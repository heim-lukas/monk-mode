using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;

namespace monk_mode_backend.Infrastructure {
    public class StarterDbContext : IdentityDbContext<ApplicationUser> {
        public StarterDbContext(DbContextOptions<StarterDbContext> options) : base(options) {
        }

        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);
        }
    }
}
