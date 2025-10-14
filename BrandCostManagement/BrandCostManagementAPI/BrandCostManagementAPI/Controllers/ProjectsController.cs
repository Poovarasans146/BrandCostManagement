using BrandCostManagementAPI.ProjectModels;
using BrandCostManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

using BrandCostManagementAPI.Services;

namespace BrandCostManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _service;
        public ProjectsController(IProjectService service)
        {
            _service = service;
        }

        [HttpGet("by-bu/{bu}")]
        public async Task<IActionResult> GetByBU(string bu)
        {
            var res = await _service.GetProjectsByBUAsync(bu);
            return Ok(res);
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            var p = await _service.GetByProjectIdAsync(projectId);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpGet("next-projectid/{bu}")]
        public async Task<IActionResult> GetNextProjectId(string bu)
        {
            var next = await _service.GenerateNextProjectIdAsync(bu);
            return Ok(new { next });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ProjectCreateDto dto)
        {
            var project = new Project
            {
                ProjectId = dto.ProjectId,
                BuName = dto.BuName,
                ProjectName = dto.ProjectName,
                Brand = dto.Brand,
                ApprovedCount = dto.ApprovedCount,
                ProjectValue = dto.ProjectValue,
                ProjectStartDate = dto.ProjectStartDate,
                ProjectEndDate = dto.ProjectEndDate
            };

            var created = await _service.CreateProjectAsync(project, dto.BrandLogo);
            return CreatedAtAction(nameof(Get), new { projectId = created.ProjectId }, created);
        }

        [HttpPut("{projectId}")]
        public async Task<IActionResult> Update(string projectId, [FromForm] ProjectUpdateDto dto)
        {
            var updatedProject = new Project
            {
                ProjectName = dto.ProjectName,
                Brand = dto.Brand,
                ApprovedCount = dto.ApprovedCount,
                ProjectValue = dto.ProjectValue,
                ProjectStartDate = dto.ProjectStartDate,
                ProjectEndDate = dto.ProjectEndDate
            };

            var updated = await _service.UpdateProjectAsync(projectId, updatedProject, dto.BrandLogo);
            return Ok(updated);
        }
    }

    public class ProjectCreateDto
    {
        public string ProjectId { get; set; } = string.Empty;
        public string BuName { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int ApprovedCount { get; set; } = 0;
        public decimal ProjectValue { get; set; } = 0;
        public IFormFile? BrandLogo { get; set; }
        public DateTime? ProjectStartDate { get; set; }
        public DateTime? ProjectEndDate { get; set; }
    }

    public class ProjectUpdateDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int ApprovedCount { get; set; } = 0;
        public decimal ProjectValue { get; set; } = 0;
        public IFormFile? BrandLogo { get; set; }
        public DateTime? ProjectStartDate { get; set; }
        public DateTime? ProjectEndDate { get; set; }
    }
}
