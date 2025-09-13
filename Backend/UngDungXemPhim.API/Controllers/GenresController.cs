using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenresController : ControllerBase
    {
        private readonly AppDbContext _db;

        public GenresController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var genres = await _db.Genres
                .OrderBy(g => g.GenreName)
                .ToListAsync();

            var result = genres.Select(g => new
            {
                genreID = g.GenreID,
                genreName = g.GenreName
            });

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var genre = await _db.Genres
                .FirstOrDefaultAsync(g => g.GenreID == id);

            if (genre == null)
            {
                return NotFound("Không tìm thấy thể loại.");
            }

            return Ok(new
            {
                genreID = genre.GenreID,
                genreName = genre.GenreName
            });
        }
    }
}