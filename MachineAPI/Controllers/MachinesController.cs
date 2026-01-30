using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MachinesController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<MachinesController> _logger;

        public MachinesController(MachineDbContext context, ILogger<MachinesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/machines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Machine>>> GetMachines(
            [FromQuery] int? societyId,
            [FromQuery] string? machineType,
            [FromQuery] string? status,
            [FromQuery] bool? isMaster,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.Machines.AsQueryable();

                if (societyId.HasValue)
                    query = query.Where(m => m.SocietyId == societyId.Value);

                if (!string.IsNullOrEmpty(machineType))
                    query = query.Where(m => m.MachineType == machineType);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(m => m.Status == status);

                // Note: IsMasterMachine field removed from Machine model
                // if (isMaster.HasValue)
                //     query = query.Where(m => m.IsMasterMachine == isMaster.Value);

                var totalCount = await query.CountAsync();
                var machines = await query
                    .OrderBy(m => m.MachineId)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(machines);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching machines");
                return StatusCode(500, new { message = "Error fetching machines", error = ex.Message });
            }
        }

        // GET: api/machines/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Machine>> GetMachine(int id)
        {
            try
            {
                var machine = await _context.Machines
                    .Include(m => m.MilkCollections.OrderByDescending(c => c.CollectionDate).Take(10))
                    .Include(m => m.MilkDispatches.OrderByDescending(d => d.DispatchDate).Take(10))
                    .Include(m => m.MilkSales.OrderByDescending(s => s.SalesDate).Take(10))
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                return Ok(machine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching machine {Id}", id);
                return StatusCode(500, new { message = "Error fetching machine", error = ex.Message });
            }
        }

        // GET: api/machines/by-machine-id/{machineId}
        [HttpGet("by-machine-id/{machineId}")]
        public async Task<ActionResult<Machine>> GetMachineByMachineId(string machineId)
        {
            try
            {
                var machine = await _context.Machines
                    .FirstOrDefaultAsync(m => m.MachineId == machineId);

                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                return Ok(machine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching machine by ID {MachineId}", machineId);
                return StatusCode(500, new { message = "Error fetching machine", error = ex.Message });
            }
        }

        // POST: api/machines
        [HttpPost]
        public async Task<ActionResult<Machine>> CreateMachine(Machine machine)
        {
            try
            {
                // Check for duplicate machine ID
                var duplicate = await _context.Machines.AnyAsync(m => m.MachineId == machine.MachineId);
                if (duplicate)
                    return BadRequest(new { message = "Machine ID already exists" });

                machine.CreatedAt = DateTime.UtcNow;
                machine.UpdatedAt = DateTime.UtcNow;

                _context.Machines.Add(machine);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created machine {Id} with machine ID {MachineId}", machine.Id, machine.MachineId);

                return CreatedAtAction(nameof(GetMachine), new { id = machine.Id }, machine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating machine");
                return StatusCode(500, new { message = "Error creating machine", error = ex.Message });
            }
        }

        // PUT: api/machines/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMachine(int id, Machine machine)
        {
            if (id != machine.Id)
                return BadRequest(new { message = "ID mismatch" });

            try
            {
                var existing = await _context.Machines.FindAsync(id);
                if (existing == null)
                    return NotFound(new { message = "Machine not found" });

                existing.MachineType = machine.MachineType;
                existing.SocietyId = machine.SocietyId;
                existing.Status = machine.Status;
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated machine {Id}", id);

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating machine {Id}", id);
                return StatusCode(500, new { message = "Error updating machine", error = ex.Message });
            }
        }

        // PUT: api/machines/password
        [HttpPut("password")]
        public async Task<IActionResult> UpdateMachinePassword([FromBody] MachinePasswordUpdate passwordUpdate)
        {
            try
            {
                if (string.IsNullOrEmpty(passwordUpdate.MachineId))
                    return BadRequest(new { message = "Machine ID is required" });

                var machine = await _context.Machines.FirstOrDefaultAsync(m => m.MachineId == passwordUpdate.MachineId);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                if (string.IsNullOrEmpty(passwordUpdate.UserPassword) && string.IsNullOrEmpty(passwordUpdate.SupervisorPassword))
                    return BadRequest(new { message = "At least one password must be provided" });

                if (!string.IsNullOrEmpty(passwordUpdate.UserPassword))
                {
                    machine.UserPassword = passwordUpdate.UserPassword;
                    machine.StatusU = true;
                }

                if (!string.IsNullOrEmpty(passwordUpdate.SupervisorPassword))
                {
                    machine.SupervisorPassword = passwordUpdate.SupervisorPassword;
                    machine.StatusS = true;
                }

                machine.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated passwords for machine {MachineId}", passwordUpdate.MachineId);

                return Ok(new { 
                    message = "Machine passwords updated successfully",
                    statusU = machine.StatusU,
                    statusS = machine.StatusS
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating machine passwords");
                return StatusCode(500, new { message = "Failed to update machine passwords" });
            }
        }

        // PUT: api/machines/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateMachineStatus(int id, [FromBody] MachineStatusUpdate statusUpdate)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(id);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                machine.Status = statusUpdate.Status;
                machine.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated status for machine {Id} to {Status}", id, statusUpdate.Status);

                return Ok(new { message = "Status updated successfully", status = machine.Status });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating machine status {Id}", id);
                return StatusCode(500, new { message = "Error updating status", error = ex.Message });
            }
        }

        // DELETE: api/machines/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(id);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                // Check if machine has related records
                var hasCollections = await _context.MilkCollections.AnyAsync(c => c.MachineId == id);
                var hasDispatches = await _context.MilkDispatches.AnyAsync(d => d.MachineId == id);
                var hasSales = await _context.MilkSales.AnyAsync(s => s.MachineId == id);

                if (hasCollections || hasDispatches || hasSales)
                    return BadRequest(new { message = "Cannot delete machine with existing collections, dispatches, or sales" });

                _context.Machines.Remove(machine);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted machine {Id}", id);

                return Ok(new { message = "Machine deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting machine {Id}", id);
                return StatusCode(500, new { message = "Error deleting machine", error = ex.Message });
            }
        }

        // GET: api/machines/{id}/statistics
        [HttpGet("{id}/statistics")]
        public async Task<ActionResult> GetMachineStatistics(int id, [FromQuery] int days = 30)
        {
            try
            {
                var machine = await _context.Machines.FindAsync(id);
                if (machine == null)
                    return NotFound(new { message = "Machine not found" });

                var fromDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-days));

                var collectionStats = await _context.MilkCollections
                    .Where(c => c.MachineId == id && c.CollectionDate >= fromDate)
                    .GroupBy(c => 1)
                    .Select(g => new
                    {
                        count = g.Count(),
                        totalQuantity = g.Sum(c => c.Quantity),
                        avgFat = g.Average(c => c.FatPercentage),
                        avgSnf = g.Average(c => c.SnfPercentage)
                    })
                    .FirstOrDefaultAsync();

                var dispatchStats = await _context.MilkDispatches
                    .Where(d => d.MachineId == id && d.DispatchDate >= fromDate)
                    .GroupBy(d => 1)
                    .Select(g => new
                    {
                        count = g.Count(),
                        totalQuantity = g.Sum(d => d.Quantity)
                    })
                    .FirstOrDefaultAsync();

                var salesStats = await _context.MilkSales
                    .Where(s => s.MachineId == id && s.SalesDate >= fromDate)
                    .GroupBy(s => 1)
                    .Select(g => new
                    {
                        count = g.Count(),
                        totalQuantity = g.Sum(s => s.Quantity),
                        totalAmount = g.Sum(s => s.TotalAmount)
                    })
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    machine = new
                    {
                        id = machine.Id,
                        machineId = machine.MachineId,
                        machineType = machine.MachineType,
                        status = machine.Status
                    },
                    period = $"Last {days} days",
                    collections = collectionStats ?? new { count = 0, totalQuantity = 0m, avgFat = 0m, avgSnf = 0m },
                    dispatches = dispatchStats ?? new { count = 0, totalQuantity = 0m },
                    sales = salesStats ?? new { count = 0, totalQuantity = 0m, totalAmount = 0m }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching machine statistics {Id}", id);
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }
    }

    // DTOs for password and status updates
    public class MachinePasswordUpdate
    {
        public string MachineId { get; set; } = string.Empty;
        public string? UserPassword { get; set; }
        public string? SupervisorPassword { get; set; }
    }

    public class MachineStatusUpdate
    {
        public string Status { get; set; } = string.Empty;
    }
}
