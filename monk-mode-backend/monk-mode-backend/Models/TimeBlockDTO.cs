namespace monk_mode_backend.Models {
    public class TimeBlockDTO {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsFocus { get; set; }
    }
}
