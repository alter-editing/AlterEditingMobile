@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AlterEditingMobile DEV Build

echo ================================
echo   ALTER EDITING MOBILE - DEV
echo ================================
echo.

cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [ERROR] This folder is not a Git repository.
    echo Put this .bat into the root folder of AlterEditingMobile.
    pause
    exit /b 1
)

REM Make sure remote info is fresh
git fetch origin

REM Create/switch to dev safely
if not exist .git (
    echo [ERROR] .git folder was not found.
    pause
    exit /b 1
)

git show-ref --verify --quiet refs/heads/dev
if errorlevel 1 (
    git show-ref --verify --quiet refs/remotes/origin/dev
    if errorlevel 1 (
        echo [INFO] dev does not exist. Creating dev from current main...
        git checkout main
        if errorlevel 1 goto fail
        git pull --ff-only origin main
        if errorlevel 1 goto fail
        git checkout -b dev
        if errorlevel 1 goto fail
        git push -u origin dev
        if errorlevel 1 goto fail
    ) else (
        echo [INFO] Creating local dev from origin/dev...
        git checkout -b dev origin/dev
        if errorlevel 1 goto fail
    )
) else (
    git checkout dev
    if errorlevel 1 goto fail
)

REM Pull dev only if remote dev exists
git ls-remote --exit-code --heads origin dev >nul 2>nul
if not errorlevel 1 (
    git pull --ff-only origin dev
    if errorlevel 1 goto fail
)

echo Current branch:
git branch --show-current
echo.

git add -A

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Dev build"
    if errorlevel 1 goto fail
) else (
    echo No file changes detected. Creating empty commit to trigger Actions...
    git commit --allow-empty -m "Trigger dev build"
    if errorlevel 1 goto fail
)

git push origin dev
if errorlevel 1 goto fail

echo.
echo ================================
echo DEV BUILD STARTED.
echo Check GitHub Actions. Branch: dev
echo This does NOT create a GitHub Release.
echo ================================
pause
exit /b 0

:fail
echo.
echo [ERROR] DEV build failed. Check message above.
pause
exit /b 1
