using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace _33.Models
{
    public class DataContext : DbContext
    {
        public DataContext()
            : base("DefaultConnection")
        {
        }

        public DbSet<Question> Questions { get; set; }
        public DbSet<CodeReview> CodeReviews { get; set; }

        public DbSet<QuickLink> QuickLinks { get; set; }
        public DbSet<HomeModel> HomeModels { get; set; }
    }
}