using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class MovieGenre
    {
        public int MovieID { get; set; }
        public int GenreID { get; set; }

        public Movie? Movie { get; set; }
        public Genre? Genre { get; set; }
    }
}
