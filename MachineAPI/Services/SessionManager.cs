using System.Collections.Concurrent;

namespace MachineAPI.Services
{
    public interface ISessionManager
    {
        Task<bool> InitializeSession(string psrCode, string secretKey);
        Task<bool> InitializeMultipleSessions(List<string> psrCodes, string secretKey);
        bool ValidateRequest(string societyId, string machineId);
        bool IsSessionActive();
        SessionData? GetSessionData();
        void ClearSession();
    }

    public class SessionData
    {
        public string SocietyId { get; set; } = string.Empty;
        public string MachineModel { get; set; } = string.Empty;
        public List<string> MachineIds { get; set; } = new List<string>();
        public List<string> MachineModels { get; set; } = new List<string>();
        public DateTime InitializedAt { get; set; }
        public string SecretKey { get; set; } = string.Empty;
        
        // Support for multiple societies
        public Dictionary<string, SocietyData> Societies { get; set; } = new Dictionary<string, SocietyData>(StringComparer.OrdinalIgnoreCase);
    }
    
    public class SocietyData
    {
        public string SocietyId { get; set; } = string.Empty;
        public List<string> MachineIds { get; set; } = new List<string>();
        public List<string> Models { get; set; } = new List<string>();
        public string SecretKey { get; set; } = string.Empty;
    }

    public class SessionManager : ISessionManager
    {
        private readonly IPSRCodeService _psrService;
        private readonly ILogger<SessionManager> _logger;
        private static readonly ConcurrentDictionary<string, SessionData> _sessions = new();
        private const string MASTER_SESSION_KEY = "MASTER_SESSION";

        /// <summary>
        /// Normalizes machine ID by removing first letter prefix (MM15 -> M15)
        /// Used consistently across all machine creation and lookup operations
        /// </summary>
        public static string NormalizeMachineId(string machineId)
        {
            if (string.IsNullOrWhiteSpace(machineId))
                return string.Empty;

            // If machine ID starts with double letter prefix (like MM15, AA123, etc.)
            // Remove the first letter to normalize (MM15 -> M15)
            if (machineId.Length > 2 && 
                char.IsLetter(machineId[0]) && 
                char.IsLetter(machineId[1]))
            {
                return machineId.Substring(1);
            }

            return machineId;
        }

        public SessionManager(IPSRCodeService psrService, ILogger<SessionManager> logger)
        {
            _psrService = psrService;
            _logger = logger;
        }

        public async Task<bool> InitializeSession(string psrCode, string secretKey)
        {
            try
            {
                // Decode PSR code
                var decodedData = _psrService.DecodePSRCode(psrCode);
                if (decodedData == null)
                {
                    _logger.LogWarning("Failed to decode PSR code");
                    return false;
                }

                // Create session data
                var sessionData = new SessionData
                {
                    SocietyId = decodedData.SocietyId,
                    MachineModel = decodedData.Model,
                    MachineIds = decodedData.MachineIds,
                    InitializedAt = DateTime.UtcNow,
                    SecretKey = !string.IsNullOrEmpty(decodedData.SecretKey) 
                        ? decodedData.SecretKey  // Use secret key from PSR code
                        : secretKey  // Fallback to provided secret key
                };

                // Store in memory
                _sessions[MASTER_SESSION_KEY] = sessionData;

                _logger.LogInformation($"Session initialized for Society: {sessionData.SocietyId}, Machines: {string.Join(", ", sessionData.MachineIds)}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing session");
                return false;
            }
        }

        public bool ValidateRequest(string societyId, string machineId)
        {
            if (!_sessions.TryGetValue(MASTER_SESSION_KEY, out var session))
            {
                _logger.LogWarning("No active session found");
                return false;
            }

            // Multi-society mode
            if (session.Societies != null && session.Societies.Count > 0)
            {
                // Find which society this request belongs to (keep society ID as-is, case-insensitive)
                var matchingSociety = session.Societies.Values
                    .FirstOrDefault(s => s.SocietyId.Equals(societyId, StringComparison.OrdinalIgnoreCase));

                if (matchingSociety == null)
                {
                    _logger.LogWarning($"Society {societyId} not found in active sessions");
                    return false;
                }

                // Normalize machine ID (MM129 -> M129)
                var normalizedMachineId = NormalizeMachineId(machineId);

                // Validate machine ID is in this society's allowed list
                var machineIdFound = matchingSociety.MachineIds.Any(m => 
                    m.Equals(normalizedMachineId, StringComparison.OrdinalIgnoreCase));

                if (!machineIdFound)
                {
                    _logger.LogWarning($"Machine ID {machineId} (normalized: {normalizedMachineId}) not authorized for society {societyId}");
                    return false;
                }

                return true;
            }
            else
            {
                // Legacy single-society mode (backward compatibility)
                // Validate society ID matches (case-insensitive, keep as-is)
                if (!session.SocietyId.Equals(societyId, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning($"Society mismatch: Request={societyId}, Session={session.SocietyId}");
                    return false;
                }

                // Normalize machine ID (MM15 -> M15)
                var normalizedMachineId = NormalizeMachineId(machineId);

                // Validate machine ID is in allowed list
                var machineIdFound = session.MachineIds.Any(m => 
                    m.Equals(normalizedMachineId, StringComparison.OrdinalIgnoreCase));

                if (!machineIdFound)
                {
                    _logger.LogWarning($"Machine ID {machineId} not in authorized list: {string.Join(", ", session.MachineIds)}");
                    return false;
                }

                return true;
            }
        }

        public bool IsSessionActive()
        {
            return _sessions.ContainsKey(MASTER_SESSION_KEY);
        }

        public SessionData? GetSessionData()
        {
            _sessions.TryGetValue(MASTER_SESSION_KEY, out var session);
            return session;
        }

        public async Task<bool> InitializeMultipleSessions(List<string> psrCodes, string secretKey)
        {
            try
            {
                if (psrCodes == null || psrCodes.Count == 0)
                {
                    _logger.LogWarning("No PSR codes provided");
                    return false;
                }

                var societies = new Dictionary<string, SocietyData>(StringComparer.OrdinalIgnoreCase);
                var allMachineIds = new List<string>();
                var allModels = new List<string>();
                string? primarySocietyId = null;
                string? primarySecretKey = null;

                // Decode and organize by society
                foreach (var psrCode in psrCodes)
                {
                    var decodedData = _psrService.DecodePSRCode(psrCode);
                    if (decodedData == null)
                    {
                        _logger.LogWarning($"Failed to decode PSR code: {psrCode.Substring(0, Math.Min(20, psrCode.Length))}...");
                        continue;
                    }

                    var societyId = decodedData.SocietyId;
                    
                    // Create or get society data
                    if (!societies.ContainsKey(societyId))
                    {
                        societies[societyId] = new SocietyData
                        {
                            SocietyId = societyId,
                            MachineIds = new List<string>(),
                            Models = new List<string>(),
                            SecretKey = !string.IsNullOrEmpty(decodedData.SecretKey) 
                                ? decodedData.SecretKey 
                                : secretKey
                        };
                    }

                    var society = societies[societyId];

                    // Merge machine IDs for this society (avoiding duplicates)
                    foreach (var machineId in decodedData.MachineIds)
                    {
                        if (!society.MachineIds.Contains(machineId))
                        {
                            society.MachineIds.Add(machineId);
                            allMachineIds.Add(machineId);
                        }
                    }

                    // Collect models for this society
                    if (!string.IsNullOrEmpty(decodedData.Model) && !society.Models.Contains(decodedData.Model))
                    {
                        society.Models.Add(decodedData.Model);
                    }

                    // Track primary society (first one decoded)
                    if (primarySocietyId == null)
                    {
                        primarySocietyId = societyId;
                        primarySecretKey = society.SecretKey;
                    }

                    // Collect all unique models
                    if (!string.IsNullOrEmpty(decodedData.Model) && !allModels.Contains(decodedData.Model))
                    {
                        allModels.Add(decodedData.Model);
                    }
                }

                if (societies.Count == 0 || string.IsNullOrEmpty(primarySocietyId))
                {
                    _logger.LogError("No valid PSR codes decoded");
                    return false;
                }

                // Create merged session data
                var sessionData = new SessionData
                {
                    SocietyId = primarySocietyId, // Primary society for backward compatibility
                    MachineModel = allModels.FirstOrDefault() ?? "",
                    MachineIds = allMachineIds,
                    MachineModels = allModels,
                    InitializedAt = DateTime.UtcNow,
                    SecretKey = primarySecretKey ?? secretKey,
                    Societies = societies
                };

                // Store in memory
                _sessions[MASTER_SESSION_KEY] = sessionData;

                _logger.LogInformation(
                    $"Multiple sessions initialized - Societies: {societies.Count}, Total PSR Codes: {psrCodes.Count}, Total Machines: {allMachineIds.Count}"
                );
                
                // Log each society's details
                foreach (var society in societies.Values)
                {
                    var maskedKey = society.SecretKey.Length > 8 
                        ? society.SecretKey.Substring(0, 4) + "****" + society.SecretKey.Substring(society.SecretKey.Length - 4)
                        : "****";
                    _logger.LogInformation(
                        $"  Society {society.SocietyId}: {society.MachineIds.Count} machines, Secret Key: {maskedKey}"
                    );
                }
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing multiple sessions");
                return false;
            }
        }

        public void ClearSession()
        {
            _sessions.TryRemove(MASTER_SESSION_KEY, out _);
            _logger.LogInformation("Session cleared");
        }
    }
}
