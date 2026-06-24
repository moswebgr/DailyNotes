@echo off
REM Daily Notes - GitHub Pages Setup Helper (Windows)
setlocal enabledelayedexpansion

color 0A
echo.
echo ════════════════════════════════════════════════
echo   Daily Notes - GitHub Pages Setup Helper
echo ════════════════════════════════════════════════
echo.

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

if "!GITHUB_USERNAME!"=="" (
    color 0C
    echo Error: GitHub username is required
    pause
    exit /b 1
)

REM Get repository name
set /p REPO_NAME="Enter repository name (default: DailyNotes): "
if "!REPO_NAME!"=="" set REPO_NAME=DailyNotes

color 0A
echo.
echo Setting up for:
echo   GitHub Username: !GITHUB_USERNAME!
echo   Repository: !REPO_NAME!

REM Update index.html with GitHub links
echo.
echo Updating web/index.html with GitHub links...

powershell -Command "(Get-Content 'web/index.html') -replace 'https://github.com/yourusername/DailyNotes', 'https://github.com/!GITHUB_USERNAME!/!REPO_NAME!' | Set-Content 'web/index.html'"

echo ✓ Updated GitHub links

REM Initialize git if not already
if not exist ".git" (
    echo.
    echo Initializing git repository...
    git init
    git branch -M main
    echo ✓ Git repository initialized
)

REM Add remote if not exists
for /f %%i in ('git remote') do (
    if "%%i"=="origin" (
        set REMOTE_EXISTS=1
    )
)

if not defined REMOTE_EXISTS (
    echo.
    echo Adding remote origin...
    git remote add origin "https://github.com/!GITHUB_USERNAME!/!REPO_NAME!.git"
    echo ✓ Remote origin added
)

REM Create .gitignore if not exists
if not exist ".gitignore" (
    echo.
    echo Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Testing
        echo coverage/
        echo.
        echo # Production
        echo dist/
        echo build/
        echo.
        echo # Misc
        echo .DS_Store
        echo .env
        echo .env.local
        echo *.log
    ) > .gitignore
    echo ✓ Created .gitignore
)

color 02
echo.
echo ════════════════════════════════════════════════
echo Setup Complete! ✓
echo ════════════════════════════════════════════════
echo.
color 0A

echo Next steps:
echo 1. Push your code to GitHub:
echo    git add .
echo    git commit -m "Initial commit: Daily Notes web version"
echo    git push -u origin main
echo.
echo 2. Go to GitHub repository settings:
echo    https://github.com/!GITHUB_USERNAME!/!REPO_NAME!/settings
echo.
echo 3. Scroll to "GitHub Pages" section
echo    - Source: Deploy from a branch
echo    - Branch: main
echo    - Folder: /web
echo    - Click Save
echo.
echo 4. Your site will be available at:
echo    https://!GITHUB_USERNAME!.github.io/!REPO_NAME!/
echo.
echo For more information, see: web/DEPLOYMENT.md
echo.
pause
