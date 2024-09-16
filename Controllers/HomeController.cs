using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using JoinMeNow.Models;

namespace JoinMeNow.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        var userEmail = HttpContext.Session.GetString("UserEmail");
        var username = HttpContext.Session.GetString("Username");
        ViewBag.UserEmail = userEmail;
        ViewBag.Username = username;
        return View();
    }
    public IActionResult Test()
    {
        return View();
    }
    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
