# ============================================================
# start.ps1 — Lance tout le projet Akoho (Backend + Frontend)
# Usage : .\start.ps1  OU  double-clic -> Run with PowerShell
# ============================================================

$ROOT    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND = Join-Path $ROOT "backend"
$NPM     = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AKOHO MANAGER - Demarrage du projet"          -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verifier SQL Server ──────────────────────────────────
Write-Host "[1/3] Verification SQL Server..." -ForegroundColor Yellow
$svc = Get-Service -Name 'MSSQLSERVER' -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq 'Running') {
    Write-Host "      SQL Server : ACTIF" -ForegroundColor Green
} elseif ($svc) {
    Write-Host "      SQL Server arrete. Demarrage en cours..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-Command Start-Service MSSQLSERVER" -Wait
    Start-Sleep 3
    Write-Host "      SQL Server : DEMARRE" -ForegroundColor Green
} else {
    Write-Host "      SQL Server : non detecte (ignore)" -ForegroundColor DarkYellow
}

# ── 2. Installer les dependances si manquantes ──────────────
Write-Host ""
Write-Host "[2/3] Verification des dependances..." -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $BACKEND "node_modules"))) {
    Write-Host "      Backend  : installation npm..." -ForegroundColor Yellow
    & node $NPM install --prefix $BACKEND
} else {
    Write-Host "      Backend  : OK" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $ROOT "node_modules"))) {
    Write-Host "      Frontend : installation npm..." -ForegroundColor Yellow
    & node $NPM install --prefix $ROOT
} else {
    Write-Host "      Frontend : OK" -ForegroundColor Green
}

# ── 3. Creer les scripts temporaires puis lancer ────────────
Write-Host ""
Write-Host "[3/3] Lancement des serveurs..." -ForegroundColor Yellow

$backendScript  = Join-Path $env:TEMP "akoho_backend.ps1"
$frontendScript = Join-Path $env:TEMP "akoho_frontend.ps1"

$backendContent = "`$host.UI.RawUI.WindowTitle = 'AKOHO Backend :3000'" + [Environment]::NewLine
$backendContent += "Write-Host '--- Backend Node.js (port 3000) ---' -ForegroundColor Cyan" + [Environment]::NewLine
$backendContent += "Set-Location '$BACKEND'" + [Environment]::NewLine
$backendContent += "node server.js" + [Environment]::NewLine
$backendContent += "Read-Host 'Serveur arrete - ENTREE pour fermer'"
Set-Content -Path $backendScript -Value $backendContent -Encoding UTF8

$frontendContent = "`$host.UI.RawUI.WindowTitle = 'AKOHO Frontend :4200'" + [Environment]::NewLine
$frontendContent += "Write-Host '--- Frontend Angular (port 4200) ---' -ForegroundColor Cyan" + [Environment]::NewLine
$frontendContent += "Set-Location '$ROOT'" + [Environment]::NewLine
$frontendContent += "node '.\node_modules\@angular\cli\bin\ng.js' serve --open" + [Environment]::NewLine
$frontendContent += "Read-Host 'Serveur arrete - ENTREE pour fermer'"
Set-Content -Path $frontendScript -Value $frontendContent -Encoding UTF8

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScript
Start-Sleep 2
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $frontendScript

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:3000"              -ForegroundColor Green
Write-Host "  Frontend : http://localhost:4200 (ouverture auto)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Appuie sur ENTREE pour fermer cette fenetre"
