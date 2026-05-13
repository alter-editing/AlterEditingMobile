@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM  Alter Editing Method Mobile - one click release
REM  This script commits changes, pushes main, creates/pushes tag.
REM  GitHub Actions will build APK and publish GitHub Release.
REM ============================================================

cd /d "%~dp0"

echo.
echo =========================================
echo  Alter Editing Method Mobile Release
echo =========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed or not added to PATH.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not added to PATH.
  pause
  exit /b 1
)

if not exist package.json (
  echo [ERROR] package.json was not found. Run this bat from the project root folder.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -p "require('./package.json').version" 2^>nul') do set CURRENT_VERSION=%%v
if "%CURRENT_VERSION%"=="" (
  echo [ERROR] Cannot read version from package.json.
  pause
  exit /b 1
)

echo Current package version: %CURRENT_VERSION%
echo.
set /p NEW_VERSION=Enter new version without v, for example 1.0.2: 

if "%NEW_VERSION%"=="" (
  echo [ERROR] Version cannot be empty.
  pause
  exit /b 1
)

set NEW_VERSION=%NEW_VERSION:v=%
set TAG_NAME=v%NEW_VERSION%

echo.
echo New version: %NEW_VERSION%
echo Tag: %TAG_NAME%
echo.
set /p CONFIRM=Continue release? Type YES: 
if /I not "%CONFIRM%"=="YES" (
  echo Cancelled.
  pause
  exit /b 0
)

echo.
echo [1/8] Updating package.json version...
node -e "const fs=require('fs'); const p='package.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); j.version=process.argv[1]; fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');" "%NEW_VERSION%"
if errorlevel 1 goto fail

if exist package-lock.json (
  echo [2/8] Updating package-lock.json version...
  node -e "const fs=require('fs'); const p='package-lock.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); j.version=process.argv[1]; if(j.packages && j.packages['']) j.packages[''].version=process.argv[1]; fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');" "%NEW_VERSION%"
  if errorlevel 1 goto fail
) else (
  echo [2/8] package-lock.json not found, skipping.
)

echo [3/8] Checking if tag already exists locally...
git rev-parse "%TAG_NAME%" >nul 2>nul
if not errorlevel 1 (
  echo [ERROR] Local tag %TAG_NAME% already exists.
  echo Delete it first if this was a mistake:
  echo git tag -d %TAG_NAME%
  pause
  exit /b 1
)

echo [4/8] Checking if tag already exists on origin...
git ls-remote --exit-code --tags origin "%TAG_NAME%" >nul 2>nul
if not errorlevel 1 (
  echo [ERROR] Remote tag %TAG_NAME% already exists on GitHub.
  echo Use a higher version number.
  pause
  exit /b 1
)

echo [5/8] Committing changes...
git add .
git diff --cached --quiet
if not errorlevel 1 (
  echo No file changes detected. Creating release tag on current commit.
) else (
  git commit -m "Release %TAG_NAME%"
  if errorlevel 1 goto fail
)

echo [6/8] Pushing main...
git push origin main
if errorlevel 1 goto fail

echo [7/8] Creating tag...
git tag "%TAG_NAME%"
if errorlevel 1 goto fail

echo [8/8] Pushing tag...
git push origin "%TAG_NAME%"
if errorlevel 1 goto fail

echo.
echo =========================================
echo  Release started successfully!
echo =========================================
echo GitHub Actions will now build APK and publish GitHub Release.
echo Check Actions page in your mobile repository.
echo.
pause
exit /b 0

:fail
echo.
echo [ERROR] Release failed. Check the message above.
echo Nothing was deleted automatically.
echo.
pause
exit /b 1
