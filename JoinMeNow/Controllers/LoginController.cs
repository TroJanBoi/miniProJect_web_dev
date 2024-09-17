using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JoinMeNow.Models;
using JoinMeNow.Data;
using Microsoft.EntityFrameworkCore;
namespace JoinMeNow.Controllers;

public class LoginController : Controller
{
    private readonly ApplicationDbContext _context;
    public LoginController(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }


    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(string email, string password, bool rememberMe)
    {
        var user = await _context.users
            .FirstOrDefaultAsync(u => u.Email == email && u.Password == password);

        if (user != null)
        {
            HttpContext.Session.SetString("UserEmail", user.Email);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("UserID", user.UserID.ToString());
            var userEmail = HttpContext.Session.GetString("UserEmail");
            var username = HttpContext.Session.GetString("Username");
            ViewBag.UserEmail = userEmail;
            ViewBag.Username = username;
            return RedirectToAction("Index", "Dashboard");
        }
        else
        {
            ViewBag.ErrorMessage = "Invalid username or password.";
            return View("Index");
        }
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Remove("UserEmail");
        HttpContext.Session.Remove("Username");
        HttpContext.Session.Remove("UserID");
        return RedirectToAction("Index", "Dashboard");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}