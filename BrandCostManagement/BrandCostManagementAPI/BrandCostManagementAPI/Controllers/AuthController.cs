using BCrypt.Net;
using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        AppDbContext db,
        IEmailService emailService,
        JwtService jwtService,
        IConfiguration config,
        IWebHostEnvironment env)
    {
        _db = db;
        _emailService = emailService;
        _jwtService = jwtService;
        _config = config;
        _env = env;
    }

    // 🔹 Step 1: Login with username + password
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { status = StatusCodes.Status400BadRequest, message = "Username and password are required" });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserName == req.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
            return Unauthorized(new { status = StatusCodes.Status401Unauthorized, message = "Invalid username or password" });

        // Generate OTP
        var rng = new Random();
        string otp = rng.Next(100000, 999999).ToString();

        var otpRequest = new OtpRequest
        {
            UserId = user.UserId,
            OtpHash = ComputeSha256Hash(otp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            Used = false
        };

        _db.OtpRequests.Add(otpRequest);
        await _db.SaveChangesAsync();

        // Log OTP in console (dev only)
        Console.WriteLine($"Generated OTP for {user.UserName}: {otp}");

        // Send OTP via email
        _ = Task.Run(async () =>
        {
            try
            {
                string recipientEmail = user.UserName;
                await _emailService.SendOtpEmail(recipientEmail, otp);
                Console.WriteLine($"OTP email sent successfully to {recipientEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"OTP email failed: {ex.Message}");
            }
        });

        return Ok(new
        {
            status = StatusCodes.Status200OK,
            otpRequestId = otpRequest.Id,
            message = "OTP sent to your registered email"
        });
    }

    // 🔹 Step 2: Verify OTP and issue JWT cookie
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        var otpReq = await _db.OtpRequests
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == req.OtpRequestId);

        if (otpReq == null || otpReq.Used || otpReq.ExpiresAt < DateTime.UtcNow)
            return Unauthorized(new { status = StatusCodes.Status401Unauthorized, message = "Invalid or expired OTP" });

        if (!SlowEquals(ComputeSha256Hash(req.Otp), otpReq.OtpHash))
            return Unauthorized(new { status = StatusCodes.Status401Unauthorized, message = "Invalid OTP" });

        otpReq.Used = true;
        await _db.SaveChangesAsync();

        // Generate JWT
        var user = otpReq.User!;
        string role = user.Role ?? "User";
        string token = _jwtService.GenerateToken(user.UserId.ToString(), role);

        // Cookie configuration
        var cookieName = _config["AuthCookie:Name"] ?? "access_token";
        var expireMinutes = Convert.ToDouble(_config["Jwt:ExpireMinutes"] ?? "30");
        var cookieExpires = DateTimeOffset.UtcNow.AddMinutes(expireMinutes);

        Response.Cookies.Append(cookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // set true in production with HTTPS
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = cookieExpires
        });

        return Ok(new
        {
            status = StatusCodes.Status200OK,
            message = "OTP verified successfully",
            role,
            expiresAtUtc = cookieExpires.UtcDateTime
        });
    }

    // 🔹 Step 3: Check if authenticated
    [Authorize]
    [HttpGet("check")]
    public IActionResult CheckAuth()
    {
        return Ok(new { status = StatusCodes.Status200OK, valid = true });
    }

    // 🔹 Step 4: Get user info (for frontend menu display)
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                     ?? "";

        var role = User.FindFirstValue(ClaimTypes.Role) ?? "User";

        return Ok(new { status = StatusCodes.Status200OK, userId, role });
    }

    // 🔹 Step 5: Logout
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var cookieName = _config["AuthCookie:Name"] ?? "access_token";

        Response.Cookies.Append(cookieName, "", new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        });

        return Ok(new { status = StatusCodes.Status200OK, message = "Logged out successfully" });
    }

    // 🔹 Helpers
    private static string ComputeSha256Hash(string raw)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
        return Convert.ToBase64String(bytes);
    }

    private static bool SlowEquals(string a, string b)
    {
        if (a.Length != b.Length) return false;
        int diff = 0;
        for (int i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
        return diff == 0;
    }
}

// Request DTOs
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public int OtpRequestId { get; set; }
    public string Otp { get; set; } = string.Empty;
}
