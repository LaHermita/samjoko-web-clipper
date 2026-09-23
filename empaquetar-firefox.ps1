# Empaquetado del paquete Firefox (MV3 event page + sidebar_action + Downloads API).
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File empaquetar-firefox.ps1
$ErrorActionPreference = "Stop"

# 1. Fijar el directorio de trabajo en la carpeta donde esta este script
$ruta_script = $PSScriptRoot
if (-not $ruta_script) { $ruta_script = Split-Path -Parent $MyInvocation.MyCommand.Definition }
Set-Location -LiteralPath $ruta_script

$ruta_dist = Join-Path $ruta_script "dist-firefox"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   EMPAQUETADO PARA FIREFOX (dist-firefox) " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 2. Nota: los ficheros compartidos se editan siempre en el raiz del repositorio;
#    dist-firefox/ es solo salida de build y no debe editarse a mano.
#    (Copiados aqui: trabajador-fondo.js, base-datos.js, componentes/,
#    _locales/, assets/, ventana-emergente/, editor-bloques/, opciones/)

# 3. Comprobaciones previas sobre el codigo compartido
$ruta_trabajador = Join-Path $ruta_script "trabajador-fondo.js"
$contenido_trabajador = Get-Content -LiteralPath $ruta_trabajador -Raw
if ($contenido_trabajador -notmatch 'typeof importScripts') {
    Write-Host "[AVISO] trabajador-fondo.js no contiene el guard de importScripts." -ForegroundColor Yellow
    Write-Host "        Firefox no puede cargar el background sin ese guard." -ForegroundColor Yellow
}

# 4. Crear carpeta de salida
if (Test-Path $ruta_dist) { Remove-Item -LiteralPath $ruta_dist -Recurse -Force }
New-Item -ItemType Directory -Path $ruta_dist | Out-Null

# 5. Transformar el manifest para Firefox
$manifest_ruta = Join-Path $ruta_script "manifest.json"
$manifest = Get-Content -LiteralPath $manifest_ruta -Raw | ConvertFrom-Json

# 5.1. Eliminar claves especificas de Chrome
$manifest.PSObject.Properties.Remove("side_panel")
$manifest.PSObject.Properties.Remove("background")

# 5.2. Permisos: quitar sidePanel, anadir downloads
$permisos = @($manifest.permissions | Where-Object { $_ -ne "sidePanel" })
if ($permisos -notcontains "downloads") { $permisos += "downloads" }
$manifest.permissions = $permisos

# 5.3. Background como event page (Firefox no soporta service_worker)
$background = [PSCustomObject]@{
    scripts = @(
        "base-datos.js",
        "componentes/configuracion.js",
        "trabajador-fondo.js"
    )
    persistent = $false
}
$manifest | Add-Member -MemberType NoteProperty -Name "background" -Value $background -Force

# 5.4. Panel lateral con sidebar_action (sustituye a side_panel)
$sidebar_action = [PSCustomObject]@{
    default_panel = "editor-bloques/editor.html"
    default_title = "__MSG_tituloAccion__"
    default_icon  = @{
        "16" = "assets/icons/Samjoko-Icono_LowP_16px.png"
        "32" = "assets/icons/Samjoko-Icono_LowP_32px.png"
    }
}
$manifest | Add-Member -MemberType NoteProperty -Name "sidebar_action" -Value $sidebar_action -Force

# 5.5. Identificador de Gecko (obligatorio en MV3 de Firefox)
# 5.6. Declaracion de recoleccion de datos (requisito AMO desde noviembre de 2025).
#      Va dentro de browser_specific_settings.gecko; si va en la raiz, Firefox lo da por ausente.
$gecko = [PSCustomObject]@{
    id                         = "samjoko-web-clipper@hermita.dev"
    data_collection_permissions = [PSCustomObject]@{ required = @("none") }
}
$manifest | Add-Member -MemberType NoteProperty -Name "browser_specific_settings" -Value ([PSCustomObject]@{ gecko = $gecko }) -Force

# 6. Guardar manifest transformado (UTF-8 sin BOM)
$ruta_manifest_destino = Join-Path $ruta_dist "manifest.json"
$manifest_json = $manifest | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($ruta_manifest_destino, $manifest_json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "manifest.json transformado en dist-firefox/" -ForegroundColor Green

# 7. Copiar el resto del paquete
$elementos_copiados = @(
    "_locales", "assets", "componentes", "ventana-emergente", "editor-bloques", "opciones",
    "trabajador-fondo.js", "extractor-contenido.js", "base-datos.js"
)
foreach ($elemento in $elementos_copiados) {
    $origen = Join-Path $ruta_script $elemento
    if (Test-Path $origen) {
        Copy-Item -LiteralPath $origen -Destination $ruta_dist -Recurse -Force
        Write-Host "  copiado: $elemento" -ForegroundColor Gray
    } else {
        Write-Host "[AVISO] No se encontro: $elemento" -ForegroundColor Yellow
    }
}

# 8. Fichero unico dist-firefox.xpi (manifest.json en la RAIZ del comprimido;
#    si el manifest queda anidado, Firefox lo rechaza como "complemento dañado").
#    Se montan las entradas a mano para garantizar separadores "/" (compatible con Firefox/Linux).
$ruta_xpi = Join-Path $ruta_script "dist-firefox.xpi"
if (Test-Path $ruta_xpi) { Remove-Item -LiteralPath $ruta_xpi -Force }
try {
    Add-Type -AssemblyName System.IO.Compression -ErrorAction Stop
    Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction Stop
    $archivo_zip = [System.IO.Compression.ZipFile]::Open($ruta_xpi, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $ruta_dist -Recurse -File | ForEach-Object {
            $ruta_relativa = $_.FullName.Substring($ruta_dist.Length).TrimStart("\", "/") -replace "\\", "/"
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archivo_zip, $_.FullName, $ruta_relativa) | Out-Null
        }
    } finally {
        $archivo_zip.Dispose()
    }
    Write-Host "dist-firefox.xpi generado (fichero unico, manifest.json en la raiz)" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] No se pudo generar dist-firefox.xpi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Paquete listo en dist-firefox/" -ForegroundColor Green
Write-Host "Pasos siguientes:"
Write-Host "  1. Revisa dist-firefox/manifest.json (gecko.id y permisos)."
Write-Host "  2. Carga en Firefox: about:debugging > Este Firefox > Cargar complemento temporal..."
Write-Host "     Selecciona dist-firefox/manifest.json (o dist-firefox.xpi)."
Write-Host "     No uses about:addons > Instalar complemento desde archivo: exige .xpi firmado."
Write-Host "  3. Prueba: captura rapida, editor de bloques (sidebar), guardado por descarga."
Read-Host -Prompt "Presiona INTRO para cerrar"
