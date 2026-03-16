@echo off
set SCRIPT_DIR=%~dp0
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -3 "%SCRIPT_DIR%go2web.py" %*
  exit /b %ERRORLEVEL%
)

python "%SCRIPT_DIR%go2web.py" %*
