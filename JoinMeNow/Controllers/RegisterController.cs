using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JoinMeNow.Data;
using JoinMeNow.Models;

namespace JoinMeNow.Controllers
{
    public class RegisterController : Controller
    {

        private readonly ApplicationDbContext _context;

        public RegisterController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _context.users
                .FirstOrDefaultAsync(u => u.Username == model.Username || u.Email == model.Email);

                if (existingUser != null)
                {
                    return Json(new { success = false, message = "Username or email already exists. Please choose a different one." });
                }

                var user = new User
                {
                    FullName = model.FullName,
                    Username = model.Username,
                    Password = model.Password,
                    Email = model.Email
                };

                _context.users.Add(user);
                await _context.SaveChangesAsync();

                HttpContext.Session.SetString("UserEmail", user.Email);
                HttpContext.Session.SetString("Username", user.Username);
                HttpContext.Session.SetString("UserID", user.UserID.ToString());

                return Json(new { success = true, message = "Registration successful! Redirecting to dashboard..." });
            }
            else
            {
                return Json(new { success = false, message = "Registration failed. Please check your inputs." });
            }
        }
    }
}
