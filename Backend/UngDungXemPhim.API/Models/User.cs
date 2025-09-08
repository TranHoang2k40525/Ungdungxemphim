using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace UngDungXemPhim.Api.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserID { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Column(TypeName = "date")]
        public DateTime? Birthday { get; set; }

        public byte[]? Avatar { get; set; }

        public Account? Account { get; set; }
        public ICollection<Comment>? Comments { get; set; }
        public ICollection<WatchHistory>? WatchHistories { get; set; }
    }
}
