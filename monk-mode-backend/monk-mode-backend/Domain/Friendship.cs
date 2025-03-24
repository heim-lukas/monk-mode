namespace monk_mode_backend.Domain {
    public class Friendship {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FriendId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public ApplicationUser User { get; set; } = null!;
    }
}
