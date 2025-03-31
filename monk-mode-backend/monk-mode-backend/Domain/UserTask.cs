using System;

namespace monk_mode_backend.Domain
{
    public class UserTask
    {
        public int Id { get; set; }
        public string Title { get; set; }  // Pflichtfeld
        public string? Description { get; set; } // Optional
        public DateTime? DueDate { get; set; } // Optional
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; } // Wird gesetzt, wenn Task abgeschlossen wird; bei Re-Öffnung wieder null

        // Beziehung zum User
        public string UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        // Optionale Beziehung zu einem TimeBlock
        public int? TimeBlockId { get; set; }
        public TimeBlock? TimeBlock { get; set; }
    }
}
