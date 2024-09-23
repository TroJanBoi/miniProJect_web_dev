public class Post
{
    public int PostID { get; set; }

    public int UserID { get; set; }

    public string Title { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public string EventType { get; set; }
    public string? Img { get; set; }

    public int MaxParticipants { get; set; }

    public string Description { get; set; }

    public string Status { get; set; }
    public DateTime CloseDate { get; set; }
}


public class PostDto
{
    public int PostID { get; set; }
    public int UserID { get; set; }
    public string Title { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string EventType { get; set; }
    public int MaxParticipants { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public DateTime CloseDate { get; set; }
    public string Img { get; set; }
    public List<ParticipantDto> Participants { get; set; }
}

public class ParticipantDto
{
    public int UserID { get; set; }
    public string Username { get; set; }
}

public class PostRequest
{
    public string Date { get; set; }
}

public class EventType
{
    public int EventTypeID { get; set; }

    public string TypeName { get; set; }
}

public class PostIdRequest
{
    public int PostID { get; set; }
}
