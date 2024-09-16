using Microsoft.AspNetCore.Mvc;

namespace JoinMeNow.Controllers
{
    public class MeetupController : Controller
    {
        public IActionResult Index()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var username = HttpContext.Session.GetString("Username");
            ViewBag.UserEmail = userEmail;
            ViewBag.Username = username;
            return View();
        }
    }
}
