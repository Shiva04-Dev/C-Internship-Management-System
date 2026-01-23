using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace C__Internship_Management_Program.Seeders
{
    public static class DatabaseSeeder
    {
        public static async Task SeedData(ApplicationDbContext context)
        {
            var canConnect = await context.Database.CanConnectAsync();
            if (!canConnect)
            {
                Console.WriteLine("?? Cannot connect to database, skipping seeding");
                return;
            }

            Console.WriteLine("Seeding database with demo data...");

            // Create Admin
            var admin = new Admin
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@internships.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                UpdatedAt = DateTime.UtcNow
            };
            context.Admins.Add(admin);

            // Create Companies
            var companies = new List<Company>
            {
                new Company
                {
                    CompanyName = "TechCorp Solutions",
                    Email = "hr@techcorp.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Company123!"),
                    PhoneNumber = "+27-11-123-4567",
                    Website = "https://techcorp.com",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "DataMinds Analytics",
                    Email = "careers@dataminds.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Company123!"),
                    PhoneNumber = "+27-21-987-6543",
                    Website = "https://dataminds.com",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "CloudScale Systems",
                    Email = "internships@cloudscale.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Company123!"),
                    PhoneNumber = "+27-11-555-0123",
                    Website = "https://cloudscale.com",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "FinTech Innovations",
                    Email = "recruit@fintech-innov.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Company123!"),
                    PhoneNumber = "+27-31-444-5678",
                    Website = "https://fintech-innov.com",
                    UpdatedAt = DateTime.UtcNow
                }
            };
            context.Companies.AddRange(companies);
            await context.SaveChangesAsync(); // Save to get CompanyIDs

            // Create Students
            var students = new List<Student>
            {
                new Student
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@student.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    PhoneNumber = "+27-82-123-4567",
                    University = "University of Cape Town",
                    Degree = "BSc Computer Science",
                    CreatedAt = DateTime.UtcNow
                },
                new Student
                {
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@student.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    PhoneNumber = "+27-83-234-5678",
                    University = "University of Witwatersrand",
                    Degree = "BSc Information Technology",
                    CreatedAt = DateTime.UtcNow
                },
                new Student
                {
                    FirstName = "Michael",
                    LastName = "Johnson",
                    Email = "michael.j@student.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    PhoneNumber = "+27-84-345-6789",
                    University = "Stellenbosch University",
                    Degree = "BCom Information Systems",
                    CreatedAt = DateTime.UtcNow
                },
                new Student
                {
                    FirstName = "Sarah",
                    LastName = "Williams",
                    Email = "sarah.w@student.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    PhoneNumber = "+27-85-456-7890",
                    University = "University of Pretoria",
                    Degree = "BEng Software Engineering",
                    CreatedAt = DateTime.UtcNow
                },
                new Student
                {
                    FirstName = "David",
                    LastName = "Brown",
                    Email = "david.brown@student.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                    PhoneNumber = "+27-86-567-8901",
                    University = "Rhodes University",
                    Degree = "BSc Data Science",
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Students.AddRange(students);
            await context.SaveChangesAsync(); // Save to get StudentIDs

            // Create Internships
            var internships = new List<Internship>
            {
                // TechCorp Solutions internships
                new Internship
                {
                    CompanyID = companies[0].CompanyID,
                    Title = "Software Development Intern",
                    Description = "Join our dynamic team and work on cutting-edge web applications using React, Node.js, and cloud technologies. You'll collaborate with senior developers and gain hands-on experience in agile development.",
                    Location = "Johannesburg, Gauteng",
                    StartDate = DateTime.UtcNow.AddDays(30),
                    EndDate = DateTime.UtcNow.AddDays(120),
                    Requirements = "Currently pursuing Computer Science or related degree, knowledge of JavaScript, Git, and basic web technologies",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Internship
                {
                    CompanyID = companies[0].CompanyID,
                    Title = "DevOps Engineering Intern",
                    Description = "Learn cloud infrastructure management with AWS/Azure, CI/CD pipelines, and containerization. Work alongside our DevOps team on real production systems.",
                    Location = "Cape Town, Western Cape",
                    StartDate = DateTime.UtcNow.AddDays(45),
                    EndDate = DateTime.UtcNow.AddDays(135),
                    Requirements = "Basic understanding of Linux, networking, and cloud concepts. Scripting experience (Python/Bash) is a plus",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-8)
                },
                
                // DataMinds Analytics internships
                new Internship
                {
                    CompanyID = companies[1].CompanyID,
                    Title = "Data Science Intern",
                    Description = "Work with our data science team on machine learning projects, data analysis, and visualization. Use Python, SQL, and modern ML frameworks.",
                    Location = "Pretoria, Gauteng",
                    StartDate = DateTime.UtcNow.AddDays(20),
                    EndDate = DateTime.UtcNow.AddDays(110),
                    Requirements = "Statistics or Computer Science background, Python programming, pandas/numpy experience, SQL knowledge",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Internship
                {
                    CompanyID = companies[1].CompanyID,
                    Title = "Business Intelligence Analyst Intern",
                    Description = "Help build dashboards and reports using PowerBI and Tableau. Analyze business data to derive insights for decision making.",
                    Location = "Johannesburg, Gauteng",
                    StartDate = DateTime.UtcNow.AddDays(35),
                    EndDate = DateTime.UtcNow.AddDays(125),
                    Requirements = "Excel proficiency, SQL basics, analytical mindset. Experience with PowerBI or Tableau is advantageous",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-12)
                },

                // CloudScale Systems internships
                new Internship
                {
                    CompanyID = companies[2].CompanyID,
                    Title = "Cloud Solutions Intern",
                    Description = "Assist in designing and implementing cloud solutions for enterprise clients. Learn AWS, Azure, and cloud architecture best practices.",
                    Location = "Durban, KwaZulu-Natal",
                    StartDate = DateTime.UtcNow.AddDays(40),
                    EndDate = DateTime.UtcNow.AddDays(130),
                    Requirements = "IT or Engineering degree in progress, interest in cloud computing, basic networking knowledge",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Internship
                {
                    CompanyID = companies[2].CompanyID,
                    Title = "Cybersecurity Intern",
                    Description = "Support our security team in vulnerability assessments, security monitoring, and incident response. Great opportunity to learn ethical hacking.",
                    Location = "Cape Town, Western Cape",
                    StartDate = DateTime.UtcNow.AddDays(50),
                    EndDate = DateTime.UtcNow.AddDays(140),
                    Requirements = "Information Security or related field, understanding of networking protocols, security certifications (e.g., CEH) are a plus",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },

                // FinTech Innovations internships
                new Internship
                {
                    CompanyID = companies[3].CompanyID,
                    Title = "Mobile App Development Intern",
                    Description = "Develop mobile banking features using React Native or Flutter. Work on both Android and iOS platforms with our mobile team.",
                    Location = "Johannesburg, Gauteng",
                    StartDate = DateTime.UtcNow.AddDays(25),
                    EndDate = DateTime.UtcNow.AddDays(115),
                    Requirements = "Mobile development interest, JavaScript/Dart knowledge, understanding of RESTful APIs",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-18)
                },
                new Internship
                {
                    CompanyID = companies[3].CompanyID,
                    Title = "Backend Developer Intern",
                    Description = "Build scalable APIs for financial applications using C#/.NET Core. Learn microservices architecture and financial systems integration.",
                    Location = "Pretoria, Gauteng",
                    StartDate = DateTime.UtcNow.AddDays(15),
                    EndDate = DateTime.UtcNow.AddDays(105),
                    Requirements = "C# or Java experience, understanding of databases and REST APIs, OOP principles",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },

                // One closed internship for demo
                new Internship
                {
                    CompanyID = companies[0].CompanyID,
                    Title = "UI/UX Design Intern (Closed)",
                    Description = "This internship has been filled. Design user interfaces for web and mobile applications.",
                    Location = "Cape Town, Western Cape",
                    StartDate = DateTime.UtcNow.AddDays(-30),
                    EndDate = DateTime.UtcNow.AddDays(60),
                    Requirements = "Design portfolio, Figma/Adobe XD skills",
                    Status = "Closed",
                    CreatedAt = DateTime.UtcNow.AddDays(-60)
                }
            };
            context.Internships.AddRange(internships);
            await context.SaveChangesAsync(); // Save to get InternshipIDs

            // Create Applications
            var applications = new List<Application>
            {
                // John Doe's applications
                new Application
                {
                    InternshipID = internships[0].InternshipID, // Software Dev at TechCorp
                    StudentID = students[0].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5),
                    Resume = "john_doe_resume.pdf"
                },
                new Application
                {
                    InternshipID = internships[7].InternshipID, // Backend Dev at FinTech
                    StudentID = students[0].StudentID,
                    Status = "Accepted",
                    AppliedAt = DateTime.UtcNow.AddDays(-15),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3),
                    Resume = "john_doe_resume.pdf"
                },

                // Jane Smith's applications
                new Application
                {
                    InternshipID = internships[2].InternshipID, // Data Science at DataMinds
                    StudentID = students[1].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-8),
                    UpdatedAt = DateTime.UtcNow.AddDays(-8),
                    Resume = "jane_smith_resume.pdf"
                },
                new Application
                {
                    InternshipID = internships[3].InternshipID, // BI Analyst at DataMinds
                    StudentID = students[1].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-7),
                    Resume = "jane_smith_resume.pdf"
                },

                // Michael Johnson's applications
                new Application
                {
                    InternshipID = internships[1].InternshipID, // DevOps at TechCorp
                    StudentID = students[2].StudentID,
                    Status = "Rejected",
                    AppliedAt = DateTime.UtcNow.AddDays(-12),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2),
                    Resume = "michael_johnson_resume.pdf"
                },
                new Application
                {
                    InternshipID = internships[4].InternshipID, // Cloud Solutions at CloudScale
                    StudentID = students[2].StudentID,
                    Status = "Accepted",
                    AppliedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow.AddDays(-4),
                    Resume = "michael_johnson_resume.pdf"
                },

                // Sarah Williams's applications
                new Application
                {
                    InternshipID = internships[6].InternshipID, // Mobile App at FinTech
                    StudentID = students[3].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3),
                    Resume = "sarah_williams_resume.pdf"
                },

                // David Brown's applications
                new Application
                {
                    InternshipID = internships[2].InternshipID, // Data Science at DataMinds
                    StudentID = students[4].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-6),
                    UpdatedAt = DateTime.UtcNow.AddDays(-6),
                    Resume = "david_brown_resume.pdf"
                },
                new Application
                {
                    InternshipID = internships[5].InternshipID, // Cybersecurity at CloudScale
                    StudentID = students[4].StudentID,
                    Status = "Pending",
                    AppliedAt = DateTime.UtcNow.AddDays(-4),
                    UpdatedAt = DateTime.UtcNow.AddDays(-4),
                    Resume = "david_brown_resume.pdf"
                }
            };
            context.Applications.AddRange(applications);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
            Console.WriteLine("\n Demo Credentials:");
            Console.WriteLine("???????????????????????????????????????????????");
            Console.WriteLine("Admin:");
            Console.WriteLine("  Email: admin@internships.com");
            Console.WriteLine("  Password: Admin123!");
            Console.WriteLine("\nCompanies:");
            Console.WriteLine("  Email: hr@techcorp.com | Password: Company123!");
            Console.WriteLine("  Email: careers@dataminds.com | Password: Company123!");
            Console.WriteLine("  Email: internships@cloudscale.com | Password: Company123!");
            Console.WriteLine("  Email: recruit@fintech-innov.com | Password: Company123!");
            Console.WriteLine("\nStudents:");
            Console.WriteLine("  Email: john.doe@student.com | Password: Student123!");
            Console.WriteLine("  Email: jane.smith@student.com | Password: Student123!");
            Console.WriteLine("  Email: michael.j@student.com | Password: Student123!");
            Console.WriteLine("  Email: sarah.w@student.com | Password: Student123!");
            Console.WriteLine("  Email: david.brown@student.com | Password: Student123!");
            Console.WriteLine("???????????????????????????????????????????????\n");
        }
    }
}