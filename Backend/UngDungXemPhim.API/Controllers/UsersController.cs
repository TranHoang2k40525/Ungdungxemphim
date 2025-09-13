using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;
using Microsoft.AspNetCore.Authorization;
using UngDungXemPhim.Api.Services;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwtService;

        public UsersController(AppDbContext db, IJwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            return Ok(new
            {
                id = user.UserID,
                name = user.FullName,
                email = user.Email,
                phone = user.Phone,
                birthday = user.Birthday,
                avatar = user.Avatar
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            // Kiểm tra email trùng lặp nếu có thay đổi
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(u => u.Email == dto.Email && u.UserID != userId))
                {
                    return BadRequest("Email đã được sử dụng bởi người dùng khác.");
                }
                user.Email = dto.Email;
            }

            if (!string.IsNullOrEmpty(dto.Name))
            {
                user.FullName = dto.Name;
            }

            if (!string.IsNullOrEmpty(dto.Phone))
            {
                user.Phone = dto.Phone;
            }

            if (dto.Birthday.HasValue)
            {
                user.Birthday = dto.Birthday;
            }

            if (dto.Avatar != null)
            {
                user.Avatar = dto.Avatar;
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = user.UserID,
                name = user.FullName,
                email = user.Email,
                phone = user.Phone,
                birthday = user.Birthday,
                avatar = user.Avatar
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var account = await _db.Accounts
                .FirstOrDefaultAsync(a => a.UserID == userId);

            if (account == null)
            {
                return NotFound("Không tìm thấy tài khoản.");
            }

            // Kiểm tra mật khẩu cũ
            if (!VerifyPassword(dto.OldPassword, account.PasswordHash))
            {
                return BadRequest("Mật khẩu cũ không đúng.");
            }

            // Cập nhật mật khẩu mới
            account.PasswordHash = HashPassword(dto.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }

        private string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        [HttpGet("WatchHistory")]
        [Authorize]
        public async Task<IActionResult> GetWatchHistory()
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var watchHistory = await _db.WatchHistories
                .Include(w => w.Episode)
                .ThenInclude(e => e.Movie)
                .Where(w => w.UserID == userId)
                .OrderByDescending(w => w.WatchedDate)
                .ToListAsync();

            var result = watchHistory.Select(w => new
            {
                historyID = w.HistoryID,
                userID = w.UserID,
                episodeID = w.EpisodeID,
                watchedDate = w.WatchedDate,
                episode = w.Episode != null ? new
                {
                    episodeID = w.Episode.EpisodeID,
                    movieID = w.Episode.MovieID,
                    episodeNumber = w.Episode.EpisodeNumber,
                    title = w.Episode.Title,
                    description = w.Episode.Description,
                    videoPath = w.Episode.VideoPath,
                    movie = w.Episode.Movie != null ? new
                    {
                        movieID = w.Episode.Movie.MovieID,
                        title = w.Episode.Movie.Title,
                        description = w.Episode.Movie.Description,
                        imagePath = w.Episode.Movie.ImagePath,
                        type = w.Episode.Movie.Type,
                        actors = w.Episode.Movie.Actors,
                        directors = w.Episode.Movie.Directors,
                        country = w.Episode.Movie.Country
                    } : null
                } : null
            });

            return Ok(result);
        }

        [HttpPost("WatchHistory")]
        [Authorize]
        public async Task<IActionResult> AddWatchHistory([FromBody] AddWatchHistoryDto dto)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var episode = await _db.Episodes
                .FirstOrDefaultAsync(e => e.EpisodeID == dto.EpisodeID);

            if (episode == null)
            {
                return NotFound("Không tìm thấy tập phim.");
            }

            // Kiểm tra xem đã có lịch sử xem chưa
            var existingHistory = await _db.WatchHistories
                .FirstOrDefaultAsync(w => w.UserID == userId && w.EpisodeID == dto.EpisodeID);

            if (existingHistory != null)
            {
                // Cập nhật thời gian xem
                existingHistory.WatchedDate = DateTime.Now;
                await _db.SaveChangesAsync();
                return Ok(new { message = "Cập nhật lịch sử xem thành công." });
            }

            var watchHistory = new WatchHistory
            {
                UserID = userId.Value,
                EpisodeID = dto.EpisodeID,
                WatchedDate = DateTime.Now
            };

            _db.WatchHistories.Add(watchHistory);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Thêm lịch sử xem thành công." });
        }

        [HttpDelete("WatchHistory/{historyId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteWatchHistory(int historyId)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var watchHistory = await _db.WatchHistories
                .FirstOrDefaultAsync(w => w.HistoryID == historyId && w.UserID == userId);

            if (watchHistory == null)
            {
                return NotFound("Không tìm thấy lịch sử xem hoặc bạn không có quyền xóa.");
            }

            _db.WatchHistories.Remove(watchHistory);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Xóa lịch sử xem thành công." });
        }
    }

}