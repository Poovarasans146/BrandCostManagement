using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Threading.Tasks;

namespace BrandCostManagementAPI.Services
{

    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _cfg;

        public SmtpEmailService(IConfiguration cfg)
        {
            _cfg = cfg;
        }

        /// <summary>
        /// Send onboarding email
        /// </summary>
        public async Task SendOnboardEmail(string email, int userId, string username, string fullname, string password, string role)
        {
            string subject = $"Welcome {fullname} - Your Account Details";
            string body = $@"
                Hello {fullname},<br/><br/>
                Welcome to the TVSE family! We're excited to have you on board.<br/>
                Your account has been successfully created.<br/>
                Here are your credentials:<br/>
                <b>Username:</b> {username}<br/>
                <b>Password:</b> {password}<br/>
                <b>Role:</b> {role}<br/><br/>
                Please login using your credentials.<br/><br/>
                Regards,<br/>
                TVSE.
            ";

            await SendEmail(email, subject, body);
        }

        /// <summary>
        /// Send OTP email
        /// </summary>
        public async Task SendOtpEmail(string toEmail, string otp)
        {
            string subject = "Your OTP Code";
            string body = $@"
                Hello,<br/><br/>
                Your OTP is: <b>{otp}</b><br/>
                This code will expire in 5 minutes.<br/><br/>
                Thanks,<br/>TVSE
            ";

            await SendEmail(toEmail, subject, body);
        }

        /// <summary>
        /// Internal method to send email
        /// </summary>
        private async Task SendEmail(string toEmail, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_cfg["SMTP:FromName"], _cfg["SMTP:FromEmail"]));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

            using var client = new SmtpClient();

            // Connect using port 25 only, no SSL/TLS, no authentication
            await client.ConnectAsync(_cfg["SMTP:Host"], 25, SecureSocketOptions.None);

            // Do NOT call AuthenticateAsync() since SMTP on port 25 does not require it

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
