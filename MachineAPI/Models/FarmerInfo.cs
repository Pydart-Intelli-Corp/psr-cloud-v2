using System.ComponentModel.DataAnnotations.Schema;

namespace MachineAPI.Models
{
    public class FarmerInfo
    {
        public int Id { get; set; }
        public string FarmerId { get; set; } = string.Empty;
        public string RfId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string SmsEnabled { get; set; } = "OFF";
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Bonus { get; set; }
        
        public int SocietyId { get; set; }
        public int? MachineId { get; set; }
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class FarmerInfoResponse
    {
        public string RfId { get; set; } = string.Empty;
        public string FarmerId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string SmsEnabled { get; set; } = "OFF";
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Bonus { get; set; }
    }
}
