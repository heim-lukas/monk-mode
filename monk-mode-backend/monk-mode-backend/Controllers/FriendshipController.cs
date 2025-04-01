using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using monk_mode_backend.Application;
using monk_mode_backend.Domain;
using monk_mode_backend.Models;

namespace monk_mode_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;
        private readonly UserManager<ApplicationUser> _userManager;

        public FriendshipController(
            IFriendshipService friendshipService,
            UserManager<ApplicationUser> userManager)
        {
            _friendshipService = friendshipService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetFriends()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var friendships = await _friendshipService.GetFriendshipsAsync(user.Id);
            return Ok(friendships);
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetFriendRequests()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var friendRequests = await _friendshipService.GetFriendRequestsAsync(user.Id);
            return Ok(friendRequests);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDTO request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _friendshipService.SendFriendRequestAsync(user.Id, request.FriendId);

            if (result.Status == "Error")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("accept/{id}")]
        public async Task<IActionResult> AcceptFriendRequest(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _friendshipService.AcceptFriendRequestAsync(user.Id, id);

            if (result.Status == "Error")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectFriendRequest(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _friendshipService.RejectFriendRequestAsync(user.Id, id);

            if (result.Status == "Error")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFriend(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _friendshipService.RemoveFriendAsync(user.Id, id);

            if (!result)
                return BadRequest(new { Status = "Error", Message = "Friend could not be removed." });

            return Ok(new { Status = "Success", Message = "Friend removed successfully." });
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSentFriendRequests()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var sentRequests = await _friendshipService.GetSentFriendRequestsAsync(user.Id);
            return Ok(sentRequests);
        }
    }
}