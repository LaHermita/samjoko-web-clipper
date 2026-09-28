#!/usr/bin/env bash
# Ejecuta el harness de pruebas de Samjoko Web Clipper en Chrome/Chromium headless.
#
# Uso:
#   ./pruebas/ejecutar-pruebas.sh
#
# Códigos de salida: 0 = todo correcto, 1 = hay fallos.
# Sin dependencias más allá de un navegador Chromium en el PATH (usa grep, no node).

set -uo pipefail

RUTA_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUTA_TEMPORAL="$(mktemp)"
trap 'rm -f "$RUTA_TEMPORAL"' EXIT

NAVEGADOR=""
for candidato in google-chrome google-chrome-stable chromium chromium-browser chrome; do
  if command -v "$candidato" >/dev/null 2>&1; then
    NAVEGADOR="$candidato"
    break
  fi
done

if [ -z "$NAVEGADOR" ]; then
  echo "[ERROR] No se encontró Chrome/Chromium en el PATH."
  echo "        Instala uno (ej.: google-chrome) o abre las pruebas a mano en pruebas/."
  exit 1
fi

# ejecutar_pagina <fichero.html> <descripción> <patrón>...
# Cada patrón debe aparecer en la salida JSON de la página para darlo por bueno.
ejecutar_pagina() {
  local fichero="$1"; shift
  local descripcion="$1"; shift
  local fallo=0

  "$NAVEGADOR" --headless --disable-gpu --no-sandbox --dump-dom \
    "file://$RUTA_SCRIPT/$fichero" 2>/dev/null > "$RUTA_TEMPORAL"

  for patron in "$@"; do
    if ! grep -qF "$patron" "$RUTA_TEMPORAL"; then
      echo "  [FALLO] $descripcion — no aparece: $patron"
      fallo=1
    fi
  done

  if [ "$fallo" -eq 0 ]; then
    echo "  [OK]   $descripcion"
  fi
  return "$fallo"
}

echo "Harness de Samjoko Web Clipper (navegador: $NAVEGADOR)"
echo

fallos_totales=0

ejecutar_pagina "ejecutor-fixtures.html" \
  "fixtures HTML → Markdown (5.9 / 5.10)" \
  '"estado": "aprobado"' || fallos_totales=$((fallos_totales + 1))

ejecutar_pagina "prueba-reescaneo.html" \
  "re-escaneo sin pérdidas + sin marcadores en el DOM (B2)" \
  '"segundaIgualQuePrimera": true' \
  '"marcadoresDOM": "0/0"' || fallos_totales=$((fallos_totales + 1))

ejecutar_pagina "prueba-ajuste-linea.html" \
  "ajuste de línea devuelve string, no Promise (B1)" \
  '"ok": true' || fallos_totales=$((fallos_totales + 1))

echo
if [ "$fallos_totales" -eq 0 ]; then
  echo "RESULTADO: TODO CORRECTO (3/3 pruebas)"
  exit 0
fi

echo "RESULTADO: HAY FALLOS ($fallos_totales pruebas con error)"
echo "Abre pruebas/ejecutor-fixtures.html en el navegador para ver el detalle."
exit 1
