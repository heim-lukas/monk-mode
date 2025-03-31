using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using UserTask = monk_mode_backend.Domain.UserTask;

namespace monk_mode_backend.Infrastructure {
    public class MonkModeDbContext : IdentityDbContext<ApplicationUser> {

        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<UserTask> Tasks { get; set; }
        public DbSet<TimeBlock> TimeBlocks { get; set; }


        public MonkModeDbContext(DbContextOptions<MonkModeDbContext> options) : base(options) {
        }

        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);
        }
    }
}
