using System;

namespace monk_mode_backend.Domain
{
    public class UserTask
    {
        public int Id { get; set; }

        // Required field
        public string Title { get; set; }

        // Optional field
        public string? Description { get; set; }

        // Optional field
        public DateTime? DueDate { get; set; } 
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }

        // Set when task is completed; null when reopened
        public DateTime? CompletedAt { get; set; } 

        // Relationship to the user
        public string UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        // Optional relationship to a time block
        public int? TimeBlockId { get; set; }
        public TimeBlock? TimeBlock { get; set; }
    }
}
