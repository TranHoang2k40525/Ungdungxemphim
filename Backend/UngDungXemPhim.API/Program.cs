// Program.cs - Main entry point for the application
// Environment-aware configuration with .env file support

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using UngDungXemPhim.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file if exists
var root = Directory.GetCurrentDirectory();
var dotenv = Path.Combine(root, "..", "..", ".env");
var dotenvDev = Path.Combine(root, "..", "..", ".env.development");
var dotenvProd = Path.Combine(root, "..", "..", ".env.production");

// Load the appropriate .env file based on environment
var envFile = builder.Environment.IsProduction() ? dotenvProd :
              builder.Environment.IsDevelopment() ? dotenvDev : dotenv;

if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        
        var parts = line.Split('=', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}

// Override ConnectionString with environment variables if available
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");

// Đọc password từ Docker Compose secrets, file mount, hoặc environment variable
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

// Docker Compose secrets được mount tại /run/secrets/ (chuẩn Docker Compose)
var dockerSecretPath = "/run/secrets/db_password";
// Fallback: Custom mount path (cho backward compatibility)
var customSecretPath = "/secrets/db_password";

if (File.Exists(dockerSecretPath))
{
    dbPassword = File.ReadAllText(dockerSecretPath).Trim();
    Console.WriteLine(" [PRODUCTION] Đọc DB password từ Docker Compose secret: /run/secrets/db_password");
}
else if (File.Exists(customSecretPath))
{
    dbPassword = File.ReadAllText(customSecretPath).Trim();
    Console.WriteLine(" [PRODUCTION] Đọc DB password từ custom secret path: /secrets/db_password");
}
else if (!string.IsNullOrEmpty(dbPassword))
{
    Console.WriteLine("  [DEVELOPMENT] Đọc DB password từ environment variable");
}
else
{
    Console.WriteLine(" CẢNH BÁO: Không tìm thấy DB password! Kiểm tra secrets hoặc environment variables.");
}

var dbTrustCert = Environment.GetEnvironmentVariable("DB_TRUST_CERTIFICATE") ?? "True";

if (!string.IsNullOrEmpty(dbServer) && !string.IsNullOrEmpty(dbName))
{
    var connectionString = $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPassword};TrustServerCertificate={dbTrustCert};";
    builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
}

// Override AssetBaseUrl if available
var assetBaseUrl = Environment.GetEnvironmentVariable("ASSET_BASE_URL");
if (!string.IsNullOrEmpty(assetBaseUrl))
{
    builder.Configuration["AssetBaseUrl"] = assetBaseUrl;
}

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.AllowTrailingCommas = true;
        options.JsonSerializerOptions.ReadCommentHandling = System.Text.Json.JsonCommentHandling.Skip;
        // Sửa lỗi encoding tiếng Việt - Không escape Unicode
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        options.JsonSerializerOptions.WriteIndented = false;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS (cho dev React Native/Expo)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();

// Check multiple possible Asset paths (for both dev and production)
var assetPath = Path.Combine(Directory.GetCurrentDirectory(), "Asset");
if (!Directory.Exists(assetPath))
{
    assetPath = "/app/Asset"; // Docker mounted path
}
if (!Directory.Exists(assetPath))
{
    assetPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "Asset");
}

if (Directory.Exists(assetPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(assetPath),
        RequestPath = "/Assets"
    });
}
else
{
    Console.WriteLine($"Warning: Asset directory not found at {assetPath}");
}

// Health check endpoint (cho Docker healthcheck)
app.MapGet("/health", async (AppDbContext dbContext) =>
{
    try
    {
        // Kiểm tra kết nối database
        await dbContext.Database.CanConnectAsync();
        return Results.Ok(new 
        { 
            status = "healthy", 
            timestamp = DateTime.UtcNow,
            environment = app.Environment.EnvironmentName,
            database = "connected"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 503,
            title: "Service Unavailable"
        );
    }
});

app.MapControllers();

// Get port from environment or config
var apiPort = Environment.GetEnvironmentVariable("API_PORT") ?? 
              builder.Configuration["ApiSettings:Port"] ?? "5016";
var apiHost = Environment.GetEnvironmentVariable("API_HOST") ?? 
              builder.Configuration["ApiSettings:Host"] ?? "0.0.0.0";

app.Run($"http://{apiHost}:{apiPort}");
