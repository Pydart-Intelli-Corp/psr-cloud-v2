using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("milk_sales")]
    public class MilkSale
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("count")]
        [MaxLength(50)]
        public string Count { get; set; } = string.Empty;

        [Column("society_id")]
        public int? SocietyId { get; set; }

        [Column("machine_id")]
        public int MachineId { get; set; }

        [Column("sales_date")]
        public DateOnly SalesDate { get; set; }

        [Column("sales_time")]
        public TimeOnly SalesTime { get; set; }

        [Column("shift_type")]
        [MaxLength(10)]
        public string ShiftType { get; set; } = "EV";

        [Column("channel")]
        [MaxLength(50)]
        public string Channel { get; set; } = "COW";

        [Column("quantity", TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; } = 0;

        [Column("rate_per_liter", TypeName = "decimal(10,2)")]
        public decimal RatePerLiter { get; set; }

        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column("customer_name")]
        [MaxLength(255)]
        public string? CustomerName { get; set; }

        [Column("customer_phone")]
        [MaxLength(20)]
        public string? CustomerPhone { get; set; }

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
