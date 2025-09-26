using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BrandCostManagementAPI.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using BCrypt.Net;
using BrandCostManagementAPI.Services;

namespace BrandCostManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public UsersController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] User user)
        {
            string plainPassword = user.Password;
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _emailService.SendOnboardEmail(
                user.UserName, user.UserId, user.UserName, user.FullName, plainPassword, user.Role
            );

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound();

            bool passwordChanged = false;
            string plainPassword = string.Empty;

            if (!string.IsNullOrEmpty(updatedUser.Password) &&
                !BCrypt.Net.BCrypt.Verify(updatedUser.Password, existingUser.Password))
            {
                plainPassword = updatedUser.Password;
                existingUser.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
                passwordChanged = true;
            }

            existingUser.FullName = updatedUser.FullName;
            existingUser.Role = updatedUser.Role;

            _context.Entry(existingUser).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            if (passwordChanged)
            {
                await _emailService.SendOnboardEmail(
                    existingUser.UserName, existingUser.UserId, existingUser.UserName, existingUser.FullName, plainPassword, existingUser.Role
                );
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] dynamic body)
        {
            string username = body.username;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Generate OTP
            string otp = new Random().Next(100000, 999999).ToString();

            // Hash OTP
            string otpHash = BCrypt.Net.BCrypt.HashPassword(otp);

            // Save OTPRequest
            var otpRequest = new OtpRequest
            {
                UserId = user.UserId,
                OtpHash = otpHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                Used = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpRequests.Add(otpRequest);
            await _context.SaveChangesAsync();

            // Send OTP by email
            await _emailService.SendOtpEmail(user.UserName, otp);

            return Ok(new { otpRequestId = otpRequest.Id, message = "OTP sent to your email" });
        }


        [HttpPost("verify-forgot-otp")]
        public async Task<IActionResult> VerifyForgotOtp([FromBody] dynamic body)
        {
            int otpRequestId = body.otpRequestId;
            string otp = body.otp;

            var otpRequest = await _context.OtpRequests
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == otpRequestId);

            if (otpRequest == null)
                return NotFound(new { message = "OTP request not found" });

            if (otpRequest.Used || otpRequest.ExpiresAt < DateTime.UtcNow)
                return BadRequest(new { message = "OTP expired or already used" });

            // Verify OTP hash
            if (!BCrypt.Net.BCrypt.Verify(otp, otpRequest.OtpHash))
                return Unauthorized(new { message = "Invalid OTP" });

            // Mark as used
            otpRequest.Used = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "OTP verified", userId = otpRequest.UserId });
        }


        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] dynamic body)
        {
            int userId = body.userId;
            string newPassword = body.newPassword;
            string confirmPassword = body.confirmPassword;

            if (newPassword != confirmPassword)
                return BadRequest(new { message = "Passwords do not match" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Hash new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully" });
        }

    }
}
