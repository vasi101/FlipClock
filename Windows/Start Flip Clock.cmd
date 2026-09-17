@echo off
setlocal
set "CLOCK_FILE=%~dp0index.html"
set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE_PATH%" goto launch
set "EDGE_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE_PATH%" goto launch
start "" "%CLOCK_FILE%"
exit /b
:launch
start "" "%EDGE_PATH%" --app="file:///%CLOCK_FILE:\=/%" --start-maximized
