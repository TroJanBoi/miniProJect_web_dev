using JoinMeNow.Data;
using JoinMeNow.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace JoinMeNow.Controllers
{
    public class HistoryController : Controller
    {
        private readonly ApplicationDbContext _context;

        private readonly IHubContext<PostHub> _hubContext;

        public HistoryController(
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
        public JsonResult GetInactivePosts()
        {
            try
            {

                int? userId = HttpContext.Session.GetString("UserID") != null
                    ? (int?)int.Parse(HttpContext.Session.GetString("UserID"))
                    : null;

                var posts = _context.posts
                    .Where(p => p.Status == "inactive" &&(p.UserID == userId.Value || _context.postparticipants.Any(pp => pp.UserID == userId && pp.PostID == p.PostID)))
                    .Select(p => new PostDto
                    {
                        PostID = p.PostID,
                        UserID = p.UserID,
                        Title = p.Title,
                        StartDate = p.StartDate,
                        EndDate = p.EndDate,
                        StartTime = p.StartTime,
                        EndTime = p.EndTime,
                        CloseDate = p.CloseDate,
                        Img = p.Img,
                        EventType = p.EventType,
                        MaxParticipants = p.MaxParticipants,
                        Description = p.Description,
                        ParticipantsCount = _context.postparticipants.Count(pp => pp.PostID == p.PostID),
                        Status = p.Status ?? "Not Registered"
                    })
                    .ToList();

                foreach (var post in posts)
                {
                    if (userId.HasValue && post.UserID == userId.Value)
                    {
                        post.Status = "Your";
                    }
                    else
                    {
                        var participant = _context.postparticipants
                            .FirstOrDefault(pp => pp.UserID == userId && pp.PostID == post.PostID && pp.status == "joined");

                        if (participant != null)
                        {
                            post.Status = "Join";
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
    }
}
