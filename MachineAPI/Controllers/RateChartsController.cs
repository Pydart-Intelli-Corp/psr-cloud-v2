using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RateChartsController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<RateChartsController> _logger;

        public RateChartsController(MachineDbContext context, ILogger<RateChartsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ratecharts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RateChart>>> GetRateCharts(
            [FromQuery] int? societyId,
            [FromQuery] int? bmcId,
            [FromQuery] string? channel,
            [FromQuery] bool? isActive,
            [FromQuery] DateOnly? effectiveDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.RateCharts.AsQueryable();

                if (societyId.HasValue)
                    query = query.Where(r => r.SocietyId == societyId.Value);

                if (bmcId.HasValue)
                    query = query.Where(r => r.BmcId == bmcId.Value);

                if (!string.IsNullOrEmpty(channel))
                    query = query.Where(r => r.Channel == channel);

                if (isActive.HasValue)
                    query = query.Where(r => r.IsActive == isActive.Value);

                if (effectiveDate.HasValue)
                    query = query.Where(r => r.ValidFrom <= effectiveDate.Value && 
                        (r.ValidTo == null || r.ValidTo >= effectiveDate.Value));

                var totalCount = await query.CountAsync();
                var rateCharts = await query
                    .OrderByDescending(r => r.Priority)
                    .ThenByDescending(r => r.ValidFrom)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(rateCharts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching rate charts");
                return StatusCode(500, new { message = "Error fetching rate charts", error = ex.Message });
            }
        }

        // GET: api/ratecharts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RateChart>> GetRateChart(int id)
        {
            try
            {
                var rateChart = await _context.RateCharts.FindAsync(id);

                if (rateChart == null)
                    return NotFound(new { message = "Rate chart not found" });

                return Ok(rateChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching rate chart {Id}", id);
                return StatusCode(500, new { message = "Error fetching rate chart", error = ex.Message });
            }
        }

        // POST: api/ratecharts
        [HttpPost]
        public async Task<ActionResult<RateChart>> CreateRateChart(RateChart rateChart)
        {
            try
            {
                rateChart.CreatedAt = DateTime.UtcNow;
                rateChart.UpdatedAt = DateTime.UtcNow;

                _context.RateCharts.Add(rateChart);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created rate chart {Id} for society {SocietyId}", rateChart.Id, rateChart.SocietyId);

                return CreatedAtAction(nameof(GetRateChart), new { id = rateChart.Id }, rateChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rate chart");
                return StatusCode(500, new { message = "Error creating rate chart", error = ex.Message });
            }
        }

        // POST: api/ratecharts/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> CreateBulkRateCharts([FromBody] List<RateChart> rateCharts)
        {
            try
            {
                if (rateCharts == null || !rateCharts.Any())
                    return BadRequest(new { message = "No rate charts provided" });

                var now = DateTime.UtcNow;
                foreach (var chart in rateCharts)
                {
                    chart.CreatedAt = now;
                    chart.UpdatedAt = now;
                }

                _context.RateCharts.AddRange(rateCharts);
                var saved = await _context.SaveChangesAsync();

                _logger.LogInformation("Created {Count} rate charts in bulk", saved);

                return Ok(new { message = $"Created {saved} rate charts", count = saved });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bulk rate charts");
                return StatusCode(500, new { message = "Error creating bulk rate charts", error = ex.Message });
            }
        }

        // PUT: api/ratecharts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRateChart(int id, RateChart rateChart)
        {
            if (id != rateChart.Id)
                return BadRequest(new { message = "ID mismatch" });

            try
            {
                var existing = await _context.RateCharts.FindAsync(id);
                if (existing == null)
                    return NotFound(new { message = "Rate chart not found" });

                existing.FatMin = rateChart.FatMin;
                existing.FatMax = rateChart.FatMax;
                existing.SnfMin = rateChart.SnfMin;
                existing.SnfMax = rateChart.SnfMax;
                existing.RatePerLiter = rateChart.RatePerLiter;
                existing.BonusPerLiter = rateChart.BonusPerLiter;
                existing.ValidFrom = rateChart.ValidFrom;
                existing.ValidTo = rateChart.ValidTo;
                existing.IsActive = rateChart.IsActive;
                existing.Priority = rateChart.Priority;
                existing.Description = rateChart.Description;
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated rate chart {Id}", id);

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating rate chart {Id}", id);
                return StatusCode(500, new { message = "Error updating rate chart", error = ex.Message });
            }
        }

        // DELETE: api/ratecharts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRateChart(int id)
        {
            try
            {
                var rateChart = await _context.RateCharts.FindAsync(id);
                if (rateChart == null)
                    return NotFound(new { message = "Rate chart not found" });

                _context.RateCharts.Remove(rateChart);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted rate chart {Id}", id);

                return Ok(new { message = "Rate chart deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting rate chart {Id}", id);
                return StatusCode(500, new { message = "Error deleting rate chart", error = ex.Message });
            }
        }

        // GET: api/ratecharts/calculate
        [HttpGet("calculate")]
        public async Task<ActionResult> CalculateRate(
            [FromQuery] int? societyId,
            [FromQuery] int? bmcId,
            [FromQuery] string channel,
            [FromQuery] decimal fat,
            [FromQuery] decimal snf,
            [FromQuery] decimal quantity,
            [FromQuery] DateOnly? date)
        {
            try
            {
                var effectiveDate = date ?? DateOnly.FromDateTime(DateTime.Today);

                var query = _context.RateCharts
                    .Where(r => r.IsActive &&
                                r.Channel == channel &&
                                r.FatMin <= fat && r.FatMax >= fat &&
                                r.SnfMin <= snf && r.SnfMax >= snf &&
                                r.ValidFrom <= effectiveDate &&
                                (r.ValidTo == null || r.ValidTo >= effectiveDate));

                if (societyId.HasValue)
                    query = query.Where(r => r.SocietyId == societyId.Value || r.SocietyId == null);

                if (bmcId.HasValue)
                    query = query.Where(r => r.BmcId == bmcId.Value || r.BmcId == null);

                var rateChart = await query
                    .OrderByDescending(r => r.Priority)
                    .ThenByDescending(r => r.SocietyId.HasValue ? 1 : 0) // Prefer society-specific rates
                    .FirstOrDefaultAsync();

                if (rateChart == null)
                    return NotFound(new { message = "No matching rate chart found" });

                var baseAmount = quantity * rateChart.RatePerLiter;
                var bonusAmount = quantity * rateChart.BonusPerLiter;
                var totalAmount = baseAmount + bonusAmount;

                return Ok(new
                {
                    rateChartId = rateChart.Id,
                    ratePerLiter = rateChart.RatePerLiter,
                    bonusPerLiter = rateChart.BonusPerLiter,
                    quantity,
                    baseAmount,
                    bonusAmount,
                    totalAmount,
                    fat,
                    snf,
                    channel
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating rate");
                return StatusCode(500, new { message = "Error calculating rate", error = ex.Message });
            }
        }

        // GET: api/ratecharts/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<RateChart>>> GetActiveRateCharts(
            [FromQuery] int? societyId,
            [FromQuery] string? channel)
        {
            try
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                var query = _context.RateCharts
                    .Where(r => r.IsActive &&
                                r.ValidFrom <= today &&
                                (r.ValidTo == null || r.ValidTo >= today));

                if (societyId.HasValue)
                    query = query.Where(r => r.SocietyId == societyId.Value || r.SocietyId == null);

                if (!string.IsNullOrEmpty(channel))
                    query = query.Where(r => r.Channel == channel);

                var charts = await query
                    .OrderByDescending(r => r.Priority)
                    .ThenBy(r => r.Channel)
                    .ThenBy(r => r.FatMin)
                    .ToListAsync();

                return Ok(charts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active rate charts");
                return StatusCode(500, new { message = "Error fetching active rate charts", error = ex.Message });
            }
        }

        // PUT: api/ratecharts/{id}/activate
        [HttpPut("{id}/activate")]
        public async Task<IActionResult> ActivateRateChart(int id)
        {
            try
            {
                var rateChart = await _context.RateCharts.FindAsync(id);
                if (rateChart == null)
                    return NotFound(new { message = "Rate chart not found" });

                rateChart.IsActive = true;
                rateChart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Rate chart activated", rateChart });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating rate chart {Id}", id);
                return StatusCode(500, new { message = "Error activating rate chart", error = ex.Message });
            }
        }

        // PUT: api/ratecharts/{id}/deactivate
        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivateRateChart(int id)
        {
            try
            {
                var rateChart = await _context.RateCharts.FindAsync(id);
                if (rateChart == null)
                    return NotFound(new { message = "Rate chart not found" });

                rateChart.IsActive = false;
                rateChart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Rate chart deactivated", rateChart });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating rate chart {Id}", id);
                return StatusCode(500, new { message = "Error deactivating rate chart", error = ex.Message });
            }
        }
    }
}
