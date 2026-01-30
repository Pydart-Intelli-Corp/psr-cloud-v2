using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MachineCorrectionController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<MachineCorrectionController> _logger;

        public MachineCorrectionController(MachineDbContext context, ILogger<MachineCorrectionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("SaveFromWeb")]
        public async Task<IActionResult> SaveFromWeb([FromBody] MachineCorrectionRequest request)
        {
            try
            {
                _logger.LogInformation("SaveFromWeb called. MachineId={MId}, C1F={C1F}, C1S={C1S}", 
                    request.MachineId, request.Channel1Fat, request.Channel1Snf);
                
                if (string.IsNullOrEmpty(request.MachineId))
                    return BadRequest(new { success = false, error = "Machine ID is required" });

                var machine = await _context.Machines.FirstOrDefaultAsync(m => m.MachineId == request.MachineId);
                if (machine == null)
                    return NotFound(new { success = false, error = "Machine not found" });

                // Check if correction already exists (ignore status)
                var existingCorrection = await _context.MachineCorrectionsWeb
                    .FirstOrDefaultAsync(c => c.MachineId == machine.Id && c.SocietyId == machine.SocietyId);

                if (existingCorrection != null)
                {
                    // Update existing correction
                    _logger.LogInformation("Updating existing correction. Request values: C1F={C1F}, C1S={C1S}, C2F={C2F}", 
                        request.Channel1Fat, request.Channel1Snf, request.Channel2Fat);
                    
                    existingCorrection.MachineType = machine.MachineType;
                    existingCorrection.Channel1Fat = request.Channel1Fat.HasValue ? request.Channel1Fat.Value : existingCorrection.Channel1Fat;
                    existingCorrection.Channel1Snf = request.Channel1Snf.HasValue ? request.Channel1Snf.Value : existingCorrection.Channel1Snf;
                    existingCorrection.Channel1Clr = request.Channel1Clr.HasValue ? request.Channel1Clr.Value : existingCorrection.Channel1Clr;
                    existingCorrection.Channel1Temp = request.Channel1Temp.HasValue ? request.Channel1Temp.Value : existingCorrection.Channel1Temp;
                    existingCorrection.Channel1Water = request.Channel1Water.HasValue ? request.Channel1Water.Value : existingCorrection.Channel1Water;
                    existingCorrection.Channel1Protein = request.Channel1Protein.HasValue ? request.Channel1Protein.Value : existingCorrection.Channel1Protein;
                    existingCorrection.Channel2Fat = request.Channel2Fat.HasValue ? request.Channel2Fat.Value : existingCorrection.Channel2Fat;
                    existingCorrection.Channel2Snf = request.Channel2Snf.HasValue ? request.Channel2Snf.Value : existingCorrection.Channel2Snf;
                    existingCorrection.Channel2Clr = request.Channel2Clr.HasValue ? request.Channel2Clr.Value : existingCorrection.Channel2Clr;
                    existingCorrection.Channel2Temp = request.Channel2Temp.HasValue ? request.Channel2Temp.Value : existingCorrection.Channel2Temp;
                    existingCorrection.Channel2Water = request.Channel2Water.HasValue ? request.Channel2Water.Value : existingCorrection.Channel2Water;
                    existingCorrection.Channel2Protein = request.Channel2Protein.HasValue ? request.Channel2Protein.Value : existingCorrection.Channel2Protein;
                    existingCorrection.Channel3Fat = request.Channel3Fat.HasValue ? request.Channel3Fat.Value : existingCorrection.Channel3Fat;
                    existingCorrection.Channel3Snf = request.Channel3Snf.HasValue ? request.Channel3Snf.Value : existingCorrection.Channel3Snf;
                    existingCorrection.Channel3Clr = request.Channel3Clr.HasValue ? request.Channel3Clr.Value : existingCorrection.Channel3Clr;
                    existingCorrection.Channel3Temp = request.Channel3Temp.HasValue ? request.Channel3Temp.Value : existingCorrection.Channel3Temp;
                    existingCorrection.Channel3Water = request.Channel3Water.HasValue ? request.Channel3Water.Value : existingCorrection.Channel3Water;
                    existingCorrection.Channel3Protein = request.Channel3Protein.HasValue ? request.Channel3Protein.Value : existingCorrection.Channel3Protein;
                    existingCorrection.Status = 1;
                    existingCorrection.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Machine correction updated for machine {MachineId}", request.MachineId);
                    return Ok(new { success = true, message = "Machine correction updated successfully" });
                }

                // Deactivate previous corrections
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE machine_corrections SET status = 0 WHERE machine_id = {0} AND status = 1",
                    machine.Id);

                // Insert new correction
                var correction = new MachineCorrectionWeb
                {
                    MachineId = machine.Id,
                    SocietyId = machine.SocietyId,
                    MachineType = machine.MachineType,
                    Channel1Fat = request.Channel1Fat ?? 0.00m,
                    Channel1Snf = request.Channel1Snf ?? 0.00m,
                    Channel1Clr = request.Channel1Clr ?? 0.00m,
                    Channel1Temp = request.Channel1Temp ?? 0.00m,
                    Channel1Water = request.Channel1Water ?? 0.00m,
                    Channel1Protein = request.Channel1Protein ?? 0.00m,
                    Channel2Fat = request.Channel2Fat ?? 0.00m,
                    Channel2Snf = request.Channel2Snf ?? 0.00m,
                    Channel2Clr = request.Channel2Clr ?? 0.00m,
                    Channel2Temp = request.Channel2Temp ?? 0.00m,
                    Channel2Water = request.Channel2Water ?? 0.00m,
                    Channel2Protein = request.Channel2Protein ?? 0.00m,
                    Channel3Fat = request.Channel3Fat ?? 0.00m,
                    Channel3Snf = request.Channel3Snf ?? 0.00m,
                    Channel3Clr = request.Channel3Clr ?? 0.00m,
                    Channel3Temp = request.Channel3Temp ?? 0.00m,
                    Channel3Water = request.Channel3Water ?? 0.00m,
                    Channel3Protein = request.Channel3Protein ?? 0.00m,
                    Status = 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.MachineCorrectionsWeb.Add(correction);
                await _context.SaveChangesAsync();

                // Keep only last 5 records
                await _context.Database.ExecuteSqlRawAsync(
                    @"DELETE FROM machine_corrections 
                      WHERE machine_id = {0} 
                      AND id NOT IN (
                        SELECT id FROM (
                          SELECT id FROM machine_corrections 
                          WHERE machine_id = {0} 
                          ORDER BY created_at DESC LIMIT 5
                        ) AS keep_records
                      )",
                    machine.Id);

                _logger.LogInformation("Machine correction saved for machine {MachineId}", request.MachineId);
                return Ok(new { success = true, message = "Machine correction saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving machine correction");
                return StatusCode(500, new { success = false, error = "Failed to save machine correction" });
            }
        }

        [HttpGet("SaveMachineCorrectionFromMachine")]
        [HttpPost("SaveMachineCorrectionFromMachine")]
        public async Task<IActionResult> SaveMachineCorrectionFromMachine([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("📥 SaveMachineCorrectionFromMachine: {Time}", DateTime.UtcNow);

                if (string.IsNullOrEmpty(InputString) && Request.Method == "POST")
                {
                    using var reader = new StreamReader(Request.Body);
                    var body = await reader.ReadToEndAsync();
                    if (body.StartsWith("InputString="))
                        InputString = body.Substring(12);
                }

                if (string.IsNullOrWhiteSpace(InputString))
                {
                    return new ContentResult
                    {
                        Content = "\"Invalid input\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();
                
                // Fix URL encoding: space back to + for value parsing
                InputString = System.Text.RegularExpressions.Regex.Replace(
                    InputString, 
                    @"\|([FSCTPW]) ", 
                    "|$1+"
                );
                
                _logger.LogInformation("InputString: {Input}", InputString);

                var parts = InputString.Split('|');
                string societyIdStr, machineType, machineIdStr, channelStr;
                string fatStr, snfStr, clrStr, tempStr, waterStr, proteinStr, timestampStr;

                if (parts.Length >= 13)
                {
                    societyIdStr = parts[0]; machineType = parts[1]; machineIdStr = parts[3];
                    channelStr = parts[5]; fatStr = parts[6]; snfStr = parts[7]; clrStr = parts[8];
                    tempStr = parts[9]; waterStr = parts[10]; proteinStr = parts[11]; timestampStr = parts[12];
                }
                else if (parts.Length >= 12)
                {
                    societyIdStr = parts[0]; machineType = parts[1]; machineIdStr = parts[3];
                    channelStr = parts[4]; fatStr = parts[5]; snfStr = parts[6]; clrStr = parts[7];
                    tempStr = parts[8]; waterStr = parts[9]; proteinStr = parts[10]; timestampStr = parts[11];
                }
                else
                {
                    return new ContentResult
                    {
                        Content = "\"Invalid data format\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Find society
                Society? society = null;
                if (societyIdStr.StartsWith("S", StringComparison.OrdinalIgnoreCase))
                {
                    var socId = societyIdStr.StartsWith("S-") ? societyIdStr.Substring(2) : societyIdStr;
                    _logger.LogInformation("Looking for society: {SocId}", socId);
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.SocietyId == socId);
                }
                else if (int.TryParse(societyIdStr, out var bmcId))
                {
                    _logger.LogInformation("Looking for BMC: {BmcId}", bmcId);
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.BmcId == bmcId);
                }

                if (society == null)
                {
                    _logger.LogWarning("❌ Society not found: {SocietyId}", societyIdStr);
                    return new ContentResult
                    {
                        Content = "\"Society not found\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation("✅ Found society: {SocId} -> ID: {Id}", societyIdStr, society.Id);

                // Normalize machine ID (MM13 -> M13) for database operations
                var normalizedMachineId = SessionManager.NormalizeMachineId(machineIdStr);

                // Check if machine exists and belongs to this society
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    // Check if machine exists in any other society
                    var machineInOtherSociety = await _context.Machines
                        .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId);

                    if (machineInOtherSociety != null)
                    {
                        var otherSociety = await _context.Societies
                            .FirstOrDefaultAsync(s => s.Id == machineInOtherSociety.SocietyId);
                        
                        _logger.LogError($"Machine {machineIdStr} (normalized: {normalizedMachineId}) belongs to society {otherSociety?.SocietyId}, not {societyIdStr}");
                        
                        return new ContentResult
                        {
                            Content = $"\"Machine {machineIdStr} belongs to different society\"",
                            ContentType = "text/plain; charset=utf-8",
                            StatusCode = 200
                        };
                    }

                    // Machine doesn't exist anywhere - create with normalized ID
                    machine = new Machine
                    {
                        MachineId = normalizedMachineId,
                        SocietyId = society.Id,
                        MachineType = machineType,
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Machines.Add(machine);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Auto-created machine: {normalizedMachineId} for society {societyIdStr} (original: {machineIdStr})");
                }
                else
                {
                    // Verify machine type matches (optional validation)
                    if (!string.IsNullOrEmpty(machine.MachineType) && 
                        !machine.MachineType.Equals(machineType, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogWarning($"Machine type mismatch for {machineIdStr}: DB={machine.MachineType}, Request={machineType}");
                    }
                }

                _logger.LogInformation($"Machine: {machineIdStr} (normalized: {normalizedMachineId}) -> DB ID: {machine.Id}");

                // Validate channel
                if (!int.TryParse(channelStr, out int channelNum) || channelNum < 1 || channelNum > 3)
                {
                    return new ContentResult
                    {
                        Content = "\"Invalid channel number\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Parse values and round to 2 decimal places
                decimal fat = Math.Round(ParseValue(fatStr), 2);
                decimal snf = Math.Round(ParseValue(snfStr), 2);
                decimal clr = Math.Round(ParseValue(clrStr), 2);
                decimal temp = Math.Round(ParseValue(tempStr), 2);
                decimal water = Math.Round(ParseValue(waterStr), 2);
                decimal protein = Math.Round(ParseValue(proteinStr), 2);

                // Parse timestamp
                DateTime correctionTimestamp = DateTime.UtcNow;
                if (timestampStr.StartsWith("D"))
                {
                    var timestampValue = timestampStr.Substring(1).Replace("_", " ");
                    if (DateTime.TryParse(timestampValue, out var parsed))
                        correctionTimestamp = parsed;
                }

                _logger.LogInformation("Saving: Machine={MId}, Channel={Ch}, F={F}, S={S}", 
                    machine.Id, channelNum, fat, snf);

                // Find or create correction record
                var correction = await _context.Set<MachineCorrection>()
                    .FirstOrDefaultAsync(c => c.MachineId == machine.Id && c.SocietyId == society.Id);

                if (correction == null)
                {
                    // Create new correction record
                    correction = new MachineCorrection
                    {
                        MachineId = machine.Id,
                        SocietyId = society.Id,
                        MachineType = machineType,
                        CreatedAt = correctionTimestamp,
                        UpdatedAt = correctionTimestamp
                    };
                    _context.Set<MachineCorrection>().Add(correction);
                }
                else
                {
                    correction.MachineType = machineType;
                    correction.UpdatedAt = correctionTimestamp;
                }

                // Update specific channel fields
                switch (channelNum)
                {
                    case 1:
                        correction.Channel1Fat = fat;
                        correction.Channel1Snf = snf;
                        correction.Channel1Clr = clr;
                        correction.Channel1Temp = temp;
                        correction.Channel1Water = water;
                        correction.Channel1Protein = protein;
                        break;
                    case 2:
                        correction.Channel2Fat = fat;
                        correction.Channel2Snf = snf;
                        correction.Channel2Clr = clr;
                        correction.Channel2Temp = temp;
                        correction.Channel2Water = water;
                        correction.Channel2Protein = protein;
                        break;
                    case 3:
                        correction.Channel3Fat = fat;
                        correction.Channel3Snf = snf;
                        correction.Channel3Clr = clr;
                        correction.Channel3Temp = temp;
                        correction.Channel3Water = water;
                        correction.Channel3Protein = protein;
                        break;
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation($"✅ Correction saved successfully for machine {machineIdStr}, channel {channelNum}");
                
                // Return ESP32-compatible response format
                const string response = "Machine correction saved successfully.";
                
                return new ContentResult
                {
                    Content = $"\"{response}\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveMachineCorrectionFromMachine");
                
                // Return ESP32-compatible error response  
                return new ContentResult
                {
                    Content = "\"Failed to save machine correction\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }

        private decimal ParseValue(string str)
        {
            if (str.Length < 2) return 0.00m;
            var valueStr = str.Substring(1).Trim().Replace("+", "");
            return decimal.TryParse(valueStr, out var value) ? value : 0.00m;
        }

        [HttpGet("SaveMachineCorrectionUpdationHistory")]
        [HttpPost("SaveMachineCorrectionUpdationHistory")]
        public async Task<IActionResult> SaveMachineCorrectionUpdationHistory([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("📥 SaveMachineCorrectionUpdationHistory: {Time}", DateTime.UtcNow);

                if (string.IsNullOrEmpty(InputString) && Request.Method == "POST")
                {
                    using var reader = new StreamReader(Request.Body);
                    var body = await reader.ReadToEndAsync();
                    if (body.StartsWith("InputString="))
                        InputString = body.Substring(12);
                }

                if (string.IsNullOrWhiteSpace(InputString))
                {
                    return new ContentResult
                    {
                        Content = "\"Invalid input\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();
                _logger.LogInformation("InputString: {Input}", InputString);

                var parts = InputString.Split('|');
                if (parts.Length != 4)
                {
                    return new ContentResult
                    {
                        Content = "\"Invalid data format\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                string societyIdStr = parts[0];
                string machineType = parts[1];
                string machineModel = parts[2];
                string machineIdStr = parts[3];

                // Find society
                Society? society = null;
                if (societyIdStr.StartsWith("S", StringComparison.OrdinalIgnoreCase))
                {
                    var socId = societyIdStr.StartsWith("S-") ? societyIdStr.Substring(2) : societyIdStr;
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.SocietyId == socId);
                }
                else if (int.TryParse(societyIdStr, out var bmcId))
                {
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.BmcId == bmcId);
                }

                if (society == null)
                {
                    _logger.LogWarning("❌ Society not found: {SocietyId}", societyIdStr);
                    return new ContentResult
                    {
                        Content = "\"Society not found\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                var normalizedMachineId = SessionManager.NormalizeMachineId(machineIdStr);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    _logger.LogWarning("❌ Machine not found: {MachineId}", machineIdStr);
                    return new ContentResult
                    {
                        Content = "\"Machine not found\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Update correction status to 0
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE machine_corrections SET status = 0, updated_at = NOW() WHERE machine_id = {0} AND status = 1",
                    machine.Id);

                _logger.LogInformation("✅ Updated correction status to 0 for machine {MachineId}", machineIdStr);

                return new ContentResult
                {
                    Content = "\"Machine correction status updated successfully.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveMachineCorrectionUpdationHistory");
                return new ContentResult
                {
                    Content = "\"Failed to update correction status\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
        }

        [HttpGet("GetLatestMachineCorrection")]
        [HttpPost("GetLatestMachineCorrection")]
        public async Task<IActionResult> GetLatestMachineCorrection([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("📥 GetLatestMachineCorrection: {Time}", DateTime.UtcNow);

                if (string.IsNullOrEmpty(InputString) && Request.Method == "POST")
                {
                    using var reader = new StreamReader(Request.Body);
                    var body = await reader.ReadToEndAsync();
                    if (body.StartsWith("InputString="))
                        InputString = body.Substring(12);
                }

                if (string.IsNullOrWhiteSpace(InputString))
                {
                    return new ContentResult
                    {
                        Content = "\"Machine correction not found.\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();
                _logger.LogInformation("InputString: {Input}", InputString);

                var parts = InputString.Split('|');
                if (parts.Length != 4)
                {
                    return new ContentResult
                    {
                        Content = "\"Machine correction not found.\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                string societyIdStr = parts[0];
                string machineType = parts[1];
                string machineModel = parts[2];
                string machineIdStr = parts[3];

                // Find society
                Society? society = null;
                if (societyIdStr.StartsWith("S", StringComparison.OrdinalIgnoreCase))
                {
                    var socId = societyIdStr.StartsWith("S-") ? societyIdStr.Substring(2) : societyIdStr;
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.SocietyId == socId);
                }
                else if (int.TryParse(societyIdStr, out var bmcId))
                {
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.BmcId == bmcId);
                }

                if (society == null)
                {
                    _logger.LogWarning("❌ Society not found: {SocietyId}", societyIdStr);
                    return new ContentResult
                    {
                        Content = "\"Machine correction not found.\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                var normalizedMachineId = SessionManager.NormalizeMachineId(machineIdStr);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    _logger.LogWarning("❌ Machine not found: {MachineId}", machineIdStr);
                    return new ContentResult
                    {
                        Content = "\"Machine correction not found.\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Get latest active correction
                var correction = await _context.MachineCorrectionsWeb
                    .Where(c => c.MachineId == machine.Id && c.Status == 1)
                    .OrderByDescending(c => c.CreatedAt)
                    .FirstOrDefaultAsync();

                if (correction == null)
                {
                    _logger.LogInformation("ℹ️ No active correction found for machine {MachineId}", machineIdStr);
                    return new ContentResult
                    {
                        Content = "\"Machine correction not found.\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Format response: date||channel|fat|snf|clr|temp|water|protein||...
                var updatedDate = correction.UpdatedAt.ToString("dd-MM-yyyy hh:mm:ss tt");
                
                var response = $"{updatedDate}||" +
                              $"1|{correction.Channel1Fat:0.00}|{correction.Channel1Snf:0.00}|{correction.Channel1Clr:0.00}|{correction.Channel1Temp:0.00}|{correction.Channel1Water:0.00}|{correction.Channel1Protein:0.00}||" +
                              $"2|{correction.Channel2Fat:0.00}|{correction.Channel2Snf:0.00}|{correction.Channel2Clr:0.00}|{correction.Channel2Temp:0.00}|{correction.Channel2Water:0.00}|{correction.Channel2Protein:0.00}||" +
                              $"3|{correction.Channel3Fat:0.00}|{correction.Channel3Snf:0.00}|{correction.Channel3Clr:0.00}|{correction.Channel3Temp:0.00}|{correction.Channel3Water:0.00}|{correction.Channel3Protein:0.00}";

                _logger.LogInformation("✅ Found correction for machine {MachineId}", machineIdStr);

                return new ContentResult
                {
                    Content = $"\"{response}\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetLatestMachineCorrection");
                return new ContentResult
                {
                    Content = "\"Machine correction not found.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
        }
    }

    public class MachineCorrectionRequest
    {
        public string MachineId { get; set; } = string.Empty;
        public string? SocietyId { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_fat")]
        public decimal? Channel1Fat { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_snf")]
        public decimal? Channel1Snf { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_clr")]
        public decimal? Channel1Clr { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_temp")]
        public decimal? Channel1Temp { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_water")]
        public decimal? Channel1Water { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel1_protein")]
        public decimal? Channel1Protein { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_fat")]
        public decimal? Channel2Fat { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_snf")]
        public decimal? Channel2Snf { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_clr")]
        public decimal? Channel2Clr { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_temp")]
        public decimal? Channel2Temp { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_water")]
        public decimal? Channel2Water { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel2_protein")]
        public decimal? Channel2Protein { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_fat")]
        public decimal? Channel3Fat { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_snf")]
        public decimal? Channel3Snf { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_clr")]
        public decimal? Channel3Clr { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_temp")]
        public decimal? Channel3Temp { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_water")]
        public decimal? Channel3Water { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("channel3_protein")]
        public decimal? Channel3Protein { get; set; }
    }
}
