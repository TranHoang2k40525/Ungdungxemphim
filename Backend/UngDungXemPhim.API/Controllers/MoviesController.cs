using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _db;
        
        public MoviesController(AppDbContext db) 
        { 
            _db = db;
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
    }
}