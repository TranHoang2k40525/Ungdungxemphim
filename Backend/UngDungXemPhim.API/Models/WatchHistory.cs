using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class WatchHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HistoryID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int EpisodeID { get; set; }

        public DateTime? WatchedDate { get; set; } // DB default GETDATE()

        public User? User { get; set; }
        public Episode? Episode { get; set; }
    }
}
