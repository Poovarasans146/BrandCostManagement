using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.ProjectAllocationModels;
using Microsoft.EntityFrameworkCore;

namespace BrandCostManagementAPI.Services
{
    public class ProjectAllocationService : IProjectAllocationService
    {
        private readonly AppDbContext _context;
        private readonly IProjectService _projectService;

        public ProjectAllocationService(AppDbContext context, IProjectService projectService)
        {
            _context = context;
            _projectService = projectService;
        }

        public async Task<IEnumerable<ProjectAllocation>> GetByProjectAsync(string projectId)
        {
            return await _context.ProjectAllocations
                .Include(a => a.Employee)
                .Where(a => a.ProjectId == projectId)
                .ToListAsync();
        }

        public async Task<ProjectAllocation> CreateAsync(ProjectAllocation allocation)
        {
            if (allocation.Allocation < 1 || allocation.Allocation > 100)
                throw new InvalidOperationException("Allocation must be between 1 and 100.");

            var project = await _projectService.GetByProjectIdAsync(allocation.ProjectId)
                ?? throw new InvalidOperationException("Invalid ProjectId.");

            if (project.ProjectEndDate.HasValue && allocation.AllocationEnd.HasValue &&
                allocation.AllocationEnd > project.ProjectEndDate)
                throw new InvalidOperationException("You are selecting beyond the Brand End Date.");

            _context.ProjectAllocations.Add(allocation);
            await _context.SaveChangesAsync();
            await _projectService.RecalculateAllocatedCountAsync(allocation.ProjectId);
            return allocation;
        }

        public async Task<ProjectAllocation> UpdateAsync(int id, ProjectAllocation updated)
        {
            var existing = await _context.ProjectAllocations.FindAsync(id)
                ?? throw new KeyNotFoundException("Project Allocation not found.");

            if (updated.Allocation < 1 || updated.Allocation > 100)
                throw new InvalidOperationException("Allocation must be between 1 and 100.");

            var project = await _projectService.GetByProjectIdAsync(existing.ProjectId)
                ?? throw new InvalidOperationException("Project not found.");

            if (project.ProjectEndDate.HasValue && updated.AllocationEnd.HasValue &&
                updated.AllocationEnd > project.ProjectEndDate)
                throw new InvalidOperationException("You are selecting beyond the Brand End Date.");

            existing.Allocation = updated.Allocation;
            existing.AllocationStart = updated.AllocationStart;
            existing.AllocationEnd = updated.AllocationEnd;
            existing.EmployeeId = updated.EmployeeId;

            await _context.SaveChangesAsync();
            await _projectService.RecalculateAllocatedCountAsync(existing.ProjectId);
            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _context.ProjectAllocations.FindAsync(id)
                ?? throw new KeyNotFoundException("Project Allocation not found.");

            _context.ProjectAllocations.Remove(existing);
            await _context.SaveChangesAsync();
            await _projectService.RecalculateAllocatedCountAsync(existing.ProjectId);
        }
    }
}
