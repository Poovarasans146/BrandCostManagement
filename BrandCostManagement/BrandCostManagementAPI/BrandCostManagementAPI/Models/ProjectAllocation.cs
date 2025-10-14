using BrandCostManagementAPI.EmployeeModels;
using BrandCostManagementAPI.ProjectModels;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BrandCostManagementAPI.ProjectAllocationModels
{
    public class ProjectAllocation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProjectAllocationId { get; set; }

        [Range(1, 100, ErrorMessage = "Allocation must be between 1 and 100")]
        public int Allocation { get; set; }

        [Column(TypeName = "date")]
        public DateTime? AllocationStart { get; set; }

        [Column(TypeName = "date")]
        public DateTime? AllocationEnd { get; set; }

        // Foreign Keys
        public int EmployeeId { get; set; }
        public string ProjectId { get; set; }

        // Navigation Properties
        [ForeignKey("EmployeeId")]
        [JsonIgnore]
        public Employee? Employee { get; set; }

        [ForeignKey("ProjectId")]
        [JsonIgnore]
        public Project? Project { get; set; }
    }
}
