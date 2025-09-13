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
    public class RatingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwtService;

        public RatingsController(AppDbContext db, IJwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpGet("movie/{movieId:int}")]
        public async Task<IActionResult> GetRatingsByMovie(int movieId, [FromQuery] int? episodeNumber = null)
        {
            var query = _db.Comments
                .Include(c => c.Episode)
                .Where(c => c.Episode != null && c.Episode.MovieID == movieId && c.Rating > 0);

            if (episodeNumber.HasValue)
            {
                query = query.Where(c => c.Episode.EpisodeNumber == episodeNumber.Value);
            }

            var ratings = await query.Select(c => c.Rating).ToListAsync();
            var avg = ratings.Count > 0 ? ratings.Average() : 0;
            var count = ratings.Count;

            return Ok(new { rating = avg, count = count });
        }

        [HttpPost("movie/{movieId:int}")]
        [Authorize]
        public async Task<IActionResult> PostRating(int movieId, [FromBody] RatingDto dto, [FromQuery] int? episodeNumber = null)
        {
            if (dto.value < 1 || dto.value > 5)
            {
                return BadRequest("Đánh giá phải từ 1 đến 5 sao.");
            }

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null || !await _db.Users.AnyAsync(u => u.UserID == userId))
            {
                return Unauthorized("Người dùng không tồn tại hoặc không được xác thực.");
            }

            var episode = await _db.Episodes
                .Where(e => e.MovieID == movieId && (!episodeNumber.HasValue || e.EpisodeNumber == episodeNumber.Value))
                .FirstOrDefaultAsync();

            if (episode == null)
            {
                if (!episodeNumber.HasValue)
                {
                    episode = await _db.Episodes
                        .Where(e => e.MovieID == movieId)
                        .FirstOrDefaultAsync();
                }
                if (episode == null)
                {
                    return BadRequest("Không tìm thấy tập phim cho phim này.");
                }
            }

            var comment = await _db.Comments
                .FirstOrDefaultAsync(c => c.EpisodeID == episode.EpisodeID && c.UserID == userId);

            if (comment == null)
            {
                comment = new Comment
                {
                    UserID = userId.Value,
                    EpisodeID = episode.EpisodeID,
                    Rating = dto.value,
                    CommentDate = DateTime.Now
                };
                _db.Comments.Add(comment);
            }
            else
            {
                comment.Rating = dto.value;
                comment.CommentDate = DateTime.Now;
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = comment.CommentID,
                userId = comment.UserID,
                rating = comment.Rating,
                date = comment.CommentDate,
                episodeNumber = episode.EpisodeNumber,
                episodeTitle = episode.Title
            });
        }

        [HttpPut("movie/{movieId:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateRating(int movieId, [FromBody] RatingDto dto, [FromQuery] int? episodeNumber = null)
        {
            if (dto.value < 1 || dto.value > 5)
            {
                return BadRequest("Đánh giá phải từ 1 đến 5 sao.");
            }

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var episode = await _db.Episodes
                .Where(e => e.MovieID == movieId && (!episodeNumber.HasValue || e.EpisodeNumber == episodeNumber.Value))
                .FirstOrDefaultAsync();

            if (episode == null)
            {
                return BadRequest("Không tìm thấy tập phim cho phim này.");
            }

            var comment = await _db.Comments
                .FirstOrDefaultAsync(c => c.EpisodeID == episode.EpisodeID && c.UserID == userId);

            if (comment == null)
            {
                return NotFound("Không tìm thấy đánh giá để cập nhật.");
            }

            comment.Rating = dto.value;
            comment.CommentDate = DateTime.Now;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = comment.CommentID,
                userId = comment.UserID,
                rating = comment.Rating,
                date = comment.CommentDate,
                episodeNumber = episode.EpisodeNumber,
                episodeTitle = episode.Title
            });
        }

        [HttpDelete("movie/{movieId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteRating(int movieId, [FromQuery] int? episodeNumber = null)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var episode = await _db.Episodes
                .Where(e => e.MovieID == movieId && (!episodeNumber.HasValue || e.EpisodeNumber == episodeNumber.Value))
                .FirstOrDefaultAsync();

            if (episode == null)
            {
                return BadRequest("Không tìm thấy tập phim cho phim này.");
            }

            var comment = await _db.Comments
                .FirstOrDefaultAsync(c => c.EpisodeID == episode.EpisodeID && c.UserID == userId);

            if (comment == null)
            {
                return NotFound("Không tìm thấy đánh giá để xóa.");
            }

            comment.Rating = null;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Xóa đánh giá thành công." });
        }
    }
}
