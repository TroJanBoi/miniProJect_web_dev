
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

            if (post.StartDate.Date == currentDateTime.Date && post.CloseDate.Date < currentDateTime.Date)
            {
                // ถ้า StartDate เป็นวันเดียวกันกับปัจจุบัน แต่ CloseDate น้อยกว่าวันปัจจุบัน
                if (post.StartTime >= currentDateTime.TimeOfDay)
                {
                    // ถ้า StartTime ไม่น้อยกว่าปัจจุบัน (โพสต์ยังไม่เริ่ม)
                    post.Status = "closejoin";
                }
                else
                {
                    post.Status = "inactive"; // โพสต์หมดเวลา
                }
                _context.posts.Update(post);
            }
            else if (post.StartDate.Date == post.CloseDate.Date || post.StartDate > currentDateTime || post.StartDate.Date == currentDateTime.Date)
            {
                if (post.StartTime < currentDateTime.TimeOfDay)
                {
                    post.Status = "inactive";
                    _context.posts.Update(post);
                }
            }
            else if (post.CloseDate.Date < currentDateTime.Date)
            {
                post.Status = "closejoin";
                _context.posts.Update(post);
            }
            else if (post.StartDate.Date > currentDateTime.Date ||
                     (post.StartDate.Date == currentDateTime.Date && post.StartTime > currentDateTime.TimeOfDay))
            {
                post.Status = "inactive";
                _context.posts.Update(post);
            }
        }

        _context.SaveChanges();
    }
}
