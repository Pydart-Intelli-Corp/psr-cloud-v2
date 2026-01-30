using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    [Table("machine_password_logs")]
    public class MachinePasswordLog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("machine_id")]
        public int MachineId { get; set; }

        [Column("password_type")]
        [MaxLength(20)]
        public string PasswordType { get; set; } = "user"; // user, supervisor

        [Column("old_password")]
        [MaxLength(255)]
        public string? OldPassword { get; set; }

        [Column("new_password")]
        [MaxLength(255)]
        public string NewPassword { get; set; } = string.Empty;

        [Column("changed_by")]
        [MaxLength(100)]
        public string? ChangedBy { get; set; }

        [Column("change_reason")]
        [MaxLength(500)]
        public string? ChangeReason { get; set; }

        [Column("ip_address")]
        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [Column("is_successful")]
        public bool IsSuccessful { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("MachineId")]
        public virtual Machine? Machine { get; set; }
    }
}
