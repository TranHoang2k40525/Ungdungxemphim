using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class Comment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CommentID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int EpisodeID { get; set; }

        public string? CommentText { get; set; }

        public int? Rating { get; set; }

        public DateTime? CommentDate { get; set; } // DB default GETDATE()

        public User? User { get; set; }
        public Episode? Episode { get; set; }
    }
}
