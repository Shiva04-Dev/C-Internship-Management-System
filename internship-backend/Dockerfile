# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY ["C# Internship Management Program.csproj", "./"]
RUN dotnet restore "C# Internship Management Program.csproj"

# Copy everything else and build
COPY . ./
RUN dotnet publish "C# Internship Management Program.csproj" -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port (Render will provide PORT environment variable)
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "C__Internship_Management_Program.dll"]