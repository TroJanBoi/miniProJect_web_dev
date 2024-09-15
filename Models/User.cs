using System.ComponentModel.DataAnnotations;

namespace JoinMeNow.Models
{
    public class User
    {
        public int UserID { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
