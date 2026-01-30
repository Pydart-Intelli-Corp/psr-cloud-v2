using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MachinePasswordController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<MachinePasswordController> _logger;

        public MachinePasswordController(MachineDbContext context, ILogger<MachinePasswordController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("UpdateMachinePasswordStatus")]
        [HttpPost("UpdateMachinePasswordStatus")]
        public async Task<IActionResult> UpdateMachinePasswordStatus([FromQuery] string? InputString)
        {
            try
            {
                _logger.LogInformation("🔍 UpdateMachinePasswordStatus API Request - {Time}", DateTime.UtcNow);

                // PRIORITY 1: Extract InputString from query or body
                if (string.IsNullOrEmpty(InputString) && Request.Method == "POST")
                {
                    using var reader = new StreamReader(Request.Body);
                    var body = await reader.ReadToEndAsync();
                    if (body.StartsWith("InputString="))
                        InputString = body.Substring(12);
                }

                if (string.IsNullOrWhiteSpace(InputString))
                {
                    _logger.LogWarning("❌ InputString is required");
                    return new ContentResult
                    {
                        Content = "\"InputString parameter is required\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Filter line endings
                InputString = InputString.Replace("\r", "").Replace("\n", "").Trim();
                _logger.LogInformation("🔍 InputString: {Input}", InputString);

                // Parse input: societyId|machineType|version|machineId|passwordType(optional)
                var parts = InputString.Split('|');
                if (parts.Length != 4 && parts.Length != 5)
                {
                    _logger.LogWarning("❌ Invalid InputString format. Expected 4 or 5 parts, got {Count}", parts.Length);
                    return new ContentResult
                    {
                        Content = "\"Invalid InputString format. Expected: societyId|machineType|version|machineId|passwordType(optional)\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                string societyIdStr = parts[0];
                string machineType = parts[1];
                string machineModel = parts[2];
                string machineIdStr = parts[3];
                string? passwordType = parts.Length == 5 ? parts[4] : null;

                _logger.LogInformation("🔍 Parsed parts - Society: {Society}, Type: {Type}, Model: {Model}, Machine: {Machine}, PasswordType: {PasswordType}",
                    societyIdStr, machineType, machineModel, machineIdStr, passwordType ?? "both");

                // PRIORITY 2: Validate Society/BMC ID and find actual database ID
                Society? society = null;
                if (societyIdStr.StartsWith("S", StringComparison.OrdinalIgnoreCase))
                {
                    var socId = societyIdStr.StartsWith("S-") ? societyIdStr.Substring(2) : societyIdStr.Substring(1);
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.SocietyId == socId);
                    if (society != null)
                        _logger.LogInformation("✅ Found society: \"{SocietyIdStr}\" -> database ID: {Id}", societyIdStr, society.Id);
                }
                else if (int.TryParse(societyIdStr, out var bmcId))
                {
                    society = await _context.Societies.FirstOrDefaultAsync(s => s.BmcId == bmcId);
                    if (society != null)
                        _logger.LogInformation("✅ Found BMC: \"{SocietyIdStr}\" -> database ID: {Id}", societyIdStr, society.Id);
                }

                if (society == null)
                {
                    _logger.LogWarning("❌ Society not found: {SocietyId}", societyIdStr);
                    return new ContentResult
                    {
                        Content = "\"Invalid society ID\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // PRIORITY 3: Validate Machine ID and find machine
                var normalizedMachineId = SessionManager.NormalizeMachineId(machineIdStr);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    _logger.LogWarning("❌ Machine not found for society {SocietyId}, machine ID {MachineId}", society.Id, machineIdStr);
                    return new ContentResult
                    {
                        Content = "\"Machine not found\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation("✅ Found machine: ID {Id}, machine_id: {MachineId}", machine.Id, machine.MachineId);
                _logger.LogInformation("🔍 Current status - User: {StatusU}, Supervisor: {StatusS}", machine.StatusU, machine.StatusS);

                // PRIORITY 4: Validate Password Type
                bool updateBoth = string.IsNullOrEmpty(passwordType);
                bool isUserPassword = passwordType == "U";
                bool isSupervisorPassword = passwordType == "S";

                if (!updateBoth && !isUserPassword && !isSupervisorPassword)
                {
                    _logger.LogWarning("❌ Invalid password type: {PasswordType}. Must be 'U' or 'S'", passwordType);
                    return new ContentResult
                    {
                        Content = "\"Invalid password type. Must be U or S\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                _logger.LogInformation("🔍 Password type: {Type} ({Description})",
                    passwordType ?? "both",
                    updateBoth ? "Both passwords" : isUserPassword ? "User password" : "Supervisor password");

                // PRIORITY 5: Update the appropriate password status
                if (updateBoth)
                {
                    _logger.LogInformation("🔄 Updating both statusU ({StatusU}) and statusS ({StatusS}) to 0 for machine ID: {Id}",
                        machine.StatusU, machine.StatusS, machine.Id);
                    machine.StatusU = false;
                    machine.StatusS = false;
                }
                else if (isUserPassword)
                {
                    _logger.LogInformation("🔄 Updating statusU from {StatusU} to 0 for machine ID: {Id}", machine.StatusU, machine.Id);
                    machine.StatusU = false;
                }
                else
                {
                    _logger.LogInformation("🔄 Updating statusS from {StatusS} to 0 for machine ID: {Id}", machine.StatusS, machine.Id);
                    machine.StatusS = false;
                }

                machine.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // PRIORITY 6: Verify the update
                await _context.Entry(machine).ReloadAsync();
                _logger.LogInformation("🔍 Verification - Updated status - User: {StatusU}, Supervisor: {StatusS}",
                    machine.StatusU, machine.StatusS);

                var successMessage = updateBoth
                    ? $"Both password statuses updated to 0 for machine {machine.MachineId}"
                    : isUserPassword
                    ? $"User password status updated to 0 for machine {machine.MachineId}"
                    : $"Supervisor password status updated to 0 for machine {machine.MachineId}";

                _logger.LogInformation("📤 {Message}", successMessage);

                return new ContentResult
                {
                    Content = "\"Machine password status updated successfully.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in UpdateMachinePasswordStatus API");
                return new ContentResult
                {
                    Content = "\"Status update failed\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
        }
    }
}
