using BrandCostManagementAPI.ProjectModels;
using Microsoft.AspNetCore.Http;

namespace BrandCostManagementAPI.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetProjectsByBUAsync(string bu);
        Task<Project?> GetByProjectIdAsync(string projectId);
        Task<Project> CreateProjectAsync(Project project, IFormFile? logoFile);
        Task<Project> UpdateProjectAsync(string projectId, Project updated, IFormFile? logoFile);
        Task<string> GenerateNextProjectIdAsync(string bu);
        Task RecalculateAllocatedCountAsync(string projectId);
    }
}
