using Microsoft.AspNetCore.Identity;

namespace monk_mode_backend.Domain
{
    public class ApplicationUser : IdentityUser
    {
        public int Level { get; set; }
        public int Xp { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<TimeBlock> TimeBlocks { get; set; } = new List<TimeBlock>();
        public ICollection<UserTask> Tasks { get; set; } = new List<UserTask>();
    }
}
