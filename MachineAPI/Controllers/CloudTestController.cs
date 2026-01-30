using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MachineAPI.Data;
using MachineAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/Machine/[controller]")]
    [EnableRateLimiting("fixed")]
    public class CloudTestController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<CloudTestController> _logger;

        public CloudTestController(
            MachineDbContext context, 
            ILogger<CloudTestController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// CloudTest API Endpoint
        /// 
        /// Purpose: Simple connectivity test endpoint for external systems
        /// Returns: "Cloud test OK" to confirm API connectivity
        /// 
        /// Endpoint: GET/POST /api/CloudTest
        /// </summary>
        [HttpGet]
        [HttpPost]
        public IActionResult CloudTest()
        {
            try
            {
                _logger.LogInformation($"🔍 CloudTest request received");

                // Return success response in ESP32-compatible format
                return Content("\"Cloud test OK\"", "text/plain");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ CloudTest API Error");
                return Content("\"Cloud test failed\"", "text/plain");
            }
        }

        /// <summary>
        /// OPTIONS method for CORS support
        /// </summary>
        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }
    }
}