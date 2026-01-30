using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;
using System.Text;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("fixed")]
    public class FarmerInfoController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ISessionManager _sessionManager;
        private readonly ILogger<FarmerInfoController> _logger;

        public FarmerInfoController(
            MachineDbContext context,
            ISessionManager sessionManager,
            ILogger<FarmerInfoController> logger)
        {
            _context = context;
            _sessionManager = sessionManager;
            _logger = logger;
        }

        /// <summary>
        /// Get Latest Farmer Info for a society/machine
        /// GET/POST: api/FarmerInfo/GetLatestFarmerInfo?InputString={params}
        /// Format: societyId|machineType|version|machineId|C00001 (page 1)
        /// CSV Format: societyId|machineType|version|machineId|D (download all)
        /// </summary>
        [HttpGet("GetLatestFarmerInfo")]
        [HttpPost("GetLatestFarmerInfo")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetLatestFarmerInfo([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("=== GetLatestFarmerInfo API Request ===");
                _logger.LogInformation($"Timestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
                _logger.LogInformation($"InputString: {InputString}");

                // Validate InputString
                if (string.IsNullOrWhiteSpace(InputString))
                {
                    return new ContentResult
                    {
                        Content = "InputString parameter is required",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Filter line endings
                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();

                // Parse input string format: societyId|machineType|version|machineId|C00001 or societyId|machineType|version|machineId|D
                var inputParts = InputString.Split('|');

                bool isCSVDownload = inputParts.Length == 4;
                bool isPaginatedRequest = inputParts.Length == 5;

                if (!isCSVDownload && !isPaginatedRequest)
                {
                    return new ContentResult
                    {
                        Content = "Invalid InputString format. Expected: societyId|machineType|version|machineId or societyId|machineType|version|machineId|pageNumber",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                string societyIdStr = inputParts[0];
                string machineType = inputParts[1];
                string machineModel = inputParts[2];
                string machineId = inputParts[3];
                string? lengthParam = isPaginatedRequest ? inputParts[4] : null;

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Model={machineModel}, Machine={machineId}, Param={lengthParam}");

                // Validate machine ID
                if (string.IsNullOrWhiteSpace(machineId))
                {
                    return new ContentResult
                    {
                        Content = "Failed to download farmer. Invalid machine details.",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Validate session authorization (same as other endpoints)
                if (!_sessionManager.ValidateRequest(societyIdStr, machineId))
                {
                    _logger.LogWarning($"Validation failed for society {societyIdStr}, machine {machineId}");
                    return new ContentResult
                    {
                        Content = "Failed to download farmer. Invalid token.",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Find or create society
                var society = await _context.Societies
                    .FirstOrDefaultAsync(s => 
                        s.SocietyId.ToLower() == societyIdStr.ToLower() || 
                        s.SocietyId.ToLower() == $"s-{societyIdStr.ToLower()}" ||
                        s.SocietyId.ToLower() == societyIdStr.ToLower().TrimStart('s', '-'));

                if (society == null)
                {
                    _logger.LogWarning($"Society not found: {societyIdStr}");
                    return new ContentResult
                    {
                        Content = "Failed to download farmer. Invalid token.",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation($"Found society: {societyIdStr} -> ID: {society.Id}");

                // Find and verify machine exists and belongs to this society
                var normalizedMachineId = SessionManager.NormalizeMachineId(machineId);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    _logger.LogWarning($"Machine {machineId} (normalized: {normalizedMachineId}) not found for society {societyIdStr}");
                    return new ContentResult
                    {
                        Content = "Failed to download farmer. Machine not authorized for this society.",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation($"Found machine: {machineId} (normalized: {normalizedMachineId}) -> ID: {machine.Id}");

                // Handle pagination
                int pageNumber = 1;
                int pageSize = 5;
                int offset = 0;

                if (isPaginatedRequest && !string.IsNullOrEmpty(lengthParam))
                {
                    // Extract page number from C parameter (C00001 = page 1)
                    if (lengthParam.StartsWith("C"))
                    {
                        var pageStr = lengthParam.Substring(1).TrimStart('0');
                        pageNumber = int.TryParse(pageStr, out int page) && page > 0 ? page : 1;
                    }
                    pageSize = 5;
                    offset = (pageNumber - 1) * pageSize;

                    _logger.LogInformation($"Pagination: Page {pageNumber}, Size {pageSize}, Offset {offset}");
                }
                else if (isCSVDownload)
                {
                    _logger.LogInformation("CSV Download - fetching all farmers");
                }

                // Build query to fetch farmers - match TypeScript field names and include machine/society filtering
                var farmersQuery = _context.Set<FarmerInfo>()
                    .Where(f => f.SocietyId == society.Id && f.Status == "active")
                    .OrderBy(f => f.FarmerId);

                // Apply pagination for paginated requests
                List<FarmerInfo> farmers;
                if (isPaginatedRequest)
                {
                    farmers = await farmersQuery.Skip(offset).Take(pageSize).ToListAsync();
                }
                else
                {
                    farmers = await farmersQuery.ToListAsync();
                }

                _logger.LogInformation($"Retrieved {farmers.Count} farmers");

                if (farmers.Count == 0)
                {
                    _logger.LogInformation("No farmers found");
                    return new ContentResult
                    {
                        Content = "Farmer info not found.",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Format response based on request type
                if (isCSVDownload)
                {
                    // CSV format matching TypeScript: ID,RF-ID,NAME,MOBILE,SMS,BONUS
                    var csvBuilder = new StringBuilder();
                    csvBuilder.AppendLine("ID,RF-ID,NAME,MOBILE,SMS,BONUS");
                    
                    foreach (var farmer in farmers)
                    {
                        var farmerId = farmer.FarmerId ?? "0";
                        var rfId = farmer.RfId ?? "0";
                        var name = farmer.Name ?? "0";
                        var phone = farmer.Phone ?? "0";
                        var smsEnabled = farmer.SmsEnabled ?? "OFF";
                        
                        // Format bonus as integer (no decimal places)
                        var bonus = Math.Round(farmer.Bonus).ToString("0");

                        // Escape CSV values that contain commas or quotes
                        var escapedName = name.Contains(",") || name.Contains("\"") ? $"\"{name.Replace("\"", "\"\"")}\"" : name;
                        var escapedPhone = phone.Contains(",") || phone.Contains("\"") ? $"\"{phone.Replace("\"", "\"\"")}\"" : phone;

                        csvBuilder.AppendLine($"{farmerId},{rfId},{escapedName},{escapedPhone},{smsEnabled},{bonus}");
                    }

                    var csvContent = csvBuilder.ToString();
                    _logger.LogInformation($"CSV Download: {farmers.Count} farmers, {csvContent.Length} bytes");

                    return new ContentResult
                    {
                        Content = csvContent,
                        ContentType = "text/csv",
                        StatusCode = 200
                    };
                }
                else
                {
                    // Paginated format: farmer_id|rf_id|name|phone|sms_enabled|bonus||
                    // Each farmer record ends with ||, except the last one
                    var responseBuilder = new StringBuilder();
                    
                    for (int i = 0; i < farmers.Count; i++)
                    {
                        var farmer = farmers[i];
                        var farmerId = farmer.FarmerId ?? "0";
                        var rfId = farmer.RfId ?? "0";
                        var name = farmer.Name ?? "0";
                        var phone = farmer.Phone ?? "0";
                        var smsEnabled = farmer.SmsEnabled ?? "OFF";
                        
                        // Format bonus with 2 decimal places for pagination
                        var bonus = farmer.Bonus.ToString("0.00");

                        // Add || after each record except the last one
                        var isLastRecord = i == farmers.Count - 1;
                        responseBuilder.Append($"{farmerId}|{rfId}|{name}|{phone}|{smsEnabled}|{bonus}");
                        if (!isLastRecord)
                        {
                            responseBuilder.Append("||");
                        }
                    }

                    var responseContent = responseBuilder.ToString();
                    
                    // Wrap the entire response in double quotes (matching TypeScript)
                    var quotedResponse = $"\"{responseContent}\"";
                    
                    _logger.LogInformation($"Page {pageNumber}: {farmers.Count} farmers, {quotedResponse.Length} bytes");

                    return new ContentResult
                    {
                        Content = quotedResponse,
                        ContentType = "text/plain",
                        StatusCode = 200
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetLatestFarmerInfo");
                return new ContentResult
                {
                    Content = "Internal server error",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }

        /// <summary>
        /// Get all farmers for a society
        /// GET: api/FarmerInfo/society/{societyId}
        /// </summary>
        [HttpGet("society/{societyId}")]
        [ProducesResponseType(typeof(IEnumerable<FarmerInfoResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<FarmerInfoResponse>>> GetFarmersBySociety(string societyId)
        {
            var society = await _context.Societies
                .FirstOrDefaultAsync(s => s.SocietyId == societyId || s.SocietyId == $"S-{societyId}");

            if (society == null)
            {
                return NotFound(new { message = "Society not found" });
            }

            var farmers = await _context.Set<FarmerInfo>()
                .Where(f => f.SocietyId == society.Id && f.Status == "active")
                .OrderBy(f => f.FarmerId)
                .Select(f => new FarmerInfoResponse
                {
                    RfId = f.RfId,
                    FarmerId = f.FarmerId,
                    Name = f.Name,
                    Phone = f.Phone,
                    SmsEnabled = f.SmsEnabled,
                    Bonus = f.Bonus
                })
                .ToListAsync();

            return Ok(farmers);
        }

        /// <summary>
        /// Get farmer by RF ID
        /// GET: api/FarmerInfo/rfid/{rfId}
        /// </summary>
        [HttpGet("rfid/{rfId}")]
        [ProducesResponseType(typeof(FarmerInfoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FarmerInfoResponse>> GetFarmerByRfId(string rfId)
        {
            var farmer = await _context.Set<FarmerInfo>()
                .Where(f => f.RfId == rfId && f.Status == "active")
                .Select(f => new FarmerInfoResponse
                {
                    RfId = f.RfId,
                    FarmerId = f.FarmerId,
                    Name = f.Name,
                    Phone = f.Phone,
                    SmsEnabled = f.SmsEnabled,
                    Bonus = f.Bonus
                })
                .FirstOrDefaultAsync();

            if (farmer == null)
            {
                return NotFound(new { message = "Farmer not found" });
            }

            return Ok(farmer);
        }

        /// <summary>
        /// Get farmer by Farmer ID
        /// GET: api/FarmerInfo/farmer/{farmerId}
        /// </summary>
        [HttpGet("farmer/{farmerId}")]
        [ProducesResponseType(typeof(FarmerInfoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FarmerInfoResponse>> GetFarmerByFarmerId(string farmerId)
        {
            var farmer = await _context.Set<FarmerInfo>()
                .Where(f => f.FarmerId == farmerId && f.Status == "active")
                .Select(f => new FarmerInfoResponse
                {
                    RfId = f.RfId,
                    FarmerId = f.FarmerId,
                    Name = f.Name,
                    Phone = f.Phone,
                    SmsEnabled = f.SmsEnabled,
                    Bonus = f.Bonus
                })
                .FirstOrDefaultAsync();

            if (farmer == null)
            {
                return NotFound(new { message = "Farmer not found" });
            }

            return Ok(farmer);
        }

        /// <summary>
        /// Upload Farmer Details from CSV file
        /// POST: api/FarmerInfo/UploadFarmerDetails
        /// </summary>
        [HttpPost("UploadFarmerDetails")]
        [EnableRateLimiting("fixed")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadFarmerDetails([FromForm] IFormFile file, [FromForm] string societyId, [FromForm] string machineId)
        {
            try
            {
                _logger.LogInformation("=== UploadFarmerDetails API Request ===");
                _logger.LogInformation($"Timestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
                _logger.LogInformation($"File: {file?.FileName}, Society: {societyId}, Machine: {machineId}");

                // Validate inputs
                if (file == null || file.Length == 0)
                {
                    return new ContentResult
                    {
                        Content = "CSV file is required",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                if (string.IsNullOrWhiteSpace(societyId))
                {
                    return new ContentResult
                    {
                        Content = "Society ID is required",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                if (string.IsNullOrWhiteSpace(machineId))
                {
                    return new ContentResult
                    {
                        Content = "Machine ID is required",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Validate file type
                if (!file.FileName.ToLower().EndsWith(".csv"))
                {
                    return new ContentResult
                    {
                        Content = "Only CSV files are allowed",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Validate session authorization
                if (!_sessionManager.ValidateRequest(societyId, machineId))
                {
                    _logger.LogWarning($"Validation failed for society {societyId}, machine {machineId}");
                    return new ContentResult
                    {
                        Content = "Invalid session or unauthorized machine",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Read CSV content
                string csvContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    csvContent = await reader.ReadToEndAsync();
                }

                var lines = csvContent.Split('\n')
                    .Where(line => !string.IsNullOrWhiteSpace(line.Trim()))
                    .Select(line => line.Trim())
                    .ToList();

                if (lines.Count < 2)
                {
                    return new ContentResult
                    {
                        Content = "CSV file must contain header and at least one data row",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Parse and validate CSV header
                var header = lines[0].Split(',').Select(h => h.Trim().Replace("\"", "")).ToList();
                _logger.LogInformation($"CSV Header: {string.Join(", ", header)}");

                var requiredHeaders = new[] { "ID", "RF-ID", "NAME", "MOBILE", "SMS", "BONUS" };
                var missingHeaders = requiredHeaders.Where(h => !header.Contains(h, StringComparer.OrdinalIgnoreCase)).ToList();

                if (missingHeaders.Any())
                {
                    return new ContentResult
                    {
                        Content = $"Missing required CSV headers: {string.Join(", ", missingHeaders)}. Required: {string.Join(", ", requiredHeaders)}",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Find or create society
                var society = await _context.Societies
                    .FirstOrDefaultAsync(s => 
                        s.SocietyId.ToLower() == societyId.ToLower() || 
                        s.SocietyId.ToLower() == $"s-{societyId.ToLower()}" ||
                        s.SocietyId.ToLower() == societyId.ToLower().TrimStart('s', '-'));

                if (society == null)
                {
                    // Auto-create society since it's authorized in session
                    society = new Society
                    {
                        SocietyId = societyId,
                        Name = $"Society {societyId}",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Societies.Add(society);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Auto-created society: {societyId}");
                }

                // Find or create machine (use normalized machine ID)
                var normalizedMachineId = SessionManager.NormalizeMachineId(machineId);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    machine = new Machine
                    {
                        MachineId = normalizedMachineId,
                        SocietyId = society.Id,
                        MachineType = "Generic",
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Machines.Add(machine);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Auto-created machine: {normalizedMachineId} (original: {machineId})");
                }

                // Process CSV data rows
                var successCount = 0;
                var failedFarmers = new List<object>();

                for (int i = 1; i < lines.Count; i++)
                {
                    try
                    {
                        var values = lines[i].Split(',').Select(v => v.Trim().Replace("\"", "")).ToArray();

                        if (values.Length != header.Count)
                        {
                            failedFarmers.Add(new
                            {
                                row = i + 1,
                                farmerId = values.Length > 0 ? values[0] : "Unknown",
                                name = values.Length > 2 ? values[2] : "Unknown",
                                error = "Invalid number of columns"
                            });
                            continue;
                        }

                        // Map CSV values to farmer data
                        var farmerData = new Dictionary<string, string>();
                        for (int j = 0; j < header.Count; j++)
                        {
                            farmerData[header[j].ToUpper()] = values[j];
                        }

                        // Validate required fields
                        if (string.IsNullOrWhiteSpace(farmerData["ID"]) || string.IsNullOrWhiteSpace(farmerData["NAME"]))
                        {
                            failedFarmers.Add(new
                            {
                                row = i + 1,
                                farmerId = farmerData.GetValueOrDefault("ID", "Unknown"),
                                name = farmerData.GetValueOrDefault("NAME", "Unknown"),
                                error = "ID and NAME are required"
                            });
                            continue;
                        }

                        var farmerId = farmerData["ID"];
                        var rfId = farmerData["RF-ID"];
                        var name = farmerData["NAME"];
                        var mobile = farmerData["MOBILE"];
                        var smsEnabled = farmerData.GetValueOrDefault("SMS", "OFF").ToUpper();
                        var bonusStr = farmerData.GetValueOrDefault("BONUS", "0");

                        // Parse bonus
                        if (!decimal.TryParse(bonusStr, out decimal bonus))
                        {
                            bonus = 0;
                        }

                        // Check if farmer already exists
                        var existingFarmer = await _context.Set<FarmerInfo>()
                            .FirstOrDefaultAsync(f => f.FarmerId == farmerId && f.SocietyId == society.Id);

                        if (existingFarmer != null)
                        {
                            // Treat duplicate as error instead of updating
                            failedFarmers.Add(new
                            {
                                row = i + 1,
                                farmerId = farmerId,
                                name = name,
                                error = $"Duplicate entry - Farmer ID '{farmerId}' already exists in society"
                            });
                            
                            _logger.LogWarning($"⚠️ Duplicate farmer {farmerId} found in society {societyId}");
                            continue;
                        }

                        // Create new farmer
                        var newFarmer = new FarmerInfo
                        {
                            FarmerId = farmerId,
                            RfId = string.IsNullOrWhiteSpace(rfId) ? farmerId : rfId,
                            Name = name,
                            Phone = string.IsNullOrWhiteSpace(mobile) ? null : mobile,
                            SmsEnabled = smsEnabled == "ON" ? "ON" : "OFF",
                            Bonus = bonus,
                            SocietyId = society.Id,
                            MachineId = machine.Id,
                            Status = "active",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Set<FarmerInfo>().Add(newFarmer);

                        await _context.SaveChangesAsync();
                        successCount++;

                        _logger.LogInformation($"✅ Processed farmer {farmerId}: {name}");
                    }
                    catch (Exception ex)
                    {
                        var values = lines[i].Split(',');
                        failedFarmers.Add(new
                        {
                            row = i + 1,
                            farmerId = values.Length > 0 ? values[0].Trim().Replace("\"", "") : "Unknown",
                            name = values.Length > 2 ? values[2].Trim().Replace("\"", "") : "Unknown",
                            error = ex.Message
                        });

                        _logger.LogError(ex, $"Failed to process farmer at row {i + 1}");
                    }
                }

                var totalProcessed = lines.Count - 1; // Exclude header
                var failedCount = failedFarmers.Count;

                _logger.LogInformation($"📊 CSV Upload Results: {successCount}/{totalProcessed} farmers imported successfully");

                // Build response message with society and machine details
                var message = $"Successfully imported {successCount} out of {totalProcessed} farmers for Society '{society.SocietyId}' (ID: {society.Id}) and Machine '{normalizedMachineId}' (ID: {machine.Id}, Original: {machineId})";
                if (failedCount > 0)
                {
                    message += $". {failedCount} farmers failed to import.";
                }

                // Return structured response (matching TypeScript format) with additional details
                var result = new
                {
                    totalProcessed,
                    successCount,
                    failedCount,
                    failedFarmers,
                    message,
                    societyDetails = new 
                    {
                        societyId = society.SocietyId,
                        societyDbId = society.Id,
                        societyName = society.Name
                    },
                    machineDetails = new
                    {
                        originalMachineId = machineId,
                        normalizedMachineId = normalizedMachineId,
                        machineDbId = machine.Id,
                        machineType = machine.MachineType,
                        machineStatus = machine.Status
                    }
                };

                return new ContentResult
                {
                    Content = System.Text.Json.JsonSerializer.Serialize(result),
                    ContentType = "application/json",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UploadFarmerDetails");
                return new ContentResult
                {
                    Content = "Failed to process farmer upload",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
        }
    }
}
