using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Models;
using MachineAPI.Services;

namespace MachineAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/Collection")] // Support both Collections and Collection routes
    public class CollectionsController : ControllerBase
    {
        private readonly MachineDbContext _context;
        private readonly ILogger<CollectionsController> _logger;
        private readonly ISessionManager _sessionManager;

        public CollectionsController(
            MachineDbContext context, 
            ILogger<CollectionsController> logger,
            ISessionManager sessionManager)
        {
            _context = context;
            _logger = logger;
            _sessionManager = sessionManager;
        }

        // GET: api/collections
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MilkCollection>>> GetCollections(
            [FromQuery] int? machineId,
            [FromQuery] int? societyId,
            [FromQuery] string? farmerId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.MilkCollections.AsQueryable();

                // Apply filters
                if (machineId.HasValue)
                    query = query.Where(c => c.MachineId == machineId.Value);

                if (societyId.HasValue)
                    query = query.Where(c => c.SocietyId == societyId.Value);

                if (!string.IsNullOrEmpty(farmerId))
                    query = query.Where(c => c.FarmerId == farmerId);

                if (fromDate.HasValue)
                    query = query.Where(c => c.CollectionDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(c => c.CollectionDate <= toDate.Value);

                // Pagination
                var totalCount = await query.CountAsync();
                var collections = await query
                    .OrderByDescending(c => c.CollectionDate)
                    .ThenByDescending(c => c.CollectionTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(c => c.Machine)
                    .ToListAsync();

                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());

                return Ok(collections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching collections");
                return StatusCode(500, new { message = "Error fetching collections", error = ex.Message });
            }
        }

        // GET: api/collections/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MilkCollection>> GetCollection(int id)
        {
            try
            {
                var collection = await _context.MilkCollections
                    .Include(c => c.Machine)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (collection == null)
                    return NotFound(new { message = "Collection not found" });

                return Ok(collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching collection {Id}", id);
                return StatusCode(500, new { message = "Error fetching collection", error = ex.Message });
            }
        }

        // POST: api/collections
        [HttpPost]
        public async Task<ActionResult<MilkCollection>> CreateCollection(MilkCollection collection)
        {
            try
            {
                // Validate machine exists
                var machineExists = await _context.Machines.AnyAsync(m => m.Id == collection.MachineId);
                if (!machineExists)
                    return BadRequest(new { message = "Machine not found" });

                collection.CreatedAt = DateTime.UtcNow;
                collection.UpdatedAt = DateTime.UtcNow;

                _context.MilkCollections.Add(collection);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created collection {Id} for farmer {FarmerId}", collection.Id, collection.FarmerId);

                return CreatedAtAction(nameof(GetCollection), new { id = collection.Id }, collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating collection");
                return StatusCode(500, new { message = "Error creating collection", error = ex.Message });
            }
        }

        // POST: api/collections/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> CreateBulkCollections([FromBody] List<MilkCollection> collections)
        {
            try
            {
                if (collections == null || !collections.Any())
                    return BadRequest(new { message = "No collections provided" });

                var now = DateTime.UtcNow;
                foreach (var collection in collections)
                {
                    collection.CreatedAt = now;
                    collection.UpdatedAt = now;
                }

                _context.MilkCollections.AddRange(collections);
                var saved = await _context.SaveChangesAsync();

                _logger.LogInformation("Created {Count} collections in bulk", saved);

                return Ok(new { message = $"Created {saved} collections", count = saved });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bulk collections");
                return StatusCode(500, new { message = "Error creating bulk collections", error = ex.Message });
            }
        }

        // PUT: api/collections/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCollection(int id, MilkCollection collection)
        {
            if (id != collection.Id)
                return BadRequest(new { message = "ID mismatch" });

            try
            {
                var existing = await _context.MilkCollections.FindAsync(id);
                if (existing == null)
                    return NotFound(new { message = "Collection not found" });

                // Update fields with rounding to 2 decimal places
                existing.FarmerId = collection.FarmerId;
                existing.SocietyId = collection.SocietyId;
                existing.FarmerName = collection.FarmerName;
                existing.Quantity = Math.Round(collection.Quantity, 2);
                existing.FatPercentage = Math.Round(collection.FatPercentage, 2);
                existing.SnfPercentage = Math.Round(collection.SnfPercentage, 2);
                existing.ClrValue = Math.Round(collection.ClrValue, 2);
                existing.RatePerLiter = Math.Round(collection.RatePerLiter, 2);
                existing.TotalAmount = Math.Round(collection.TotalAmount, 2);
                existing.Bonus = Math.Round(collection.Bonus, 2);
                existing.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated collection {Id}", id);

                return Ok(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating collection {Id}", id);
                return StatusCode(500, new { message = "Error updating collection", error = ex.Message });
            }
        }

        // DELETE: api/collections/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
        {
            try
            {
                var collection = await _context.MilkCollections.FindAsync(id);
                if (collection == null)
                    return NotFound(new { message = "Collection not found" });

                _context.MilkCollections.Remove(collection);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted collection {Id}", id);

                return Ok(new { message = "Collection deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting collection {Id}", id);
                return StatusCode(500, new { message = "Error deleting collection", error = ex.Message });
            }
        }

        // GET: api/collections/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult> GetStatistics(
            [FromQuery] int? societyId,
            [FromQuery] DateOnly? fromDate,
            [FromQuery] DateOnly? toDate)
        {
            try
            {
                var query = _context.MilkCollections.AsQueryable();

                if (societyId.HasValue)
                    query = query.Where(c => c.SocietyId == societyId.Value);

                if (fromDate.HasValue)
                    query = query.Where(c => c.CollectionDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(c => c.CollectionDate <= toDate.Value);

                var stats = await query
                    .GroupBy(c => 1)
                    .Select(g => new
                    {
                        totalCollections = g.Count(),
                        totalQuantity = g.Sum(c => c.Quantity),
                        averageFat = g.Average(c => c.FatPercentage),
                        averageSnf = g.Average(c => c.SnfPercentage),
                        totalAmount = g.Sum(c => c.TotalAmount),
                        uniqueFarmers = g.Select(c => c.FarmerId).Distinct().Count()
                    })
                    .FirstOrDefaultAsync();

                return Ok(stats ?? new
                {
                    totalCollections = 0,
                    totalQuantity = 0m,
                    averageFat = 0.0m,
                    averageSnf = 0.0m,
                    totalAmount = 0m,
                    uniqueFarmers = 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching collection statistics");
                return StatusCode(500, new { message = "Error fetching statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Save Collection Details From Machine
        /// GET/POST: api/Collections/SaveCollectionDetails?InputString={data}
        /// Format: societyId|machineType|version|machineId|session|extra|channel|F{fat}|S{snf}|C{clr}|P{protein}|L{lactose}|s{salt}|W{water}|T{temp}|I{farmerId}|Q{quantity}|R{totalAmount}|r{rate}|i{bonus}|D{datetime}
        /// Example: 111|ECOD-G|LE2.00|M00001|EV|4|COW|F090.70|S07.90|C28.00|P02.90|L04.30|s00.65|W06.00|T26.47|I00005|Q00000.00|R00000.00|r033.60|i10.99|D2025-07-24_02:40:26
        /// </summary>
        [HttpGet("SaveCollectionDetails")]
        [HttpPost("SaveCollectionDetails")]
        [EnableRateLimiting("fixed")]
        public async Task<ActionResult> SaveCollectionDetails([FromQuery] string InputString)
        {
            try
            {
                _logger.LogInformation("=== SaveCollectionDetails API Request ===");
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

                // Parse input string - expected 21 parts
                var inputParts = InputString.Split('|');
                
                if (inputParts.Length != 21)
                {
                    _logger.LogError($"Invalid InputString format. Expected 21 parts, got {inputParts.Length}");
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
                var session = inputParts[4];
                var extra = inputParts[5];
                var channel = inputParts[6];
                var fatStr = inputParts[7];
                var snfStr = inputParts[8];
                var clrStr = inputParts[9];
                var proteinStr = inputParts[10];
                var lactoseStr = inputParts[11];
                var saltStr = inputParts[12];
                var waterStr = inputParts[13];
                var temperatureStr = inputParts[14];
                var farmerIdStr = inputParts[15];
                var quantityStr = inputParts[16];
                var totalAmountStr = inputParts[17];
                var rateStr = inputParts[18];
                var bonusStr = inputParts[19];
                var datetimeStr = inputParts[20];

                _logger.LogInformation($"Parsed: Society={societyIdStr}, Type={machineType}, Version={version}, Machine={machineIdStr}");
                _logger.LogInformation($"Farmer={farmerIdStr}, Session={session}, Channel={channel}, Datetime={datetimeStr}");

                // Parse numeric values and round to 2 decimal places
                if (!decimal.TryParse(fatStr[1..], out decimal fat)) fat = 0;
                if (!decimal.TryParse(snfStr[1..], out decimal snf)) snf = 0;
                if (!decimal.TryParse(clrStr[1..], out decimal clr)) clr = 0;
                if (!decimal.TryParse(proteinStr[1..], out decimal protein)) protein = 0;
                if (!decimal.TryParse(lactoseStr[1..], out decimal lactose)) lactose = 0;
                if (!decimal.TryParse(saltStr[1..], out decimal salt)) salt = 0;
                if (!decimal.TryParse(waterStr[1..], out decimal water)) water = 0;
                if (!decimal.TryParse(temperatureStr[1..], out decimal temperature)) temperature = 0;
                if (!decimal.TryParse(quantityStr[1..], out decimal quantity)) quantity = 0;
                if (!decimal.TryParse(totalAmountStr[1..], out decimal totalAmount)) totalAmount = 0;
                if (!decimal.TryParse(rateStr[1..], out decimal rate)) rate = 0;
                if (!decimal.TryParse(bonusStr[1..], out decimal bonus)) bonus = 0;
                
                // Round all decimal values to 2 decimal places
                fat = Math.Round(fat, 2);
                snf = Math.Round(snf, 2);
                clr = Math.Round(clr, 2);
                protein = Math.Round(protein, 2);
                lactose = Math.Round(lactose, 2);
                salt = Math.Round(salt, 2);
                water = Math.Round(water, 2);
                temperature = Math.Round(temperature, 2);
                quantity = Math.Round(quantity, 2);
                totalAmount = Math.Round(totalAmount, 2);
                rate = Math.Round(rate, 2);
                bonus = Math.Round(bonus, 2);
                
                var farmerId = farmerIdStr[1..]; // Remove 'I' prefix

                _logger.LogInformation($"Values: Fat={fat}, SNF={snf}, CLR={clr}, Farmer={farmerId}");
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

                // Parse datetime: D2025-07-24_02:40:26 -> date: 2025-07-24, time: 02:40:26
                var datetime = datetimeStr[1..]; // Remove 'D' prefix
                var datetimeParts = datetime.Split('_');
                var datePart = datetimeParts[0]; // 2025-07-24
                var timePart = datetimeParts.Length > 1 ? datetimeParts[1].Replace('-', ':') : "00:00:00"; // 02:40:26

                if (!DateOnly.TryParse(datePart, out DateOnly collectionDate))
                    collectionDate = DateOnly.FromDateTime(DateTime.Now);
                
                if (!TimeOnly.TryParse(timePart, out TimeOnly collectionTime))
                    collectionTime = TimeOnly.FromDateTime(DateTime.Now);

                // Determine shift type (morning or evening)
                var shiftType = session.ToUpper() == "EV" ? "evening" : "morning";
                
                // Use extra field as farmer name
                var farmerName = extra;

                _logger.LogInformation($"Collection: Date={collectionDate}, Time={collectionTime}, Shift={shiftType}");

                // Create collection record (with duplicate key handling)
                var collection = new MilkCollection
                {
                    FarmerId = farmerId,
                    SocietyId = society.Id,
                    MachineId = machine.Id,
                    CollectionDate = collectionDate,
                    CollectionTime = collectionTime,
                    ShiftType = shiftType,
                    FarmerName = farmerName,
                    Channel = channel,
                    FatPercentage = fat,
                    SnfPercentage = snf,
                    ClrValue = clr,
                    ProteinPercentage = protein,
                    LactosePercentage = lactose,
                    SaltPercentage = salt,
                    WaterPercentage = water,
                    Temperature = temperature,
                    Quantity = quantity,
                    RatePerLiter = rate,
                    TotalAmount = totalAmount,
                    Bonus = bonus,
                    MachineType = machineType,
                    MachineVersion = version,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Check for existing collection (unique constraint)
                var existingCollection = await _context.MilkCollections
                    .FirstOrDefaultAsync(c => 
                        c.FarmerId == farmerId && 
                        c.SocietyId == society.Id && 
                        c.MachineId == machine.Id && 
                        c.CollectionDate == collectionDate && 
                        c.CollectionTime == collectionTime && 
                        c.ShiftType == shiftType);

                if (existingCollection != null)
                {
                    // Update existing collection
                    existingCollection.FarmerName = farmerName;
                    existingCollection.Channel = channel;
                    existingCollection.FatPercentage = fat;
                    existingCollection.SnfPercentage = snf;
                    existingCollection.ClrValue = clr;
                    existingCollection.ProteinPercentage = protein;
                    existingCollection.LactosePercentage = lactose;
                    existingCollection.SaltPercentage = salt;
                    existingCollection.WaterPercentage = water;
                    existingCollection.Temperature = temperature;
                    existingCollection.Quantity = quantity;
                    existingCollection.RatePerLiter = rate;
                    existingCollection.TotalAmount = totalAmount;
                    existingCollection.Bonus = bonus;
                    existingCollection.MachineType = machineType;
                    existingCollection.MachineVersion = version;
                    existingCollection.UpdatedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation($"✅ Updated existing collection for farmer {farmerId}");
                }
                else
                {
                    // Create new collection
                    _context.MilkCollections.Add(collection);
                    _logger.LogInformation($"✅ Created new collection for farmer {farmerId}");
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Collection saved successfully for farmer {farmerId}");

                return new ContentResult
                {
                    Content = "\"Collection details saved successfully.\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SaveCollectionDetails");
                
                return new ContentResult
                {
                    Content = "\"Failed to save collection details\"",
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = 200 // ESP32 compatibility: always return 200
                };
            }
        }
    }
}
