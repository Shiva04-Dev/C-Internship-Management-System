using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.Models
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        [Required]
        public string Message { get; set; }

        [Required]
        public bool IsRead { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        // Navigation
        public ICollection<NotificationRole> NotificationRoles { get; set; }
    }
}
