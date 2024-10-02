using JoinMeNow.Data;
using JoinMeNow.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace JoinMeNow.Controllers
{
    public class MeetupController : Controller
    {

        private readonly ApplicationDbContext _context;

        private readonly IHubContext<PostHub> _hubContext;

        public MeetupController(
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
        public JsonResult GetPosts([FromBody] PostRequest request)
        {
            try
            {
                var userIdStr = HttpContext.Session.GetString("UserID");
                if (userIdStr == null)
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                int userId = int.Parse(userIdStr);

                var registeredPostIds = _context.postparticipants
                    .Where(pp => pp.UserID == userId && pp.status == "joined")
                    .Select(pp => pp.PostID)
                    .ToList();

                var posts = _context.posts
                    .Where(p => registeredPostIds.Contains(p.PostID) && p.Status =="active" || registeredPostIds.Contains(p.PostID) && p.Status == "closejoin")
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
                        Status = "Joined",
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

                return Json(posts);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
