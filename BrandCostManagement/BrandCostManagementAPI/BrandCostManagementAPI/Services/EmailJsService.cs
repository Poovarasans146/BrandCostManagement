using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace BrandCostManagementAPI.Services
{
    public class EmailJsService : IEmailService
    {
        private readonly IConfiguration _cfg;
        private readonly HttpClient _http;

        public EmailJsService(IConfiguration cfg, HttpClient http)
        {
            _cfg = cfg;
            _http = http;
        }

        public async Task SendOnboardEmail(string email, int userid, string username, string fullname, string password, string role)
        {
            var payload = new
            {
                service_id = _cfg["EmailJS:ServiceId"],
                template_id = _cfg["EmailJS:OnboardTemplateId"], // set in appsettings
                user_id = _cfg["EmailJS:PublicKey"],
                template_params = new
                {
                    username = username,
                    userid = userid,
                    fullname = fullname,
                    password = password, // plain password
                    role = role,
                    email = email
                }
            };

            await SendEmail(payload);
        }

        public async Task SendOtpEmail(string toEmail, string otp)
        {
            var payload = new
            {
                service_id = _cfg["EmailJS:ServiceId"],
                template_id = _cfg["EmailJS:OtpTemplateId"],
                user_id = _cfg["EmailJS:PublicKey"],
                template_params = new
                {
                    email = toEmail,
                    otp = otp
                }
            };

            await SendEmail(payload);
        }

        private async Task SendEmail(object payload)
        {
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _http.PostAsync("https://api.emailjs.com/api/v1.0/email/send", content);

            var respContent = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"EmailJS failed: {response.StatusCode} - {respContent}");
            }
            else
            {
                Console.WriteLine($"EmailJS success: {respContent}");
            }
        }
    }
}
