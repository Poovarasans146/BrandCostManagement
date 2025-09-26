using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BrandCostManagementAPI.Services;

public static class JwtSlidingExpirationExtensions
{
    public static IApplicationBuilder UseJwtSlidingExpiration(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            var cfg = context.RequestServices.GetRequiredService<IConfiguration>();
            var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
            var cookieName = cfg["AuthCookie:Name"] ?? "access_token";
            var slidingWindowMinutes = double.Parse(cfg["Jwt:SlidingWindowMinutes"] ?? "1");
            var expireMinutes = double.Parse(cfg["Jwt:ExpireMinutes"] ?? "30");

            // Only proceed if user is authenticated and we have the token cookie.
            if (context.User?.Identity?.IsAuthenticated == true &&
                context.Request.Cookies.TryGetValue(cookieName, out var tokenStr))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var token = handler.ReadJwtToken(tokenStr);

                    // How long until expiry?
                    var timeLeft = token.ValidTo - DateTime.UtcNow;
                    if (timeLeft <= TimeSpan.FromMinutes(slidingWindowMinutes))
                    {
                        // Re-issue with same identity/role
                        var userId = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                                     ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                                     ?? "";
                        var role = context.User.FindFirstValue(ClaimTypes.Role) ?? "User";

                        var jwtSvc = context.RequestServices.GetRequiredService<JwtService>();
                        var newToken = jwtSvc.GenerateToken(userId, role);

                        // Set cookie - environment-aware
                        var opts = BuildCookieOptions(cfg, TimeSpan.FromMinutes(expireMinutes), env);
                        context.Response.Cookies.Append(cookieName, newToken, opts);
                    }
                }
                catch
                {
                    // If the token cannot be parsed, let the pipeline continue; auth will fail naturally.
                }
            }

            await next();
        });
    }

    private static CookieOptions BuildCookieOptions(IConfiguration cfg, TimeSpan lifetime, IWebHostEnvironment env)
    {
        var sameSite = (cfg["AuthCookie:SameSite"] ?? (env.IsDevelopment() ? "Lax" : "None")).ToLowerInvariant() switch
        {
            "lax" => SameSiteMode.Lax,
            "none" => SameSiteMode.None,
            _ => SameSiteMode.Strict
        };

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),    // Secure only in non-dev
            SameSite = sameSite,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.Add(lifetime)
        };
    }
}
