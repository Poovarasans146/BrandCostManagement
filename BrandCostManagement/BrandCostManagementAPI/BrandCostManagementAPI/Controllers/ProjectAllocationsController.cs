using BrandCostManagementAPI.ProjectAllocationModels;
using BrandCostManagementAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BrandCostManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectAllocationsController : ControllerBase
    {
        private readonly IProjectAllocationService _service;

        public ProjectAllocationsController(IProjectAllocationService service)
        {
            _service = service;
        }

        [HttpGet("by-project/{projectId}")]
        public async Task<IActionResult> GetByProject(string projectId)
        {
            var list = await _service.GetByProjectAsync(projectId);
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProjectAllocation allocation)
        {
            var created = await _service.CreateAsync(allocation);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProjectAllocation allocation)
        {
            var updated = await _service.UpdateAsync(id, allocation);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
