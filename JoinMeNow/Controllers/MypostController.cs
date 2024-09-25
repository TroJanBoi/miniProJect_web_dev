using JoinMeNow.Data;
using JoinMeNow.Hubs;
using JoinMeNow.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace JoinMeNow.Controllers
{
    public class MypostController : Controller
    {
        private readonly ApplicationDbContext _context;

        private readonly IHubContext<PostHub> _hubContext;

        public MypostController(
            ApplicationDbContext context,
            IHubContext<PostHub> hubContext
        )
        {
            _hubContext = hubContext;
            _context = context;
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
            try
            {
                string currentDateStr = request.Date;
                DateTime currentDate = DateTime.Parse(currentDateStr);

                int userId = int.Parse(HttpContext.Session.GetString("UserID"));

                var posts = _context.posts
                    .Where(p => p.StartDate.Date >= currentDate && p.UserID == userId)
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
                        MaxParticipants = p.MaxParticipants - _context.postparticipants.Count(pp => pp.PostID == p.PostID),
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

                foreach (var participantId in request.Participants)
                {
                    var participant = _context.postparticipants
                        .FirstOrDefault(p => p.UserID == int.Parse(participantId) && p.PostID == request.PostId);

                    if (participant != null)
                    {
                        participant.status = request.Status;

                    }
                }
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
    }
}
