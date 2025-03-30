using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace monk_mode_backend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task<System.Threading.Tasks.Task> SendFriendRequest(string receiverId, string message)
        {
            await Clients.User(receiverId).SendAsync("ReceiveFriendRequest", Context.UserIdentifier, message);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        public async Task<System.Threading.Tasks.Task> SendFriendRequestAccepted(string receiverId)
        {
            await Clients.User(receiverId).SendAsync("FriendRequestAccepted", Context.UserIdentifier);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        public async Task<System.Threading.Tasks.Task> SendFriendRequestRejected(string receiverId)
        {
            await Clients.User(receiverId).SendAsync("FriendRequestRejected", Context.UserIdentifier);
            return System.Threading.Tasks.Task.CompletedTask;
        }
    }
}