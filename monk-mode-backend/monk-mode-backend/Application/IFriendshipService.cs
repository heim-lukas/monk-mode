using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application
{
    public interface IFriendshipService
    {
        Task<IEnumerable<FriendshipDTO>> GetFriendshipsAsync(string userId);
        Task<IEnumerable<FriendshipDTO>> GetFriendRequestsAsync(string userId);
        Task<FriendshipResponseDTO> SendFriendRequestAsync(string userId, string friendId);
        Task<FriendshipResponseDTO> AcceptFriendRequestAsync(string userId, int friendshipId);
        Task<FriendshipResponseDTO> RejectFriendRequestAsync(string userId, int friendshipId);
        Task<bool> RemoveFriendAsync(string userId, int friendshipId);
    }
}