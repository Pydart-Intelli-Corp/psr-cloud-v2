using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordsController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<PasswordsController> _logger;

        public PasswordsController(MachineDbContext context, ILogger<PasswordsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/passwords/machine/{machineId}/logs
        [HttpGet("machine/{machineId}/logs")]
        public async Task<ActionResult<IEnumerable<MachinePasswordLog>>> GetPasswordLogs(
            int machineId,
            [FromQuery] string? passwordType,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.MachinePasswordLogs
                    .Where(p => p.MachineId == machineId);

                if (!string.IsNullOrEmpty(passwordType))
                    query = query.Where(p => p.PasswordType == passwordType);

                var totalCount = await query.CountAsync();
                var logs = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(p => p.Machine)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching password logs for machine {MachineId}", machineId);
                return StatusCode(500, new { message = "Error fetching password logs", error = ex.Message });
            }
        }

        // POST: api/passwords/machine/{machineId}/change
        [HttpPost("machine/{machineId}/change")]
        public async Task<ActionResult> ChangePassword(int machineId, [FromBody] PasswordChangeRequest request)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(machineId);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                string? oldPassword = null;
                bool passwordUpdated = false;

                // Password fields removed from Machine model in schema simplification
                // Keeping endpoints for API compatibility but returning appropriate messages
                return BadRequest(new { 
                    message = "Password functionality removed - Machine model simplified",
                    reason = "UserPassword, SupervisorPassword, StatusU, and StatusS fields removed from database schema",
                    suggestion = "Use machine authentication through PSR codes instead"
                });

                if (passwordUpdated)
                {
                    machine.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Log the password change
                    var log = new MachinePasswordLog
                    {
                        MachineId = machineId,
                        PasswordType = request.PasswordType.ToLower(),
                        OldPassword = oldPassword,
                        NewPassword = request.NewPassword,
                        ChangedBy = request.ChangedBy,
                        ChangeReason = request.Reason,
                        IpAddress = GetClientIpAddress(),
                        IsSuccessful = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.MachinePasswordLogs.Add(log);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Changed {PasswordType} password for machine {MachineId} by {ChangedBy}", 
                        request.PasswordType, machineId, request.ChangedBy);

                    return Ok(new 
                    { 
                        message = $"{request.PasswordType} password changed successfully",
                        machineId,
                        passwordType = request.PasswordType,
                        changedAt = DateTime.UtcNow
                    });
                }

                return StatusCode(500, new { message = "Failed to update password" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for machine {MachineId}", machineId);
                
                // Log failed attempt
                var failedLog = new MachinePasswordLog
                {
                    MachineId = machineId,
                    PasswordType = request.PasswordType.ToLower(),
                    NewPassword = request.NewPassword,
                    ChangedBy = request.ChangedBy,
                    ChangeReason = $"Failed: {ex.Message}",
                    IpAddress = GetClientIpAddress(),
                    IsSuccessful = false,
                    CreatedAt = DateTime.UtcNow
                };

                try
                {
                    _context.MachinePasswordLogs.Add(failedLog);
                    await _context.SaveChangesAsync();
                }
                catch { }

                return StatusCode(500, new { message = "Error changing password", error = ex.Message });
            }
        }

        // POST: api/passwords/machine/{machineId}/verify
        [HttpPost("machine/{machineId}/verify")]
        public async Task<ActionResult> VerifyPassword(int machineId, [FromBody] PasswordVerification request)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(machineId);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                // Password fields removed from Machine model
                _logger.LogInformation("Password verification requested for machine {MachineId}, type {PasswordType} - functionality removed", 
                    machineId, request.PasswordType);

                return Ok(new 
                { 
                    isValid = false,
                    machineId,
                    passwordType = request.PasswordType,
                    hasPassword = false,
                    message = "Password functionality removed - use PSR code authentication instead"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying password for machine {MachineId}", machineId);
                return StatusCode(500, new { message = "Error verifying password", error = ex.Message });
            }
        }

        // GET: api/passwords/machine/{machineId}/status
        [HttpGet("machine/{machineId}/status")]
        public async Task<ActionResult> GetPasswordStatus(int machineId)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(machineId);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                var lastUserChange = await _context.MachinePasswordLogs
                    .Where(p => p.MachineId == machineId && p.PasswordType == "user" && p.IsSuccessful)
                    .OrderByDescending(p => p.CreatedAt)
                    .FirstOrDefaultAsync();

                var lastSupervisorChange = await _context.MachinePasswordLogs
                    .Where(p => p.MachineId == machineId && p.PasswordType == "supervisor" && p.IsSuccessful)
                    .OrderByDescending(p => p.CreatedAt)
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    machineId,
                    machineIdStr = machine.MachineId,
                    userPassword = new
                    {
                        isSet = false,
                        hasPassword = false,
                        message = "Password functionality removed"
                    },
                    supervisorPassword = new
                    {
                        isSet = false,
                        hasPassword = false,
                        message = "Password functionality removed"
                    },
                    note = "Machine model simplified - use PSR code authentication instead"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching password status for machine {MachineId}", machineId);
                return StatusCode(500, new { message = "Error fetching password status", error = ex.Message });
            }
        }

        // POST: api/passwords/machine/{machineId}/reset
        [HttpPost("machine/{machineId}/reset")]
        public async Task<ActionResult> ResetPassword(int machineId, [FromBody] PasswordReset request)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(machineId);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                // Password functionality removed from Machine model
                _logger.LogInformation("Password reset requested for machine {MachineId}, type {PasswordType} - functionality removed", 
                    machineId, request.PasswordType);

                return Ok(new 
                { 
                    message = "Password functionality removed from Machine model",
                    machineId,
                    passwordType = request.PasswordType,
                    suggestion = "Use PSR code authentication instead"
                });


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for machine {MachineId}", machineId);
                return StatusCode(500, new { message = "Error resetting password", error = ex.Message });
            }
        }

        // Helper method to get client IP address
        private string? GetClientIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }
    }

    // DTOs
    public class PasswordChangeRequest
    {
        public string PasswordType { get; set; } = "user"; // user or supervisor
        public string NewPassword { get; set; } = string.Empty;
        public string? ChangedBy { get; set; }
        public string? Reason { get; set; }
    }

    public class PasswordVerification
    {
        public string PasswordType { get; set; } = "user";
        public string Password { get; set; } = string.Empty;
    }

    public class PasswordReset
    {
        public string PasswordType { get; set; } = "user";
        public string ResetBy { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}
