using System;

namespace monk_mode_backend.Models
{
    public class UpdateTaskDTO
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }
}
