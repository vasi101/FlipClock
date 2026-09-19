@echo off
setlocal
if not exist "%~dp0app\Flip Clock.exe" (
    echo The bundled app is missing. Extract the complete Windows release ZIP first.
    pause
    exit /b 1
)
start "" "%~dp0app\Flip Clock.exe"
