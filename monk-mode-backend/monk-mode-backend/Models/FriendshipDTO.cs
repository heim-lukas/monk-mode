namespace monk_mode_backend.Models
{
    public class FriendshipDTO
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FriendId { get; set; }
        public string FriendUsername { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FriendRequestDTO
    {
        public string FriendId { get; set; }
    }

    public class FriendshipResponseDTO
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public FriendshipDTO Friendship { get; set; }
    }
}