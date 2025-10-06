using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // for [JsonIgnore]

namespace BrandCostManagementAPI.EmployeeModels
{
    [Table("Employees")]
    public class Employee
    {
        [Key]
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; }

        [Column("mobile_number")]
        [MaxLength(20)]
        public string? MobileNumber { get; set; }

        [Column("email_id")]
        [MaxLength(50)]
        public string? EmailId { get; set; }

        [Column("gender")]
        [MaxLength(12)]
        public string? Gender { get; set; } = "NA";

        [Column("location")]
        [MaxLength(100)]
        public string? Location { get; set; }

        [Column("address")]
        [MaxLength(100)]
        public string? Address { get; set; }

        [Column("manager_name")]
        [MaxLength(100)]
        public string? ManagerName { get; set; }

        [Column("role_status")]
        [MaxLength(10)]
        public string? RoleStatus { get; set; } = "NA"; // Default value

        [Column("doj")]
        public DateTime? Doj { get; set; }  = new DateTime(2025, 09, 01); // Default

        [Column("cost")]
        public int? Cost { get; set; }  = 0; // Default value

        // 🔹 Navigation Property - One Employee can have many ProjectAllocations
       // public ICollection<ProjectAllocation> ProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }
}
