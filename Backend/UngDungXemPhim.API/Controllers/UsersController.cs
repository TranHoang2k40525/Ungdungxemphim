using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Data;
using UngDungXemPhim.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace UngDungXemPhim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _db.Users.ToListAsync());

        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var u = await _db.Users.FindAsync(id);
            if (u == null) return NotFound();
            var dto = new {
                id = u.UserID,
                name = u.FullName,
                email = u.Email,
                phone = u.Phone,
                birthday = u.Birthday
            };
            return Ok(dto);
        }

        [Authorize]
        [HttpGet("WatchHistory")]
        public async Task<IActionResult> GetWatchHistory()
        {
            int userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            var history = await _db.WatchHistories
                .Include(h => h.Episode)
                .ThenInclude(e => e.Movie)
                .ThenInclude(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .Where(h => h.UserID == userId)
                .OrderByDescending(h => h.WatchedDate)
                .ToListAsync();
            var result = history.Select(h => new {
                id = h.HistoryID,
                movieId = h.Episode?.MovieID,
                title = h.Episode?.Movie?.Title,
                imageUrl = h.Episode?.Movie?.ImagePath,
                type = h.Episode?.Movie?.Type,
                genres = h.Episode?.Movie?.MovieGenres.Select(mg => mg.Genre?.GenreName).ToList(),
                watchedAt = h.WatchedDate,
                episode = h.Episode?.EpisodeNumber == 0 ? null : new {
                    id = h.Episode?.EpisodeID,
                    number = h.Episode?.EpisodeNumber,
                    title = h.Episode?.Title,
                    videoPath = h.Episode?.VideoPath
                }
            });
            return Ok(new { history = result });
        }

        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = user.UserID }, user);
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, User input)
        {
            if (id != input.UserID) return BadRequest();
            _db.Entry(input).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var u = await _db.Users.FindAsync(id);
            if (u == null) return NotFound();
            _db.Users.Remove(u);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
