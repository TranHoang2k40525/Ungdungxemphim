using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class Episode
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EpisodeID { get; set; }

        [Required]
        public int MovieID { get; set; }

        [Required]
        public int EpisodeNumber { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? VideoPath { get; set; }

        public Movie? Movie { get; set; }
    }
}
