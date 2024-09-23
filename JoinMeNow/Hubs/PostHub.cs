using JoinMeNow.Models;
using Microsoft.AspNetCore.SignalR;

namespace JoinMeNow.Hubs
{
    public class PostHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task SendAsync(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task UpdateParticipant(int userId, int postId)
        {
            await Clients.All.SendAsync("UpdateParticipant", userId, postId);
        }

    }
}
