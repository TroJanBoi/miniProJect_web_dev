
using JoinMeNow.Data;

public interface IPostService
{
    void IsPostActive();
}


public class PostService : IPostService
{
    private readonly ApplicationDbContext _context;

    public PostService(ApplicationDbContext context)
    {
        _context = context;
    }

    public void IsPostActive()
    {
        var currentDateTime = DateTime.Now;
        var posts = _context.posts.ToList();

        foreach (var post in posts)
        {
            post.Status = "active";
            _context.posts.Update(post);

            if (post.StartDate.Date == post.CloseDate.Date || post.StartDate > currentDateTime)
            {
                if (post.StartTime < currentDateTime.TimeOfDay && post.StartDate.Date >= currentDateTime)
                {
                    post.Status = "inactive";
                    _context.posts.Update(post);
                }
            }
            else if (post.CloseDate < currentDateTime || post.StartDate > currentDateTime)
            {
                if (post.CloseDate < currentDateTime && (post.StartDate > currentDateTime || (post.StartDate.Date == currentDateTime.Date && post.StartTime > currentDateTime.TimeOfDay)))
                {
                    post.Status = "closejoin";
                }
                else
                {
                    post.Status = "inactive";
                }
                _context.posts.Update(post);
            }
        }

        _context.SaveChanges();
    }
}
