using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("fixed")]
    public class MachineUpdatesController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly IPSRCodeService _psrService;
        private readonly ILogger<MachineUpdatesController> _logger;

        public MachineUpdatesController(
            MachineDbContext context,
            IPSRCodeService psrService,
            ILogger<MachineUpdatesController> logger)
        {
            _context = context;
            _psrService = psrService;
            _logger = logger;
        }

        /// <summary>
        /// Check for Machine Updates from Machine
        /// GET/POST: api/MachineUpdates/FromMachine?InputString={params}
        /// Format: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09
        /// Response: "DD-MM-YYYY HH:MM:SS AM/PM|Status"
        /// </summary>
        [HttpGet("FromMachine")]
        [HttpPost("FromMachine")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CheckUpdateFromMachine([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("=== MachineNewupdate FromMachine API Request ===");
                _logger.LogInformation($"Timestamp: {DateTime.UtcNow:O}");
                _logger.LogInformation($"InputString: {InputString}");

                // Validate InputString
                if (string.IsNullOrWhiteSpace(InputString))
                {
                    _logger.LogWarning("InputString is missing");
                    return BadRequest("InputString parameter is required");
                }

                // Filter line endings
                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();

                // Parse input string: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09
                var inputParts = InputString.Split('|');

                if (inputParts.Length != 5)
                {
                    _logger.LogWarning($"Invalid InputString format. Expected 5 parts, got {inputParts.Length}");
                    return BadRequest("Invalid InputString format");
                }

                string societyIdStr = inputParts[0];
                string machineType = inputParts[1];
                string machineModel = inputParts[2];
                string machineIdStr = inputParts[3];
                string datetime = inputParts[4];

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Model={machineModel}, Machine={machineIdStr}, DateTime={datetime}");

                // Get PSR code from Authorization header or query parameter
                string? psrCode = Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
                if (string.IsNullOrEmpty(psrCode))
                {
                    psrCode = Request.Query["PSRCode"].FirstOrDefault();
                }

                if (string.IsNullOrEmpty(psrCode))
                {
                    _logger.LogWarning("PSR code not provided");
                    return BadRequest("PSR code is required for authentication");
                }

                // Validate PSR code
                var psrValidation = _psrService.ValidatePSRCode(machineIdStr, psrCode);
                if (!psrValidation)
                {
                    _logger.LogWarning($"Invalid PSR code validation for machine: {machineIdStr}");
                    return BadRequest("Invalid machine authentication");
                }

                // Find society
                var society = await _context.Societies
                    .FirstOrDefaultAsync(s => s.SocietyId == societyIdStr || s.SocietyId == $"S-{societyIdStr}");

                if (society == null)
                {
                    _logger.LogWarning($"Society not found: {societyIdStr}");
                    // Still return valid response format with "No update"
                    var fallbackResponse = $"{DateTime.Now:dd-MM-yyyy hh:mm:ss tt}|No update";
                    return Ok(fallbackResponse);
                }

                _logger.LogInformation($"Found society: {societyIdStr} -> ID: {society.Id}");

                // Find machine
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == machineIdStr && m.SocietyId == society.Id);

                if (machine == null)
                {
                    _logger.LogWarning($"Machine not found: {machineIdStr} for society {society.Id}");
                    // Still return valid response format
                }
                else
                {
                    _logger.LogInformation($"Found machine: {machineIdStr} -> ID: {machine.Id}");
                }

                // Parse request timestamp from input (format: D2025-11-12_10:59:09)
                DateTime requestTimestamp = DateTime.UtcNow;
                if (!string.IsNullOrEmpty(datetime) && datetime.StartsWith("D"))
                {
                    try
                    {
                        string dateTimeStr = datetime.Substring(1); // Remove 'D' prefix
                        var dateTimeParts = dateTimeStr.Split('_');
                        if (dateTimeParts.Length == 2)
                        {
                            string datePart = dateTimeParts[0];
                            string timePart = dateTimeParts[1];

                            var dateParts = datePart.Split('-');
                            var timeParts = timePart.Split(':');

                            if (dateParts.Length == 3 && timeParts.Length == 3)
                            {
                                int year = int.Parse(dateParts[0]);
                                int month = int.Parse(dateParts[1]);
                                int day = int.Parse(dateParts[2]);
                                int hour = int.Parse(timeParts[0]);
                                int minute = int.Parse(timeParts[1]);
                                int second = int.Parse(timeParts[2]);

                                requestTimestamp = new DateTime(year, month, day, hour, minute, second);
                                _logger.LogInformation($"Parsed request timestamp: {requestTimestamp:O}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Failed to parse datetime: {datetime}");
                    }
                }

                // Check for available updates (currently returns "No update" - can be enhanced later)
                // TODO: Implement actual update checking logic based on firmware versions
                string updateStatus = "No update";
                string? availableVersion = null;

                // Log the update check
                if (machine != null)
                {
                    var updateRecord = new MachineUpdate
                    {
                        SocietyId = society.Id,
                        MachineId = machine.Id,
                        MachineType = machineType,
                        CurrentVersion = machineModel,
                        AvailableVersion = availableVersion,
                        UpdateStatus = updateStatus,
                        LastChecked = requestTimestamp,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Set<MachineUpdate>().Add(updateRecord);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"✅ Update check logged for machine {machineIdStr}");
                }

                // Format response: "DD-MM-YYYY HH:MM:SS AM/PM|Status"
                var response = $"{DateTime.Now:dd-MM-yyyy hh:mm:ss tt}|{updateStatus}";
                _logger.LogInformation($"Response: {response}");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckUpdateFromMachine");
                
                // Even on error, return valid response format
                var errorResponse = $"{DateTime.Now:dd-MM-yyyy hh:mm:ss tt}|No update";
                return Ok(errorResponse);
            }
        }

        /// <summary>
        /// Get update history for a machine
        /// GET: api/MachineUpdates/machine/{machineId}
        /// </summary>
        [HttpGet("machine/{machineId}")]
        [ProducesResponseType(typeof(IEnumerable<MachineUpdate>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<MachineUpdate>>> GetUpdateHistory(string machineId)
        {
            var machine = await _context.Machines
                .FirstOrDefaultAsync(m => m.MachineId == machineId);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found" });
            }

            var updates = await _context.Set<MachineUpdate>()
                .Where(u => u.MachineId == machine.Id)
                .OrderByDescending(u => u.LastChecked)
                .Take(100)
                .ToListAsync();

            return Ok(updates);
        }

        /// <summary>
        /// Get latest update check for a machine
        /// GET: api/MachineUpdates/machine/{machineId}/latest
        /// </summary>
        [HttpGet("machine/{machineId}/latest")]
        [ProducesResponseType(typeof(MachineUpdate), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MachineUpdate>> GetLatestUpdateCheck(string machineId)
        {
            var machine = await _context.Machines
                .FirstOrDefaultAsync(m => m.MachineId == machineId);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found" });
            }

            var latestUpdate = await _context.Set<MachineUpdate>()
                .Where(u => u.MachineId == machine.Id)
                .OrderByDescending(u => u.LastChecked)
                .FirstOrDefaultAsync();

            if (latestUpdate == null)
            {
                return NotFound(new { message = "No update history found for this machine" });
            }

            return Ok(latestUpdate);
        }

        /// <summary>
        /// Get all pending updates
        /// GET: api/MachineUpdates/pending
        /// </summary>
        [HttpGet("pending")]
        [ProducesResponseType(typeof(IEnumerable<MachineUpdate>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<MachineUpdate>>> GetPendingUpdates()
        {
            var pendingUpdates = await _context.Set<MachineUpdate>()
                .Where(u => u.UpdateStatus != "No update" && u.UpdateStatus != "Updated")
                .OrderByDescending(u => u.LastChecked)
                .ToListAsync();

            return Ok(pendingUpdates);
        }

        /// <summary>
        /// Create or update firmware version information
        /// POST: api/MachineUpdates/firmware
        /// </summary>
        [HttpPost("firmware")]
        [ProducesResponseType(typeof(MachineUpdate), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MachineUpdate>> CreateFirmwareUpdate([FromBody] MachineUpdateRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.SocietyId) ||
                    string.IsNullOrWhiteSpace(request.MachineType) ||
                    string.IsNullOrWhiteSpace(request.MachineModel))
                {
                    return BadRequest("Society ID, Machine Type, and Machine Model are required");
                }

                // Find society
                var society = await _context.Societies
                    .FirstOrDefaultAsync(s => s.SocietyId == request.SocietyId || s.SocietyId == $"S-{request.SocietyId}");

                if (society == null)
                {
                    return BadRequest("Invalid society ID");
                }

                // Create update record
                var update = new MachineUpdate
                {
                    SocietyId = society.Id,
                    MachineId = null,
                    MachineType = request.MachineType,
                    CurrentVersion = request.MachineModel,
                    AvailableVersion = null,
                    UpdateStatus = "No update",
                    LastChecked = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Set<MachineUpdate>().Add(update);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetLatestUpdateCheck),
                    new { machineId = request.MachineId },
                    update);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating firmware update");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
