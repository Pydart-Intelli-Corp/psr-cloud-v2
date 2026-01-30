using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<SalesController> _logger;
        private readonly ISessionManager _sessionManager;

        public SalesController(MachineDbContext context, ILogger<SalesController> logger, ISessionManager sessionManager)
        {
            _context = context;
            _logger = logger;
            _sessionManager = sessionManager;
        }

        // GET: api/sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MilkSale>>> GetSales(
            [FromQuery] int? machineId,
            [FromQuery] int? societyId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] string? customerName,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.MilkSales.AsQueryable();

                if (machineId.HasValue)
                    query = query.Where(s => s.MachineId == machineId.Value);

                if (societyId.HasValue)
                    query = query.Where(s => s.SocietyId == societyId.Value);

                if (fromDate.HasValue)
                    query = query.Where(s => s.SalesDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(s => s.SalesDate <= toDate.Value);

                if (!string.IsNullOrEmpty(customerName))
                    query = query.Where(s => s.CustomerName != null && s.CustomerName.Contains(customerName));

                var totalCount = await query.CountAsync();
                var sales = await query
                    .OrderByDescending(s => s.SalesDate)
                    .ThenByDescending(s => s.SalesTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(s => s.Machine)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sales");
                return StatusCode(500, new { message = "Error fetching sales", error = ex.Message });
            }
        }

        // GET: api/sales/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MilkSale>> GetSale(int id)
        {
            try
            {
                var sale = await _context.MilkSales
                    .Include(s => s.Machine)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (sale == null)
                    return NotFound(new { message = "Sale not found" });

                return Ok(sale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sale {Id}", id);
                return StatusCode(500, new { message = "Error fetching sale", error = ex.Message });
            }
        }

        // POST: api/sales
        [HttpPost]
        public async Task<ActionResult<MilkSale>> CreateSale(MilkSale sale)
        {
            try
            {
                var machineExists = await _context.Machines.AnyAsync(m => m.Id == sale.MachineId);
                if (!machineExists)
                    return BadRequest(new { message = "Machine not found" });

                sale.CreatedAt = DateTime.UtcNow;
                sale.UpdatedAt = DateTime.UtcNow;

                _context.MilkSales.Add(sale);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created sale {Id} for customer {CustomerName}", sale.Id, sale.CustomerName);

                return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, sale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sale");
                return StatusCode(500, new { message = "Error creating sale", error = ex.Message });
            }
        }

        // POST: api/sales/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> CreateBulkSales([FromBody] List<MilkSale> sales)
        {
            try
            {
                if (sales == null || !sales.Any())
                    return BadRequest(new { message = "No sales provided" });

                var now = DateTime.UtcNow;
                foreach (var sale in sales)
                {
                    sale.CreatedAt = now;
                    sale.UpdatedAt = now;
                }

                _context.MilkSales.AddRange(sales);
                var saved = await _context.SaveChangesAsync();

                _logger.LogInformation("Created {Count} sales in bulk", saved);

                return Ok(new { message = $"Created {saved} sales", count = saved });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bulk sales");
                return StatusCode(500, new { message = "Error creating bulk sales", error = ex.Message });
            }
        }

        // PUT: api/sales/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSale(int id, MilkSale sale)
        {
            if (id != sale.Id)
                return BadRequest(new { message = "ID mismatch" });

            try
            {
                var existing = await _context.MilkSales.FindAsync(id);
                if (existing == null)
                    return NotFound(new { message = "Sale not found" });

                existing.CustomerName = sale.CustomerName;
                existing.CustomerPhone = sale.CustomerPhone;
                existing.Quantity = Math.Round(sale.Quantity, 2);
                existing.RatePerLiter = Math.Round(sale.RatePerLiter, 2);
                existing.TotalAmount = Math.Round(sale.TotalAmount, 2);
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated sale {Id}", id);

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating sale {Id}", id);
                return StatusCode(500, new { message = "Error updating sale", error = ex.Message });
            }
        }

        // DELETE: api/sales/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            try
            {
                var sale = await _context.MilkSales.FindAsync(id);
                if (sale == null)
                    return NotFound(new { message = "Sale not found" });

                _context.MilkSales.Remove(sale);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted sale {Id}", id);

                return Ok(new { message = "Sale deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting sale {Id}", id);
                return StatusCode(500, new { message = "Error deleting sale", error = ex.Message });
            }
        }

        // GET: api/sales/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult> GetStatistics(
            [FromQuery] int? societyId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            try
            {
                var query = _context.MilkSales.AsQueryable();

                if (societyId.HasValue)
                    query = query.Where(s => s.SocietyId == societyId.Value);

                if (fromDate.HasValue)
                    query = query.Where(s => s.SalesDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(s => s.SalesDate <= toDate.Value);

                var stats = await query
                    .GroupBy(s => 1)
                    .Select(g => new
                    {
                        totalSales = g.Count(),
                        totalQuantity = g.Sum(s => s.Quantity),
                        totalAmount = g.Sum(s => s.TotalAmount),
                        averageRate = g.Average(s => s.RatePerLiter),
                        uniqueCustomers = g.Where(s => s.CustomerName != null).Select(s => s.CustomerName).Distinct().Count()
                    })
                    .FirstOrDefaultAsync();

                return Ok(stats ?? new
                {
                    totalSales = 0,
                    totalQuantity = 0m,
                    totalAmount = 0m,
                    averageRate = 0m,
                    uniqueCustomers = 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sales statistics");
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }

        // GET: api/sales/daily-report
        [HttpGet("daily-report")]
        public async Task<ActionResult> GetDailyReport([FromQuery] DateOnly? date)
        {
            try
            {
                var reportDate = date ?? DateOnly.FromDateTime(DateTime.Today);

                var report = await _context.MilkSales
                    .Where(s => s.SalesDate == reportDate)
                    .GroupBy(s => s.MachineId)
                    .Select(g => new
                    {
                        machineId = g.Key,
                        machineName = g.Select(s => s.Machine!.MachineId).FirstOrDefault(),
                        totalSales = g.Count(),
                        totalQuantity = g.Sum(s => s.Quantity),
                        totalAmount = g.Sum(s => s.TotalAmount)
                    })
                    .ToListAsync();

                return Ok(new
                {
                    date = reportDate,
                    machines = report,
                    summary = new
                    {
                        totalSales = report.Sum(r => r.totalSales),
                        totalQuantity = report.Sum(r => r.totalQuantity),
                        totalAmount = report.Sum(r => r.totalAmount)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating daily sales report");
                return StatusCode(500, new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Save Sales Details From Machine
        /// GET/POST: api/Sales/SaveSalesDetails?InputString={data}
        /// Format: societyId|machineType|version|machineId|shiftType|count|channel|Q{quantity}|R{totalAmount}|r{rate}|D{datetime}
        /// Example: S1|LSE-SVPWTBQ-12AH|LE3.36|MM15|EV|I4|COW|Q00100.00|R05500.00|r055.00|D2025-11-24_00:00:00
        /// </summary>
        [HttpGet("SaveSalesDetails")]
        [HttpPost("SaveSalesDetails")]
        [EnableRateLimiting("fixed")]
        [Route("~/api/Sale/SaveSalesDetails")] // Support singular form
        public async Task<ActionResult> SaveSalesDetails([FromQuery] string InputString)
        {
            try
            {
                _logger.LogInformation("=== SaveSalesDetails API Request ===");
                _logger.LogInformation($"Timestamp: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
                _logger.LogInformation($"InputString: {InputString}");

                if (string.IsNullOrEmpty(InputString))
                {
                    return new ContentResult
                    {
                        Content = "\"InputString parameter is required\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Parse input string - expected 10 or 11 parts for sales
                var inputParts = InputString.Split('|');
                
                if (inputParts.Length != 10 && inputParts.Length != 11)
                {
                    _logger.LogError($"Invalid InputString format. Expected 10 or 11 parts, got {inputParts.Length}");
                    return new ContentResult
                    {
                        Content = "\"Invalid InputString format\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                string societyIdStr, machineType, version, machineIdStr, shiftType, countStr, channel, quantityStr, totalAmountStr, rateStr, datetimeStr;
                
                if (inputParts.Length == 11)
                {
                    // Format: societyId|machineType|version|machineId|shiftType|count|channel|quantity|totalAmount|rate|datetime
                    societyIdStr = inputParts[0];
                    machineType = inputParts[1];
                    version = inputParts[2];
                    machineIdStr = inputParts[3];
                    shiftType = inputParts[4];
                    countStr = inputParts[5];
                    channel = inputParts[6];
                    quantityStr = inputParts[7];
                    totalAmountStr = inputParts[8];
                    rateStr = inputParts[9];
                    datetimeStr = inputParts[10];
                }
                else
                {
                    // Format: societyId|machineType|version|machineId|count|channel|quantity|totalAmount|rate|datetime (no shift type)
                    societyIdStr = inputParts[0];
                    machineType = inputParts[1];
                    version = inputParts[2];
                    machineIdStr = inputParts[3];
                    countStr = inputParts[4];
                    channel = inputParts[5];
                    quantityStr = inputParts[6];
                    totalAmountStr = inputParts[7];
                    rateStr = inputParts[8];
                    datetimeStr = inputParts[9];
                    shiftType = "EV"; // Default to evening shift
                }

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Version={version}, Machine={machineIdStr}");
                _logger.LogInformation($"Count={countStr}, Shift={shiftType}, Channel={channel}, Datetime={datetimeStr}");

                // Parse numeric values and round to 2 decimal places
                if (!decimal.TryParse(quantityStr[1..], out decimal quantity)) quantity = 0;
                if (!decimal.TryParse(totalAmountStr[1..], out decimal totalAmount)) totalAmount = 0;
                if (!decimal.TryParse(rateStr[1..], out decimal rate)) rate = 0;
                
                quantity = Math.Round(quantity, 2);
                totalAmount = Math.Round(totalAmount, 2);
                rate = Math.Round(rate, 2);
                
                var count = countStr[1..]; // Remove 'I' prefix

                _logger.LogInformation($"Values: Count={count}, Quantity={quantity}, Rate={rate}, Amount={totalAmount}");

                // Validate session authorization (same as MachineStatistics)
                if (!_sessionManager.ValidateRequest(societyIdStr, machineIdStr))
                {
                    _logger.LogWarning($"Validation failed for society {societyIdStr}, machine {machineIdStr}");
                    return new ContentResult
                    {
                        Content = "\"Invalid session or unauthorized machine\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                // Find or create society
                var society = await _context.Societies
                    .FirstOrDefaultAsync(s => 
                        s.SocietyId.ToLower() == societyIdStr.ToLower() || 
                        s.SocietyId.ToLower() == $"s-{societyIdStr.ToLower()}" ||
                        s.SocietyId.ToLower() == societyIdStr.ToLower().TrimStart('s', '-'));

                if (society == null)
                {
                    // Auto-create society since it's authorized in PSR code
                    society = new Society
                    {
                        SocietyId = societyIdStr,
                        Name = $"Society {societyIdStr}",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Societies.Add(society);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Auto-created society: {societyIdStr}");
                }

                _logger.LogInformation($"Society: {societyIdStr} -> DB ID: {society.Id}");

                // Check if machine exists and belongs to this society (use normalized machine ID)
                var normalizedMachineId = SessionManager.NormalizeMachineId(machineIdStr);
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId && m.SocietyId == society.Id);

                if (machine == null)
                {
                    // Check if machine exists in any other society
                    var machineInOtherSociety = await _context.Machines
                        .FirstOrDefaultAsync(m => m.MachineId == normalizedMachineId);

                    if (machineInOtherSociety != null)
                    {
                        var otherSociety = await _context.Societies
                            .FirstOrDefaultAsync(s => s.Id == machineInOtherSociety.SocietyId);
                        
                        _logger.LogError($"Machine {machineIdStr} (normalized: {normalizedMachineId}) belongs to society {otherSociety?.SocietyId}, not {societyIdStr}");
                        
                        return new ContentResult
                        {
                            Content = $"\"Machine {machineIdStr} belongs to different society\"",
                            ContentType = "text/plain; charset=utf-8",
                            StatusCode = 200
                        };
                    }

                    // Machine doesn't exist anywhere - only create if authorized in PSR
                    // Machine doesn't exist anywhere - create with normalized machine ID
                    machine = new Machine
                    {
                        MachineId = normalizedMachineId,
                        SocietyId = society.Id,
                        MachineType = machineType,
                        Status = "active",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Machines.Add(machine);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Auto-created machine: {normalizedMachineId} for society {societyIdStr} (original: {machineIdStr})");
                }

                _logger.LogInformation($"Machine: {machineIdStr} (normalized: {normalizedMachineId}) -> DB ID: {machine.Id}");

                // Parse datetime: D2025-09-26_10:29: -> date: 2025-09-26, time: 10:29:00
                var datetime = datetimeStr[1..]; // Remove 'D' prefix
                var datetimeParts = datetime.Split('_');
                var datePart = datetimeParts[0]; // 2025-09-26
                var timePart = datetimeParts.Length > 1 ? datetimeParts[1] : "00:00:00"; // 10:29: or 00:00:00
                
                // Clean up time part - remove trailing colons and ensure proper format
                timePart = timePart.TrimEnd(':'); // Remove trailing colon from "10:29:"
                var timeComponents = timePart.Split(':');
                var formattedTime = $"{(timeComponents.Length > 0 ? timeComponents[0] : "00").PadLeft(2, '0')}:{(timeComponents.Length > 1 ? timeComponents[1] : "00").PadLeft(2, '0')}:{(timeComponents.Length > 2 ? timeComponents[2] : "00").PadLeft(2, '0')}";

                if (!DateOnly.TryParse(datePart, out DateOnly salesDate))
                    salesDate = DateOnly.FromDateTime(DateTime.Now);
                
                if (!TimeOnly.TryParse(formattedTime, out TimeOnly salesTime))
                    salesTime = TimeOnly.FromDateTime(DateTime.Now);
                
                _logger.LogInformation($"Sales: Date={salesDate}, Time={salesTime}, Shift={shiftType}");

                // Create sales record with duplicate key handling
                var sale = new MilkSale
                {
                    Count = count,
                    SocietyId = society.Id,
                    MachineId = machine.Id,
                    SalesDate = salesDate,
                    SalesTime = salesTime,
                    ShiftType = shiftType,
                    Channel = channel,
                    Quantity = quantity,
                    RatePerLiter = rate,
                    TotalAmount = totalAmount,
                    MachineType = machineType,
                    MachineVersion = version,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Check for existing sale (unique constraint)
                var existingSale = await _context.MilkSales
                    .FirstOrDefaultAsync(s => 
                        s.Count == count && 
                        s.SocietyId == society.Id && 
                        s.MachineId == machine.Id && 
                        s.SalesDate == salesDate && 
                        s.SalesTime == salesTime && 
                        s.ShiftType == shiftType);

                if (existingSale != null)
                {
                    // Update existing sale
                    existingSale.Channel = channel;
                    existingSale.Quantity = quantity;
                    existingSale.RatePerLiter = rate;
                    existingSale.TotalAmount = totalAmount;
                    existingSale.MachineType = machineType;
                    existingSale.MachineVersion = version;
                    existingSale.UpdatedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation($"✅ Updated existing sale count {count}");
                }
                else
                {
                    // Create new sale
                    _context.MilkSales.Add(sale);
                    _logger.LogInformation($"✅ Created new sale count {count}");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Sale saved successfully for count {count}");

                return new ContentResult
                {
                    Content = "\"Sales details saved successfully.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveSalesDetails");
                
                return new ContentResult
                {
                    Content = "\"Failed to save sales details\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }
    }
}
