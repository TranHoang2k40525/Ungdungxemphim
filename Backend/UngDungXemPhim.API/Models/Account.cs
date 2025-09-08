using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UngDungXemPhim.Api.Models
{
    public class Account
    {
        [Key]
        [ForeignKey(nameof(User))]
        public int UserID { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Token { get; set; }

        public User? User { get; set; }
    }
}
