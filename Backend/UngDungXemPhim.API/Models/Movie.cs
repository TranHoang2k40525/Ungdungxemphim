using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class Movie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MovieID { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImagePath { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "Phim lẻ"; // Phim lẻ / Phim bộ

        [MaxLength(500)]
        public string? Actors { get; set; }

        [MaxLength(500)]
        public string? Directors { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        public ICollection<Episode>? Episodes { get; set; }
        public ICollection<MovieGenre>? MovieGenres { get; set; }
    }
}
