# -----------------------------------------------------------------------------
# Download full HuggingFace model repositories from hf.devneeds.ir
#
# Each "model" on HF is a folder of files (config.json, tokenizer.json,
# multiple model-XXXX-of-YYYY.safetensors shards, etc.). This script uses
# huggingface-cli inside a small Python container to download every file
# in the repo with resume support.
#
# Usage:
#   .\scripts\download_llms.ps1
#
# - Uses ONLY hf.devneeds.ir (HF_ENDPOINT)
# - Pip packages come from pypi.devneeds.ir
# - Resumes interrupted downloads when re-run
# - Saves each model to a separate folder under data\models\llms\
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

# -- Edit this section --------------------------------------------------------

$DestRoot   = "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard\data\models\llms"
$HFEndpoint = "https://hf.devneeds.ir/"
$PipMirror  = "https://pypi.devneeds.ir/simple/"
$PipHost    = "pypi.devneeds.ir"

# Models confirmed available on hf.devneeds.ir
$Models = @(
    "google/gemma-4-26B-A4B-it",
    "google/gemma-4-31B-it",
    "Qwen/Qwen3.6-35B-A3B-FP8",
    "Qwen/Qwen3.6-35B-A3B"
)

# -- End of edit section ------------------------------------------------------


if (-not (Test-Path $DestRoot)) {
    New-Item -ItemType Directory -Path $DestRoot -Force | Out-Null
    Write-Host "Created $DestRoot" -ForegroundColor Cyan
}

# Verify Docker is available
try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running. Start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

$success = @()
$failed  = @()

foreach ($repo in $Models) {
    # Folder name: replace / with -- so paths are flat (e.g. google--gemma-4-31B-it)
    $dirName  = $repo.Replace("/", "--")
    $localDir = Join-Path $DestRoot $dirName

    Write-Host ""
    Write-Host "============================================================"
    Write-Host "  Repo: $repo"
    Write-Host "  Dest: $localDir"
    Write-Host "============================================================"

    # Run the download inside a python:3.11-slim container.
    # - Installs huggingface_hub (provides the new `hf` CLI) from the Iranian pip mirror
    # - Sets HF_ENDPOINT so the CLI uses devneeds mirror
    # - Mounts the destination folder so files persist on host
    # - The new `hf` CLI replaces the deprecated `huggingface-cli`. Resume is automatic.
    $cmd = "pip install -q --no-cache-dir 'huggingface_hub>=0.30' && " +
           "hf download '$repo' --local-dir '/output/$dirName'"

    docker run --rm `
        -e "HF_ENDPOINT=$HFEndpoint" `
        -e "PIP_INDEX_URL=$PipMirror" `
        -e "PIP_TRUSTED_HOST=$PipHost" `
        -v "${DestRoot}:/output" `
        python:3.11-slim `
        bash -c $cmd

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $repo downloaded" -ForegroundColor Green
        $success += $repo
    } else {
        Write-Host "  [FAIL] $repo failed (exit $LASTEXITCODE)" -ForegroundColor Red
        $failed += $repo
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "  SUMMARY" -ForegroundColor White
Write-Host "============================================================"
Write-Host "  Success: $($success.Count)" -ForegroundColor Green
foreach ($r in $success) { Write-Host "    [OK]   $r" -ForegroundColor Green }
if ($failed.Count -gt 0) {
    Write-Host "  Failed: $($failed.Count)" -ForegroundColor Red
    foreach ($r in $failed) { Write-Host "    [FAIL] $r" -ForegroundColor Red }
}
Write-Host ""
Write-Host "Folders in $DestRoot :"
Get-ChildItem $DestRoot -Directory -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object {
        $totalSize = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
                      Measure-Object -Property Length -Sum).Sum
        $gb = if ($totalSize) { [math]::Round($totalSize/1GB, 2) } else { 0 }
        Write-Host ("  {0,-40} {1,8:N2} GB" -f $_.Name, $gb)
    }
