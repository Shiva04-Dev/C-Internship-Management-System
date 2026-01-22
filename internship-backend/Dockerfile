FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["C# Internship Management Program.csproj", "InternshipManagement.csproj"]

RUN dotnet restore "InternshipManagement.csproj"

COPY . .

RUN dotnet publish "InternshipManagement.csproj" -c Release -o /app/publish \
    -p:AssemblyName=InternshipManagement --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "InternshipManagement.dll"]