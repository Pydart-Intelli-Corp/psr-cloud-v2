using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DispatchesController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<DispatchesController> _logger;
        private readonly ISessionManager _sessionManager;

        public DispatchesController(MachineDbContext context, ILogger<DispatchesController> logger, ISessionManager sessionManager)
        {
            _context = context;
            _logger = logger;
            _sessionManager = sessionManager;
        }

        // GET: api/dispatches
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MilkDispatch>>> GetDispatches(
            [FromQuery] int? machineId,
            [FromQuery] int? societyId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] string? shiftType,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.MilkDispatches.AsQueryable();

                if (machineId.HasValue)
                    query = query.Where(d => d.MachineId == machineId.Value);

                if (societyId.HasValue)
                    query = query.Where(d => d.SocietyId == societyId.Value);

                if (fromDate.HasValue)
                    query = query.Where(d => d.DispatchDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(d => d.DispatchDate <= toDate.Value);

                if (!string.IsNullOrEmpty(shiftType))
                    query = query.Where(d => d.ShiftType == shiftType);

                var totalCount = await query.CountAsync();
                var dispatches = await query
                    .OrderByDescending(d => d.DispatchDate)
                    .ThenByDescending(d => d.DispatchTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(d => d.Machine)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(dispatches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dispatches");
                return StatusCode(500, new { message = "Error fetching dispatches", error = ex.Message });
            }
        }

        // GET: api/dispatches/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MilkDispatch>> GetDispatch(int id)
        {
            try
            {
                var dispatch = await _context.MilkDispatches
                    .Include(d => d.Machine)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dispatch == null)
                    return NotFound(new { message = "Dispatch not found" });

                return Ok(dispatch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dispatch {Id}", id);
                return StatusCode(500, new { message = "Error fetching dispatch", error = ex.Message });
            }
        }

        // POST: api/dispatches
        [HttpPost]
        public async Task<ActionResult<MilkDispatch>> CreateDispatch(MilkDispatch dispatch)
        {
            try
            {
                var machineExists = await _context.Machines.AnyAsync(m => m.Id == dispatch.MachineId);
                if (!machineExists)
                    return BadRequest(new { message = "Machine not found" });

                // Check for duplicate dispatch
                var duplicate = await _context.MilkDispatches.AnyAsync(d =>
                    d.DispatchId == dispatch.DispatchId &&
                    d.MachineId == dispatch.MachineId &&
                    d.DispatchDate == dispatch.DispatchDate);

                if (duplicate)
                    return BadRequest(new { message = "Duplicate dispatch record" });

                dispatch.CreatedAt = DateTime.UtcNow;
                dispatch.UpdatedAt = DateTime.UtcNow;

                _context.MilkDispatches.Add(dispatch);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created dispatch {Id} with dispatch ID {DispatchId}", dispatch.Id, dispatch.DispatchId);

                return CreatedAtAction(nameof(GetDispatch), new { id = dispatch.Id }, dispatch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dispatch");
                return StatusCode(500, new { message = "Error creating dispatch", error = ex.Message });
            }
        }

        // POST: api/dispatches/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> CreateBulkDispatches([FromBody] List<MilkDispatch> dispatches)
        {
            try
            {
                if (dispatches == null || !dispatches.Any())
                    return BadRequest(new { message = "No dispatches provided" });

                var now = DateTime.UtcNow;
                foreach (var dispatch in dispatches)
                {
                    dispatch.CreatedAt = now;
                    dispatch.UpdatedAt = now;
                }

                _context.MilkDispatches.AddRange(dispatches);
                var saved = await _context.SaveChangesAsync();

                _logger.LogInformation("Created {Count} dispatches in bulk", saved);

                return Ok(new { message = $"Created {saved} dispatches", count = saved });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bulk dispatches");
                return StatusCode(500, new { message = "Error creating bulk dispatches", error = ex.Message });
            }
        }

        // PUT: api/dispatches/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDispatch(int id, MilkDispatch dispatch)
        {
            if (id != dispatch.Id)
                return BadRequest(new { message = "ID mismatch" });

            try
            {
                var existing = await _context.MilkDispatches.FindAsync(id);
                if (existing == null)
                    return NotFound(new { message = "Dispatch not found" });

                existing.SocietyId = dispatch.SocietyId;
                existing.Quantity = Math.Round(dispatch.Quantity, 2);
                existing.FatPercentage = Math.Round(dispatch.FatPercentage, 2);
                existing.SnfPercentage = Math.Round(dispatch.SnfPercentage, 2);
                existing.ClrValue = Math.Round(dispatch.ClrValue, 2);
                existing.RatePerLiter = Math.Round(dispatch.RatePerLiter, 2);
                existing.TotalAmount = Math.Round(dispatch.TotalAmount, 2);
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated dispatch {Id}", id);

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dispatch {Id}", id);
                return StatusCode(500, new { message = "Error updating dispatch", error = ex.Message });
            }
        }

        // DELETE: api/dispatches/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDispatch(int id)
        {
            try
            {
                var dispatch = await _context.MilkDispatches.FindAsync(id);
                if (dispatch == null)
                    return NotFound(new { message = "Dispatch not found" });

                _context.MilkDispatches.Remove(dispatch);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted dispatch {Id}", id);

                return Ok(new { message = "Dispatch deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting dispatch {Id}", id);
                return StatusCode(500, new { message = "Error deleting dispatch", error = ex.Message });
            }
        }

        // GET: api/dispatches/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult> GetStatistics(
            [FromQuery] int? societyId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            try
            {
                var query = _context.MilkDispatches.AsQueryable();

                if (societyId.HasValue)
                    query = query.Where(d => d.SocietyId == societyId.Value);

                if (fromDate.HasValue)
                    query = query.Where(d => d.DispatchDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(d => d.DispatchDate <= toDate.Value);

                var stats = await query
                    .GroupBy(d => 1)
                    .Select(g => new
                    {
                        totalDispatches = g.Count(),
                        totalQuantity = g.Sum(d => d.Quantity),
                        averageFat = g.Average(d => d.FatPercentage),
                        averageSnf = g.Average(d => d.SnfPercentage),
                        totalAmount = g.Sum(d => d.TotalAmount)
                    })
                    .FirstOrDefaultAsync();

                return Ok(stats ?? new
                {
                    totalDispatches = 0,
                    totalQuantity = 0m,
                    averageFat = 0m,
                    averageSnf = 0m,
                    totalAmount = 0m
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dispatch statistics");
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Save Dispatch Details From Machine
        /// GET/POST: api/Dispatches/SaveDispatchDetails?InputString={data}
        /// Format: societyId|machineType|version|machineId|shift|extra|channel|F{fat}|S{snf}|C{clr}|I{dispatchId}|Q{quantity}|R{totalAmount}|r{rate}|D{datetime}
        /// Example: S1|LSE-SVPWTBQ-12AH|LE2.00|MM15|MR|N|COW|F090.70|S07.90|C28.00|I001001|Q00010.00|R00059.70|r005.97|D2001-01-01_00:00:00
        /// </summary>
        [HttpGet("SaveDispatchDetails")]
        [HttpPost("SaveDispatchDetails")]
        [EnableRateLimiting("fixed")]
        [Route("~/api/Dispatch/SaveDispatchDetails")] // Support singular form
        public async Task<ActionResult> SaveDispatchDetails([FromQuery] string InputString)
        {
            try
            {
                _logger.LogInformation("=== SaveDispatchDetails API Request ===");
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

                // Parse input string - expected 15 parts for dispatch
                var inputParts = InputString.Split('|');
                
                if (inputParts.Length != 15)
                {
                    _logger.LogError($"Invalid InputString format. Expected 15 parts, got {inputParts.Length}");
                    return new ContentResult
                    {
                        Content = "\"Invalid InputString format\"",
                        ContentType = "text/plain; charset=utf-8",
                        StatusCode = 200
                    };
                }

                var societyIdStr = inputParts[0];
                var machineType = inputParts[1];
                var version = inputParts[2];
                var machineIdStr = inputParts[3];
                var shift = inputParts[4];
                var dispatchIdStr = inputParts[5];
                var extra = inputParts[6];
                var channel = inputParts[7];
                var fatStr = inputParts[8];
                var snfStr = inputParts[9];
                var clrStr = inputParts[10];
                var quantityStr = inputParts[11];
                var totalAmountStr = inputParts[12];
                var rateStr = inputParts[13];
                var datetimeStr = inputParts[14];

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Version={version}, Machine={machineIdStr}");
                _logger.LogInformation($"Dispatch={dispatchIdStr}, Shift={shift}, Channel={channel}, Datetime={datetimeStr}");

                // Parse numeric values and round to 2 decimal places
                if (!decimal.TryParse(fatStr[1..], out decimal fat)) fat = 0;
                if (!decimal.TryParse(snfStr[1..], out decimal snf)) snf = 0;
                if (!decimal.TryParse(clrStr[1..], out decimal clr)) clr = 0;
                if (!decimal.TryParse(quantityStr[1..], out decimal quantity)) quantity = 0;
                if (!decimal.TryParse(totalAmountStr[1..], out decimal totalAmount)) totalAmount = 0;
                if (!decimal.TryParse(rateStr[1..], out decimal rate)) rate = 0;
                
                fat = Math.Round(fat, 2);
                snf = Math.Round(snf, 2);
                clr = Math.Round(clr, 2);
                quantity = Math.Round(quantity, 2);
                totalAmount = Math.Round(totalAmount, 2);
                rate = Math.Round(rate, 2);
                
                var dispatchId = dispatchIdStr[1..]; // Remove 'I' prefix

                _logger.LogInformation($"Values: Fat={fat}, SNF={snf}, CLR={clr}, DispatchId={dispatchId}");
                _logger.LogInformation($"Quantity={quantity}, Rate={rate}, Amount={totalAmount}");

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
                    // Auto-create society 
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

                // Parse datetime: D2001-01-01_00:00:00 -> date: 2001-01-01, time: 00:00:00
                var datetime = datetimeStr[1..]; // Remove 'D' prefix
                var datetimeParts = datetime.Split('_');
                var datePart = datetimeParts[0]; // 2001-01-01
                var timePart = datetimeParts.Length > 1 ? datetimeParts[1].Replace('-', ':') : "00:00:00"; // 00:00:00

                if (!DateOnly.TryParse(datePart, out DateOnly dispatchDate))
                    dispatchDate = DateOnly.FromDateTime(DateTime.Now);
                
                if (!TimeOnly.TryParse(timePart, out TimeOnly dispatchTime))
                    dispatchTime = TimeOnly.FromDateTime(DateTime.Now);

                // Determine shift type (morning, evening, or other)
                var shiftType = shift.ToUpper() switch
                {
                    "MO" => "morning",
                    "EV" => "evening", 
                    "MR" => "morning",
                    _ => "morning"
                };

                _logger.LogInformation($"Dispatch: Date={dispatchDate}, Time={dispatchTime}, Shift={shiftType}");

                // Create dispatch record (with duplicate key handling)
                var dispatch = new MilkDispatch
                {
                    DispatchId = dispatchId,
                    SocietyId = society.Id,
                    MachineId = machine.Id,
                    DispatchDate = dispatchDate,
                    DispatchTime = dispatchTime,
                    ShiftType = shiftType,
                    Channel = channel,
                    FatPercentage = fat,
                    SnfPercentage = snf,
                    ClrValue = clr,
                    Quantity = quantity,
                    RatePerLiter = rate,
                    TotalAmount = totalAmount,
                    MachineType = machineType,
                    MachineVersion = version,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Check for existing dispatch (unique constraint)
                var existingDispatch = await _context.MilkDispatches
                    .FirstOrDefaultAsync(d => 
                        d.DispatchId == dispatchId && 
                        d.SocietyId == society.Id && 
                        d.MachineId == machine.Id && 
                        d.DispatchDate == dispatchDate && 
                        d.DispatchTime == dispatchTime && 
                        d.ShiftType == shiftType);

                if (existingDispatch != null)
                {
                    // Update existing dispatch
                    existingDispatch.Channel = channel;
                    existingDispatch.FatPercentage = fat;
                    existingDispatch.SnfPercentage = snf;
                    existingDispatch.ClrValue = clr;
                    existingDispatch.Quantity = quantity;
                    existingDispatch.RatePerLiter = rate;
                    existingDispatch.TotalAmount = totalAmount;
                    existingDispatch.MachineType = machineType;
                    existingDispatch.MachineVersion = version;
                    existingDispatch.UpdatedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation($"✅ Updated existing dispatch {dispatchId}");
                }
                else
                {
                    // Create new dispatch
                    _context.MilkDispatches.Add(dispatch);
                    _logger.LogInformation($"✅ Created new dispatch {dispatchId}");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Dispatch saved successfully: {dispatchId}");

                return new ContentResult
                {
                    Content = "\"Dispatch details saved successfully.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveDispatchDetails");
                
                return new ContentResult
                {
                    Content = "\"Failed to save dispatch details\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }
    }
}
