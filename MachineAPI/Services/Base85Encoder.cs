using System.Text;

namespace MachineAPI.Services
{
    /// <summary>
    /// Base85 encoder/decoder for compact string representation (20% smaller than Base64)
    /// </summary>
    public static class Base85Encoder
    {
        private const string Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";

        public static string Encode(byte[] data)
        {
            var result = new StringBuilder();
            
            for (int i = 0; i < data.Length; i += 4)
            {
                uint value = 0;
                int chunkSize = Math.Min(4, data.Length - i);
                
                for (int j = 0; j < chunkSize; j++)
                {
                    value = value * 256 + data[i + j];
                }
                
                // Pad if needed
                for (int j = chunkSize; j < 4; j++)
                {
                    value *= 256;
                }
                
                // Convert to base85
                var temp = new char[5];
                for (int j = 4; j >= 0; j--)
                {
                    temp[j] = Chars[(int)(value % 85)];
                    value /= 85;
                }
                
                result.Append(temp, 0, chunkSize + 1);
            }
            
            return result.ToString();
        }

        public static byte[] Decode(string encoded)
        {
            var result = new List<byte>();
            
            for (int i = 0; i < encoded.Length; i += 5)
            {
                uint value = 0;
                int chunkSize = Math.Min(5, encoded.Length - i);
                
                for (int j = 0; j < chunkSize; j++)
                {
                    char c = encoded[i + j];
                    int index = Chars.IndexOf(c);
                    if (index == -1)
                        throw new ArgumentException($"Invalid base85 character: {c}");
                    value = value * 85 + (uint)index;
                }
                
                // Extract bytes
                var bytes = new byte[4];
                for (int j = 3; j >= 0; j--)
                {
                    bytes[j] = (byte)(value & 0xFF);
                    value >>= 8;
                }
                
                // Add only valid bytes
                for (int j = 4 - chunkSize + 1; j < 4; j++)
                {
                    result.Add(bytes[j]);
                }
            }
            
            return result.ToArray();
        }
    }
}
