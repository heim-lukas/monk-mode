using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using monk_mode_backend.Domain;
using monk_mode_backend.Hubs;
using monk_mode_backend.Infrastructure;
using monk_mode_backend.Models;

namespace monk_mode_backend.Application
{
    public class FriendshipService : IFriendshipService
    {
        private readonly MonkModeDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public FriendshipService(
            MonkModeDbContext dbContext,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<FriendshipDTO>> GetFriendshipsAsync(string userId)
        {
            var friendships = await _dbContext.Friendships
                .Where(f => (f.UserId == userId || f.FriendId == userId) && f.Status == "Accepted")
                .ToListAsync();

            var friendshipDTOs = new List<FriendshipDTO>();

            foreach (var friendship in friendships)
            {
                var friendId = friendship.UserId == userId ? friendship.FriendId : friendship.UserId;
                var friend = await _userManager.FindByIdAsync(friendId);

                var friendshipDTO = _mapper.Map<FriendshipDTO>(friendship);
                friendshipDTO.FriendUsername = friend.UserName;

                friendshipDTOs.Add(friendshipDTO);
            }

            return friendshipDTOs;
        }

        public async Task<IEnumerable<FriendshipDTO>> GetFriendRequestsAsync(string userId)
        {
            var friendRequests = await _dbContext.Friendships
                .Where(f => f.FriendId == userId && f.Status == "Pending")
                .ToListAsync();

            var friendshipDTOs = new List<FriendshipDTO>();

            foreach (var request in friendRequests)
            {
                var requester = await _userManager.FindByIdAsync(request.UserId);

                var friendshipDTO = _mapper.Map<FriendshipDTO>(request);
                friendshipDTO.FriendUsername = requester.UserName;

                friendshipDTOs.Add(friendshipDTO);
            }

            return friendshipDTOs;
        }

        public async Task<FriendshipResponseDTO> SendFriendRequestAsync(string userId, string friendUsername)
        {
            var response = new FriendshipResponseDTO();

            // Check if friend exists
            var friend = await _userManager.FindByNameAsync(friendUsername);
            if (friend == null)
            {
                response.Status = "Error";
                response.Message = "User not found.";
                return response;
            }

            var friendId = friend.Id;

            // Check if user is trying to add themselves
            if (userId == friendId)
            {
                response.Status = "Error";
                response.Message = "You cannot add yourself as a friend.";
                return response;
            }

            // Check if friendship already exists
            var existingFriendship = await _dbContext.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.UserId == userId && f.FriendId == friendId) ||
                    (f.UserId == friendId && f.FriendId == userId));

            if (existingFriendship != null)
            {
                response.Status = "Error";
                response.Message = existingFriendship.Status == "Accepted"
                    ? "You are already friends with this user."
                    : "A friend request already exists.";
                return response;
            }

            var friendship = new Friendship
            {
                UserId = userId,
                FriendId = friendId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Friendships.Add(friendship);
            await _dbContext.SaveChangesAsync();

            // Send real-time notification
            var requester = await _userManager.FindByIdAsync(userId);
            await _hubContext.Clients.User(friendId)
                .SendAsync("ReceiveFriendRequest", userId, requester.UserName);

            var friendshipDTO = _mapper.Map<FriendshipDTO>(friendship);
            friendshipDTO.FriendUsername = friend.UserName;

            response.Status = "Success";
            response.Message = "Friend request sent successfully.";
            response.Friendship = friendshipDTO;

            return response;
        }

        public async Task<FriendshipResponseDTO> AcceptFriendRequestAsync(string userId, int friendshipId)
        {
            var response = new FriendshipResponseDTO();

            var friendship = await _dbContext.Friendships.FindAsync(friendshipId);

            if (friendship == null)
            {
                response.Status = "Error";
                response.Message = "Friend request not found.";
                return response;
            }

            if (friendship.FriendId != userId)
            {
                response.Status = "Error";
                response.Message = "You cannot accept this friend request.";
                return response;
            }

            if (friendship.Status != "Pending")
            {
                response.Status = "Error";
                response.Message = "This friend request cannot be accepted.";
                return response;
            }

            friendship.Status = "Accepted";
            _dbContext.Friendships.Update(friendship);
            await _dbContext.SaveChangesAsync();

            // Send real-time notification
            await _hubContext.Clients.User(friendship.UserId)
                .SendAsync("FriendRequestAccepted", userId);

            var requester = await _userManager.FindByIdAsync(friendship.UserId);
            var friendshipDTO = _mapper.Map<FriendshipDTO>(friendship);
            friendshipDTO.FriendUsername = requester.UserName;

            response.Status = "Success";
            response.Message = "Friend request accepted.";
            response.Friendship = friendshipDTO;

            return response;
        }

        public async Task<FriendshipResponseDTO> RejectFriendRequestAsync(string userId, int friendshipId)
        {
            var response = new FriendshipResponseDTO();

            var friendship = await _dbContext.Friendships.FindAsync(friendshipId);

            if (friendship == null)
            {
                response.Status = "Error";
                response.Message = "Friend request not found.";
                return response;
            }

            if (friendship.FriendId != userId)
            {
                response.Status = "Error";
                response.Message = "You cannot reject this friend request.";
                return response;
            }

            if (friendship.Status != "Pending")
            {
                response.Status = "Error";
                response.Message = "This friend request cannot be rejected.";
                return response;
            }

            _dbContext.Friendships.Remove(friendship);
            await _dbContext.SaveChangesAsync();

            // Send real-time notification
            await _hubContext.Clients.User(friendship.UserId)
                .SendAsync("FriendRequestRejected", userId);

            response.Status = "Success";
            response.Message = "Friend request rejected.";

            return response;
        }

        public async Task<bool> RemoveFriendAsync(string userId, int friendshipId)
        {
            var friendship = await _dbContext.Friendships.FindAsync(friendshipId);

            if (friendship == null ||
                (friendship.UserId != userId && friendship.FriendId != userId) ||
                friendship.Status != "Accepted")
            {
                return false;
            }

            _dbContext.Friendships.Remove(friendship);
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }
}