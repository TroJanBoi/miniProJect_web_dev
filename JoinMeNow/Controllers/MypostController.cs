using JoinMeNow.Data;
using JoinMeNow.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace JoinMeNow.Controllers
{
    public class MypostController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<PostHub> _hubContext;
        private readonly IPostService _postService;

        public MypostController(
            ApplicationDbContext context,
            IHubContext<PostHub> hubContext,
            IPostService postService

        )
        {
            _hubContext = hubContext;
            _context = context;
            _postService = postService;
        }
        public IActionResult Index()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var username = HttpContext.Session.GetString("Username");
            ViewBag.UserEmail = userEmail;
            ViewBag.Username = username;
            return View();
        }

        [HttpPost]
        public JsonResult GetUserPosts([FromBody] PostRequest request)
        {
            _postService.IsPostActive();
            try
            {
                string currentDateStr = request.Date;
                DateTime currentDate = DateTime.Parse(currentDateStr);
                var currentDateTime = DateTime.Now;
                int userId = int.Parse(HttpContext.Session.GetString("UserID"));

                var posts = _context.posts
                    .Where(p => p.Status == "active" && p.UserID == userId || p.Status == "closejoin" && p.UserID == userId)
                    .Select(p => new PostDto
                    {
                        PostID = p.PostID,
                        UserID = p.UserID,
                        Title = p.Title,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate,
                        StartTime = p.StartTime,
                        EndTime = p.EndTime,
                        EventType = p.EventType,
                        MaxParticipants = p.MaxParticipants,
                        Description = p.Description,
                        Status = "Your",
                        CloseDate = p.CloseDate,
                        Participants = _context.postparticipants
                            .Where(pp => pp.PostID == p.PostID)
                            .Select(pp => new ParticipantDto
                            {
                                UserID = pp.UserID,
                                Username = _context.users.FirstOrDefault(u => u.UserID == pp.UserID).Username,
                                Status = pp.status,
                            })
                            .ToList()
                    })
                    .ToList();

                if (HttpContext.Session.GetString("UserID") != null)
                {
                    var registeredPostIds = _context.postparticipants
                        .Where(pp => pp.UserID == userId)
                        .Select(pp => pp.PostID)
                        .ToList();

                    foreach (var post in posts)
                    {
                        if (registeredPostIds.Contains(post.PostID))
                        {
                            post.Status = "Joined";
                        }
                    }
                }

                return Json(posts);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("GetUser/{userId}")]
        public async Task<IActionResult> GetUser(int userId)
        {
            var user = await _context.users
                .Where(u => u.UserID == userId)
                .Select(u => new
                {
                    u.UserID,
                    u.Username,
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }

            return Ok(new { success = true, user });
        }

        [HttpPost]
        public IActionResult UpdateStatus([FromBody] UpdateStatusRequest request)
        {

            try
            {
                var post = _context.posts.FirstOrDefault(p => p.PostID == request.PostId);
                var userId = HttpContext.Session.GetString("UserID");
                foreach (var participantId in request.Participants)
                {
                    var participant = _context.postparticipants
                        .FirstOrDefault(p => p.UserID == int.Parse(participantId) && p.PostID == request.PostId);

                    if (participant != null)
                    {
                        participant.status = request.Status;

                        if (request.Status == "joined")
                        {
                            string date = post.StartDate.ToString("yyyy/MM/dd");
                            var notification = new Notification
                            {
                                SourceOwner = post.UserID,
                                UserID = participant.UserID,
                                EventName = post.Title,
                                Detail = $"You are officially registered for {post.Title} on {date}. We look forward to seeing you!",
                                Timestamp = DateTime.Now
                            };

                            _context.notifications.Add(notification);
                            _context.SaveChanges();
                        }

                        if (request.Status == "denied")
                        {
                            string date = post.StartDate.ToString("yyyy/MM/dd");
                            var notification = new Notification
                            {
                                SourceOwner = post.UserID,
                                UserID = participant.UserID,
                                EventName = post.Title,
                                Detail = $"We're sorry, but your request to join {post.Title} on {date}. has been denied.",
                                Timestamp = DateTime.Now
                            };
                            _context.notifications.Add(notification);
                            _context.SaveChanges();
                        }
                    }
                }
                _hubContext.Clients.All.SendAsync("UpdateNotifications");
                _context.SaveChanges();

                var participantsBeforeUpdate = _context.postparticipants
                    .Where(p => p.PostID == request.PostId)
                    .Select(p => new ParticipantDto
                    {
                        UserID = p.UserID,
                        Username = _context.users.FirstOrDefault(u => u.UserID == p.UserID).Username,
                        Status = p.status,
                    }).ToList();

                _hubContext.Clients.All.SendAsync("UpdateMeetup");
                return Ok(new { success = true , participants = participantsBeforeUpdate });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while updating the status.", error = ex.Message });
            }
        }

        [HttpDelete("DeletePost/{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.posts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            var participants = _context.postparticipants.Where(pp => pp.PostID == id);

            foreach (var participant in participants)
            {
                string date = post.StartDate.ToString("yyyy/MM/dd");
                var notification = new Notification
                {
                    SourceOwner = post.UserID,
                    UserID = participant.UserID,
                    EventName = post.Title,
                    Detail = $"Post {post.Title} on {date} has been denied. Thank you for your contribution!",
                };

                _context.notifications.Add(notification);

            }
            _hubContext.Clients.All.SendAsync("UpdateNotifications");
            _context.postparticipants.RemoveRange(participants);
            _context.posts.Remove(post);
            try
            {
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
