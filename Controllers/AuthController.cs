using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApp.Models;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace NotesApp.Controllers
{
    public class AuthController : Controller
    {
        private readonly NotesDbContext _context;

        public AuthController(NotesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login() => View();

        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == req.Username))
                return Json(new { success = false, message = "Username already taken!" });

            var user = new AppUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = req.Username,
                DisplayName = req.DisplayName,
                PasswordHash = HashPassword(req.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await SignInUser(user);
            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == req.Username);
            if (user == null || user.PasswordHash != HashPassword(req.Password))
                return Json(new { success = false, message = "Invalid username or password!" });
            await SignInUser(user);
            return Json(new { success = true });
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("CookieAuth");
            return Redirect("/Auth/Login");
        }

        private async Task SignInUser(AppUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim("DisplayName", user.DisplayName)
            };
            var identity = new ClaimsIdentity(claims, "CookieAuth");
            await HttpContext.SignInAsync("CookieAuth", new ClaimsPrincipal(identity));
        }

        private string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string DisplayName { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }
}