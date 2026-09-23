# Actualizador de Samjoko Web Clipper para Chrome (extension cargada en modo desarrollador)
# Descarga la ultima version del repositorio y la sobrescribe sobre esta carpeta.
# Usa Git si esta instalado; si no, descarga el ZIP oficial de GitHub (no requiere instalar nada).
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$url_zip = "https://github.com/LaHermita/samjoko-web-clipper/archive/refs/heads/main.zip"
$carpeta_interna_zip = "samjoko-web-clipper-main"

# 1. Fijar el directorio de trabajo en la carpeta donde esta este script
$ruta_script = $PSScriptRoot
if (-not $ruta_script) { $ruta_script = Split-Path -Parent $MyInvocation.MyCommand.Definition }
Set-Location -LiteralPath $ruta_script

$ruta_manifest = Join-Path $ruta_script "manifest.json"

function Leer-Version {
    param([string]$ruta)
    try {
        $manifest = Get-Content -LiteralPath $ruta -Raw | ConvertFrom-Json
        return [string]$manifest.version
    } catch {
        return ""
    }
}

# PowerShell 5.1 necesita TLS 1.2 explicito para hablar con GitHub
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$version_instalada = ""
if (Test-Path $ruta_manifest) { $version_instalada = Leer-Version $ruta_manifest }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ACTUALIZADOR DE SAMJOKO WEB CLIPPER     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Carpeta de la extension: $ruta_script"
if ($version_instalada) {
    Write-Host "Version instalada: $version_instalada"
} else {
    Write-Host "Version instalada: desconocida (no se encontro manifest.json)"
}
Write-Host ""

# 2. Confirmacion para no sobrescribir sin querer
$respuesta = Read-Host "Se descargara la ultima version y se sobrescribira esta carpeta. Continuar? (S/N)"
if ($respuesta -notmatch '^[sS]') {
    Write-Host "Cancelado. No se ha modificado nada." -ForegroundColor Yellow
    Read-Host -Prompt "Presiona INTRO para cerrar esta ventana"
    exit 0
}
Write-Host ""

# 3. Elegir metodo: Git si esta instalado y la carpeta ya es un repositorio; ZIP en cualquier otro caso
$tiene_git = $false
try { $null = Get-Command git -ErrorAction Stop; $tiene_git = $true } catch {}
$es_repositorio_git = Test-Path (Join-Path $ruta_script ".git")

try {
    if ($tiene_git -and $es_repositorio_git) {
        Write-Host "Metodo: Git (repositorio detectado)" -ForegroundColor Yellow
        git fetch origin
        if ($LASTEXITCODE -ne 0) { throw "No se pudo conectar con el repositorio (git fetch)." }
        git reset --hard origin/main
        if ($LASTEXITCODE -ne 0) { throw "No se pudo sincronizar la carpeta (git reset)." }

        $pendientes = @(git status --porcelain | Where-Object { $_.Trim() -ne "" })
        if ($pendientes.Count -gt 0) {
            Write-Host ""
            Write-Host "Hay archivos locales que no pertenecen al repositorio:" -ForegroundColor Yellow
            $pendientes | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
            $borrar = Read-Host "Eliminarlos para dejar la carpeta identica al repositorio? (S/N)"
            if ($borrar -match '^[sS]') { git clean -fd }
        }
        $version_instalada = Leer-Version $ruta_manifest
    } else {
        Write-Host "Metodo: descarga directa (ZIP de GitHub, no requiere Git)" -ForegroundColor Yellow
        $ruta_zip_temp = Join-Path $env:TEMP "samjoko-web-clipper.zip"
        $ruta_extraccion = Join-Path $env:TEMP "samjoko-web-clipper-extraccion"

        Write-Host "Descargando la ultima version desde GitHub..."
        Invoke-WebRequest -Uri $url_zip -OutFile $ruta_zip_temp -UseBasicParsing

        if (Test-Path $ruta_extraccion) { Remove-Item -LiteralPath $ruta_extraccion -Recurse -Force }
        Write-Host "Extrayendo..."
        Expand-Archive -LiteralPath $ruta_zip_temp -DestinationPath $ruta_extraccion -Force

        $origen = Join-Path $ruta_extraccion $carpeta_interna_zip
        if (-not (Test-Path (Join-Path $origen "manifest.json"))) {
            throw "El ZIP descargado no contiene la extension. Comprueba tu conexion e intentalo de nuevo."
        }

        Write-Host "Sobrescribiendo la carpeta actual..."
        robocopy $origen $ruta_script /MIR /XD ".git" /NFL /NDL /NJH /NP /NS /NC
        if ($LASTEXITCODE -ge 8) { throw "La copia de archivos ha fallado (codigo robocopy $LASTEXITCODE)." }

        Remove-Item -LiteralPath $ruta_zip_temp -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $ruta_extraccion -Recurse -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] No se pudo actualizar: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Comprueba tu conexion a internet e intentalo de nuevo." -ForegroundColor Red
    Write-Host ""
    Read-Host -Prompt "Presiona INTRO para cerrar esta ventana"
    exit 1
}

# 4. Informe de version (antes -> despues)
$version_final = ""
if (Test-Path $ruta_manifest) { $version_final = Leer-Version $ruta_manifest }
Write-Host ""
if ($version_instalada -and $version_final -and ($version_instalada -ne $version_final)) {
    Write-Host "Extension actualizada: $version_instalada -> $version_final" -ForegroundColor Green
} elseif ($version_final) {
    Write-Host "La carpeta esta sincronizada con la ultima version (v$version_final)." -ForegroundColor Green
} else {
    Write-Host "Extension actualizada con exito!" -ForegroundColor Green
}

# 5. Recarga en Chrome, paso a paso
Write-Host ""
Write-Host "Para aplicar la actualizacion en Chrome:" -ForegroundColor Cyan
Write-Host "  1. Abre Chrome y entra en  chrome://extensions"
Write-Host "  2. Activa el interruptor 'Modo de desarrollador' (arriba a la derecha) si no lo esta"
Write-Host "  3. Busca la tarjeta 'Samjoko Web Clipper' y pulsa el boton de recargar (flecha circular)"
Write-Host "  4. Si Chrome mostrara un error, pulsa 'Quitar' y vuelve a cargarla con 'Cargar descomprimida' seleccionando esta carpeta"
Write-Host ""
Read-Host -Prompt "Presiona INTRO para cerrar esta ventana"
