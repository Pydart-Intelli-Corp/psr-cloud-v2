using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("machine_statistics")]
    public class MachineStatistics
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("MachineId")]
        public int MachineId { get; set; }

        [Required]
        [Column("SocietyId")]
        public int SocietyId { get; set; }

        [Column("TotalTest")]
        public int TotalTest { get; set; } = 0;

        [Column("DailyCleaning")]
        public int DailyCleaning { get; set; } = 0;

        [Column("WeeklyCleaning")]
        public int WeeklyCleaning { get; set; } = 0;

        [Column("CleaningSkip")]
        public int CleaningSkip { get; set; } = 0;

        [Column("Gain")]
        public int Gain { get; set; } = 0;

        [Column("AutoChannel")]
        [MaxLength(255)]
        public string AutoChannel { get; set; } = "DISABLE";

        [Required]
        [Column("StatisticsDate")]
        public string StatisticsDate { get; set; } = string.Empty;

        [Required]
        [Column("StatisticsTime")]
        public string StatisticsTime { get; set; } = string.Empty;

        [Column("RecordedAt")]
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Machine? Machine { get; set; }
        public virtual Society? Society { get; set; }
    }

    public class MachineStatisticsRequest
    {
        public string SocietyId { get; set; } = string.Empty;
        public string MachineType { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string MachineId { get; set; } = string.Empty;
        public int TotalTest { get; set; }
        public int DailyCleaning { get; set; }
        public int WeeklyCleaning { get; set; }
        public int CleaningSkip { get; set; }
        public int Gain { get; set; }
        public string AutoChannel { get; set; } = "DISABLE";
        public string StatisticsDate { get; set; } = string.Empty;
        public string StatisticsTime { get; set; } = string.Empty;
    }
}
