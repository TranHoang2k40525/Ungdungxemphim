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
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwtService;

        public CommentsController(AppDbContext db, IJwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpGet("movie/{movieId:int}")]
        public async Task<IActionResult> GetCommentsByMovie(int movieId, [FromQuery] int? episodeNumber = null)
        {
            var query = _db.Comments
                .Include(c => c.User)
                .Include(c => c.Episode)
                .ThenInclude(e => e.Movie)
                .Where(c => c.Episode != null && c.Episode.MovieID == movieId);

            if (episodeNumber.HasValue)
            {
                query = query.Where(c => c.Episode.EpisodeNumber == episodeNumber.Value);
            }

            var comments = await query.OrderByDescending(c => c.CommentDate).ToListAsync();
            var result = comments.Select(c => new
            {
                id = c.CommentID,
                userId = c.UserID,
                userName = c.User?.FullName ?? "Ẩn danh",
                text = c.CommentText,
                rating = c.Rating,
                date = c.CommentDate,
                episodeNumber = c.Episode?.EpisodeNumber,
                episodeTitle = c.Episode?.Title
            });

            return Ok(new { comments = result });
        }

        [HttpPost("movie/{movieId:int}")]
        [Authorize]
        public async Task<IActionResult> PostComment(int movieId, [FromBody] CommentDto dto, [FromQuery] int? episodeNumber = null)
        {
            if (string.IsNullOrWhiteSpace(dto.text) && !dto.rating.HasValue)
            {
                return BadRequest("Nội dung bình luận hoặc đánh giá phải được cung cấp.");
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

            var comment = new Comment
            {
                UserID = userId.Value,
                EpisodeID = episode.EpisodeID,
                CommentText = string.IsNullOrWhiteSpace(dto.text) ? null : dto.text,
                Rating = dto.rating,
                CommentDate = DateTime.Now
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = comment.CommentID,
                userId = comment.UserID,
                text = comment.CommentText,
                rating = comment.Rating,
                date = comment.CommentDate,
                episodeNumber = episode.EpisodeNumber,
                episodeTitle = episode.Title
            });
        }

        [HttpPut("{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int commentId, [FromBody] CommentDto dto)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var comment = await _db.Comments
                .FirstOrDefaultAsync(c => c.CommentID == commentId && c.UserID == userId);

            if (comment == null)
            {
                return NotFound("Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa.");
            }

            if (!string.IsNullOrWhiteSpace(dto.text))
            {
                comment.CommentText = dto.text;
            }

            if (dto.rating.HasValue)
            {
                comment.Rating = dto.rating;
            }

            comment.CommentDate = DateTime.Now;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                id = comment.CommentID,
                userId = comment.UserID,
                text = comment.CommentText,
                rating = comment.Rating,
                date = comment.CommentDate
            });
        }

        [HttpDelete("{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var comment = await _db.Comments
                .FirstOrDefaultAsync(c => c.CommentID == commentId && c.UserID == userId);

            if (comment == null)
            {
                return NotFound("Không tìm thấy bình luận hoặc bạn không có quyền xóa.");
            }

            _db.Comments.Remove(comment);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Xóa bình luận thành công." });
        }
    }
}
