using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace C__Internship_Management_Program.Seeders
{
    public static class DatabaseSeeder
    {
        // Fixed seed so a fresh database always gets the same demo dataset -
        // consistent charts and screenshots across resets instead of a
        // different random spread every time.
        private const int RandomSeed = 20260827;

        public static async Task SeedData(ApplicationDbContext context)
        {
            try
            {
                if (await context.Students.AnyAsync())
                {
                    Console.WriteLine("Database already seeded, skipping");
                    return;
                }
            }
            catch
            {
                Console.WriteLine("Fresh database, proceeding with seeding...");
            }

            Console.WriteLine("Seeding database with demo data...");
            var rng = new Random(RandomSeed);

            // Create Admin
            var admin = new Admin
            {
                FirstName = "Zara",
                LastName = "Hendricks",
                Email = "zara.hendricks@imscontrol.io",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Obsidian#7Key"),
                UpdatedAt = DateTime.UtcNow
            };
            context.Admins.Add(admin);

            // Create Companies
            var companies = new List<Company>
            {
                new Company
                {
                    CompanyName = "Solace Robotics",
                    Email = "talent@solace-robotics.io",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-11-201-3344",
                    Website = "https://solace-robotics.io",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Ledgerwave",
                    Email = "people@ledgerwave.app",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-21-556-7788",
                    Website = "https://ledgerwave.app",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Pixelforge Studios",
                    Email = "hiring@pixelforge.studio",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-31-442-9910",
                    Website = "https://pixelforge.studio",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Skyline Biotech",
                    Email = "careers@skylinebiotech.co.za",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-12-330-6621",
                    Website = "https://skylinebiotech.co.za",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Ironclad Cyber",
                    Email = "recruiting@ironcladcyber.dev",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-21-884-1123",
                    Website = "https://ironcladcyber.dev",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Meridian Logistics Tech",
                    Email = "talent@meridianlogix.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-11-670-4455",
                    Website = "https://meridianlogix.com",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Thistle & Vine Media",
                    Email = "hello@thistleandvine.co.za",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-21-773-2290",
                    Website = "https://thistleandvine.co.za",
                    UpdatedAt = DateTime.UtcNow
                },
                new Company
                {
                    CompanyName = "Quantum Loop Energy",
                    Email = "careers@quantumloop.energy",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ignite&Forge3"),
                    IsApproved = true,
                    PhoneNumber = "+27-51-408-7712",
                    Website = "https://quantumloop.energy",
                    UpdatedAt = DateTime.UtcNow
                }
            };
            context.Companies.AddRange(companies);
            await context.SaveChangesAsync(); // Save to get CompanyIDs

            // Create Students
            var students = new List<Student>
            {
                new Student { FirstName = "Lindiwe", LastName = "Khumalo", Email = "lindiwe.khumalo@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-82-101-2233", University = "University of Cape Town", Degree = "BSc Computer Science", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Pieter", LastName = "van der Merwe", Email = "pieter.vandermerwe@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-83-112-3344", University = "University of the Witwatersrand", Degree = "BSc Information Technology", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Amara", LastName = "Ndlovu", Email = "amara.ndlovu@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-84-123-4455", University = "Stellenbosch University", Degree = "BCom Information Systems", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Farid", LastName = "Osman", Email = "farid.osman@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-85-134-5566", University = "University of Pretoria", Degree = "BEng Software Engineering", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Zanele", LastName = "Mokoena", Email = "zanele.mokoena@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-86-145-6677", University = "Rhodes University", Degree = "BSc Data Science", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Liam", LastName = "Petersen", Email = "liam.petersen@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-82-156-7788", University = "University of KwaZulu-Natal", Degree = "BSc Computer Engineering", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Naledi", LastName = "Dube", Email = "naledi.dube@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-83-167-8899", University = "University of Johannesburg", Degree = "BCom Informatics", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Ruan", LastName = "Botha", Email = "ruan.botha@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-84-178-9900", University = "North-West University", Degree = "BSc Applied Mathematics", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Thandeka", LastName = "Zulu", Email = "thandeka.zulu@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-85-189-0011", University = "Nelson Mandela University", Degree = "BEng Electronic Engineering", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Kabelo", LastName = "Sithole", Email = "kabelo.sithole@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-86-190-1122", University = "University of the Free State", Degree = "BSc Cybersecurity", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Aisha", LastName = "Adams", Email = "aisha.adams@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-82-201-2233", University = "Cape Peninsula University of Technology", Degree = "BCom Business Analytics", CreatedAt = DateTime.UtcNow },
                new Student { FirstName = "Jaco", LastName = "Fourie", Email = "jaco.fourie@mailbox.co.za", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Comet$Drift42"), PhoneNumber = "+27-83-212-3344", University = "Durban University of Technology", Degree = "BSc Multimedia Technology", CreatedAt = DateTime.UtcNow }
            };
            context.Students.AddRange(students);
            await context.SaveChangesAsync(); // Save to get StudentIDs

            // Create Internships (2 per company; 3 marked Closed for status-mix variety)
            var internships = new List<Internship>
            {
                // Solace Robotics
                new Internship { CompanyID = companies[0].CompanyID, Title = "Robotics Systems Intern", Description = "Work alongside our robotics engineers building perception and control software for warehouse automation robots. Hands-on with ROS2, sensor fusion, and real hardware.", Location = "Johannesburg, Gauteng", StartDate = DateTime.UtcNow.AddDays(28), EndDate = DateTime.UtcNow.AddDays(118), Requirements = "Robotics, Mechatronics, or Computer Engineering background, C++ or Python, interest in embedded systems", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-22) },
                new Internship { CompanyID = companies[0].CompanyID, Title = "Embedded Firmware Intern", Description = "Write and test firmware for our next-generation sensor modules. You'll work close to the metal on microcontrollers and real-time constraints.", Location = "Johannesburg, Gauteng", StartDate = DateTime.UtcNow.AddDays(35), EndDate = DateTime.UtcNow.AddDays(125), Requirements = "C/C++ experience, understanding of microcontrollers, coursework in embedded systems", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-14) },

                // Ledgerwave
                new Internship { CompanyID = companies[1].CompanyID, Title = "Blockchain Engineering Intern", Description = "Build and audit smart contracts for our settlement layer. Learn Solidity, gas optimization, and how a real fintech ships on-chain code safely.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(20), EndDate = DateTime.UtcNow.AddDays(110), Requirements = "Solidity or willingness to learn fast, strong fundamentals in data structures, interest in cryptography", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Internship { CompanyID = companies[1].CompanyID, Title = "Product Analytics Intern", Description = "Own the metrics behind our payments product. Build dashboards, run experiments, and help the team decide what to build next.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(18), EndDate = DateTime.UtcNow.AddDays(108), Requirements = "SQL proficiency, comfort with A/B testing concepts, Excel or BI tool experience", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-9) },

                // Pixelforge Studios
                new Internship { CompanyID = companies[2].CompanyID, Title = "Gameplay Programming Intern", Description = "Prototype and ship gameplay systems for our next mobile title in Unity. Work directly with designers on feel and balance.", Location = "Durban, KwaZulu-Natal", StartDate = DateTime.UtcNow.AddDays(40), EndDate = DateTime.UtcNow.AddDays(130), Requirements = "C# and Unity experience, a portfolio or personal game project is a big plus", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-17) },
                new Internship { CompanyID = companies[2].CompanyID, Title = "QA & Playtesting Intern", Description = "This role has been filled. Ran structured playtests and triaged bugs ahead of our last major release.", Location = "Durban, KwaZulu-Natal", StartDate = DateTime.UtcNow.AddDays(-40), EndDate = DateTime.UtcNow.AddDays(20), Requirements = "Meticulous attention to detail, passion for games, basic bug-tracking tool experience", Status = "Closed", CreatedAt = DateTime.UtcNow.AddDays(-70) },

                // Skyline Biotech
                new Internship { CompanyID = companies[3].CompanyID, Title = "Bioinformatics Intern", Description = "Analyze genomic sequencing data alongside our research team. Python and statistics meet real lab science here.", Location = "Pretoria, Gauteng", StartDate = DateTime.UtcNow.AddDays(32), EndDate = DateTime.UtcNow.AddDays(122), Requirements = "Life sciences or Computer Science background, Python, curiosity about genomics", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Internship { CompanyID = companies[3].CompanyID, Title = "Lab Data Systems Intern", Description = "This role has been filled. Digitized and structured lab instrument output into our internal data platform.", Location = "Pretoria, Gauteng", StartDate = DateTime.UtcNow.AddDays(-25), EndDate = DateTime.UtcNow.AddDays(35), Requirements = "SQL, attention to detail, interest in laboratory information systems", Status = "Closed", CreatedAt = DateTime.UtcNow.AddDays(-55) },

                // Ironclad Cyber
                new Internship { CompanyID = companies[4].CompanyID, Title = "Security Operations Intern", Description = "Sit in our SOC monitoring live alerts, tuning detection rules, and learning how real incidents get triaged and closed.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(24), EndDate = DateTime.UtcNow.AddDays(114), Requirements = "Networking fundamentals, interest in SIEM tooling, security coursework or CTF experience", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-11) },
                new Internship { CompanyID = companies[4].CompanyID, Title = "Penetration Testing Intern", Description = "Shadow our red team on authorized engagements, from recon through reporting. Ethical hacking, done properly.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(45), EndDate = DateTime.UtcNow.AddDays(135), Requirements = "Understanding of common web vulnerabilities, OSCP-track coursework or equivalent self-study, strong write-up skills", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-6) },

                // Meridian Logistics Tech
                new Internship { CompanyID = companies[5].CompanyID, Title = "Supply Chain Analytics Intern", Description = "Model delivery routes and warehouse throughput for national retail clients. Real optimization problems with real trucks.", Location = "Johannesburg, Gauteng", StartDate = DateTime.UtcNow.AddDays(27), EndDate = DateTime.UtcNow.AddDays(117), Requirements = "SQL and spreadsheet modeling, interest in operations research, Python is a plus", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-19) },
                new Internship { CompanyID = companies[5].CompanyID, Title = "Fleet Systems Intern", Description = "This role has been filled. Built dashboards tracking our delivery fleet's live GPS and fuel telemetry.", Location = "Johannesburg, Gauteng", StartDate = DateTime.UtcNow.AddDays(-20), EndDate = DateTime.UtcNow.AddDays(40), Requirements = "Data visualization experience, comfort with APIs, logistics interest", Status = "Closed", CreatedAt = DateTime.UtcNow.AddDays(-48) },

                // Thistle & Vine Media
                new Internship { CompanyID = companies[6].CompanyID, Title = "Growth & Content Intern", Description = "Plan and ship campaigns across our clients' social channels. You'll own real budget and real metrics from week one.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(16), EndDate = DateTime.UtcNow.AddDays(106), Requirements = "Strong writing, familiarity with social platforms and basic analytics, portfolio of any kind welcome", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-13) },
                new Internship { CompanyID = companies[6].CompanyID, Title = "Creative Technology Intern", Description = "Build interactive web experiences for brand campaigns using modern front-end tooling and a little bit of WebGL.", Location = "Cape Town, Western Cape", StartDate = DateTime.UtcNow.AddDays(22), EndDate = DateTime.UtcNow.AddDays(112), Requirements = "JavaScript/TypeScript, an eye for design, curiosity about creative coding", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-4) },

                // Quantum Loop Energy
                new Internship { CompanyID = companies[7].CompanyID, Title = "Renewable Systems Intern", Description = "Support the design and monitoring of solar microgrid installations across our pilot sites.", Location = "Bloemfontein, Free State", StartDate = DateTime.UtcNow.AddDays(38), EndDate = DateTime.UtcNow.AddDays(128), Requirements = "Electrical or Mechanical Engineering coursework, interest in renewable energy systems", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-16) },
                new Internship { CompanyID = companies[7].CompanyID, Title = "Energy Data Intern", Description = "Turn raw meter and inverter telemetry into insight for our operations team, including a dashboard you'll help design.", Location = "Bloemfontein, Free State", StartDate = DateTime.UtcNow.AddDays(30), EndDate = DateTime.UtcNow.AddDays(120), Requirements = "Python or R, comfort with time-series data, interest in the energy sector", Status = "Active", CreatedAt = DateTime.UtcNow.AddDays(-3) }
            };
            context.Internships.AddRange(internships);
            await context.SaveChangesAsync(); // Save to get InternshipIDs

            // Create Applications - each student applies to 3-5 distinct internships,
            // with AppliedAt spread across the last 30 days so the admin activity
            // chart has a real shape. Deterministic (fixed-seed rng above), so a
            // reset always produces the same demo dataset.
            var applications = new List<Application>();
            var statusPool = new[] { "Pending", "Pending", "Pending", "Accepted", "Accepted", "Rejected" };

            foreach (var student in students)
            {
                var applicationCount = rng.Next(3, 6); // 3-5 inclusive
                var chosenInternships = internships
                    .OrderBy(_ => rng.Next())
                    .Take(applicationCount)
                    .ToList();

                foreach (var internship in chosenInternships)
                {
                    var appliedDaysAgo = rng.Next(1, 31); // last 30 days
                    var appliedAt = DateTime.UtcNow.AddDays(-appliedDaysAgo);
                    var status = statusPool[rng.Next(statusPool.Length)];
                    var updatedAt = status == "Pending"
                        ? appliedAt
                        : appliedAt.AddDays(rng.Next(1, Math.Max(2, appliedDaysAgo)));

                    var resumeName = $"{student.FirstName}_{student.LastName}".ToLowerInvariant().Replace(" ", "_");

                    applications.Add(new Application
                    {
                        InternshipID = internship.InternshipID,
                        StudentID = student.StudentID,
                        Status = status,
                        AppliedAt = appliedAt,
                        UpdatedAt = updatedAt,
                        Resume = $"{resumeName}_resume.pdf"
                    });
                }
            }
            context.Applications.AddRange(applications);
            await context.SaveChangesAsync();

            Console.WriteLine("Database seeded successfully!");
            Console.WriteLine($"  {companies.Count} companies, {students.Count} students, {internships.Count} internships, {applications.Count} applications");
            Console.WriteLine("\n Demo Credentials:");
            Console.WriteLine("===================================================");
            Console.WriteLine("Admin:");
            Console.WriteLine($"  {admin.Email} | Obsidian#7Key");
            Console.WriteLine("\nCompanies (shared password: Ignite&Forge3):");
            foreach (var c in companies)
            {
                Console.WriteLine($"  {c.CompanyName}: {c.Email}");
            }
            Console.WriteLine("\nStudents (shared password: Comet$Drift42):");
            foreach (var s in students)
            {
                Console.WriteLine($"  {s.FirstName} {s.LastName}: {s.Email}");
            }
            Console.WriteLine("===================================================\n");
        }
    }
}
