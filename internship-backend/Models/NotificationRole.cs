using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class NotificationRole
    {
        public int NotificationID { get; set; }

        public int RoleID { get; set; }

        [ForeignKey(nameof(NotificationID))]
        public Notification Notification { get; set; }

        [ForeignKey(nameof(RoleID))]
        public Role Role { get; set; }
    }
}
