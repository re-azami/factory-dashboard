# -----------------------------------------------------------------------------
# Resume download of google/gemma-4-31B-it from hf.devneeds.ir
#
# Single-model focused script. Previous attempts left partial files in
# data\models\llms\google--gemma-4-31B-it -- this script picks up where
# they stopped (huggingface_hub does this automatically on re-run).
#
# Usage:
#   .\scripts\download_gemma_4_31b.ps1
#
# Safe to interrupt with Ctrl+C and re-run -- already-finished files are
# kept, partial files resume.
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

$Repo       = "google/gemma-4-31B-it"
$DirName    = "google--gemma-4-31B-it"
$DestRoot   = "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard\data\models\llms"
$HFEndpoint = "https://hf.devneeds.ir/"
$PipMirror  = "https://pypi.devneeds.ir/simple/"
$PipHost    = "pypi.devneeds.ir"

if (-not (Test-Path $DestRoot)) {
    New-Item -ItemType Directory -Path $DestRoot -Force | Out-Null
}

# Verify Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running. Start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

$localDir = Join-Path $DestRoot $DirName

Write-Host "============================================================"
Write-Host "  Repo: $Repo"
Write-Host "  Dest: $localDir"
Write-Host "  Mirror: $HFEndpoint"
Write-Host "============================================================"

# Show what's already there
if (Test-Path $localDir) {
    $existingSize = (Get-ChildItem $localDir -Recurse -File -ErrorAction SilentlyContinue |
                     Measure-Object -Property Length -Sum).Sum
    if ($existingSize) {
        $gb = [math]::Round($existingSize/1GB, 2)
        Write-Host "  Already on disk: $gb GB (will resume)" -ForegroundColor Yellow
    }
}

# Build the command. Using --max-workers 1 avoids hammering the mirror with
# parallel connections (the mirror tends to drop streams under load).
$cmd = "pip install -q --no-cache-dir 'huggingface_hub>=0.30' && " +
       "hf download '$Repo' --local-dir '/output/$DirName' --max-workers 1"

# Loop: re-launch the download if connection drops mid-stream. hf will resume
# files that already have .incomplete sidecars. We give up only if the same
# error keeps recurring 5 times in a row.
$attempts = 0
$maxAttempts = 20

while ($attempts -lt $maxAttempts) {
    $attempts++
    Write-Host ""
    Write-Host "Attempt $attempts of $maxAttempts ..." -ForegroundColor Cyan

    docker run --rm `
        -e "HF_ENDPOINT=$HFEndpoint" `
        -e "PIP_INDEX_URL=$PipMirror" `
        -e "PIP_TRUSTED_HOST=$PipHost" `
        -e "HF_HUB_DOWNLOAD_TIMEOUT=600" `
        -v "${DestRoot}:/output" `
        python:3.11-slim `
        bash -c $cmd

    $exit = $LASTEXITCODE
    if ($exit -eq 0) {
        Write-Host ""
        Write-Host "[OK] Download complete." -ForegroundColor Green
        break
    }

    Write-Host ""
    Write-Host "[Warning] Attempt $attempts failed (exit $exit). Retrying in 10s..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

if ($attempts -ge $maxAttempts) {
    Write-Host "[FAIL] Gave up after $maxAttempts attempts." -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================"
Write-Host "  Files on disk in $localDir :" -ForegroundColor White
Write-Host "============================================================"
if (Test-Path $localDir) {
    Get-ChildItem $localDir -Recurse -File -ErrorAction SilentlyContinue |
        Sort-Object Name |
        ForEach-Object {
            $relPath = $_.FullName.Substring($localDir.Length + 1)
            Write-Host ("  {0,-50} {1,8:N2} GB" -f $relPath, ($_.Length/1GB))
        }
    $totalSize = (Get-ChildItem $localDir -Recurse -File -ErrorAction SilentlyContinue |
                  Measure-Object -Property Length -Sum).Sum
    Write-Host ("  {0,-50} {1,8:N2} GB" -f "TOTAL:", ($totalSize/1GB)) -ForegroundColor Cyan
} else {
    Write-Host "  (folder does not exist)"
}
