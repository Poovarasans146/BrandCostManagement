using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.EmployeeModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Text.Json;

namespace BrandCostManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // all endpoints require authenticated user by default
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(AppDbContext context, ILogger<EmployeesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ============================================================
        // 1. GET: /api/employees
        //    - returns all employees (authenticated users)
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            var list = await _context.Employees.AsNoTracking().ToListAsync();
            return Ok(list);
        }

        // ============================================================
        // 2. Suggestions endpoint
        //    GET: /api/employees/suggestions?code=102&limit=10
        //    returns string[] of matched employee codes (as text), limited
        // ============================================================
        [HttpGet("suggestions")]
        public async Task<ActionResult<IEnumerable<string>>> GetSuggestions([FromQuery] string code, [FromQuery] int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Query parameter 'code' is required." });

            // normalize and search by EmployeeId prefix OR name/email (string contains)
            var q = code.Trim();

            // If code is numeric-like, match EmployeeId starting with the digits:
            // convert EmployeeId to string and compare startswith
            var suggestions = await _context.Employees
                .AsNoTracking()
                .Where(e => EF.Functions.Like(e.EmployeeId.ToString(), $"{q}%")
                         || EF.Functions.Like(e.Name, $"%{q}%")
                         || EF.Functions.Like(e.EmailId, $"%{q}%"))
                .OrderBy(e => e.EmployeeId)
                .Select(e => e.EmployeeId.ToString())
                .Take(limit)
                .ToListAsync();

            return Ok(suggestions);
        }

        // ============================================================
        // 3a. Search by query (query param)
        //     GET: /api/employees/search?query=102
        // 3b. Search by path (convenience)
        //     GET: /api/employees/search/{code}
        // ============================================================
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Employee>>> SearchEmployeesQuery([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Search query cannot be empty." });

            return await SearchInternal(query);
        }

        [HttpGet("search/{code}")]
        public async Task<ActionResult<IEnumerable<Employee>>> SearchEmployeesPath(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Search code cannot be empty." });

            return await SearchInternal(code);
        }

        // internal helper for search logic
        private async Task<ActionResult<IEnumerable<Employee>>> SearchInternal(string q)
        {
            q = q.Trim();

            // If q is numeric, we can match EmployeeId containing q (like '%q%') OR name/email contains q
            var results = await _context.Employees
                .AsNoTracking()
                .Where(e => EF.Functions.Like(e.EmployeeId.ToString(), $"%{q}%")
                         || EF.Functions.Like(e.Name, $"%{q}%")
                         || EF.Functions.Like(e.EmailId, $"%{q}%"))
                .OrderBy(e => e.EmployeeId)
                .ToListAsync();

            return Ok(results);
        }

        // ============================================================
        // 4. GET: /api/employees/{id}
        //    - get single employee by id (authenticated users)
        // ============================================================
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.EmployeeId == id);
            if (employee == null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            return Ok(employee);
        }

        // ============================================================
        // 5. POST: /api/employees
        //    - Create new employee (admin only)
        // ============================================================
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateEmployee([FromBody] Employee employee)
        {
            if (employee == null)
                return BadRequest(new { message = "Employee payload is required." });

            // Basic validation
            if (string.IsNullOrWhiteSpace(employee.Name))
                return BadRequest(new { message = "Employee name is required." });

            var exists = await _context.Employees.AnyAsync(e => e.EmployeeId == employee.EmployeeId);
            if (exists)
                return Conflict(new { message = $"Employee with ID {employee.EmployeeId} already exists." });

            try
            {
                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEmployee), new { id = employee.EmployeeId }, employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee");
                return StatusCode(500, new { message = "Failed to create employee." });
            }
        }

        // ============================================================
        // 6. PUT: /api/employees/{id}
        //    - Update editable fields (admin only)
        // ============================================================
        [HttpPut("{id:int}")]
        [Authorize(Roles = "admin")]
        [Consumes("application/json")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] JsonElement updateData)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            Dictionary<string, JsonElement> updates;
            try
            {
                updates = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(updateData.GetRawText());
            }
            catch (JsonException)
            {
                return BadRequest(new { message = "Invalid JSON payload." });
            }

            try
            {
                foreach (var kvp in updates)
                {
                    var key = kvp.Key.Trim().ToLowerInvariant();
                    var val = kvp.Value;

                    switch (key)
                    {
                        case "name":
                            employee.Name = val.GetString();
                            break;
                        case "mobilenumber":
                            employee.MobileNumber = val.GetString();
                            break;
                        case "gender":
                            employee.Gender = val.GetString();
                            break;
                        case "location":
                            employee.Location = val.GetString();
                            break;
                        case "address":
                            employee.Address = val.GetString();
                            break;
                        case "managername":
                            employee.ManagerName = val.GetString();
                            break;
                        case "rolestatus":
                            employee.RoleStatus = val.GetString();
                            break;
                        case "cost":
                            if (val.ValueKind == JsonValueKind.Number && val.TryGetInt32(out var cost))
                                employee.Cost = cost;
                            else if (val.ValueKind == JsonValueKind.String && int.TryParse(val.GetString(), out var cost2))
                                employee.Cost = cost2;
                            break;
                        case "doj":
                            if (val.ValueKind == JsonValueKind.String && DateTime.TryParse(val.GetString(), out var doj))
                                employee.Doj = doj;
                            break;
                        // ignore EmployeeId and EmailId updates here (not editable per requirement)
                        default:
                            // unknown keys ignored
                            break;
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Employee updated successfully.", employee });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating employee id {EmployeeId}", id);
                return StatusCode(500, new { message = "Failed to update employee." });
            }
        }

        // ============================================================
        // 7. POST: /api/employees/import
        //    - Import Excel (admin only)
        // ============================================================
        [HttpPost("import")]
        [Authorize(Roles = "admin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> ImportEmployees(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            int importedCount = 0;
            int skippedCount = 0;
            var errorRows = new List<int>();

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null)
                    return BadRequest(new { message = "Invalid Excel file format - worksheet missing." });

                int rowCount = worksheet.Dimension.Rows;
                // Cache existing IDs for faster checks
                var existingEmployeeIds = await _context.Employees.Select(e => e.EmployeeId).ToListAsync();
                var newEmployees = new List<Employee>();

                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var rawId = worksheet.Cells[row, 1]?.Text?.Trim();
                        if (!int.TryParse(rawId, out int employeeId))
                        {
                            skippedCount++;
                            errorRows.Add(row);
                            continue;
                        }

                        if (existingEmployeeIds.Contains(employeeId))
                        {
                            skippedCount++;
                            continue;
                        }

                        var employee = new Employee
                        {
                            EmployeeId = employeeId,
                            Name = worksheet.Cells[row, 2]?.Text?.Trim(),
                            MobileNumber = worksheet.Cells[row, 3]?.Text?.Trim(),
                            EmailId = worksheet.Cells[row, 4]?.Text?.Trim(),
                            Gender = worksheet.Cells[row, 5]?.Text?.Trim(),
                            Location = worksheet.Cells[row, 6]?.Text?.Trim(),
                            Address = worksheet.Cells[row, 7]?.Text?.Trim(),
                            ManagerName = worksheet.Cells[row, 8]?.Text?.Trim(),
                            RoleStatus = worksheet.Cells[row, 9]?.Text?.Trim(),
                            Doj = DateTime.TryParse(worksheet.Cells[row, 10]?.Text?.Trim(), out var d) ? d : (DateTime?)null,
                            Cost = int.TryParse(worksheet.Cells[row, 11]?.Text?.Trim(), out var c) ? c : 0
                        };

                        newEmployees.Add(employee);
                        existingEmployeeIds.Add(employeeId); // avoid duplicates inside file
                        importedCount++;
                    }
                    catch (Exception rowEx)
                    {
                        _logger.LogError(rowEx, "Error processing row {Row}", row);
                        skippedCount++;
                        errorRows.Add(row);
                    }
                }

                if (newEmployees.Count > 0)
                {
                    await _context.Employees.AddRangeAsync(newEmployees);
                    await _context.SaveChangesAsync();
                }

                var message = $"Import completed. {importedCount} added, {skippedCount} skipped.";
                if (errorRows.Count > 0)
                    message += $" Rows with parse errors: {string.Join(',', errorRows)}";

                return Ok(new { message, inserted = importedCount, skipped = skippedCount, errorRows });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Import failed for uploaded file {FileName}", file.FileName);
                return StatusCode(500, new { message = "Import failed due to server error." });
            }
        }

        // ============================================================
        // 8. DELETE: /api/employees/{id}  (admin only)
        // ============================================================
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound(new { message = $"Employee with id {id} not found." });

            try
            {
                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Employee deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting employee id {EmployeeId}", id);
                return StatusCode(500, new { message = "Failed to delete employee." });
            }
        }

        // ============================================================
        // 9. AD Sync placeholder (admin only)
        // ============================================================
        [HttpPost("adsync")]
        [Authorize(Roles = "admin")]
        public IActionResult AdSyncPlaceholder()
        {
            // you can trigger background job here to sync from AD/Graph
            return Ok(new { message = "AD Sync queued (placeholder). Implementation pending." });
        }
    }
}
