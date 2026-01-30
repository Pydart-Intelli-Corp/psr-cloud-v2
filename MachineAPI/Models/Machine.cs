using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("machines")]
    public class Machine
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("MachineId")]
        [MaxLength(50)]
        public string MachineId { get; set; } = string.Empty;

        [Column("MachineName")]
        [MaxLength(100)]
        public string? MachineName { get; set; }

        [Column("MachineType")]
        [MaxLength(100)]
        public string? MachineType { get; set; }

        [Column("MachineModel")]
        [MaxLength(100)]
        public string? MachineModel { get; set; }

        [Required]
        [Column("SocietyId")]
        public int SocietyId { get; set; }

        [Column("BmcId")]
        public int? BmcId { get; set; }

        [Column("Status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        [Column("IsMasterMachine")]
        public bool IsMasterMachine { get; set; } = false;

        [Column("LastSyncDate")]
        public DateTime? LastSyncDate { get; set; }

        [Column("InstallationDate")]
        public DateTime? InstallationDate { get; set; }

        [Column("UserPassword")]
        [MaxLength(255)]
        public string? UserPassword { get; set; }

        [Column("SupervisorPassword")]
        [MaxLength(255)]
        public string? SupervisorPassword { get; set; }

        [Column("StatusU")]
        public bool StatusU { get; set; } = false;

        [Column("StatusS")]
        public bool StatusS { get; set; } = false;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<MilkCollection> MilkCollections { get; set; } = new List<MilkCollection>();
        public virtual ICollection<MilkDispatch> MilkDispatches { get; set; } = new List<MilkDispatch>();
        public virtual ICollection<MilkSale> MilkSales { get; set; } = new List<MilkSale>();
    }
}
