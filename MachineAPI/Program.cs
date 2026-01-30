using Microsoft.EntityFrameworkCore;
using MachineAPI.Data;
using MachineAPI.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Configure MySQL DbContext with connection pooling
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("USE_ENVIRONMENT"))
{
    throw new InvalidOperationException("Database connection string is not configured. Set ConnectionStrings:DefaultConnection in appsettings.Production.json or environment variables.");
}

builder.Services.AddDbContext<MachineDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
            mySqlOptions.CommandTimeout(30);
        });
    
    // Only enable sensitive data logging in Development
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Add PSR Code Service (for machine authentication)
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();
builder.Services.AddSingleton<IPSRCodeService, PSRCodeService>();
builder.Services.AddSingleton<ISessionManager, SessionManager>();

// Add Session Auto-Initializer
builder.Services.AddHostedService<SessionInitializerService>();

// Add Health Checks
builder.Services.AddHealthChecks();

// Add Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Add Response Caching
builder.Services.AddResponseCaching();

// Add Rate Limiting
var rateLimitConfig = builder.Configuration.GetSection("RateLimiting");
var enableRateLimiting = rateLimitConfig.GetValue<bool>("EnableRateLimiting", true);

if (enableRateLimiting)
{
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        
        options.AddFixedWindowLimiter("fixed", limiterOptions =>
        {
            limiterOptions.PermitLimit = rateLimitConfig.GetValue<int>("PermitLimit", 100);
            limiterOptions.Window = TimeSpan.FromSeconds(rateLimitConfig.GetValue<int>("WindowSeconds", 60));
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 10;
        });
    });
}

// Add CORS with production-ready configuration
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "https://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionCors", corsBuilder =>
    {
        if (builder.Environment.IsDevelopment())
        {
            corsBuilder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .WithExposedHeaders("X-Total-Count", "X-Page", "X-Page-Size");
        }
        else
        {
            corsBuilder.WithOrigins(corsOrigins)
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials()
                       .WithExposedHeaders("X-Total-Count", "X-Page", "X-Page-Size");
        }
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Poornasree Machine API",
        Version = "v1",
        Description = "ASP.NET Core Web API for Machine Collections, Dispatches, and Sales",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Poornasree Equipments",
            Email = "support@poornasree.com"
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Machine API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}
else
{
    // Production error handling
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;

            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(exception, "Unhandled exception occurred");

            var response = new
            {
                error = "An internal server error occurred.",
                traceId = context.TraceIdentifier
            };

            await context.Response.WriteAsJsonAsync(response);
        });
    });
    
    // Enable HSTS in production
    app.UseHsts();
}

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    // Remove server header for security
    context.Response.Headers.Remove("Server");
    
    await next();
});

app.UseHttpsRedirection();

app.UseResponseCompression();
app.UseResponseCaching();

app.UseCors("ProductionCors");

if (enableRateLimiting)
{
    app.UseRateLimiter();
}

app.UseAuthorization();

// Health check endpoint
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapControllers();

// Database migration and initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MachineDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        if (app.Environment.IsDevelopment())
        {
            await dbContext.Database.EnsureCreatedAsync();
            logger.LogInformation("Database checked/created successfully.");
        }
        else
        {
            // In production, just test the connection
            var canConnect = await dbContext.Database.CanConnectAsync();
            if (canConnect)
            {
                logger.LogInformation("Database connection verified.");
            }
            else
            {
                logger.LogError("Cannot connect to database.");
                throw new InvalidOperationException("Database connection failed.");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database.");
        if (!app.Environment.IsDevelopment())
        {
            throw; // Fail fast in production
        }
    }
}

var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
startupLogger.LogInformation("Machine API starting in {Environment} mode", app.Environment.EnvironmentName);

app.Run();
