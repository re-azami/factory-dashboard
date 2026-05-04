# -----------------------------------------------------------------------------
# Quantize google/gemma-4-31B-it (BF16 safetensors) to GGUF Q4_K_M
#
# Two steps inside Docker:
#   1. safetensors -> GGUF F16  (intermediate, ~62 GB)
#   2. GGUF F16   -> GGUF Q4_K_M (final output, ~16 GB)
# The F16 intermediate is deleted automatically at the end.
#
# Disk space needed: ~80 GB free (62 GB intermediate + 16 GB output)
# RAM needed: ~16 GB (the converter is streaming, not all-at-once)
#
# Usage:
#   .\scripts\quantize_gemma.ps1
# -----------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

$LlmsRoot  = "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard\data\models\llms"
$InputDir  = "$LlmsRoot\google--gemma-4-31B-it"
$OutputDir = "$LlmsRoot\google--gemma-4-31B-it-Q4_K_M"
$PipMirror = "https://pypi.devneeds.ir/simple/"
$PipHost   = "pypi.devneeds.ir"

# Validate input exists
if (-not (Test-Path $InputDir)) {
    Write-Host "ERROR: Input model not found at $InputDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

try { docker info | Out-Null } catch {
    Write-Host "ERROR: Docker is not running." -ForegroundColor Red; exit 1
}

Write-Host "============================================================"
Write-Host "  Input:  $InputDir"
Write-Host "  Output: $OutputDir"
Write-Host "  Output file: google--gemma-4-31b-Q4_K_M.gguf (~16 GB)"
Write-Host "============================================================"

# Write the Python runner script to a temp location inside the mount
$RunnerPath = "$LlmsRoot\quantize_runner.py"

Set-Content -Path $RunnerPath -Encoding utf8 -Value @'
import subprocess, sys, os, urllib.request

def run(cmd, **kw):
    print(">>>", " ".join(str(c) for c in cmd))
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        print(f"FAILED (exit {r.returncode})")
        sys.exit(r.returncode)

# ---- Install dependencies ----
run([sys.executable, "-m", "pip", "install", "-q", "--no-cache-dir",
     "gguf>=0.10", "transformers>=4.45", "sentencepiece",
     "protobuf", "numpy", "llama-cpp-python>=0.3.0"])

# ---- Paths ----
model_dir = os.environ["MODEL_INPUT"]
f16_path  = os.environ["F16_PATH"]
q4_path   = os.environ["Q4_PATH"]

# ---- Step 1: use the local copy of convert_hf_to_gguf.py ----
# The file was pre-downloaded to scripts/convert_hf_to_gguf.py
script_path = "/models/convert_hf_to_gguf.py"
print(f"\n[Step 1] Using local convert_hf_to_gguf.py at {script_path}")
if not os.path.exists(script_path):
    print("  ERROR: /models/convert_hf_to_gguf.py not found.")
    print("  Make sure scripts/convert_hf_to_gguf.py exists in the project.")
    sys.exit(1)
print("  OK")

# ---- Step 2: Convert safetensors -> GGUF F16 ----
print(f"\n[Step 2] Converting {model_dir} -> {f16_path} (F16)...")
print("  This is the slow step. A 31B model takes 10-30 minutes. RAM usage ~16 GB.")
run([sys.executable, script_path,
     model_dir,
     "--outfile", f16_path,
     "--outtype", "f16"])

f16_gb = os.path.getsize(f16_path) / 1e9
print(f"  F16 GGUF written: {f16_gb:.1f} GB")

# ---- Step 3: Quantize F16 GGUF -> Q4_K_M using llama_cpp Python API ----
print(f"\n[Step 3] Quantizing {f16_path} -> {q4_path} (Q4_K_M)...")
print("  This step also takes 10-30 minutes and uses CPU heavily.")

import llama_cpp
from llama_cpp import llama_cpp as _lib

_lib.llama_backend_init()

params = _lib.llama_model_quantize_default_params()
params.ntype = _lib.LLAMA_FTYPE_MOSTLY_Q4_K_M
params.nthread = 0  # 0 = auto-detect number of CPU threads

ret = _lib.llama_model_quantize(
    f16_path.encode(),
    q4_path.encode(),
    params
)

if ret != 0:
    print(f"  ERROR: quantize returned {ret}")
    sys.exit(1)

q4_gb = os.path.getsize(q4_path) / 1e9
print(f"  Q4_K_M GGUF written: {q4_gb:.1f} GB")

# ---- Cleanup F16 intermediate ----
print(f"\n[Cleanup] Removing F16 intermediate ({f16_gb:.1f} GB)...")
os.remove(f16_path)
print("  Done.")

print(f"\n[OK] Quantized model saved to:\n  {q4_path}")
'@

Write-Host ""
Write-Host "Starting Docker container (CPU quantization, no GPU needed)..."
Write-Host "Expected total time: 30-60 minutes."
Write-Host ""

$ScriptsRoot = "C:\Users\User\OneDrive\Documents\Agentic\agentic_projects\factory-dashboard\scripts"

docker run --rm `
    -e "MODEL_INPUT=/models/google--gemma-4-31B-it" `
    -e "F16_PATH=/models/google--gemma-4-31B-it-Q4_K_M/gemma-4-31b-f16.gguf" `
    -e "Q4_PATH=/models/google--gemma-4-31B-it-Q4_K_M/gemma-4-31b-Q4_K_M.gguf" `
    -e "PIP_INDEX_URL=$PipMirror" `
    -e "PIP_TRUSTED_HOST=$PipHost" `
    -v "${LlmsRoot}:/models" `
    -v "${ScriptsRoot}/convert_hf_to_gguf.py:/models/convert_hf_to_gguf.py:ro" `
    python:3.11-slim `
    python /models/quantize_runner.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Quantization complete." -ForegroundColor Green
    Write-Host ""
    Write-Host "Output files:"
    Get-ChildItem $OutputDir -File | ForEach-Object {
        Write-Host ("  {0}  {1:N1} GB" -f $_.Name, ($_.Length/1GB))
    }
    Write-Host ""
    Write-Host "To load in Ollama:"
    Write-Host "  New-Item -Path .\Modelfile -Value 'FROM $OutputDir\gemma-4-31b-Q4_K_M.gguf'"
    Write-Host "  ollama create gemma4-31b-q4 -f .\Modelfile"
} else {
    Write-Host ""
    Write-Host "[FAIL] Quantization failed (see errors above)." -ForegroundColor Red
}

# Cleanup temp runner script
Remove-Item -Force $RunnerPath -ErrorAction SilentlyContinue
