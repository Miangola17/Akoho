# ============================================================
# build.ps1 — Compile le projet Angular en production
# Usage : .\build.ps1
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$NG   = Join-Path $ROOT "node_modules\@angular\cli\bin\ng.js"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AKOHO MANAGER - Build de production"          -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
Write-Host "Compilation Angular en cours..." -ForegroundColor Yellow
& node $NG build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Build REUSSI !" -ForegroundColor Green
    Write-Host "Fichiers dans : $ROOT\dist\akoho\" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Build ECHOUE. Verifie les erreurs ci-dessus." -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuie sur ENTREE pour fermer"
