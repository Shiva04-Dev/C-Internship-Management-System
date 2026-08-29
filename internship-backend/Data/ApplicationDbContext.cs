using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Models;

namespace C__Internship_Management_Program.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { 
        }

        public DbSet<Student> Students { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Internship> Internships { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationRole> NotificationRoles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<CompanyBan> CompanyBans { get; set; }
        public DbSet<UserBan> UserBans { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<NotificationRole>()
                .HasKey(nr => new { nr.NotificationID, nr.RoleID });


            modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.Student)
            .WithMany(s => s.RefreshTokens)
            .HasForeignKey(rt => rt.StudentID)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
            .HasOne (rt => rt.Company)
            .WithMany(c => c.RefreshTokens)
            .HasForeignKey(rt => rt.CompanyID)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.Admin)
            .WithMany(a => a.RefreshTokens)
            .HasForeignKey(rt => rt.AdminID)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Student>()
            .HasIndex(s => s.Email)
            .IsUnique();

            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Admin>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Only backfills existing rows on migration — new EF inserts always send an
            // explicit value and never fall through to this default.
            modelBuilder.Entity<Company>()
                .Property(c => c.IsApproved)
                .HasDefaultValue(true);

            // Both are filtered on heavily (public listings, admin dashboard counts)
            // and only had EF's automatic FK indexes before this.
            modelBuilder.Entity<Internship>()
                .HasIndex(i => i.Status);

            modelBuilder.Entity<Application>()
                .HasIndex(a => a.Status);

            // Filtered on every company search query (Company/students).
            modelBuilder.Entity<Student>()
                .HasIndex(s => s.IsDiscoverable);
        }
    }
}