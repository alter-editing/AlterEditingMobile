@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================
echo   BUILD DEV APK
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

REM Fetch remote branches
git fetch origin

REM If local dev does not exist, create it
git show-ref --verify --quiet refs/heads/dev
if errorlevel 1 (
    git show-ref --verify --quiet refs/remotes/origin/dev
    if errorlevel 1 (
        echo [INFO] Remote dev branch not found. Creating dev from main...
        git checkout main
        if errorlevel 1 (
            echo [ERROR] Cannot switch to main to create dev.
            pause
            exit /b 1
        )
        git pull --ff-only origin main
        git checkout -b dev
        git push -u origin dev
    ) else (
        echo [INFO] Local dev branch not found. Creating from origin/dev...
        git checkout -b dev origin/dev
    )
) else (
    git checkout dev
)

if errorlevel 1 (
    echo [ERROR] Cannot switch to dev.
    pause
    exit /b 1
)

REM Pull latest dev if remote exists
git ls-remote --exit-code --heads origin dev >nul 2>nul
if not errorlevel 1 (
    git pull --ff-only origin dev
    if errorlevel 1 (
        echo [WARNING] Could not fast-forward pull dev.
        echo Fix conflicts manually if needed.
        pause
        exit /b 1
    )
)

echo Current branch:
git branch --show-current
echo.

REM Add all changes
git add .

REM Commit changes, or create empty commit to trigger GitHub Actions
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Dev build"
) else (
    echo No file changes detected. Creating empty dev build commit...
    git commit --allow-empty -m "Trigger dev build"
)

if errorlevel 1 (
    echo [ERROR] Commit failed.
    pause
    exit /b 1
)

REM Push only dev
git push origin dev

if errorlevel 1 (
    echo [ERROR] Push to dev failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo DEV BUILD STARTED.
echo Check GitHub Actions. Branch: dev
echo This does NOT create a GitHub Release.
echo ================================
pause
