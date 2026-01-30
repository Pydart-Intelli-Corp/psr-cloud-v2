namespace MachineAPI.Models
{
    public class MachineUpdate
    {
        public int Id { get; set; }
        public int SocietyId { get; set; }
        public int? MachineId { get; set; }
        public string MachineType { get; set; } = string.Empty;
        public string UpdateType { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string? AvailableVersion { get; set; }
        public string UpdateStatus { get; set; } = "No update";
        public DateTime? LastChecked { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class MachineUpdateRequest
    {
        public string SocietyId { get; set; } = string.Empty;
        public string MachineType { get; set; } = string.Empty;
        public string MachineModel { get; set; } = string.Empty;
        public string MachineId { get; set; } = string.Empty;
        public string DateTime { get; set; } = string.Empty;
    }

    public class MachineUpdateResponse
    {
        public string Timestamp { get; set; } = string.Empty;
        public string Status { get; set; } = "No update";
    }
}
