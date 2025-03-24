using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using Task = monk_mode_backend.Domain.Task;

namespace monk_mode_backend.Infrastructure {
    public class MonkModeDbContext : IdentityDbContext<ApplicationUser> {

        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<TimeBlock> TimeBlocks { get; set; }


        public MonkModeDbContext(DbContextOptions<MonkModeDbContext> options) : base(options) {
        }

        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);
        }
    }
}
