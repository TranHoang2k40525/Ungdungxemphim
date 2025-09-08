using Microsoft.EntityFrameworkCore;
using UngDungXemPhim.Api.Models;

namespace UngDungXemPhim.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<Movie> Movies { get; set; } = null!;
        public DbSet<Episode> Episodes { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Genre> Genres { get; set; } = null!;
        public DbSet<MovieGenre> MovieGenres { get; set; } = null!;
        public DbSet<WatchHistory> WatchHistories { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Account one-to-one with User (UserID is PK in Account and FK to Users)
            modelBuilder.Entity<Account>()
                .HasKey(a => a.UserID);

            modelBuilder.Entity<Account>()
                .HasOne(a => a.User)
                .WithOne(u => u.Account)
                .HasForeignKey<Account>(a => a.UserID)
                .OnDelete(DeleteBehavior.Cascade);

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

            // Comments
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Episode)
                .WithMany(e => e.Comments)
                .HasForeignKey(c => c.EpisodeID)
                .OnDelete(DeleteBehavior.Cascade);

            // WatchHistory
            modelBuilder.Entity<WatchHistory>()
                .HasOne(w => w.User)
                .WithMany(u => u.WatchHistories)
                .HasForeignKey(w => w.UserID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WatchHistory>()
                .HasOne(w => w.Episode)
                .WithMany(e => e.WatchHistories)
                .HasForeignKey(w => w.EpisodeID)
                .OnDelete(DeleteBehavior.Cascade);

            // Defaults and constraints
            modelBuilder.Entity<Comment>()
                .Property(c => c.CommentDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<WatchHistory>()
                .Property(w => w.WatchedDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Comment>()
                .HasCheckConstraint("CK_Comments_Rating", "[Rating] IS NULL OR ([Rating] >= 1 AND [Rating] <= 5)");

            modelBuilder.Entity<Movie>()
                .HasCheckConstraint("CK_Movies_Type", "[Type] IN (N'Phim lẻ', N'Phim bộ')");
        }
    }
}
