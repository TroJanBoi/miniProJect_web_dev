using JoinMeNow.Data;
using JoinMeNow.Hubs;
using JoinMeNow.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace JoinMeNow.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _context;

        private readonly IHubContext<PostHub> _hubContext;

        public DashboardController(
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
            var userID = HttpContext.Session.GetString("UserID");
            ViewBag.UserEmail = userEmail;
            ViewBag.Username = username;
            ViewBag.UserID = userID;
            return View();
        }

        [HttpPost]
        public JsonResult GetPosts([FromBody] PostRequest request)
        {
            try
            {
                string currentDateStr = request.Date;
                DateTime currentDate = DateTime.Parse(currentDateStr);
                var posts = _context.posts
                    .Where(p => p.StartDate.Date == currentDate)
                    .Select(p => new PostDto
                    {
                        PostID = p.PostID,
                        UserID = p.UserID,
                        Title = p.Title,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate,
                        StartTime = p.StartTime,
                        EndTime = p.EndTime,
                        Img = p.Img,
                        EventType = p.EventType,
                        MaxParticipants = p.MaxParticipants != 0 ? p.MaxParticipants - _context.postparticipants.Count(pp => pp.PostID == p.PostID) : 0,
                        Description = p.Description,
                        Status = p.Status ?? "Not Registered"
                    })
                    .ToList();

                if (HttpContext.Session.GetString("UserID") != null)
                {
                    int userId =
                        int.Parse(HttpContext.Session.GetString("UserID"));
                    var registeredPostIds =
                        _context
                            .postparticipants
                            .Where(pp => pp.UserID == userId)
                            .Select(pp => pp.PostID)
                            .ToList();

                    foreach (var post in posts)
                    {
                        if (post.UserID == userId)
                        {
                            post.Status = "Your";
                        }
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

        public class PostParticipantRequest
        {
            public int PostID { get; set; }
        }

        [HttpPost]
        public JsonResult
        AddPostParticipant([FromBody] PostParticipantRequest request)
        {
            try
            {
                var userId = HttpContext.Session.GetString("UserID");

                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new {
                        success = false,
                        message = "User not logged in."
                    });
                }

                int parsedUserId = int.Parse(userId);
                int postId = request.PostID;

                var existingParticipant =
                    _context
                        .postparticipants
                        .FirstOrDefault(pp =>
                            pp.PostID == request.PostID &&
                            pp.UserID == parsedUserId);

                if (existingParticipant != null)
                {
                    return Json(new {
                        success = false,
                        message = "User already joined."
                    });
                }

                var newParticipant =
                    new PostParticipant {
                        PostID = request.PostID,
                        UserID = parsedUserId,
                        status = "pending"
                    };

                _context.postparticipants.Add (newParticipant);
                _context.SaveChanges();
                _hubContext
                    .Clients
                    .All
                    .SendAsync("UpdateParticipant", parsedUserId, postId , "pending");

                return Json(new {
                    success = true,
                    message = "Successfully joined the post."
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
