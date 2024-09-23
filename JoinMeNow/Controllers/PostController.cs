using JoinMeNow.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JoinMeNow.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace JoinMeNow.Controllers
{
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<PostHub> _hubContext;

        public PostController(ApplicationDbContext context, IHubContext<PostHub> hubContext)
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

        [HttpGet]
        public async Task<IActionResult> GetEvenType()
        {
            try
            {
                var evenTypes = await _context.eventtypes.ToListAsync();
                return Ok(evenTypes);

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] IFormCollection form, IFormFile image)
        {
            var userID = HttpContext.Session.GetString("UserID");

            var post = new Post
            {
                UserID = int.Parse(userID),
                Title = form["title"],
                Description = form["description"],
                EventType = form["eventType"],
                StartDate = DateTime.Parse(form["startDate"]),
                EndDate = DateTime.Parse(form["endDate"]),
                StartTime = TimeSpan.Parse(form["startTime"] + ":00"),
                EndTime = TimeSpan.Parse(form["endTime"] + ":00"),
                CloseDate = DateTime.Parse(form["closeDate"]),
                MaxParticipants = form["participants"] == "non-limit" ? 0 : int.Parse(form["maxParticipants"]),
                Status = "active",
            };

            post.Img = image != null && image.Length > 0 ? "/img/" + image.FileName : "/img/jmn-01.jpg";

            try
            {

                if (image != null && image.Length > 0)
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img", image.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }
                }

                _context.posts.Add(post);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("UpdatePosts");
                return Json(new { success = true, message = "Post created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
    }
}
