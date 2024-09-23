using System.ComponentModel.DataAnnotations;

namespace JoinMeNow.Models
{
    public class PostParticipant
    {
        public int PostParticipantID { get; set; }
        public int PostID { get; set; }
        public int UserID { get; set; }
        public String status { get; set; }
    }
}


public class UpdateStatusRequest
{
    public int PostId { get; set; }
    public List<string> Participants { get; set; }
    public string Status { get; set; }
}