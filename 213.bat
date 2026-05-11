@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================
echo   BUILD DEV APK
echo ================================
echo.

cd /d "%~dp0"

git status >nul 2>nul
if errorlevel 1 (
    echo [ERROR] This folder is not a git repository.
    pause
    exit /b 1
)

git checkout dev
if errorlevel 1 (
    echo [ERROR] Cannot switch to dev branch.
    echo Create it first:
    echo git checkout -b dev
    echo git push -u origin dev
    pause
    exit /b 1
)

echo Current branch:
git branch --show-current
echo.

git add .

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Dev build"
) else (
    echo No changes detected. Creating empty dev build commit...
    git commit --allow-empty -m "Trigger dev build"
)

git push origin dev

echo.
echo ================================
echo DEV BUILD STARTED.
echo Check GitHub Actions.
echo ================================
pause