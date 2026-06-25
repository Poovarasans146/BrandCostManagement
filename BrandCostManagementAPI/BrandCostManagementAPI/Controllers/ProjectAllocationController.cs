using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.ProjectAllocationModels;
using BrandCostManagementAPI.EmployeeModels;
using BrandCostManagementAPI.ProjectModels;
using BrandCostManagementAPI.Models.Dtos;

namespace BrandCostManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin,manager")] // ✅ Only Admin & Manager access
    public class ProjectAllocationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectAllocationController(AppDbContext context)
        {
            _context = context;
        }

        // 🧩 1️⃣ Get All Allocations (with employee + project details)
        [HttpGet]
        public async Task<IActionResult> GetAllAllocations()
        {
            try
            {
                var allocations = await _context.ProjectAllocations
                    .Include(a => a.Employee)
                    .Include(a => a.Project)
                    .Select(a => new
                    {
                        a.ProjectAllocationId,
                        a.Allocation,
                        a.AllocationStart,
                        a.AllocationEnd,
                        Employee = new
                        {
                            a.Employee.EmployeeId,
                            a.Employee.Name,
                            a.Employee.MobileNumber,
                            a.Employee.EmailId,
                            a.Employee.Location,
                            a.Employee.Address,
                            a.Employee.ManagerName,
                            a.Employee.RoleStatus
                        },
                        Project = new
                        {
                            a.Project.ProjectId,
                            a.Project.ProjectName,
                            a.Project.Brand,
                            a.Project.BuName,
                            a.Project.BrandLogo,
                            a.Project.ProjectStartDate,
                            a.Project.ProjectEndDate,
                        }
                    })
                    .ToListAsync();

                return Ok(allocations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch allocations.", Details = ex.Message });
            }
        }

        // 🧩 2️⃣ Get Employees (for dropdown)
        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            try
            {
                var employees = await _context.Employees
                    .Select(e => new
                    {
                        e.EmployeeId,
                        e.Name,
                        e.MobileNumber,
                        e.EmailId,
                        e.Location,
                        e.Address,
                        e.ManagerName,
                        e.RoleStatus
                    })
                    .ToListAsync();

                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch employees.", Details = ex.Message });
            }
        }

        // 🧩 3️⃣ Get Projects by BU (for project dropdown)
        [HttpGet("projects/by-bu/{buName}")]
        public async Task<IActionResult> GetProjectsByBu(string buName)
        {
            try
            {
                var projects = await _context.Projects
                    .Where(p => p.BuName == buName)
                    .Select(p => new
                    {
                        p.ProjectId,
                        p.ProjectName,
                        p.Brand,
                        p.BrandLogo,
                        p.ProjectStartDate,
                        p.ProjectEndDate
                    })
                    .ToListAsync();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch projects.", Details = ex.Message });
            }
        }

        // 🧩 4️⃣ Get Brand Logos by BU (for search brand logo section)
        [HttpGet("brands/by-bu/{buName}")]
        public async Task<IActionResult> GetBrandsByBu(string buName)
        {
            try
            {
                var brands = await _context.Projects
                    .Where(p => p.BuName == buName)
                    .Select(p => new
                    {
                        p.ProjectId,
                        p.Brand,
                        p.BrandLogo
                    })
                    .Distinct()
                    .ToListAsync();

                return Ok(brands);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch brands.", Details = ex.Message });
            }
        }

        // 🧩 5️⃣ Get Allocations by ProjectId (on brand logo click)
        [HttpGet("allocations/by-project/{projectId}")]
        public async Task<IActionResult> GetAllocationsByProject(string projectId)
        {
            try
            {
                var allocations = await _context.ProjectAllocations
                    .Include(a => a.Employee)
                    .Include(a => a.Project)
                    .Where(a => a.ProjectId == projectId)
                    .Select(a => new
                    {
                        a.ProjectAllocationId,
                        a.Allocation,
                        a.AllocationStart,
                        a.AllocationEnd,
                        EmployeeId = a.Employee.EmployeeId,
                        EmployeeName = a.Employee.Name,
                        ProjectId = a.Project.ProjectId,
                        ProjectName = a.Project.ProjectName,
                        Role = a.Employee.RoleStatus
                    })
                    .ToListAsync();

                return Ok(allocations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch allocations by project.", Details = ex.Message });
            }
        }

        // 🧩 6️⃣ Get Allocation by AllocationId
        [HttpGet("allocations/{allocationId}")]
        public async Task<IActionResult> GetAllocationByAllocationId(int allocationId)
        {
            try
            {
                var allocation = await _context.ProjectAllocations
                    .Include(a => a.Employee)
                    .Include(a => a.Project)
                    .Where(a => a.ProjectAllocationId == allocationId)
                    .Select(a => new
                    {
                        a.ProjectAllocationId,
                        a.Allocation,
                        a.AllocationStart,
                        a.AllocationEnd,
                        EmployeeId = a.Employee.EmployeeId,
                        EmployeeName = a.Employee.Name,
                        ProjectId = a.Project.ProjectId,
                        ProjectName = a.Project.ProjectName,
                        Role = a.Employee.RoleStatus
                    })
                    .FirstOrDefaultAsync();

                if (allocation == null)
                    return NotFound(new { Message = "Allocation not found." });

                return Ok(allocation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to fetch allocation.", Details = ex.Message });
            }
        }

        // 🧩 7️⃣ Create New Allocation
        [HttpPost]
        public async Task<IActionResult> CreateAllocation(ProjectAllocationCreateDto model)
        {
            try
            {
                var employee = await _context.Employees.FindAsync(model.EmployeeId);
                var project = await _context.Projects.FindAsync(model.ProjectId);

                if (employee == null || project == null)
                    return BadRequest(new { Message = "Invalid Employee or Project." });

                if (model.Allocation < 1 || model.Allocation > 100)
                    return BadRequest(new { Message = "Allocation must be between 1 and 100." });

                if (project.ProjectStartDate.HasValue && model.AllocationStart.HasValue &&
                    model.AllocationStart < project.ProjectStartDate)
                {
                    return BadRequest(new { Message = "You are selecting before the Brand Start Date." });
                }

                if (project.ProjectEndDate.HasValue && model.AllocationEnd.HasValue &&
                    model.AllocationEnd > project.ProjectEndDate)
                {
                    return BadRequest(new { Message = "You are selecting beyond the Brand End Date." });
                }

                if (!string.IsNullOrEmpty(model.Role))
                {
                    employee.RoleStatus = model.Role;
                    _context.Employees.Update(employee);
                }

                if (!string.IsNullOrEmpty(model.ProjectId))
                {
                    project.AllocatedCount += 1;
                    _context.Projects.Update(project);
                }

                var allocation = new ProjectAllocation
                {
                    Allocation = model.Allocation,
                    AllocationStart = model.AllocationStart,
                    AllocationEnd = model.AllocationEnd,
                    EmployeeId = model.EmployeeId,
                    ProjectId = model.ProjectId
                };

                _context.ProjectAllocations.Add(allocation);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = $"Employee {employee.Name} assigned to {project.ProjectName} successfully.",
                    AllocationId = allocation.ProjectAllocationId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to create allocation.", Details = ex.Message });
            }
        }

        // 🧩 8️⃣ Update Allocation
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAllocation(int id, ProjectAllocationCreateDto model)
        {
            try
            {
                var employee = await _context.Employees.FindAsync(model.EmployeeId);
                var project = await _context.Projects.FindAsync(model.ProjectId);

                if (employee == null || project == null)
                    return BadRequest(new { Message = "Invalid Employee or Project." });

                var existing = await _context.ProjectAllocations
                    .Include(a => a.Employee)
                    .Include(a => a.Project)
                    .FirstOrDefaultAsync(a => a.ProjectAllocationId == id);

                if (existing == null)
                    return NotFound(new { Message = "Allocation record not found." });

                if (model.Allocation < 1 || model.Allocation > 100)
                    return BadRequest(new { Message = "Allocation must be between 1 and 100." });

                if (project.ProjectStartDate.HasValue && model.AllocationStart.HasValue &&
                    model.AllocationStart < project.ProjectStartDate)
                {
                    return BadRequest(new { Message = "You are selecting before the Brand Start Date." });
                }

                if (project.ProjectEndDate.HasValue && model.AllocationEnd.HasValue &&
                    model.AllocationEnd > project.ProjectEndDate)
                {
                    return BadRequest(new { Message = "You are selecting beyond the Brand End Date." });
                }

                // Update allocation fields
                existing.Allocation = model.Allocation;
                existing.AllocationStart = model.AllocationStart;
                existing.AllocationEnd = model.AllocationEnd;

                if (!string.IsNullOrEmpty(model.Role))
                {
                    employee.RoleStatus = model.Role;
                    _context.Employees.Update(employee);
                }

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Allocation updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to update allocation.", Details = ex.Message });
            }
        }

        // 🧩 9️⃣ Delete Allocation
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAllocation(int id)
        {
            try
            {
                var existing = await _context.ProjectAllocations.FindAsync(id);
                if (existing == null)
                    return NotFound(new { Message = "Allocation not found." });

                _context.ProjectAllocations.Remove(existing);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Allocation deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to delete allocation.", Details = ex.Message });
            }
        }
    }
}
