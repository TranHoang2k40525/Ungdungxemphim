using System;
using System.Collections.Generic;

namespace UngDungXemPhim.Api.Models
{
    public class MovieDto
    {
        public int MovieID { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public string? MovieDescription { get; set; }
        public string? ImageUrl { get; set; }

        public string? VideoPath { get; set; }
        
        public string MovieType { get; set; } = string.Empty;
        public string? MovieActors { get; set; }
        public string? MovieDirector { get; set; }
        public string? MovieCountry { get; set; }
        public List<string>? MovieGenre { get; set; }
    }
}
