using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("rate_charts")]
    public class RateChart
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("society_id")]
        public int? SocietyId { get; set; }

        [Column("bmc_id")]
        public int? BmcId { get; set; }

        [Column("channel")]
        [MaxLength(50)]
        public string Channel { get; set; } = "COW"; // COW, BUFFALO, MIXED

        [Column("fat_min", TypeName = "decimal(5,2)")]
        public decimal FatMin { get; set; }

        [Column("fat_max", TypeName = "decimal(5,2)")]
        public decimal FatMax { get; set; }

        [Column("snf_min", TypeName = "decimal(5,2)")]
        public decimal SnfMin { get; set; }

        [Column("snf_max", TypeName = "decimal(5,2)")]
        public decimal SnfMax { get; set; }

        [Column("rate_per_liter", TypeName = "decimal(10,2)")]
        public decimal RatePerLiter { get; set; }

        [Column("bonus_per_liter", TypeName = "decimal(10,2)")]
        public decimal BonusPerLiter { get; set; } = 0;

        [Column("valid_from")]
        public DateOnly ValidFrom { get; set; }

        [Column("valid_to")]
        public DateOnly? ValidTo { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("priority")]
        public int Priority { get; set; } = 0; // Higher priority wins in case of overlap

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("created_by")]
        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
