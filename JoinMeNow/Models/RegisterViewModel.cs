using System.ComponentModel.DataAnnotations;

namespace JoinMeNow.Models
{
    public class RegisterViewModel
    {
        //[Required(ErrorMessage = "Full Name is required.")]
        public string FullName { get; set; }

        //[Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; }

        //[Required(ErrorMessage = "Email is required.")]
        //[EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; }

        //[Required(ErrorMessage = "Password is required.")]
        //[StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; }
    }

}
