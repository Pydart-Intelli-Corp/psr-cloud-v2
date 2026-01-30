using Microsoft.AspNetCore.Mvc;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PSRController : ControllerBase
    {
        private readonly IPSRCodeService _psrService;
        private readonly ILogger<PSRController> _logger;

        public PSRController(IPSRCodeService psrService, ILogger<PSRController> logger)
        {
            _psrService = psrService;
            _logger = logger;
        }

        /// <summary>
        /// Get PSR configuration status
        /// </summary>
        [HttpGet("config")]
        public ActionResult GetConfig()
        {
            if (!_psrService.IsConfigured)
            {
                return Ok(new
                {
                    configured = false,
                    message = "PSR codes not configured. API operates in open mode."
                });
            }

            var config = _psrService.Configuration;
            
            // Decode master PSR code to get details
            var decodedData = _psrService.DecodePSRCode(config!.MasterPSRCode);
            
            return Ok(new
            {
                configured = true,
                totalMachines = decodedData?.MachineIds.Count ?? 0,
                message = "PSR codes are active. All operations require valid PSR codes."
            });
        }

        /// <summary>
        /// Validate a PSR code for a machine
        /// </summary>
        [HttpPost("validate")]
        public ActionResult ValidatePSRCode([FromBody] PSRValidationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MachineId) || string.IsNullOrWhiteSpace(request.PSRCode))
            {
                return BadRequest(new { error = "MachineId and PSRCode are required" });
            }

            var isValid = _psrService.ValidatePSRCode(request.MachineId, request.PSRCode);

            if (isValid)
            {
                return Ok(new
                {
                    valid = true,
                    machineId = request.MachineId,
                    psrCode = request.PSRCode,
                    message = "PSR code is valid"
                });
            }
            else
            {
                return Ok(new
                {
                    valid = false,
                    machineId = request.MachineId,
                    message = "Invalid PSR code for this machine"
                });
            }
        }

        /// <summary>
        /// Decode a PSR code to extract society ID, machine model, and machine ID
        /// </summary>
        [HttpPost("decode")]
        public ActionResult DecodePSRCode([FromBody] PSRDecodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PSRCode))
            {
                return BadRequest(new { error = "PSRCode is required" });
            }

            var decodedData = _psrService.DecodePSRCode(request.PSRCode);

            if (decodedData == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid PSR code format or corrupted data"
                });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    societyId = decodedData.SocietyId,
                    machineModel = decodedData.Model,
                    machineIds = decodedData.MachineIds, // Array of machine IDs
                    totalMachines = decodedData.MachineIds.Count,
                    timestamp = decodedData.Timestamp,
                    generatedDate = DateTimeOffset.FromUnixTimeMilliseconds(decodedData.Timestamp).ToString("yyyy-MM-dd HH:mm:ss")
                },
                message = "PSR code decoded successfully"
            });
        }

        /// <summary>
        /// Get PSR code for a machine ID
        /// </summary>
        [HttpGet("machine/{machineId}")]
        public ActionResult GetPSRCode(string machineId)
        {
            if (!_psrService.IsConfigured)
            {
                return Ok(new
                {
                    configured = false,
                    message = "PSR codes not configured"
                });
            }

            var psrCode = _psrService.GetPSRCode(machineId);

            if (psrCode != null)
            {
                return Ok(new
                {
                    machineId,
                    psrCode,
                    message = "PSR code found"
                });
            }
            else
            {
                return NotFound(new
                {
                    machineId,
                    message = "Machine ID not found in PSR configuration"
                });
            }
        }

        /// <summary>
        /// Get machine ID from PSR code
        /// </summary>
        [HttpGet("code/{psrCode}")]
        public ActionResult GetMachineId(string psrCode)
        {
            if (!_psrService.IsConfigured)
            {
                return Ok(new
                {
                    configured = false,
                    message = "PSR codes not configured"
                });
            }

            var machineId = _psrService.GetMachineId(psrCode);

            if (machineId != null)
            {
                return Ok(new
                {
                    psrCode,
                    machineId,
                    message = "Machine ID found"
                });
            }
            else
            {
                return NotFound(new
                {
                    psrCode,
                    message = "PSR code not found in configuration"
                });
            }
        }

        /// <summary>
        /// Get all PSR code mappings
        /// </summary>
        [HttpGet("mappings")]
        public ActionResult GetAllMappings()
        {
            if (!_psrService.IsConfigured)
            {
                return Ok(new
                {
                    configured = false,
                    mappings = new Dictionary<string, string>(),
                    message = "PSR codes not configured"
                });
            }

            var config = _psrService.Configuration;
            var decodedData = _psrService.DecodePSRCode(config!.MasterPSRCode);
            
            return Ok(new
            {
                configured = true,
                totalMachines = decodedData?.MachineIds.Count ?? 0,
                machineIds = decodedData?.MachineIds ?? new List<string>()
            });
        }
    }

    public class PSRValidationRequest
    {
        public string MachineId { get; set; } = string.Empty;
        public string PSRCode { get; set; } = string.Empty;
    }

    public class PSRDecodeRequest
    {
        public string PSRCode { get; set; } = string.Empty;
    }
}
