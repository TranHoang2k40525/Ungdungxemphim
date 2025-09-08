using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;
using System.Security.Cryptography;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Kiểm tra định dạng email
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Email, @"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"))
                return BadRequest(new { message = "Email không đúng định dạng" });
            // Kiểm tra số điện thoại (10-11 số, chỉ số)
            if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Phone, @"^\d{10,11}$"))
                return BadRequest(new { message = "Số điện thoại phải là 10 hoặc 11 số" });
            // Kiểm tra ngày sinh
            if (dto.Birthday == null || dto.Birthday < new DateTime(1900, 1, 1) || dto.Birthday > DateTime.Now)
                return BadRequest(new { message = "Ngày sinh không hợp lệ" });
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

            // Nếu token còn hạn thì trả về token cũ
            var handler = new JwtSecurityTokenHandler();
            if (!string.IsNullOrEmpty(user.Account.Token))
            {
                var jwt = handler.ReadJwtToken(user.Account.Token);
                if (jwt.ValidTo > DateTime.UtcNow)
                {
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
                        token = user.Account.Token
                    });
                }
            }
            // Nếu hết hạn thì tạo token mới
            var token = GenerateJwtToken(user);
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

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", "user")
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "supersecretkey"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "localhost",
                audience: _config["Jwt:Audience"] ?? "localhost",
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
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
