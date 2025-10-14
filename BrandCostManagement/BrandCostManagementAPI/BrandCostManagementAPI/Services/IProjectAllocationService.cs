using BrandCostManagementAPI.ProjectAllocationModels;

namespace BrandCostManagementAPI.Services
{
    public interface IProjectAllocationService
    {
        Task<IEnumerable<ProjectAllocation>> GetByProjectAsync(string projectId);
        Task<ProjectAllocation> CreateAsync(ProjectAllocation allocation);
        Task<ProjectAllocation> UpdateAsync(int id, ProjectAllocation updated);
        Task DeleteAsync(int id);
    }
}
