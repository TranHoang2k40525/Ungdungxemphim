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
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
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

var assetPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Asset");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(assetPath),
    RequestPath = "/Assets"
});

app.MapControllers();

// Get port from environment or config
var apiPort = Environment.GetEnvironmentVariable("API_PORT") ?? 
              builder.Configuration["ApiSettings:Port"] ?? "5016";
var apiHost = Environment.GetEnvironmentVariable("API_HOST") ?? 
              builder.Configuration["ApiSettings:Host"] ?? "0.0.0.0";

app.Run($"http://{apiHost}:{apiPort}");
