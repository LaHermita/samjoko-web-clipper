# Evitar que la ventana se cierre inmediatamente si hay un error critico
$ErrorActionPreference = "Stop"

# 1. Definir la URL del repositorio de la extension de Chrome
$url_repositorio = "https://github.com/LaHermita/samjoko-web-clipper.git"

# 2. Fijar el directorio de trabajo en la carpeta donde esta este script
$ruta_script = $PSScriptRoot
if (-not $ruta_script) { $ruta_script = Split-Path -Parent $MyInvocation.MyCommand.Definition }
Set-Location -LiteralPath $ruta_script

# 3. Comprobar si ya existe la carpeta de Git (.git) en el directorio actual
$es_repositorio_git = Test-Path (Join-Path $ruta_script ".git")

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ACTUALIZADOR DE LA EXTENSION DE CHROME  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Carpeta actual: $ruta_script"
Write-Host ""

try {
    if ($es_repositorio_git) {
        # Si ya esta vinculado a Git, descargamos solo las novedades
        Write-Host "Buscando actualizaciones en GitHub..." -ForegroundColor Yellow
        git pull origin main
        Write-Host ""
        Write-Host "Extension actualizada con exito!" -ForegroundColor Green
    } else {
        # Si la carpeta esta vacia o no es un repo de Git, lo inicializamos aqui mismo
        Write-Host "Configurando el repositorio por primera vez..." -ForegroundColor Yellow

        # Inicializar Git en la carpeta actual sin crear subcarpetas extra
        git init
        git remote add origin $url_repositorio

        # Traer el contenido del repositorio
        git fetch
        git checkout -t origin/main -f

        Write-Host ""
        Write-Host "Configuracion inicial completada y extension descargada!" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Hubo un problema al intentar actualizar." -ForegroundColor Red
    Write-Host "Asegurate de tener Git instalado y acceso al repositorio." -ForegroundColor Red
}

Write-Host ""
Write-Host "Puedes recargar la extension en tu navegador Chrome (chrome://extensions)." -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Read-Host -Prompt "Presiona INTRO para cerrar esta ventana"
