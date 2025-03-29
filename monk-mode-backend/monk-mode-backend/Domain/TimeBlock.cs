namespace monk_mode_backend.Domain {
    public class TimeBlock {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsFocus { get; set; }

        public ApplicationUser User { get; set; } = null!;

        public ICollection<UserTask> Tasks { get; set; } = new List<UserTask>();
    }
}
