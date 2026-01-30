using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("milk_collections")]
    public class MilkCollection
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("farmer_id")]
        [MaxLength(50)]
        public string? FarmerId { get; set; }

        [Column("society_id")]
        public int? SocietyId { get; set; }

        [Column("machine_id")]
        public int MachineId { get; set; }

        [Column("collection_date")]
        public DateOnly CollectionDate { get; set; }

        [Column("collection_time")]
        public TimeOnly CollectionTime { get; set; }

        [Column("shift_type")]
        [MaxLength(20)]
        public string ShiftType { get; set; } = "morning";

        [Column("farmer_name")]
        [MaxLength(255)]
        public string? FarmerName { get; set; }

        [Column("channel")]
        [MaxLength(50)]
        public string Channel { get; set; } = "COW";

        [Column("quantity", TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; } = 0;

        [Column("fat_percentage", TypeName = "decimal(5,2)")]
        public decimal FatPercentage { get; set; }

        [Column("snf_percentage", TypeName = "decimal(5,2)")]
        public decimal SnfPercentage { get; set; }

        [Column("clr_value", TypeName = "decimal(5,2)")]
        public decimal ClrValue { get; set; } = 0;

        [Column("protein_percentage", TypeName = "decimal(5,2)")]
        public decimal ProteinPercentage { get; set; } = 0;

        [Column("lactose_percentage", TypeName = "decimal(5,2)")]
        public decimal LactosePercentage { get; set; } = 0;

        [Column("salt_percentage", TypeName = "decimal(5,2)")]
        public decimal SaltPercentage { get; set; } = 0;

        [Column("water_percentage", TypeName = "decimal(5,2)")]
        public decimal WaterPercentage { get; set; } = 0;

        [Column("temperature", TypeName = "decimal(5,2)")]
        public decimal Temperature { get; set; } = 0;

        [Column("rate_per_liter", TypeName = "decimal(10,2)")]
        public decimal RatePerLiter { get; set; }

        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column("bonus", TypeName = "decimal(10,2)")]
        public decimal Bonus { get; set; } = 0;

        [Column("machine_type")]
        [MaxLength(100)]
        public string? MachineType { get; set; }

        [Column("machine_version")]
        [MaxLength(50)]
        public string? MachineVersion { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("MachineId")]
        public virtual Machine? Machine { get; set; }
    }
}
