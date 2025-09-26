using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.EmployeeModels;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BrandCostManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees.ToListAsync();
        }

        // GET: api/Employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            return employee;
        }

        // POST: api/Employees
        [HttpPost]
        public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.EmployeeId }, employee);
        }

        /*
        // PUT: api/Employees/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.EmployeeId)
            {
                return BadRequest("Employee ID mismatch");
            }

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Employees.Any(e => e.EmployeeId == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }*/

      

[HttpPut("{id}")]
    [Consumes("application/json")]            // tells Swagger / client to use application/json
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] JsonElement updateData)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        // Defensive checks
        if (updateData.ValueKind == JsonValueKind.Undefined || updateData.ValueKind == JsonValueKind.Null)
            return BadRequest("Invalid JSON payload.");

        // If caller mistakenly sends json-patch content type, reject with clear message
        var ct = Request.ContentType ?? string.Empty;
        if (ct.Contains("json-patch"))
            return BadRequest("This endpoint expects 'application/json' (object). Use JSON Patch on a PATCH endpoint or change Content-Type to application/json.");

        // Try deserialize into dictionary of JsonElement
        Dictionary<string, JsonElement> updates;
        try
        {
            updates = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(updateData.GetRawText());
        }
        catch (JsonException)
        {
            return BadRequest("Invalid JSON payload.");
        }

        foreach (var kvp in updates)
        {
            var key = kvp.Key.Trim().ToLowerInvariant();
            var val = kvp.Value;

            switch (key)
            {
                case "emailid":
                    employee.EmailId = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "location":
                    employee.Location = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "address":
                    employee.Address = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "mobilenumber":
                    employee.MobileNumber = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "managername":
                    employee.ManagerName = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "rolestatus":
                    employee.RoleStatus = val.ValueKind == JsonValueKind.Null ? null : val.GetString();
                    break;
                case "cost":
                    if (val.ValueKind == JsonValueKind.Number && val.TryGetInt32(out var c1))
                        employee.Cost = c1;
                    else if (val.ValueKind == JsonValueKind.String && int.TryParse(val.GetString(), out var c2))
                        employee.Cost = c2;
                    break;
                case "doj":
                    if (val.ValueKind == JsonValueKind.String && DateTime.TryParse(val.GetString(), out var d))
                        employee.Doj = d;
                    break;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(employee);
    }




    /*[HttpPatch("{id}")]
    public async Task<IActionResult> PatchEmployee(int id, JsonPatchDocument<Employee> patchDoc)
    {
        if (patchDoc == null)
        {
            return BadRequest();
        }

        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        patchDoc.ApplyTo(employee, ModelState);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _context.SaveChangesAsync();

        return Ok(employee);
    }
    */

    // DELETE: api/Employees/5
    [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
