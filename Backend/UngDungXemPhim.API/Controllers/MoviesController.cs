using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public MoviesController(AppDbContext db) { _db = db; }

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
                    // Filter by genre name (e.g., "phim kinh dị", "hành động")
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
                VideoPath = m.Episodes?.FirstOrDefault()?.VideoPath ?? null,  // Nếu phim lẻ, lấy từ episode đầu hoặc null
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
        public async Task<IActionResult> GetComments(int id)
        {
            var comments = await _db.Comments
                .Include(c => c.User)
                .Include(c => c.Episode)
                .Where(c => c.Episode != null && c.Episode.MovieID == id)
                .OrderByDescending(c => c.CommentDate)
                .ToListAsync();
            var result = comments.Select(c => new {
                id = c.CommentID,
                userName = c.User?.FullName ?? "Ẩn danh",
                text = c.CommentText,
                rating = c.Rating,
                date = c.CommentDate
            });
            return Ok(new { comments = result });
        }

        [HttpPost("{id:int}/Comments")]
        [Authorize]
        public async Task<IActionResult> PostComment(int id, [FromBody] CommentDto body)
        {
            if (string.IsNullOrWhiteSpace(body.Text) && !body.Rating.HasValue)
            {
                return BadRequest("Nội dung bình luận hoặc đánh giá phải được cung cấp.");
            }

            int userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            var episode = await _db.Episodes.FirstOrDefaultAsync(e => e.MovieID == id);
            if (episode == null) return BadRequest("Không tìm thấy tập phim cho phim này.");

            var comment = new Comment
            {
                UserID = userId,
                EpisodeID = episode.EpisodeID,
                CommentText = string.IsNullOrWhiteSpace(body.Text) ? null : body.Text,
                Rating = body.Rating,
                CommentDate = DateTime.Now
            };
            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();
            return Ok(comment);
        }

        [HttpGet("{id:int}/Ratings")]
        public async Task<IActionResult> GetRatings(int id)
        {
            var ratings = await _db.Comments
                .Include(c => c.Episode)
                .Where(c => c.Episode != null && c.Episode.MovieID == id && c.Rating > 0)
                .Select(c => c.Rating)
                .ToListAsync();
            var avg = ratings.Count > 0 ? ratings.Average() : 0;
            return Ok(new { rating = avg });
        }

        [HttpPost("{id:int}/Ratings")]
        [Authorize]
        public async Task<IActionResult> PostRating(int id, [FromBody] RatingDto body)
        {
            if (body.Value < 1 || body.Value > 5)
            {
                return BadRequest("Đánh giá phải từ 1 đến 5 sao.");
            }

            int userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            var episode = await _db.Episodes.FirstOrDefaultAsync(e => e.MovieID == id);
            if (episode == null) return BadRequest("Không tìm thấy tập phim cho phim này.");

            var comment = await _db.Comments.FirstOrDefaultAsync(c => c.EpisodeID == episode.EpisodeID && c.UserID == userId);
            if (comment == null)
            {
                comment = new Comment
                {
                    UserID = userId,
                    EpisodeID = episode.EpisodeID,
                    Rating = body.Value,
                    CommentDate = DateTime.Now
                };
                _db.Comments.Add(comment);
            }
            else
            {
                comment.Rating = body.Value;
            }
            await _db.SaveChangesAsync();
            return Ok(comment);
        }
    }

    public class CommentDto
    {
        public string? Text { get; set; }
        public int? Rating { get; set; }
    }

    public class RatingDto
    {
        public int Value { get; set; }
    }
}