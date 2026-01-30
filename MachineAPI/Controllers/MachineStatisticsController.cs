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
    public class MachineStatisticsController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ISessionManager _sessionManager;
        private readonly ILogger<MachineStatisticsController> _logger;

        public MachineStatisticsController(
            MachineDbContext context,
            ISessionManager sessionManager,
            ILogger<MachineStatisticsController> logger)
        {
            _context = context;
            _sessionManager = sessionManager;
            _logger = logger;
        }

        /// <summary>
        /// Save Machine Statistics from Machine
        /// GET/POST: api/MachineStatistics/SaveMachineStatisticsFromMachine?InputString={params}
        /// Format: societyId|machineType|version|machineId|T30|D1|W1|S8|G2|ENABLE|D2025-11-15_12:31:04
        /// </summary>
        [HttpGet("SaveMachineStatisticsFromMachine")]
        [HttpPost("SaveMachineStatisticsFromMachine")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SaveMachineStatisticsFromMachine([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("=== SaveMachineStatisticsFromMachine API Request ===");
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

                // Parse input string: S-101|LSE-SVWTBQ-12AH|LE3.36|MM223202|T30|D1|W1|S8|G2|ENABLE|D2025-11-15_12:31:04
                var inputParts = InputString.Split('|');

                if (inputParts.Length != 11)
                {
                    _logger.LogWarning($"Invalid InputString format. Expected 11 parts, got {inputParts.Length}");
                    return BadRequest("Invalid InputString format");
                }

                string societyIdStr = inputParts[0];
                string machineType = inputParts[1];
                string version = inputParts[2];
                string machineIdStr = inputParts[3];
                string totalTestStr = inputParts[4];      // T30
                string dailyCleaningStr = inputParts[5];  // D1
                string weeklyCleaningStr = inputParts[6]; // W1
                string cleaningSkipStr = inputParts[7];   // S8
                string gainStr = inputParts[8];           // G2
                string autoChannel = inputParts[9];       // ENABLE/DISABLE
                string dateTimeStr = inputParts[10];      // D2025-11-15_12:31:04

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Version={version}, Machine={machineIdStr}");
                _logger.LogInformation($"Stats: {totalTestStr}, {dailyCleaningStr}, {weeklyCleaningStr}, {cleaningSkipStr}, {gainStr}, {autoChannel}, {dateTimeStr}");

                // Parse statistics values
                int totalTest = int.TryParse(totalTestStr.Substring(1), out int tt) ? tt : 0;         // Remove 'T' prefix
                int dailyCleaning = int.TryParse(dailyCleaningStr.Substring(1), out int dc) ? dc : 0; // Remove 'D' prefix
                int weeklyCleaning = int.TryParse(weeklyCleaningStr.Substring(1), out int wc) ? wc : 0; // Remove 'W' prefix
                int cleaningSkip = int.TryParse(cleaningSkipStr.Substring(1), out int cs) ? cs : 0;   // Remove 'S' prefix
                int gain = int.TryParse(gainStr.Substring(1), out int g) ? g : 0;                     // Remove 'G' prefix

                // Parse date and time from format: D2025-11-15_12:31:04
                string dateTimePart = dateTimeStr.Substring(1); // Remove 'D' prefix
                var dateTimeParts = dateTimePart.Split('_');
                string statisticsDate = dateTimeParts[0]; // 2025-11-15
                string statisticsTime = dateTimeParts.Length > 1 ? dateTimeParts[1] : "00:00:00"; // 12:31:04

                _logger.LogInformation($"Parsed Statistics: Total={totalTest}, Daily={dailyCleaning}, Weekly={weeklyCleaning}, Skip={cleaningSkip}, Gain={gain}, Auto={autoChannel}");
                _logger.LogInformation($"Date: {statisticsDate}, Time: {statisticsTime}");

                // Validate request against active session (using embedded PSR code secret keys)
                if (!_sessionManager.ValidateRequest(societyIdStr, machineIdStr))
                {
                    _logger.LogWarning($"Session validation failed for Society: {societyIdStr}, Machine: {machineIdStr}");
                    return BadRequest("Invalid session or unauthorized machine. Initialize session first.");
                }

                // Find or create society
                var socId = societyIdStr.StartsWith("S-") ? societyIdStr.Substring(2) : societyIdStr;
                _logger.LogInformation("Looking for society: {SocId}", socId);
                
                var society = await _context.Societies.FirstOrDefaultAsync(s => s.SocietyId == socId);

                if (society == null)
                {
                    _logger.LogWarning("❌ Society not found: {SocId}", socId);
                    return new ContentResult
                    {
                        Content = "\"Society not found\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation("✅ Found society: {SocId} -> ID: {Id}", socId, society.Id);

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
                    // Auto-create machine since it's authorized in PSR code
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

                // Parse recorded timestamp
                DateTime recordedAt = DateTime.UtcNow;
                if (DateTime.TryParse($"{statisticsDate} {statisticsTime}", out DateTime parsedDate))
                {
                    recordedAt = parsedDate;
                }

                // Check if statistics already exists for this machine and society
                var existingStats = await _context.Set<MachineStatistics>()
                    .FirstOrDefaultAsync(s => s.MachineId == machine.Id && s.SocietyId == society.Id);

                if (existingStats != null)
                {
                    // Update existing record
                    existingStats.TotalTest = totalTest;
                    existingStats.DailyCleaning = dailyCleaning;
                    existingStats.WeeklyCleaning = weeklyCleaning;
                    existingStats.CleaningSkip = cleaningSkip;
                    existingStats.Gain = gain;
                    existingStats.AutoChannel = autoChannel;
                    existingStats.StatisticsDate = statisticsDate;
                    existingStats.StatisticsTime = statisticsTime;
                    existingStats.RecordedAt = recordedAt;
                    existingStats.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation($"🔄 Updated existing statistics for machine {machineIdStr}");
                }
                else
                {
                    // Create new statistics record
                    var statistics = new MachineStatistics
                    {
                        SocietyId = society.Id,
                        MachineId = machine.Id,
                        TotalTest = totalTest,
                        DailyCleaning = dailyCleaning,
                        WeeklyCleaning = weeklyCleaning,
                        CleaningSkip = cleaningSkip,
                        Gain = gain,
                        AutoChannel = autoChannel,
                        StatisticsDate = statisticsDate,
                        StatisticsTime = statisticsTime,
                        RecordedAt = recordedAt,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Set<MachineStatistics>().Add(statistics);
                    _logger.LogInformation($"➕ Created new statistics for machine {machineIdStr}");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Statistics saved successfully for machine {machineIdStr}");

                // Return ESP32-compatible response format (matching TypeScript implementation)
                const string response = "Machine statistics saved successfully.";
                
                return new ContentResult
                {
                    Content = $"\"{response}\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveMachineStatisticsFromMachine");
                
                // Return ESP32-compatible error response  
                return new ContentResult
                {
                    Content = "\"Failed to save machine statistics\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }

        /// <summary>
        /// Get machine statistics by machine ID
        /// GET: api/MachineStatistics/machine/{machineId}
        /// </summary>
        [HttpGet("machine/{machineId}")]
        [ProducesResponseType(typeof(IEnumerable<MachineStatistics>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<MachineStatistics>>> GetStatisticsByMachine(string machineId)
        {
            var machine = await _context.Machines
                .FirstOrDefaultAsync(m => m.MachineId == machineId);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found" });
            }

            var statistics = await _context.Set<MachineStatistics>()
                .Where(s => s.MachineId == machine.Id)
                .OrderByDescending(s => s.CreatedAt)
                .Take(100)
                .ToListAsync();

            return Ok(statistics);
        }

        /// <summary>
        /// Get latest statistics for a machine
        /// GET: api/MachineStatistics/machine/{machineId}/latest
        /// </summary>
        [HttpGet("machine/{machineId}/latest")]
        [ProducesResponseType(typeof(MachineStatistics), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MachineStatistics>> GetLatestStatistics(string machineId)
        {
            var machine = await _context.Machines
                .FirstOrDefaultAsync(m => m.MachineId == machineId);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found" });
            }

            var latestStats = await _context.Set<MachineStatistics>()
                .Where(s => s.MachineId == machine.Id)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (latestStats == null)
            {
                return NotFound(new { message = "No statistics found for this machine" });
            }

            return Ok(latestStats);
        }

        /// <summary>
        /// Get statistics by date range
        /// GET: api/MachineStatistics/machine/{machineId}/range?startDate={start}&endDate={end}
        /// </summary>
        [HttpGet("machine/{machineId}/range")]
        [ProducesResponseType(typeof(IEnumerable<MachineStatistics>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<MachineStatistics>>> GetStatisticsByDateRange(
            string machineId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var machine = await _context.Machines
                .FirstOrDefaultAsync(m => m.MachineId == machineId);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found" });
            }

            var statistics = await _context.Set<MachineStatistics>()
                .Where(s => s.MachineId == machine.Id &&
                           s.CreatedAt >= startDate &&
                           s.CreatedAt <= endDate)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(statistics);
        }
    }
}
