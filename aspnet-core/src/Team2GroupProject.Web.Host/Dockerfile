FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/Team2GroupProject.Web.Host/Team2GroupProject.Web.Host.csproj", "src/Team2GroupProject.Web.Host/"]
COPY ["src/Team2GroupProject.Web.Core/Team2GroupProject.Web.Core.csproj", "src/Team2GroupProject.Web.Core/"]
COPY ["src/Team2GroupProject.Application/Team2GroupProject.Application.csproj", "src/Team2GroupProject.Application/"]
COPY ["src/Team2GroupProject.Core/Team2GroupProject.Core.csproj", "src/Team2GroupProject.Core/"]
COPY ["src/Team2GroupProject.EntityFrameworkCore/Team2GroupProject.EntityFrameworkCore.csproj", "src/Team2GroupProject.EntityFrameworkCore/"]
WORKDIR "/src/src/Team2GroupProject.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/Team2GroupProject.Web.Host", "src/Team2GroupProject.Web.Host"]
COPY ["src/Team2GroupProject.Web.Core", "src/Team2GroupProject.Web.Core"]
COPY ["src/Team2GroupProject.Application", "src/Team2GroupProject.Application"]
COPY ["src/Team2GroupProject.Core", "src/Team2GroupProject.Core"]
COPY ["src/Team2GroupProject.EntityFrameworkCore", "src/Team2GroupProject.EntityFrameworkCore"]
WORKDIR "/src/src/Team2GroupProject.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "Team2GroupProject.Web.Host.dll"]
