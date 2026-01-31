using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var httpClient = new HttpClient();
        var baseUrl = "http://localhost:5000";
        
        // Create CSV content
        var csvContent = @"CLR,FAT,SNF,RATE
7,3,3,15
8,3,3.1,15.25
8,3,3.2,15.5
8,3,3.3,15.75
9,3,3.4,16
9,3,3.5,16.25
10,3,3.6,16.5
10,3,3.7,16.75
10,3,3.8,17
11,3,3.9,17.25
11,3,4,17.5
12,3,4.1,17.75
12,3,4.2,18
12,3,4.3,18.25
13,3,4.4,18.5
13,3,4.5,18.75";

        // Create form data
        using var form = new MultipartFormDataContent();
        
        // Add CSV file
        var csvBytes = System.Text.Encoding.UTF8.GetBytes(csvContent);
        var csvStream = new MemoryStream(csvBytes);
        form.Add(new StreamContent(csvStream), "file", "rate_chart_s1_cow.csv");
        
        // Add form parameters
        form.Add(new StringContent("1"), "societyIds");  // Society ID 1 for S1
        form.Add(new StringContent("COW"), "channel");
        
        try
        {
            Console.WriteLine("Uploading rate chart for Society S1, Channel COW...");
            
            var response = await httpClient.PostAsync($"{baseUrl}/api/RateCharts/UploadRateChartDetails", form);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            Console.WriteLine($"Response Status: {response.StatusCode}");
            Console.WriteLine($"Response Content: {responseContent}");
            
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("✅ Rate chart uploaded successfully!");
            }
            else
            {
                Console.WriteLine("❌ Upload failed!");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
        finally
        {
            csvStream?.Dispose();
            httpClient.Dispose();
        }
        
        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();
    }
}