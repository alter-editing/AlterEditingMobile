@echo off
chcp 65001 >nul
title AlterEditingMobile Push + Build

cd /d "C:\Users\ozbek\Desktop\213\3t"

echo ===============================
echo   PUSH ALTER EDITING MOBILE
echo ===============================
echo.

git init
git remote remove origin 2>nul
git remote add origin https://github.com/alter-editing/AlterEditingMobile.git

git branch -M main

git add -A
git commit -m "Auto update" || echo No changes to commit

git push origin main --force

echo.
echo ===============================
echo   PUSH DONE. BUILD STARTED.
echo ===============================
echo.
pause