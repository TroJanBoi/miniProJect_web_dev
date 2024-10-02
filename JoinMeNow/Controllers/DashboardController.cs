using JoinMeNow.Data;
using JoinMeNow.Hubs;
using JoinMeNow.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

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

        public void IsPostActive()
        {
            var currentDateTime = DateTime.Now;
            var posts = _context.posts.ToList();

            foreach (var post in posts)
            {
                post.Status = "active";
                _context.posts.Update(post);

                if (post.StartDate.Date == post.CloseDate.Date || post.StartDate > currentDateTime)
                {
                    if (post.StartTime < currentDateTime.TimeOfDay)
                    {
                        post.Status = "inactive";
                        _context.posts.Update(post);
                    }
                }
                else if (post.CloseDate < currentDateTime || post.StartDate > currentDateTime)
                {
                    if (post.CloseDate < currentDateTime && (post.StartDate > currentDateTime || (post.StartDate.Date == currentDateTime.Date && post.StartTime > currentDateTime.TimeOfDay)))
                    {
                        post.Status = "closejoin";
                    }
                    else
                    {
                        post.Status = "inactive";
                    }
                    _context.posts.Update(post);
                }
            }

            _context.SaveChanges();
        }

        [HttpPost]
        public JsonResult GetPosts([FromBody] PostRequest request)
        {
            IsPostActive();
            try
            {
                string currentDateStr = request.Date;
                DateTime currentDate = DateTime.Parse(currentDateStr);
                var currentDateTime = DateTime.Now;
                var posts = _context.posts
                    .Where(p => p.StartDate.Date == currentDate && p.Status == "active")
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
                    return Json(new
                    {
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
                    return Json(new
                    {
                        success = false,
                        message = "User already joined."
                    });
                }

                var post = _context.posts.FirstOrDefault(p => p.PostID == postId);
                string participantStatus = post.MaxParticipants != 0 ? "joined" : "pending";

                var newParticipant =
                    new PostParticipant
                    {
                        PostID = request.PostID,
                        UserID = parsedUserId,
                        status = participantStatus
                    };

                _context.postparticipants.Add(newParticipant);
                _context.SaveChanges();
                _hubContext
                    .Clients
                    .All
                    .SendAsync("UpdateParticipant", parsedUserId, postId, newParticipant.status);
                _hubContext.Clients.All.SendAsync("UpdatePostsID", postId);

                return Json(new
                {
                    success = true,
                    message = "Successfully joined the post."
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("/Dashboard/cancel-join/{postID}")]
        public IActionResult CancelJoin(int postID)
        {
            var userId = HttpContext.Session.GetString("UserID");
            if (userId == null)
            {
                return Unauthorized("User not logged in.");
            }

            try
            {
                var participation = _context.postparticipants
                    .FirstOrDefault(pp => pp.PostID == postID && pp.UserID == int.Parse(userId));

                if (participation != null)
                {
                    _context.postparticipants.Remove(participation);
                    _context.SaveChanges();

                    return Ok(new { message = "Participation cancelled successfully." });
                }
                else
                {
                    return NotFound("Participation not found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}
