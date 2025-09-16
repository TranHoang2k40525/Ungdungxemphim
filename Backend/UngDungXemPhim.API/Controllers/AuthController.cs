using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;
using System.Security.Cryptography;
using UngDungXemPhim.Api.Services;
using Microsoft.Extensions.Logging;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext db, IConfiguration config, IJwtService jwtService, ILogger<AuthController> logger)
        {
            _db = db;
            _config = config;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
                return BadRequest(new { message = "Email không đúng định dạng" });
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email đã tồn tại" });

            var user = new User
            {
                FullName = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Birthday = dto.Birthday,
                Avatar = dto.Avatar
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var passwordHash = HashPassword(dto.Password);
            var account = new Account
            {
                UserID = user.UserID,
                PasswordHash = passwordHash
            };
            _db.Accounts.Add(account);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _db.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || user.Account == null)
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            if (!VerifyPassword(dto.Password, user.Account.PasswordHash))
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            var token = _jwtService.GenerateToken(user);
            user.Account.Token = token;
            await _db.SaveChangesAsync();
            return Ok(new
            {
                user = new
                {
                    id = user.UserID,
                    name = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    birthday = user.Birthday
                },
                token
            });
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto dto)
        {
            var user = await _db.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound(new { message = "Email không tồn tại" });

            var otp = new Random().Next(100000, 999999).ToString();

            // Kiểm tra và tạo Account nếu chưa tồn tại
            if (user.Account == null)
            {
                _logger.LogInformation("Creating new account for user {UserId}", user.UserID);
                var account = new Account
                {
                    UserID = user.UserID,
                    PasswordHash = "" // Giá trị mặc định
                };
                _db.Accounts.Add(account);
                await _db.SaveChangesAsync(); // Lưu trước khi gán Token

                // Reload user để đảm bảo Account được liên kết
                user = await _db.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.UserID == user.UserID);
                _logger.LogInformation("Account created and reloaded for user {UserId}", user.UserID);
            }

            // Gán và lưu OTP
            user.Account.Token = otp;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Mã OTP đã được tạo", otp = otp });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            var user = await _db.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || user.Account == null)
                return NotFound(new { message = "Email không tồn tại" });

            if (user.Account.Token != dto.Otp)
                return BadRequest(new { success = false, message = "Mã OTP không đúng" });

            var account = user.Account;
            account.PasswordHash = HashPassword(dto.NewPassword);
            account.Token = null; // Xóa OTP sau khi xác minh
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Mật khẩu đã được thay đổi" });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }

    public class SendOtpDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyOtpDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime? Birthday { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public byte[]? Avatar { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
