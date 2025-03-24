using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using Task = monk_mode_backend.Domain.Task;

namespace monk_mode_backend.Infrastructure {
    public class StarterDbContext : IdentityDbContext<ApplicationUser> {

        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<TimeBlock> TimeBlocks { get; set; }


        public StarterDbContext(DbContextOptions<StarterDbContext> options) : base(options) {
        }

        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);
        }
    }
}
