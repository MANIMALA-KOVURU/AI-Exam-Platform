$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot 'backend\.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
    throw "Backend virtual environment not found at $python. Create it and install backend/requirements.txt first."
}

Push-Location $projectRoot
try {
    & $python -m pip install pyinstaller
    if ($LASTEXITCODE -ne 0) { throw 'Could not install PyInstaller.' }

    $outputPath = Join-Path $projectRoot 'backend\dist'
    $workPath = Join-Path $projectRoot 'backend\build\pyinstaller'
    & $python -m PyInstaller --noconfirm --clean --onedir `
        --name aiexam-backend `
        --distpath $outputPath `
        --workpath $workPath `
        --specpath $workPath `
        --paths (Join-Path $projectRoot 'backend') `
        --collect-all fastapi `
        --collect-all uvicorn `
        --collect-all sqlalchemy `
        --collect-all pydantic `
        --collect-all pydantic_settings `
        --collect-all jose `
        --collect-all passlib `
        --collect-all multipart `
        --collect-all psycopg `
        --collect-all cryptography `
        --hidden-import app.main `
        (Join-Path $projectRoot 'backend\desktop_entry.py')
    if ($LASTEXITCODE -ne 0) { throw 'PyInstaller failed to bundle the FastAPI backend.' }
} finally {
    Pop-Location
}