using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("machine_corrections_from_machine")]
    public class MachineCorrection
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("machine_id")]
        public int MachineId { get; set; }

        [Required]
        [Column("society_id")]
        public int SocietyId { get; set; }

        [Column("machine_type")]
        [MaxLength(100)]
        public string? MachineType { get; set; }

        [Column("channel1_fat", TypeName = "decimal(10,2)")]
        public decimal? Channel1Fat { get; set; }

        [Column("channel1_snf", TypeName = "decimal(10,2)")]
        public decimal? Channel1Snf { get; set; }

        [Column("channel1_clr", TypeName = "decimal(10,2)")]
        public decimal? Channel1Clr { get; set; }

        [Column("channel1_temp", TypeName = "decimal(10,2)")]
        public decimal? Channel1Temp { get; set; }

        [Column("channel1_water", TypeName = "decimal(10,2)")]
        public decimal? Channel1Water { get; set; }

        [Column("channel1_protein", TypeName = "decimal(10,2)")]
        public decimal? Channel1Protein { get; set; }

        [Column("channel2_fat", TypeName = "decimal(10,2)")]
        public decimal? Channel2Fat { get; set; }

        [Column("channel2_snf", TypeName = "decimal(10,2)")]
        public decimal? Channel2Snf { get; set; }

        [Column("channel2_clr", TypeName = "decimal(10,2)")]
        public decimal? Channel2Clr { get; set; }

        [Column("channel2_temp", TypeName = "decimal(10,2)")]
        public decimal? Channel2Temp { get; set; }

        [Column("channel2_water", TypeName = "decimal(10,2)")]
        public decimal? Channel2Water { get; set; }

        [Column("channel2_protein", TypeName = "decimal(10,2)")]
        public decimal? Channel2Protein { get; set; }

        [Column("channel3_fat", TypeName = "decimal(10,2)")]
        public decimal? Channel3Fat { get; set; }

        [Column("channel3_snf", TypeName = "decimal(10,2)")]
        public decimal? Channel3Snf { get; set; }

        [Column("channel3_clr", TypeName = "decimal(10,2)")]
        public decimal? Channel3Clr { get; set; }

        [Column("channel3_temp", TypeName = "decimal(10,2)")]
        public decimal? Channel3Temp { get; set; }

        [Column("channel3_water", TypeName = "decimal(10,2)")]
        public decimal? Channel3Water { get; set; }

        [Column("channel3_protein", TypeName = "decimal(10,2)")]
        public decimal? Channel3Protein { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
