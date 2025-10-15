using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.ProjectModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BrandCostManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProjectsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ✅ GET all projects by BU
        [HttpGet("by-bu/{bu}")]
        [Authorize(Roles = "admin, manager")]
        public async Task<IActionResult> GetByBU(string bu)
        {
            try
            {
                var projects = await _context.Projects
                    .Where(p => p.BuName == bu)
                    .OrderBy(p => p.ProjectId)
                    .ToListAsync();

                if (projects == null || !projects.Any())
                    return NotFound(new { message = $"No projects found for BU '{bu}'." });

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching projects.", error = ex.Message });
            }
        }

        // ✅ GET project by ProjectId
        [HttpGet("{projectId}")]
        [Authorize(Roles = "admin, manager")]
        public async Task<IActionResult> Get(string projectId)
        {
            try
            {
                var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
                if (project == null)
                    return NotFound(new { message = $"Project '{projectId}' not found." });

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching project.", error = ex.Message });
            }
        }

        // ✅ Generate next project ID
        [HttpGet("next-projectid/{bu}")]
        [Authorize(Roles = "admin, manager")]
        public async Task<IActionResult> GetNextProjectId(string bu)
        {
            try
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

                string nextId = $"{bu}{next:D6}";
                return Ok(new { next = nextId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating project ID.", error = ex.Message });
            }
        }

        // ✅ Helper method - Convert uploaded logo to byte array
        private async Task<byte[]?> ConvertLogoToByteArrayAsync(IFormFile? logo)
        {
            if (logo == null) return null;
            var ext = Path.GetExtension(logo.FileName).ToLowerInvariant();
            if (ext != ".png" && ext != ".jpg" && ext != ".jpeg")
                throw new InvalidOperationException("Only PNG or JPEG files are allowed.");

            using (var ms = new MemoryStream())
            {
                await logo.CopyToAsync(ms);
                return ms.ToArray();
            }
        }

        // ✅ POST - Create a new project
        [HttpPost]
        [Authorize(Roles = "admin, manager")]
        public async Task<IActionResult> Create([FromForm] Project project)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid project data.", errors = ModelState });

            try
            {
                // Convert uploaded file if it exists
                var files = HttpContext.Request.Form.Files;
                var logoFile = files.FirstOrDefault(f => f.Name == "BrandLogo");
                if (logoFile != null)
                {
                    project.BrandLogo = await ConvertLogoToByteArrayAsync(logoFile);
                }

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                await RecalculateAllocatedCountAsync(project.ProjectId);

                return CreatedAtAction(nameof(Get), new { projectId = project.ProjectId }, project);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database update failed.", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating project.", error = ex.Message });
            }
        }

        // ✅ PUT - Update an existing project
        // ✅ PUT - Update an existing project
        // ✅ PUT - Update an existing project
        [HttpPut("{projectId}")]
        [Authorize(Roles = "admin, manager")]
        public async Task<IActionResult> Update(string projectId)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid project data.", errors = ModelState });

            try
            {
                var existing = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
                if (existing == null)
                    return NotFound(new { message = $"Project '{projectId}' not found." });

                // ✅ Read form fields
                var form = HttpContext.Request.Form;

                existing.ProjectName = form["ProjectName"];
                existing.Brand = form["Brand"];
                existing.ApprovedCount = int.TryParse(form["ApprovedCount"], out var approved)
                    ? approved
                    : existing.ApprovedCount;
                existing.ProjectValue = decimal.TryParse(form["ProjectValue"], out var value)
                    ? value
                    : existing.ProjectValue;
                existing.ProjectStartDate = DateTime.TryParse(form["ProjectStartDate"], out var start)
                    ? start
                    : existing.ProjectStartDate;
                existing.ProjectEndDate = DateTime.TryParse(form["ProjectEndDate"], out var end)
                    ? end
                    : existing.ProjectEndDate;

                // ✅ Check if a new logo file is uploaded
                var logoFile = form.Files.FirstOrDefault(f => f.Name == "BrandLogo");
                if (logoFile != null && logoFile.Length > 0)
                {
                    using (var ms = new MemoryStream())
                    {
                        await logoFile.CopyToAsync(ms);
                        existing.BrandLogo = ms.ToArray(); // update logo
                    }
                }

                await _context.SaveChangesAsync();
                await RecalculateAllocatedCountAsync(existing.ProjectId);

                return Ok(new { message = "Project updated successfully.", project = existing });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database update failed.", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating project.", error = ex.Message });
            }
        }


        // ✅ Recalculate Allocated Count
        private async Task RecalculateAllocatedCountAsync(string projectId)
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
