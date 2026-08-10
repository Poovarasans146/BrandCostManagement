using Microsoft.EntityFrameworkCore;

using BrandCostManagementAPI.EmployeeModels;
using BrandCostManagementAPI.ProjectModels;
using BrandCostManagementAPI.ProjectAllocationModels;

namespace BrandCostManagementAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<OtpRequest> OtpRequests { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectAllocation> ProjectAllocations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ---------------------- Users ----------------------
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(u => u.UserId);

                entity.Property(u => u.UserId)
                      .HasColumnName("user_id");

                entity.Property(u => u.UserName)
                      .HasColumnName("username")
                      .HasMaxLength(50)
                      .IsRequired();

                entity.HasIndex(u => u.UserName)
                      .IsUnique();

                entity.Property(u => u.FullName)
                      .HasColumnName("fullname")
                      .HasMaxLength(50)
                      .IsRequired();

                entity.Property(u => u.Password)
                      .HasColumnName("password")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(u => u.Role)
                      .HasColumnName("role")
                      .HasColumnType("ENUM('admin','manager','finance','hr','viewer')")
                      .HasDefaultValue("viewer")
                      .IsRequired();
            });
            // ---------------------- Otp ----------------------

            modelBuilder.Entity<OtpRequest>(entity =>
            {
                entity.ToTable("OtpRequests");
                entity.HasKey(o => o.Id);

                entity.Property(o => o.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(o => o.OtpHash).HasColumnName("otp_hash").HasMaxLength(255).IsRequired();
                entity.Property(o => o.ExpiresAt).HasColumnName("expires_at").IsRequired();
                entity.Property(o => o.Used).HasColumnName("used").IsRequired();
                entity.Property(o => o.CreatedAt).HasColumnName("created_at").IsRequired();

                entity.HasOne(o => o.User)
                      .WithMany()
                      .HasForeignKey(o => o.UserId);
            });

            // ---------------------- Employees ----------------------
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.ToTable("Employees");

                entity.HasKey(e => e.EmployeeId);

                entity.Property(e => e.EmployeeId)
                      .HasColumnName("employee_id");

                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasColumnName("name")
                      .HasMaxLength(100);

                entity.Property(e => e.MobileNumber)
                      .HasColumnName("mobile_number")
                      .HasMaxLength(20);

                entity.Property(e => e.EmailId)
                      .HasColumnName("email_id")
                      .HasMaxLength(50);

                entity.Property(e => e.Gender)
                      .HasColumnName("gender")
                      .HasColumnType("ENUM('Male','Female','Transgender')")
                      .HasMaxLength(100);

                entity.Property(e => e.Location)
                      .HasColumnName("location")
                      .HasMaxLength(100);

                entity.Property(e => e.Address)
                      .HasColumnName("address")
                      .HasMaxLength(100);

                entity.Property(e => e.ManagerName)
                      .HasColumnName("manager_name")
                      .HasMaxLength(100);

                entity.Property(e => e.RoleStatus)
                      .HasColumnName("role_status")
                      .HasDefaultValue("NA");

                entity.Property(e => e.Doj)
                      .HasColumnName("doj")
                      .HasDefaultValueSql("'2025-09-01'"); // MySQL default

                entity.Property(e => e.Cost)
                      .HasColumnName("cost")
                      .HasDefaultValue(0); 
            });

            // ---------------------- Project ----------------------
            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("Project");

                entity.HasKey(p => p.ProjectId);

                entity.Property(e => e.ProjectId)
                      .HasColumnName("project_id")
                      .HasMaxLength(20);

                entity.Property(e => e.BuName)
                      .HasColumnName("bu_name")
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(e => e.ProjectName)
                      .HasColumnName("project_name")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(e => e.Brand)
                      .HasColumnName("brand")
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(e => e.ApprovedCount)
                      .HasColumnName("approved_count")
                      .HasDefaultValue(0);

                entity.Property(e => e.AllocatedCount)
                      .HasColumnName("allocated_count")
                      .HasDefaultValue(0);

                entity.Property(e => e.ProjectValue)
                      .HasColumnName("project_value")
                      .HasColumnType("decimal(12,2)")
                      .HasDefaultValue(0);

                entity.Property(e => e.BrandLogo)
                      .HasColumnName("brand_logo");

                entity.Property(e => e.ContractDocument)
                      .HasColumnName("contract_document");

                entity.Property(e => e.ContractDocumentName)
                      .HasColumnName("contract_document_name")
                      .HasMaxLength(255);

                entity.Property(e => e.ProjectStartDate)
                      .HasColumnName("project_start_date");

                entity.Property(e => e.ProjectEndDate)
                      .HasColumnName("project_end_date");
            });

            // ---------------------- Project Allocation ----------------------
            modelBuilder.Entity<ProjectAllocation>(entity =>
            {
                entity.ToTable("Project_Allocation");

                entity.HasKey(e => e.ProjectAllocationId);

                entity.Property(e => e.ProjectAllocationId)
                      .HasColumnName("project_allocation_id");

                entity.Property(e => e.Allocation)
                      .HasColumnName("allocation");

                entity.Property(e => e.AllocationStart)
                      .HasColumnName("allocation_start")
                      .HasColumnType("date");

                entity.Property(e => e.AllocationEnd)
                      .HasColumnName("allocation_end")
                      .HasColumnType("date");

                entity.Property(e => e.EmployeeId)
                      .HasColumnName("employee_id");

                entity.Property(e => e.ProjectId)
                      .HasColumnName("project_id")
                      .HasMaxLength(20);

                // Foreign Key relations
                entity.HasOne(e => e.Employee)
                      .WithMany() //emp => emp.ProjectAllocations
                      .HasForeignKey(e => e.EmployeeId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Project)
                      .WithMany() //proj => proj.ProjectAllocations
                      .HasForeignKey(e => e.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
