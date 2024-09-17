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
                var user = new User
                {
                    FullName = model.Username,
                    Username = model.Username,
                    Password = model.Password,
                    Email = model.Email
                };

                _context.users.Add(user);
                await _context.SaveChangesAsync();

                return RedirectToAction("Index", "Home");
            }


            return RedirectToAction("Index", "Login");
        }
    }
}
