@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo  Alter Editing Method - Android release key
echo ============================================
echo.
echo This creates a stable Android signing key for GitHub Releases.
echo Keep alter-release-key.jks safe. If you lose it, users cannot update over old APK.
echo.

where keytool >nul 2>nul
if errorlevel 1 (
  echo ERROR: keytool not found.
  echo Install JDK 17/21 or use Android Studio bundled JDK, then run this again.
  pause
  exit /b 1
)

where certutil >nul 2>nul
if errorlevel 1 (
  echo ERROR: certutil not found.
  pause
  exit /b 1
)

set KEYSTORE=alter-release-key.jks
set ALIAS=alterediting

if exist "%KEYSTORE%" (
  echo %KEYSTORE% already exists.
  echo For safety this script will not overwrite it.
  pause
  exit /b 1
)

set /p STOREPASS=Enter keystore password: 
set /p KEYPASS=Enter key password, can be same: 

if "%STOREPASS%"=="" (
  echo Password cannot be empty.
  pause
  exit /b 1
)
if "%KEYPASS%"=="" (
  echo Password cannot be empty.
  pause
  exit /b 1
)

echo.
echo Creating keystore...
keytool -genkeypair -v -keystore "%KEYSTORE%" -alias "%ALIAS%" -keyalg RSA -keysize 2048 -validity 10000 -storepass "%STOREPASS%" -keypass "%KEYPASS%" -dname "CN=Alter Editing Method, OU=Mobile, O=Alter Editing, L=Unknown, S=Unknown, C=US"
if errorlevel 1 (
  echo Failed to create keystore.
  pause
  exit /b 1
)

echo.
echo Encoding keystore to Base64...
certutil -encode "%KEYSTORE%" android-keystore-base64.txt >nul
if errorlevel 1 (
  echo Failed to encode keystore.
  pause
  exit /b 1
)

echo.
echo Done.
echo.
echo Add these GitHub Secrets in repo Settings ^> Secrets and variables ^> Actions:
echo.
echo ANDROID_KEYSTORE_BASE64 = content of android-keystore-base64.txt WITHOUT BEGIN/END lines
echo ANDROID_KEYSTORE_PASSWORD = %STOREPASS%
echo ANDROID_KEY_ALIAS = %ALIAS%
echo ANDROID_KEY_PASSWORD = %KEYPASS%
echo.
echo IMPORTANT: keep %KEYSTORE% private and backed up.
echo.
pause
