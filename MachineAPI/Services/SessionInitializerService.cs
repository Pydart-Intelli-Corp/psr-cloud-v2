using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MachineAPI.Services
{
    /// <summary>
    /// Background service that automatically initializes the session on application startup
    /// </summary>
    public class SessionInitializerService : IHostedService
    {
        // HIDDEN INTERNAL SECRET KEY - DO NOT EXPOSE IN CONFIG FILES
        private const string INTERNAL_SECRET_KEY = "psr-hidden-secret-2026-secure-key-7x9#mK$pL@2wQ!vN";
        
        private readonly ISessionManager _sessionManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SessionInitializerService> _logger;

        public SessionInitializerService(
            ISessionManager sessionManager,
            IConfiguration configuration,
            ILogger<SessionInitializerService> logger)
        {
            _sessionManager = sessionManager;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                var autoInitialize = _configuration.GetValue<bool>("PSRCodes:AutoInitialize");
                
                if (!autoInitialize)
                {
                    _logger.LogInformation("Auto-initialization is disabled");
                    return;
                }

                // Load PSR codes from configuration (supports both array and single code)
                var psrCodes = new List<string>();
                
                // Try new array format first
                var codesArray = _configuration.GetSection("PSRCodes:Codes").Get<string[]>();
                if (codesArray != null && codesArray.Length > 0)
                {
                    psrCodes.AddRange(codesArray.Where(c => !string.IsNullOrEmpty(c)));
                }
                
                // Fallback to legacy single code format
                if (psrCodes.Count == 0)
                {
                    var singleCode = _configuration["PSRCodes:MasterPSRCode"];
                    if (!string.IsNullOrEmpty(singleCode))
                    {
                        psrCodes.Add(singleCode);
                    }
                }
                
                // Use internal secret key as fallback
                var secretKey = INTERNAL_SECRET_KEY;

                if (psrCodes.Count == 0)
                {
                    _logger.LogWarning("No PSR codes configured. Skipping auto-initialization.");
                    return;
                }

                _logger.LogInformation($"Initializing session with {psrCodes.Count} PSR code(s)...");

                bool result;
                if (psrCodes.Count == 1)
                {
                    result = await _sessionManager.InitializeSession(psrCodes[0], secretKey);
                }
                else
                {
                    result = await _sessionManager.InitializeMultipleSessions(psrCodes, secretKey);
                }

                if (result)
                {
                    var sessionData = _sessionManager.GetSessionData();
                    _logger.LogInformation(
                        "✅ Session initialized successfully! Society: {SocietyId}, PSR Codes: {CodeCount}, Machine Models: {ModelCount}, Total Machines: {MachineCount}",
                        sessionData?.SocietyId,
                        psrCodes.Count,
                        sessionData?.MachineModels?.Count ?? 0,
                        sessionData?.MachineIds?.Count ?? 0
                    );
                    
                    var maskedKey = sessionData?.SecretKey != null && sessionData.SecretKey.Length > 8
                        ? sessionData.SecretKey.Substring(0, 4) + "****" + sessionData.SecretKey.Substring(sessionData.SecretKey.Length - 4)
                        : "****";
                    _logger.LogInformation("🔐 Active Secret Key: {SecretKey}", maskedKey);
                    _logger.LogInformation("📡 API is ready to accept requests with X-Secret-Key header");
                }
                else
                {
                    _logger.LogError("❌ Failed to initialize session. Invalid PSR code.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during session auto-initialization");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Session service stopping...");
            return Task.CompletedTask;
        }
    }
}
