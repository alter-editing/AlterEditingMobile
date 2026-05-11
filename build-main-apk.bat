@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================
echo   BUILD MAIN APK
echo ================================
echo.

REM Go to folder where this .bat is located
cd /d "%~dp0"

REM Check repository
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [ERROR] This folder is not a Git repository.
    echo Put this .bat into the root folder of AlterEditingMobile.
    pause
    exit /b 1
)

REM Make sure main exists locally
git fetch origin
git show-ref --verify --quiet refs/heads/main
if errorlevel 1 (
    echo [INFO] Local main branch not found. Creating from origin/main...
    git checkout -b main origin/main
) else (
    git checkout main
)

if errorlevel 1 (
    echo [ERROR] Cannot switch to main.
    pause
    exit /b 1
)

REM Pull latest main
git pull --ff-only origin main
if errorlevel 1 (
    echo [WARNING] Could not fast-forward pull main.
    echo Fix conflicts manually if needed.
    pause
    exit /b 1
)

echo Current branch:
git branch --show-current
echo.

REM Add all changes
git add .

REM Commit changes, or create empty commit to trigger GitHub Actions
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Main build"
) else (
    echo No file changes detected. Creating empty build commit...
    git commit --allow-empty -m "Trigger main build"
)

if errorlevel 1 (
    echo [ERROR] Commit failed.
    pause
    exit /b 1
)

REM Push only main
git push origin main

if errorlevel 1 (
    echo [ERROR] Push to main failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo MAIN BUILD STARTED.
echo Check GitHub Actions. Branch: main
echo This does NOT create a GitHub Release.
echo ================================
pause
