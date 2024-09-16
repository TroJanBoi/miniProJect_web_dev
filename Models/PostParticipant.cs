using System.ComponentModel.DataAnnotations;

namespace JoinMeNow.Models
{
    public class PostParticipant
    {
        public int PostParticipantID { get; set; }
        public int PostID { get; set; }
        public int UserID { get; set; }
    }
}
