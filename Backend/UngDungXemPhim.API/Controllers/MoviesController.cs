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
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtService _jwtService;
        
        public MoviesController(AppDbContext db, IJwtService jwtService) 
        { 
            _db = db; 
            _jwtService = jwtService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? filter = null)
        {
            var query = _db.Movies
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .Include(m => m.Episodes)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter))
            {
                if (filter == "series")
                {
                    query = query.Where(m => m.Type == "Phim bộ");
                }
                else if (filter == "single")
                {
                    query = query.Where(m => m.Type == "Phim lẻ");
                }
                else
                {
                    query = query.Where(m => m.MovieGenres != null && 
                        m.MovieGenres.Any(mg => mg.Genre != null && 
                        mg.Genre.GenreName.ToLower().Contains(filter.ToLower())));
                }
            }

            var movies = await query.ToListAsync();
            var result = movies.Select(m => new MovieDto
            {
                MovieID = m.MovieID,
                MovieTitle = m.Title,
                MovieDescription = m.Description,
                ImageUrl = m.ImagePath,
                MovieType = m.Type,
                MovieActors = m.Actors,
                MovieDirector = m.Directors,
                MovieCountry = m.Country,
                MovieGenre = m.MovieGenres != null ? 
                    m.MovieGenres.Where(g => g.Genre != null)
                    .Select(g => g.Genre!.GenreName).ToList() : 
                    new List<string>()
            }).ToList();
            return Ok(new { movies = result });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var m = await _db.Movies
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .Include(m => m.Episodes)
                .FirstOrDefaultAsync(m => m.MovieID == id);
            if (m == null) return NotFound();
            var dto = new MovieDto
            {
                MovieID = m.MovieID,
                MovieTitle = m.Title,
                MovieDescription = m.Description,
                ImageUrl = m.ImagePath,
                VideoPath = m.Episodes?.FirstOrDefault()?.VideoPath ?? null,
                MovieType = m.Type,
                MovieActors = m.Actors,
                MovieDirector = m.Directors,
                MovieCountry = m.Country,
                MovieGenre = m.MovieGenres != null ? 
                    m.MovieGenres.Where(g => g.Genre != null)
                    .Select(g => g.Genre!.GenreName).ToList() : 
                    new List<string>()
            };
            return Ok(dto);
        }

        [HttpGet("{id:int}/Episodes")]
        public async Task<IActionResult> GetEpisodes(int id)
        {
            var episodes = await _db.Episodes.Where(e => e.MovieID == id).ToListAsync();
            return Ok(new { episodes });
        }

        [HttpGet("{id:int}/Comments")]
        public async Task<IActionResult> GetComments(int id, [FromQuery] int? episodeNumber = null)
        {
            var query = _db.Comments
                .Include(c => c.User)
                .Include(c => c.Episode)
                .ThenInclude(e => e.Movie)
                .Where(c => c.Episode != null && c.Episode.MovieID == id);

            if (episodeNumber.HasValue)
            {
                query = query.Where(c => c.Episode.EpisodeNumber == episodeNumber.Value);
            }

            var comments = await query.OrderByDescending(c => c.CommentDate).ToListAsync();
            var result = comments.Select(c => new
            {
                id = c.CommentID,
                userName = c.User?.FullName ?? "Ẩn danh",
                text = c.CommentText,
                rating = c.Rating,
                date = c.CommentDate,
                episodeNumber = c.Episode?.EpisodeNumber,
                episodeTitle = c.Episode?.Title
            });
            return Ok(new { comments = result });
        }
        [HttpDelete("{id:int}/Comments/{commentId:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id, int commentId)
        {            
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null)
            {
                return Unauthorized("Người dùng không được xác thực.");
            }

            var comment = await _db.Comments
                .Include(c => c.Episode)
                .FirstOrDefaultAsync(c => c.CommentID == commentId && c.UserID == userId && c.Episode != null && c.Episode.MovieID == id);

            if (comment == null)
            {
                return NotFound("Không tìm thấy bình luận hoặc bạn không có quyền xóa bình luận này.");
            }

            _db.Comments.Remove(comment);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Xóa bình luận thành công." });
        }
        [HttpPost("{id:int}/Comments")]
        [Authorize]
        public async Task<IActionResult> PostComment(int id, [FromBody] CommentDto body, [FromQuery] int? episodeNumber = null)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(body.text) && !body.rating.HasValue)
            {
                return BadRequest("Nội dung bình luận hoặc đánh giá phải được cung cấp.");
            }

            // Debug: Kiểm tra thông tin User
            Console.WriteLine($"User Identity: {User.Identity?.Name}");
            Console.WriteLine($"User IsAuthenticated: {User.Identity?.IsAuthenticated}");
            Console.WriteLine($"User Claims Count: {User.Claims.Count()}");
            
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
            }

            var userId = _jwtService.GetUserIdFromToken(User);
            Console.WriteLine($"Extracted UserId: {userId}");
            
            if (userId == null || !await _db.Users.AnyAsync(u => u.UserID == userId))
            {
                return Unauthorized("Người dùng không tồn tại hoặc không được xác thực.");
            }

            var episode = await _db.Episodes
                .Where(e => e.MovieID == id && (!episodeNumber.HasValue || e.EpisodeNumber == episodeNumber.Value))
                .FirstOrDefaultAsync();

            if (episode == null)
            {
                if (!episodeNumber.HasValue)
                {
                    episode = await _db.Episodes
                        .Where(e => e.MovieID == id)
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
                CommentText = string.IsNullOrWhiteSpace(body.text) ? null : body.text,
                Rating = body.rating,
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

        [HttpGet("{id:int}/Ratings")]
        public async Task<IActionResult> GetRatings(int id, [FromQuery] int? episodeNumber = null)
        {
            var query = _db.Comments
                .Include(c => c.Episode)
                .Where(c => c.Episode != null && c.Episode.MovieID == id && c.Rating > 0);

            if (episodeNumber.HasValue)
            {
                query = query.Where(c => c.Episode.EpisodeNumber == episodeNumber.Value);
            }

            var ratings = await query.Select(c => c.Rating).ToListAsync();
            var avg = ratings.Count > 0 ? ratings.Average() : 0;
            return Ok(new { rating = avg, count = ratings.Count });
        }

        [HttpPost("{id:int}/Ratings")]
        [Authorize]
        public async Task<IActionResult> PostRating(int id, [FromBody] RatingDto body, [FromQuery] int? episodeNumber = null)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (body.value < 1 || body.value > 5)
            {
                return BadRequest("Đánh giá phải từ 1 đến 5 sao.");
            }

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null || !await _db.Users.AnyAsync(u => u.UserID == userId))
            {
                return Unauthorized("Người dùng không tồn tại hoặc không được xác thực.");
            }

            var episode = await _db.Episodes
                .Where(e => e.MovieID == id && (!episodeNumber.HasValue || e.EpisodeNumber == episodeNumber.Value))
                .FirstOrDefaultAsync();

            if (episode == null)
            {
                if (!episodeNumber.HasValue)
                {
                    episode = await _db.Episodes
                        .Where(e => e.MovieID == id)
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
                    Rating = body.value,
                    CommentDate = DateTime.Now
                };
                _db.Comments.Add(comment);
            }
            else
            {
                comment.Rating = body.value;
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
    }
}