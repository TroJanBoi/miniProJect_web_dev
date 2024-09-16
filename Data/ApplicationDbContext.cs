using Microsoft.EntityFrameworkCore;
using JoinMeNow.Models;

namespace JoinMeNow.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> users { get; set; }
    }
}
