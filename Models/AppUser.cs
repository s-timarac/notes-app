using Microsoft.AspNetCore.Identity;

namespace NotesApp.Models
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; } = "";
    }
}