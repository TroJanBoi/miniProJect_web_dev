using JoinMeNow.Data;
using JoinMeNow.Models;
using Microsoft.AspNetCore.Mvc;
namespace JoinMeNow.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ApplicationDbContext _context;
        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var username = HttpContext.Session.GetString("Username");
            var userID = HttpContext.Session.GetString("Username");
            ViewBag.UserEmail = userEmail;
            ViewBag.Username = username;
            ViewBag.UserID = userID;
            return View();
        }

        public class PostDto
        {
            public int PostID { get; set; } 
            public int UserID { get; set; } 
            public string Title { get; set; }
            public DateTime StartDate { get; set; } 
            public DateTime EndDate { get; set; }
            public TimeSpan StartTime { get; set; } 
            public TimeSpan EndTime { get; set; } 
            public string EventType { get; set; }
            public int MaxParticipants { get; set; } 
            public string Description { get; set; }
            public string Status { get; set; } 
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
                        EventType = p.EventType,
                        MaxParticipants =  p.MaxParticipants-_context.postparticipants.Count(pp => pp.PostID == p.PostID),
                        Description = p.Description,
                        Status = p.Status ?? "Not Registered"
                    })
                    .ToList();


                if (HttpContext.Session.GetString("UserID") != null)
                {
                    int userId = int.Parse(HttpContext.Session.GetString("UserID"));
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


        public class PostParticipantRequest
        {
            public int PostID { get; set; }
        }
        [HttpPost]
        public JsonResult AddPostParticipant([FromBody] PostParticipantRequest request)
        {
            try
            {
                var userId = HttpContext.Session.GetString("UserID");

                if (string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "User not logged in." });
                }

                int parsedUserId = int.Parse(userId);

                var existingParticipant = _context.postparticipants
                    .FirstOrDefault(pp => pp.PostID == request.PostID && pp.UserID == parsedUserId);

                if (existingParticipant != null)
                {
                    return Json(new { success = false, message = "User already joined." });
                }

                var newParticipant = new PostParticipant
                {
                    PostID = request.PostID,
                    UserID = parsedUserId
                };

                _context.postparticipants.Add(newParticipant);
                _context.SaveChanges();

                return Json(new { success = true, message = "Successfully joined the post." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


    }
}
