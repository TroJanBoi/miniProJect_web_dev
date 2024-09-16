public class Post
{
    public int PostID { get; set; } // Primary Key
    public int UserID { get; set; } // Foreign Key to Users table
    public string Title { get; set; } // Title of the event
    public DateTime StartDate { get; set; } // Start date of the event
    public DateTime EndDate { get; set; } // End date of the event
    public TimeSpan StartTime { get; set; } // Start time of the event
    public TimeSpan EndTime { get; set; } // End time of the event
    public string EventType { get; set; } // Type of event (e.g., Webinar, Workshop)
    public int MaxParticipants { get; set; } // Maximum number of participants
    public string Description { get; set; } // Description of the event
    public string Status { get; set; } // Description of the event
}

public class PostRequest
{
    public string Date { get; set; }
}