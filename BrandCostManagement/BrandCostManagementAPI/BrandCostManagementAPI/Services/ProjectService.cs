using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.ProjectModels;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace BrandCostManagementAPI.Services
{
	public class ProjectService : IProjectService
	{
		private readonly AppDbContext _context;
		private readonly IWebHostEnvironment _env;

		public ProjectService(AppDbContext context, IWebHostEnvironment env)
		{
			_context = context;
			_env = env;
		}

		public async Task<IEnumerable<Project>> GetProjectsByBUAsync(string bu)
		{
			return await _context.Projects
				.Where(p => p.BuName == bu)
				.OrderBy(p => p.ProjectId)
				.ToListAsync();
		}

		public async Task<Project?> GetByProjectIdAsync(string projectId)
		{
			return await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
		}

		public async Task<string> GenerateNextProjectIdAsync(string bu)
		{
			var last = await _context.Projects
				.Where(p => p.BuName == bu)
				.OrderByDescending(p => p.ProjectId)
				.Select(p => p.ProjectId)
				.FirstOrDefaultAsync();

			int next = 1;
			if (!string.IsNullOrEmpty(last) && last.Length > bu.Length)
			{
				var numStr = last.Substring(bu.Length);
				if (int.TryParse(numStr, out int lastNum))
					next = lastNum + 1;
			}

			return $"{bu}{next:D6}";
		}

		private async Task<byte[]?> ConvertLogoToByteArrayAsync(IFormFile? logo)
		{
			if (logo == null) return null;
			var ext = Path.GetExtension(logo.FileName).ToLowerInvariant();
			if (ext != ".png" && ext != ".jpg" && ext != ".jpeg")
				throw new InvalidOperationException("Only PNG/JPEG files are allowed.");

			using (var ms = new MemoryStream())
			{
				await logo.CopyToAsync(ms);
				return ms.ToArray();
			}
		}

		public async Task<Project> CreateProjectAsync(Project project, IFormFile? logoFile)
		{
			project.BrandLogo = await ConvertLogoToByteArrayAsync(logoFile);
			_context.Projects.Add(project);
			await _context.SaveChangesAsync();
			await RecalculateAllocatedCountAsync(project.ProjectId);
			return project;
		}

		public async Task<Project> UpdateProjectAsync(string projectId, Project updated, IFormFile? logoFile)
		{
			var existing = await GetByProjectIdAsync(projectId);
			if (existing == null) throw new KeyNotFoundException("Project not found.");

			existing.ProjectName = updated.ProjectName;
			existing.Brand = updated.Brand;
			existing.ApprovedCount = updated.ApprovedCount;
			existing.ProjectValue = updated.ProjectValue;
			existing.ProjectStartDate = updated.ProjectStartDate;
			existing.ProjectEndDate = updated.ProjectEndDate;

			if (logoFile != null)
				existing.BrandLogo = await ConvertLogoToByteArrayAsync(logoFile);

			await _context.SaveChangesAsync();
			await RecalculateAllocatedCountAsync(existing.ProjectId);
			return existing;
		}

		public async Task RecalculateAllocatedCountAsync(string projectId)
		{
			var count = await _context.ProjectAllocations
				.CountAsync(a => a.ProjectId == projectId);
			var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);

			if (project != null)
			{
				project.AllocatedCount = count;
				await _context.SaveChangesAsync();
			}
		}
	}
}
