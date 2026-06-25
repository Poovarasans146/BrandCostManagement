namespace BrandCostManagementAPI.Models.Dtos
{
    public class ProjectAllocationCreateDto
    {
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string ProjectId { get; set; } = string.Empty;
        public string? ProjectName { get; set; }
        public string? Role { get; set; }     // 👈 Comes from frontend
        public int Allocation { get; set; }
        public DateTime? AllocationStart { get; set; }
        public DateTime? AllocationEnd { get; set; }
    }

}
