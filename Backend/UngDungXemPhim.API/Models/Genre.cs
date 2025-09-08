using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UngDungXemPhim.Api.Models
{
    public class Genre
    {
        [Key]
        public int GenreID { get; set; }

        [Required]
        [MaxLength(100)]
        public string GenreName { get; set; } = string.Empty;

        public ICollection<MovieGenre>? MovieGenres { get; set; }
    }
}
