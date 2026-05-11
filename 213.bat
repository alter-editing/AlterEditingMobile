@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================
echo   BUILD DEV APK
echo ================================
echo.

REM Переходим в папку, где лежит сам bat
cd /d "%~dp0"

REM Проверяем git
git status >nul 2>nul
if errorlevel 1 (
    echo [ERROR] This folder is not a git repository.
    pause
    exit /b 1
)

REM Переключаемся на dev
git checkout dev
if errorlevel 1 (
    echo [ERROR] Cannot switch to dev branch.
    echo Create it first:
    echo git checkout -b dev
    echo git push -u origin dev
    pause
    exit /b 1
)

REM Показываем текущую ветку
echo Current branch:
git branch --show-current
echo.

REM Добавляем изменения
git add .

REM Коммитим, если есть изменения
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Dev build"
) else (
    echo No changes to commit.
)

REM Пушим именно dev
git push origin dev

echo.
echo ================================
echo DEV BUILD STARTED.
echo Check GitHub Actions.
echo ================================
pause