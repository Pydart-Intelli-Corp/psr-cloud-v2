using System.Text.Json;

namespace MachineAPI.Models
{
    public class PSRCodeConfig
    {
        public string MasterPSRCode { get; set; } = string.Empty;
    }

    public class PSRCodesSettings
    {
        public string MasterPSRCode { get; set; } = string.Empty;
        public List<string> Codes { get; set; } = new List<string>();
        public bool AutoInitialize { get; set; } = true;
    }
}
