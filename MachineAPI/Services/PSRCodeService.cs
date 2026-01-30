using MachineAPI.Models;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace MachineAPI.Services
{
    public interface IPSRCodeService
    {
        bool ValidatePSRCode(string machineId, string psrCode);
        string? GetPSRCode(string machineId);
        string? GetMachineId(string psrCode);
        PSRCodeData? DecodePSRCode(string psrCode);
        bool IsConfigured { get; }
        PSRCodesSettings? Configuration { get; }
    }

    public class PSRCodeData
    {
        public string SocietyId { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public List<string> MachineIds { get; set; } = new List<string>(); // Array of machine IDs
        public string SecretKey { get; set; } = string.Empty; // Embedded secret key
        public long Timestamp { get; set; }
    }

    public class PSRCodeService : IPSRCodeService
    {
        private readonly PSRCodesSettings? _psrConfig;
        private readonly ILogger<PSRCodeService> _logger;
        private readonly IEncryptionService _encryptionService;
        private readonly PSRCodeData? _decodedMasterData;

        public bool IsConfigured => !string.IsNullOrEmpty(_psrConfig?.MasterPSRCode) || 
                                     (_psrConfig?.Codes != null && _psrConfig.Codes.Count > 0);
        public PSRCodesSettings? Configuration => _psrConfig;

        public PSRCodeService(
            IConfiguration configuration, 
            ILogger<PSRCodeService> logger,
            IEncryptionService encryptionService)
        {
            _logger = logger;
            _encryptionService = encryptionService;

            try
            {
                // Try to load from appsettings
                _psrConfig = configuration.GetSection("PSRCodes").Get<PSRCodesSettings>();

                // If not in appsettings, try to load from psr-config.json
                if (string.IsNullOrEmpty(_psrConfig?.MasterPSRCode))
                {
                    var psrConfigPath = Path.Combine(AppContext.BaseDirectory, "psr-config.json");
                    if (File.Exists(psrConfigPath))
                    {
                        var jsonContent = File.ReadAllText(psrConfigPath);
                        var fileConfig = System.Text.Json.JsonSerializer.Deserialize<PSRCodeConfig>(jsonContent);
                        
                        if (fileConfig != null && !string.IsNullOrEmpty(fileConfig.MasterPSRCode))
                        {
                            _psrConfig = new PSRCodesSettings
                            {
                                MasterPSRCode = fileConfig.MasterPSRCode
                            };
                        }
                    }
                }

                // Decode master PSR code once on startup (for backward compatibility)
                if (!string.IsNullOrEmpty(_psrConfig?.MasterPSRCode))
                {
                    _decodedMasterData = DecodePSRCode(_psrConfig.MasterPSRCode);
                    
                    if (_decodedMasterData != null)
                    {
                        _logger.LogInformation(
                            "PSR Code Service initialized. Machines: {Count}",
                            _decodedMasterData.MachineIds.Count
                        );
                    }
                }
                else if (_psrConfig?.Codes != null && _psrConfig.Codes.Count > 0)
                {
                    // New multi-code format - decode first code for legacy compatibility
                    try
                    {
                        _decodedMasterData = DecodePSRCode(_psrConfig.Codes[0]);
                        
                        if (_decodedMasterData != null)
                        {
                            _logger.LogInformation(
                                "PSR Code Service initialized. PSR Codes: {CodeCount}, Machines: {Count}",
                                _psrConfig.Codes.Count,
                                _decodedMasterData.MachineIds.Count
                            );
                        }
                    }
                    catch (Exception decodeEx)
                    {
                        _logger.LogDebug(decodeEx, "Pre-decoding PSR code during initialization (non-critical)");
                    }
                }
                else
                {
                    _logger.LogWarning("PSR Code configuration not found. API will operate without PSR validation.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load PSR Code configuration");
            }
        }

        public PSRCodeData? DecodePSRCode(string psrCode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(psrCode) || !psrCode.StartsWith("PSR-"))
                {
                    return null;
                }

                // New ultra-compact format: PSR-{BASE85_ENCODED_DATA} (no checksum)
                // Extract encoded data after "PSR-" prefix
                var encodedData = psrCode.Substring(4); // Skip "PSR-"

                // Decrypt the encoded data using internal encryption key
                string jsonString;
                try
                {
                    jsonString = _encryptionService.Decrypt(encodedData);
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Failed to decrypt PSR code - may be invalid format or encryption key");
                    return null;
                }

                // Parse JSON with case-insensitive property names
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var decoded = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString, options);
                
                if (decoded == null)
                {
                    return null;
                }

                // Extract machine IDs - supports multiple formats
                var machineIds = new List<string>();
                string societyId = "";
                string model = "";
                
                // Compact format: { s, m: [{ t, i: [] }] }
                if (decoded.ContainsKey("m") && decoded["m"].ValueKind == JsonValueKind.Array)
                {
                    societyId = decoded.ContainsKey("s") ? decoded["s"].GetString() ?? "" : "";
                    var models = decoded["m"].EnumerateArray().ToList();
                    if (models.Any())
                    {
                        model = models[0].TryGetProperty("t", out var modelType) ? modelType.GetString() ?? "" : "";
                        foreach (var m in models)
                        {
                            if (m.TryGetProperty("i", out var ids) && ids.ValueKind == JsonValueKind.Array)
                            {
                                var normalizedIds = ids.EnumerateArray()
                                    .Select(e => e.GetString() ?? "")
                                    .Where(s => !string.IsNullOrEmpty(s))
                                    .Select(id => SessionManager.NormalizeMachineId(id)); // Normalize machine IDs
                                machineIds.AddRange(normalizedIds);
                            }
                        }
                    }
                }
                // Old multi-machine format: { sid, model, mids: [] }
                else if (decoded.ContainsKey("mids") && decoded["mids"].ValueKind == JsonValueKind.Array)
                {
                    societyId = decoded.ContainsKey("sid") ? decoded["sid"].GetString() ?? "" : "";
                    model = decoded.ContainsKey("model") ? decoded["model"].GetString() ?? "" : "";
                    machineIds = decoded["mids"].EnumerateArray()
                        .Select(e => e.GetString() ?? "")
                        .Where(s => !string.IsNullOrEmpty(s))
                        .Select(id => SessionManager.NormalizeMachineId(id)) // Normalize machine IDs
                        .ToList();
                }
                // Legacy single-machine format: { sid, model, mid }
                else if (decoded.ContainsKey("mid"))
                {
                    societyId = decoded.ContainsKey("sid") ? decoded["sid"].GetString() ?? "" : "";
                    model = decoded.ContainsKey("model") ? decoded["model"].GetString() ?? "" : "";
                    var mid = decoded["mid"].GetString();
                    if (!string.IsNullOrEmpty(mid))
                    {
                        machineIds.Add(SessionManager.NormalizeMachineId(mid)); // Normalize machine ID
                    }
                }

                return new PSRCodeData
                {
                    SocietyId = societyId,
                    Model = model,
                    MachineIds = machineIds,
                    SecretKey = decoded.ContainsKey("k") ? decoded["k"].GetString() ?? "" : "",
                    Timestamp = decoded.ContainsKey("ts") ? decoded["ts"].GetInt64() : 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to decode PSR code: {PSRCode}", psrCode);
                return null;
            }
        }

        public bool ValidatePSRCode(string machineId, string psrCode)
        {
            if (!IsConfigured)
            {
                // If PSR codes are not configured, allow all requests
                return true;
            }

            if (string.IsNullOrWhiteSpace(machineId) || string.IsNullOrWhiteSpace(psrCode))
            {
                return false;
            }

            // Check if provided PSR code matches master PSR code
            if (!psrCode.Equals(_psrConfig!.MasterPSRCode, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("PSR code does not match master PSR code");
                return false;
            }

            // Decode the PSR code
            var decodedData = DecodePSRCode(psrCode);
            if (decodedData == null)
            {
                _logger.LogWarning("Failed to decode PSR code for machine {MachineId}", machineId);
                return false;
            }

            // Validate machine ID is in the decoded machine IDs list
            if (!decodedData.MachineIds.Any(mid => 
                string.Equals(mid, machineId, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.LogWarning(
                    "Machine ID {MachineId} not found in PSR code's machine list",
                    machineId
                );
                return false;
            }

            return true;
        }

        public string? GetPSRCode(string machineId)
        {
            if (!IsConfigured || string.IsNullOrWhiteSpace(machineId))
            {
                return null;
            }

            // Check if machine ID is in the decoded master data
            if (_decodedMasterData?.MachineIds.Any(mid => 
                string.Equals(mid, machineId, StringComparison.OrdinalIgnoreCase)) == true)
            {
                return _psrConfig!.MasterPSRCode;
            }

            return null;
        }

        public string? GetMachineId(string psrCode)
        {
            if (string.IsNullOrWhiteSpace(psrCode))
            {
                return null;
            }

            // Decode PSR code to get machine IDs
            var decodedData = DecodePSRCode(psrCode);
            // Return first machine ID (for backward compatibility with old API expecting single ID)
            return decodedData?.MachineIds?.FirstOrDefault();
        }
    }
}
