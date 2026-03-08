# ============================================================
# start.ps1 — Lance tout le projet Akoho (Backend + Frontend)
# Usage : .\start.ps1  OU  clic-droit -> Executer avec PowerShell
# ============================================================

$ROOT    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND = Join-Path $ROOT "backend"
$ENVFILE = Join-Path $BACKEND ".env"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AKOHO MANAGER - Demarrage du projet"          -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ── 0. Verifier Node.js ─────────────────────────────────────
$nodeVersion = $null
try { $nodeVersion = node --version 2>$null } catch {}

if (-not $nodeVersion) {
    Write-Host "[ERREUR] Node.js n'est pas installe !" -ForegroundColor Red
    Write-Host "         Telecharge-le sur : https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Appuie sur ENTREE pour fermer"
    exit 1
}
Write-Host "[OK] Node.js detecte : $nodeVersion" -ForegroundColor Green

# ── 1. Verifier SQL Server ──────────────────────────────────
Write-Host ""
Write-Host "[1/4] Verification SQL Server..." -ForegroundColor Yellow
$svc = Get-Service -Name 'MSSQLSERVER' -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq 'Running') {
    Write-Host "      SQL Server : ACTIF" -ForegroundColor Green
} elseif ($svc) {
    Write-Host "      SQL Server arrete. Demarrage en cours..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-Command Start-Service MSSQLSERVER" -Wait
    Start-Sleep 3
    Write-Host "      SQL Server : DEMARRE" -ForegroundColor Green
} else {
    Write-Host "      SQL Server : non detecte (utilise Docker ou installe-le)" -ForegroundColor DarkYellow
}

# ── 2. Creer le fichier .env si manquant ────────────────────
Write-Host ""
Write-Host "[2/4] Verification configuration backend..." -ForegroundColor Yellow

if (-not (Test-Path $ENVFILE)) {
    Write-Host "      Creation du fichier .env..." -ForegroundColor Yellow
    $envContent = @"
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=Akoho@2025!
DB_NAME=AkohoDB
PORT=3000
"@
    Set-Content -Path $ENVFILE -Value $envContent -Encoding UTF8
    Write-Host "      .env cree avec config par defaut" -ForegroundColor Green
    Write-Host "      (Modifie backend/.env si ton mot de passe SQL est different)" -ForegroundColor DarkYellow
} else {
    Write-Host "      .env : OK" -ForegroundColor Green
}

# ── 3. Installer les dependances si manquantes ──────────────
Write-Host ""
Write-Host "[3/4] Verification des dependances..." -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $BACKEND "node_modules"))) {
    Write-Host "      Backend  : installation npm (premiere fois)..." -ForegroundColor Yellow
    Push-Location $BACKEND
    npm install
    Pop-Location
} else {
    Write-Host "      Backend  : OK (deja installe)" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $ROOT "node_modules"))) {
    Write-Host "      Frontend : installation npm (premiere fois)..." -ForegroundColor Yellow
    Push-Location $ROOT
    npm install
    Pop-Location
} else {
    Write-Host "      Frontend : OK (deja installe)" -ForegroundColor Green
}

# ── 4. Creer les scripts temporaires puis lancer ────────────
Write-Host ""
Write-Host "[4/4] Lancement des serveurs..." -ForegroundColor Yellow

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
$frontendContent += "npx ng serve --open" + [Environment]::NewLine
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
Write-Host "Les 2 fenetres de serveurs sont ouvertes." -ForegroundColor Cyan
Write-Host "Ferme-les pour arreter le projet." -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuie sur ENTREE pour fermer cette fenetre"
