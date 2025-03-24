namespace monk_mode_backend.Domain {
    public class Task {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public int? TimeBlockId { get; set; }
        public TimeBlock? TimeBlock { get; set; }
        public ApplicationUser User { get; set; } = null!;
    }
}
