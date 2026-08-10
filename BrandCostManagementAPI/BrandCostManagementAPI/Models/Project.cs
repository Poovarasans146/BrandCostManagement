using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // for [JsonIgnore]

namespace BrandCostManagementAPI.ProjectModels
{
    [Table("Project")]
    public class Project
    {
        [Key]
        [Column("project_id")]
        [StringLength(20)]
        public string ProjectId { get; set; }   // e.g., IMS000001

        [Required]
        [Column("bu_name")]
        [StringLength(100)]
        public string BuName { get; set; }      // Business Unit (IMS, FSS, CSS)

        [Required]
        [Column("project_name")]
        [StringLength(255)]
        public string ProjectName { get; set; }

        [Required]
        [Column("brand")]
        [StringLength(100)]
        public string Brand { get; set; }

        [Column("approved_count")]
        public int ApprovedCount { get; set; } = 0;

        [Column("allocated_count")]
        public int AllocatedCount { get; set; } = 0;

        [Column("project_value", TypeName = "decimal(12,2)")]
        public decimal ProjectValue { get; set; } = 0;

        [Column("brand_logo", TypeName = "LONGBLOB")]
        public byte[]? BrandLogo { get; set; }   // LONGBLOB → byte[]

        [Column("contract_document", TypeName = "LONGBLOB")]
        public byte[]? ContractDocument { get; set; }

        [Column("contract_document_name")]
        [StringLength(255)]
        public string? ContractDocumentName { get; set; }

        [Column("project_start_date", TypeName = "date")]
        public DateTime? ProjectStartDate { get; set; }

        [Column("project_end_date", TypeName = "date")]
        public DateTime? ProjectEndDate { get; set; }

        // 🔹 Navigation Property - One Project can have many ProjectAllocations
       // public ICollection<ProjectAllocation> ProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }
}
