using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("milk_dispatches")]
    public class MilkDispatch
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("dispatch_id")]
        [MaxLength(50)]
        public string DispatchId { get; set; } = string.Empty;

        [Column("society_id")]
        public int? SocietyId { get; set; }

        [Column("machine_id")]
        public int MachineId { get; set; }

        [Column("dispatch_date")]
        public DateOnly DispatchDate { get; set; }

        [Column("dispatch_time")]
        public TimeOnly DispatchTime { get; set; }

        [Required]
        [Column("shift_type")]
        [MaxLength(20)]
        public string ShiftType { get; set; } = "morning";

        [Column("channel")]
        [MaxLength(50)]
        public string Channel { get; set; } = "COW";

        [Column("fat_percentage", TypeName = "decimal(5,2)")]
        public decimal FatPercentage { get; set; }

        [Column("snf_percentage", TypeName = "decimal(5,2)")]
        public decimal SnfPercentage { get; set; }

        [Column("clr_value", TypeName = "decimal(5,2)")]
        public decimal ClrValue { get; set; } = 0;

        [Column("quantity", TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; } = 0;

        [Column("rate_per_liter", TypeName = "decimal(10,2)")]
        public decimal RatePerLiter { get; set; }

        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

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
