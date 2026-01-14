using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Models;

namespace C__Internship_Management_Program.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { 
        }

        // Db Tables
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

            //Unique Email Constraint
            modelBuilder.Entity<Student>()
            .HasIndex(s => s.Email)
            .IsUnique();

            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Admin>()
                .HasIndex(c => c.Email)
                .IsUnique();
        }
    }
}