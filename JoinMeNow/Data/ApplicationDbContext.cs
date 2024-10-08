﻿using Microsoft.EntityFrameworkCore;
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
        public DbSet<PostParticipant> postparticipants { get; set; }
        public DbSet<Post> posts { get; set; }
        public DbSet<EventType> eventtypes { get; set; }
        public DbSet<Notification> notifications { get; set; }
    }
}
