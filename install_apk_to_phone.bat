@echo off
title Install SecurePay APK to Phone
echo ========================================================
echo   SecurePay UPI - 1-Click Android APK Installer
echo ========================================================
echo.

set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
set APK="C:\New_Capstone\SecurePay-Standalone.apk"

if not exist %ADB% (
    echo [ERROR] adb.exe not found in Android SDK.
    echo Please copy SecurePay-Standalone.apk to your phone manually.
    pause
    exit /b
)

if not exist %APK% (
    echo [ERROR] SecurePay-Standalone.apk not found.
    pause
    exit /b
)

echo Checking for connected Android phone...
%ADB% devices

echo.
echo Installing SecurePay-Standalone.apk to connected device...
%ADB% install -r %APK%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] APK installed successfully on your phone!
    echo Launching SecurePay on your device...
    echo ========================================================
    %ADB% shell monkey -p com.securepay.fraudguard -c android.intent.category.LAUNCHER 1
) else (
    echo.
    echo [NOTICE] Installation via USB did not complete.
    echo If your phone is not connected via USB debugging:
    echo Simply copy C:\New_Capstone\SecurePay-Standalone.apk to your phone
    echo via USB cable or Google Drive, then tap to Install.
)

echo.
pause
