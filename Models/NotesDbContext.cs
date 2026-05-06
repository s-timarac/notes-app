using Microsoft.EntityFrameworkCore;

namespace NotesApp.Models
{
    public class NotesDbContext : DbContext
    {
        public NotesDbContext(DbContextOptions<NotesDbContext> options) : base(options) { }

        public DbSet<Note> Notes { get; set; }
        public DbSet<AppUser> Users { get; set; }
    }
}