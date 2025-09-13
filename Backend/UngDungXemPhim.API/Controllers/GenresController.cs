using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;

namespace UngDungXemPhim.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GenresController(AppDbContext context)
        {
            _context = context;
        }

        // DTO để tránh vòng lặp và chỉ lấy dữ liệu cần thiết
        public class GenreDto
        {
            public int GenreID { get; set; }
            public string GenreName { get; set; } = string.Empty;
            // Tùy chọn: Thêm danh sách MovieID nếu cần
            // public List<int> MovieIds { get; set; } = new List<int>();
        }

        // GET: api/Genres
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GenreDto>>> GetGenres()
        {
            try
            {
                var genres = await _context.Genres
                    .Select(g => new GenreDto
                    {
                        GenreID = g.GenreID,
                        GenreName = g.GenreName
                        // Tùy chọn: Nếu cần MovieIDs
                        // MovieIds = g.MovieGenres?.Select(mg => mg.MovieID).ToList() ?? new List<int>()
                    })
                    .ToListAsync();

                if (genres == null || !genres.Any())
                {
                    return NotFound("No genres found.");
                }
                return Ok(genres);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}