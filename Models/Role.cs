using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.Models
{
    public class Role
    {
        [Key]
        public int RoleID { get; set; }

        [Required]
        public string RoleName { get; set; }

        // Navigation
        public ICollection<NotificationRole> NotificationRoles { get; set; }
    }
}
