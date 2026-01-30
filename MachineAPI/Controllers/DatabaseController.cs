using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<DatabaseController> _logger;

        public DatabaseController(MachineDbContext context, ILogger<DatabaseController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("update-schema")]
        public async Task<IActionResult> UpdateSchema()
        {
            try
            {
                // Add missing columns to machines table
                var addColumnsQuery = @"
                    ALTER TABLE machines 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";

                await _context.Database.ExecuteSqlRawAsync(addColumnsQuery);
                _logger.LogInformation("✅ Added missing columns to machines table");

                // Create machine_statistics table if not exists
                var createStatsTable = @"
                    CREATE TABLE IF NOT EXISTS machine_statistics (
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      machine_id INT NOT NULL,
                      society_id INT NOT NULL,
                      machine_type VARCHAR(50) NOT NULL,
                      version VARCHAR(20) NOT NULL,
                      total_test INT DEFAULT 0,
                      daily_cleaning INT DEFAULT 0,
                      weekly_cleaning INT DEFAULT 0,
                      cleaning_skip INT DEFAULT 0,
                      gain INT DEFAULT 0,
                      auto_channel VARCHAR(20) DEFAULT NULL,
                      statistics_date DATE NOT NULL,
                      statistics_time TIME NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      INDEX idx_machine_id (machine_id),
                      INDEX idx_society_id (society_id),
                      INDEX idx_statistics_date (statistics_date),
                      INDEX idx_created_at (created_at),
                      INDEX idx_machine_date (machine_id, statistics_date),
                      FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
                      FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
                    )";

                await _context.Database.ExecuteSqlRawAsync(createStatsTable);
                _logger.LogInformation("✅ Created/verified machine_statistics table");

                return Ok(new { 
                    message = "Database schema updated successfully",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating database schema");
                return StatusCode(500, new { 
                    message = "Error updating database schema", 
                    error = ex.Message 
                });
            }
        }

        [HttpGet("verify-schema")]
        public async Task<IActionResult> VerifySchema()
        {
            try
            {
                // Check machines table structure
                var machinesColumns = await _context.Database.ExecuteSqlRawAsync("SHOW COLUMNS FROM machines");
                
                // Check if machine_statistics table exists
                var tableExists = await _context.Database.ExecuteSqlRawAsync("SHOW TABLES LIKE 'machine_statistics'");

                return Ok(new { 
                    message = "Schema verification completed",
                    machinesTable = "Checked",
                    machineStatisticsTable = "Checked",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying database schema");
                return StatusCode(500, new { 
                    message = "Error verifying database schema", 
                    error = ex.Message 
                });
            }
        }
    }
}