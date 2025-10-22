using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Models;

namespace UngDungXemPhim.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Movie> Movies { get; set; } = null!;
        public DbSet<Episode> Episodes { get; set; } = null!;
        public DbSet<Genre> Genres { get; set; } = null!;
        public DbSet<MovieGenre> MovieGenres { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // MovieGenres composite key
            modelBuilder.Entity<MovieGenre>()
                .HasKey(mg => new { mg.MovieID, mg.GenreID });

            modelBuilder.Entity<MovieGenre>()
                .HasOne(mg => mg.Movie)
                .WithMany(m => m.MovieGenres)
                .HasForeignKey(mg => mg.MovieID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MovieGenre>()
                .HasOne(mg => mg.Genre)
                .WithMany(g => g.MovieGenres)
                .HasForeignKey(mg => mg.GenreID)
                .OnDelete(DeleteBehavior.Cascade);

            // Episode unique per movie (MovieID + EpisodeNumber)
            modelBuilder.Entity<Episode>()
                .HasIndex(e => new { e.MovieID, e.EpisodeNumber })
                .IsUnique();

            modelBuilder.Entity<Episode>()
                .HasOne(e => e.Movie)
                .WithMany(m => m.Episodes)
                .HasForeignKey(e => e.MovieID)
                .OnDelete(DeleteBehavior.Cascade);

            // Movie type constraint (Updated to use ToTable)
            modelBuilder.Entity<Movie>()
                .ToTable(t => t.HasCheckConstraint("CK_Movies_Type", "[Type] IN (N'Phim lẻ', N'Phim bộ')"));
        }
    }
}
