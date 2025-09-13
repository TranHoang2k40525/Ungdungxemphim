using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace UngDungXemPhim.Api.Models
{
    public class CommentDto
    {
        [JsonPropertyName("text")]
        public string? text { get; set; }
        
        [JsonPropertyName("rating")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int? rating { get; set; }
    }

    public class RatingDto
    {
        [JsonPropertyName("value")]
        [Required(ErrorMessage = "Value is required")]
        [Range(1, 5, ErrorMessage = "Value must be between 1 and 5")]
        public int value { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public DateTime? Birthday { get; set; }
        public byte[]? Avatar { get; set; }
    }

    public class ChangePasswordDto
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AddWatchHistoryDto
    {
        public int EpisodeID { get; set; }
    }
}
