#!/usr/bin/env bash
# Empaquetado del paquete Firefox (MV3 event page + sidebar_action + Downloads API).
# Version Linux/macOS del script empaquetar-firefox.ps1.
# Uso: ./empaquetar-firefox.sh
set -euo pipefail

# 1. Fijar el directorio de trabajo en la carpeta donde este este script
ruta_script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ruta_script"

ruta_dist="$ruta_script/dist-firefox"

# Colores (solo si la salida es una terminal)
if [ -t 1 ]; then
    C_CIAN='\033[36m'
    C_VERDE='\033[32m'
    C_AMARILLO='\033[33m'
    C_GRIS='\033[90m'
    C_ROJO='\033[31m'
    C_RESET='\033[0m'
else
    C_CIAN=''
    C_VERDE=''
    C_AMARILLO=''
    C_GRIS=''
    C_ROJO=''
    C_RESET=''
fi

informar() { printf "${C_CIAN}%b${C_RESET}\n" "$1"; }
correcto() { printf "${C_VERDE}%b${C_RESET}\n" "$1"; }
aviso()    { printf "${C_AMARILLO}%b${C_RESET}\n" "$1"; }
error()    { printf "${C_ROJO}%b${C_RESET}\n" "$1"; }
tenue()    { printf "${C_GRIS}%b${C_RESET}\n" "$1"; }

informar "=========================================="
informar "   EMPAQUETADO PARA FIREFOX (dist-firefox) "
informar "=========================================="

# 2. Nota: los ficheros compartidos se editan siempre en la raiz del repositorio;
#    dist-firefox/ es solo salida de build y no debe editarse a mano.
#    (Copiados aqui: trabajador-fondo.js, base-datos.js, componentes/,
#    _locales/, assets/, ventana-emergente/, editor-bloques/, opciones/)

# 3. Comprobaciones previas sobre el codigo compartido
if [ ! -f "$ruta_script/trabajador-fondo.js" ] || [ ! -f "$ruta_script/manifest.json" ]; then
    error "[ERROR] Faltan trabajador-fondo.js o manifest.json en la raiz del proyecto."
    exit 1
fi

if ! grep -q 'typeof importScripts' "$ruta_script/trabajador-fondo.js"; then
    aviso "[AVISO] trabajador-fondo.js no contiene el guard de importScripts."
    aviso "        Firefox no puede cargar el background sin ese guard."
fi

# 4. Crear carpeta de salida
rm -rf "$ruta_dist"
mkdir -p "$ruta_dist"

# 5. Transformar el manifest para Firefox
ruta_manifest="$ruta_script/manifest.json"
ruta_manifest_destino="$ruta_dist/manifest.json"
ruta_manifest_temporal="$ruta_dist/.manifest.json.tmp"
trap 'rm -f "$ruta_manifest_temporal"' EXIT

# La transformacion se escribe en un temporal y solo se mueve si termina bien,
# para no dejar un manifest.json a medias si algo falla.
transformar_manifest() {
    if command -v python3 >/dev/null 2>&1; then
        transformar_con_python
    elif command -v jq >/dev/null 2>&1; then
        transformar_con_jq
    else
        error "[ERROR] Hace falta python3 o jq para transformar manifest.json."
        error "        Instala uno de ellos (ej.: sudo apt install python3) y vuelve a intentarlo."
        exit 1
    fi
    mv -f "$ruta_manifest_temporal" "$ruta_manifest_destino"
}

transformar_con_python() {
    python3 - "$ruta_manifest" "$ruta_manifest_temporal" <<'PY'
import json
import sys

ruta_entrada, ruta_salida = sys.argv[1], sys.argv[2]

with open(ruta_entrada, encoding="utf-8-sig") as archivo:
    manifiesto = json.load(archivo)

# 5.1. Eliminar claves especificas de Chrome
manifiesto.pop("side_panel", None)
manifiesto.pop("background", None)

# 5.2. Permisos: quitar sidePanel, anadir downloads
permisos = [p for p in manifiesto.get("permissions") or [] if p != "sidePanel"]
if "downloads" not in permisos:
    permisos.append("downloads")
manifiesto["permissions"] = permisos

# 5.3. Background como event page (Firefox no soporta service_worker)
manifiesto["background"] = {
    "scripts": [
        "base-datos.js",
        "componentes/configuracion.js",
        "trabajador-fondo.js",
    ],
    "persistent": False,
}

# 5.4. Panel lateral con sidebar_action (sustituye a side_panel)
manifiesto["sidebar_action"] = {
    "default_panel": "editor-bloques/editor.html",
    "default_title": "__MSG_tituloAccion__",
    "default_icon": {
        "16": "assets/icons/Samjoko-Icono_LowP_16px.png",
        "32": "assets/icons/Samjoko-Icono_LowP_32px.png",
    },
}

# 5.5. Identificador de Gecko y declaracion de recoleccion de datos.
#      En Firefox van dentro de browser_specific_settings.gecko
#      (gecko.id obligatorio en MV3; data_collection_permissions exigido por AMO
#      desde noviembre de 2025). Si va en la raiz, Firefox lo da por ausente.
manifiesto["browser_specific_settings"] = {
    "gecko": {
        "id": "samjoko-web-clipper@hermita.dev",
        "data_collection_permissions": {"required": ["none"]},
    }
}

# 6. Guardar manifest transformado (UTF-8 sin BOM)
with open(ruta_salida, "w", encoding="utf-8", newline="\n") as archivo:
    json.dump(manifiesto, archivo, ensure_ascii=False, indent=2)
    archivo.write("\n")
PY
}

transformar_con_jq() {
    jq '
        del(.side_panel) | del(.background)
        | .permissions = ((.permissions // [])
            | map(select(. != "sidePanel"))
            | if index("downloads") then . else . + ["downloads"] end)
        | .background = {
            "scripts": ["base-datos.js", "componentes/configuracion.js", "trabajador-fondo.js"],
            "persistent": false
          }
        | .sidebar_action = {
            "default_panel": "editor-bloques/editor.html",
            "default_title": "__MSG_tituloAccion__",
            "default_icon": {
                "16": "assets/icons/Samjoko-Icono_LowP_16px.png",
                "32": "assets/icons/Samjoko-Icono_LowP_32px.png"
            }
          }
        | .browser_specific_settings = { "gecko": {
            "id": "samjoko-web-clipper@hermita.dev",
            "data_collection_permissions": { "required": ["none"] }
          } }
    ' "$ruta_manifest" > "$ruta_manifest_temporal"
}

transformar_manifest

correcto "manifest.json transformado en dist-firefox/"

# 7. Copiar el resto del paquete
elementos_copiados=(
    "_locales" "assets" "componentes" "ventana-emergente" "editor-bloques" "opciones"
    "trabajador-fondo.js" "extractor-contenido.js" "base-datos.js"
)
for elemento in "${elementos_copiados[@]}"; do
    origen="$ruta_script/$elemento"
    if [ -e "$origen" ]; then
        cp -a "$origen" "$ruta_dist/"
        tenue "  copiado: $elemento"
    else
        aviso "[AVISO] No se encontro: $elemento"
    fi
done

# 8. Fichero unico dist-firefox.xpi (manifest.json en la RAIZ del comprimido;
#    si el manifest queda anidado, Firefox lo rechaza como "complemento dañado")
ruta_xpi="$ruta_script/dist-firefox.xpi"

empaquetar_xpi() {
    rm -f "$ruta_xpi"
    if command -v zip >/dev/null 2>&1; then
        (cd "$ruta_dist" && zip -q -r -X "$ruta_xpi" .)
    elif command -v python3 >/dev/null 2>&1; then
        python3 - "$ruta_dist" "$ruta_xpi" <<'PY'
import os
import sys
import zipfile

origen, destino = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as archivo_zip:
    for raiz, _subcarpetas, ficheros in os.walk(origen):
        for nombre in sorted(ficheros):
            ruta = os.path.join(raiz, nombre)
            archivo_zip.write(ruta, os.path.relpath(ruta, origen).replace(os.sep, "/"))
PY
    else
        aviso "[AVISO] Sin 'zip' ni python3: no se genera dist-firefox.xpi."
        return 0
    fi
    correcto "dist-firefox.xpi generado (fichero unico, manifest.json en la raiz)"
}

empaquetar_xpi

printf "\n"
correcto "Paquete listo en dist-firefox/"
printf "Pasos siguientes:\n"
printf "  1. Revisa dist-firefox/manifest.json (gecko.id y permisos).\n"
printf "  2. Carga en Firefox: about:debugging > Este Firefox > Cargar complemento temporal...\n"
printf "     Selecciona dist-firefox/manifest.json (o dist-firefox.xpi).\n"
printf "     No uses about:addons > Instalar complemento desde archivo: exige .xpi firmado.\n"
printf "  3. Prueba: captura rapida, editor de bloques (sidebar), guardado por descarga.\n"

if [ -t 0 ]; then
    read -r -p "Presiona INTRO para cerrar"
fi
