using Microsoft.AspNetCore.Mvc;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly ISessionManager _sessionManager;
        private readonly ILogger<SessionController> _logger;

        public SessionController(ISessionManager sessionManager, ILogger<SessionController> logger)
        {
            _sessionManager = sessionManager;
            _logger = logger;
        }

        /// <summary>
        /// Initialize session with PSR code (called once when app starts)
        /// POST: api/Session/Initialize
        /// Body: { "psrCode": "PSR-xxxx-xxxx", "secretKey": "your-secret-key" }
        /// </summary>
        [HttpPost("Initialize")]
        public async Task<IActionResult> Initialize([FromBody] InitializeRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PsrCode) || string.IsNullOrEmpty(request.SecretKey))
                {
                    return BadRequest(new { message = "PSR code and secret key are required" });
                }

                var result = await _sessionManager.InitializeSession(request.PsrCode, request.SecretKey);
                
                if (!result)
                {
                    return BadRequest(new { message = "Failed to initialize session. Invalid PSR code." });
                }

                var sessionData = _sessionManager.GetSessionData();
                
                return Ok(new
                {
                    message = "Session initialized successfully",
                    societyId = sessionData?.SocietyId,
                    machineCount = sessionData?.MachineIds.Count ?? 0,
                    initializedAt = sessionData?.InitializedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Initialize");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Check if session is active
        /// GET: api/Session/Status
        /// </summary>
        [HttpGet("Status")]
        public IActionResult GetStatus()
        {
            var isActive = _sessionManager.IsSessionActive();
            var sessionData = _sessionManager.GetSessionData();

            return Ok(new
            {
                isActive,
                societyId = sessionData?.SocietyId,
                machineCount = sessionData?.MachineIds.Count ?? 0,
                initializedAt = sessionData?.InitializedAt
            });
        }

        /// <summary>
        /// Clear current session
        /// POST: api/Session/Clear
        /// </summary>
        [HttpPost("Clear")]
        public IActionResult ClearSession()
        {
            _sessionManager.ClearSession();
            return Ok(new { message = "Session cleared successfully" });
        }
    }

    public class InitializeRequest
    {
        public string PsrCode { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
    }
}
