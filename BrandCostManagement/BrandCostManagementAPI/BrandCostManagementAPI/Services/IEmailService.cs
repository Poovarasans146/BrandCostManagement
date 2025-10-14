namespace BrandCostManagementAPI.Services
{
    public interface IEmailService
    {
        Task SendOnboardEmail(string email, int userid, string username, string fullname, string password, string role);
        Task SendOtpEmail(string toEmail, string otp);
    }
}