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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<NotificationRole>()
                .HasKey(nr => new { nr.NotificationID, nr.RoleID });

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("RefreshTokens");

                entity.Property(e => e.TokenHash).IsRequired().HasMaxLength(64);
                entity.Property(e => e.JwtID).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ReplacedByTokenHash).IsRequired().HasMaxLength(64);
                entity.Property(e => e.CreatedByIP).IsRequired().HasMaxLength(45);
                entity.Property(e => e.RevokedByIP).IsRequired().HasMaxLength(45);

                entity.HasIndex(e => e.TokenHash).IsUnique();
                entity.HasIndex(e => e.JwtID);
                entity.HasIndex(e => e.StudentID);
                entity.HasIndex(e => e.CompanyID);
                entity.HasIndex(e => e.AdminID);

                entity.HasOne(e => e.Student)
                .WithMany(s => s.RefreshTokens)
                .HasForeignKey(e => e.StudentID)
                .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Company)
                .WithMany(c => c.RefreshTokens)
                .HasForeignKey(e => e.CompanyID)
                .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Admin)
                .WithMany(a => a.RefreshTokens)
                .HasForeignKey(e => e.AdminID)
                .OnDelete(DeleteBehavior.Cascade);

                //SQL Server check: That only 1 owner is set
                entity.HasCheckConstraint(
                    "CK_RefreshTokens_SingleOwner",
                "((CASE WHEN [StudentID] IS NOT NULL THEN 1 ELSE 0 END) + " +
                "(CASE WHEN [CompanyID] IS NOT NULL THEN 1 ELSE 0 END) + " +
                "(CASE WHEN [AdminID] IS NOT NULL THEN 1 ELSE 0 END)) = 1"
                );
            });
        }
    }
}