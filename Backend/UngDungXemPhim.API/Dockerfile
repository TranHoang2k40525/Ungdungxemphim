# Simple Dockerfile (can be used for both dev and prod)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy and restore
COPY ["UngDungXemPhim.API.csproj", "./"]
RUN dotnet restore

# Copy and build
COPY . .
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Cài curl cho healthcheck (cho phép Docker kiểm tra /health endpoint)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

EXPOSE 5016
ENV ASPNETCORE_URLS=http://+:5016

ENTRYPOINT ["dotnet", "UngDungXemPhim.API.dll"]
