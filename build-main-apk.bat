@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title AlterEditingMobile MAIN Build

echo ================================
echo   ALTER EDITING MOBILE - MAIN
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

git fetch origin

git show-ref --verify --quiet refs/heads/main
if errorlevel 1 (
    echo [INFO] Local main not found. Creating from origin/main...
    git checkout -b main origin/main
    if errorlevel 1 goto fail
) else (
    git checkout main
    if errorlevel 1 goto fail
)

git pull --ff-only origin main
if errorlevel 1 goto fail

echo Current branch:
git branch --show-current
echo.

git add -A

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Main build"
    if errorlevel 1 goto fail
) else (
    echo No file changes detected. Creating empty commit to trigger Actions...
    git commit --allow-empty -m "Trigger main build"
    if errorlevel 1 goto fail
)

git push origin main
if errorlevel 1 goto fail

echo.
echo ================================
echo MAIN BUILD STARTED.
echo Check GitHub Actions. Branch: main
echo This does NOT create a GitHub Release.
echo ================================
pause
exit /b 0

:fail
echo.
echo [ERROR] MAIN build failed. Check message above.
pause
exit /b 1
