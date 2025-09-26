using BrandCostManagementAPI.Data;
using BrandCostManagementAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DevConnection"),
        new MySqlServerVersion(new Version(8, 4, 0))
    )
);

// Email and Jwt services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<JwtService>();

// CORS (Angular dev server)
// IMPORTANT: do not use AllowAnyOrigin with AllowCredentials. Provide explicit origin(s).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", p => p
        .WithOrigins("http://localhost:4200", "https://localhost:4200") // exact dev origins
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// JWT Authentication
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var cfg = builder.Configuration;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = cfg["Jwt:Issuer"],
            ValidAudience = cfg["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };

        // Pull token from HttpOnly cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var cookieName = context.HttpContext.RequestServices
                    .GetRequiredService<IConfiguration>()["AuthCookie:Name"] ?? "access_token";

                if (context.Request.Cookies.TryGetValue(cookieName, out var token))
                    context.Token = token;

                return Task.CompletedTask;
            }
        };
    });

// Controllers
builder.Services.AddControllers()
    .AddNewtonsoftJson();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must be before authentication if you're using cookies from a different origin
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseJwtSlidingExpiration();
app.UseAuthorization();

app.MapControllers();

app.Run();
