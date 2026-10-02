@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul || (echo Node.js 20.9 or newer is required. Install Node.js, then run this launcher again.& pause & exit /b 1)
where npm >nul 2>nul || (echo npm is required. Repair the Node.js installation, then run this launcher again.& pause & exit /b 1)

if not exist "backend\.venv\Scripts\python.exe" (
  echo Backend environment is missing. Creating it now...
  py -3 -m venv backend\.venv || (echo Python 3 is required to set up the backend.& pause & exit /b 1)
)

"backend\.venv\Scripts\python.exe" -m pip show fastapi >nul 2>nul || (
  echo Installing backend dependencies...
  "backend\.venv\Scripts\python.exe" -m pip install -r backend\requirements.txt || (echo Backend dependency installation failed.& pause & exit /b 1)
)

if not exist "frontend\node_modules\next\dist\bin\next" (
  echo Installing frontend dependencies...
  call npm ci --prefix frontend || (echo Frontend dependency installation failed.& pause & exit /b 1)
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo Installing desktop dependencies...
  call npm install || (echo Electron dependency installation failed.& pause & exit /b 1)
)

call npm run desktop
if errorlevel 1 pause