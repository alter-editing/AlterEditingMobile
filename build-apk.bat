@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0build-main-apk.bat"
