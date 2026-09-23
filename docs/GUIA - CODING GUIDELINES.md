---
version: 1.2
fecha: 2026-09-23
estado: activo
descripcion: Guía de estilo y nomenclatura para el código del proyecto. Fuente única de las reglas de código; `AGENTS.md` es el resumen que apunta aquí.
---

# GUIA - CODING GUIDELINES

## Nomenclatura (Castellano descriptivo)

Todas las identificaciones en el código deben estar escritas en Castellano y ser claras y explícitas sobre su propósito.

| Elemento | Convención | Ejemplos |
|----------|------------|----------|
| Variables y parámetros | `camelCase` | `numeroDeIntentos`, `datosUsuario` |
| Funciones / Métodos | `camelCase` (acción/verbo) | `calcularTotal()`, `obtenerDatosCliente()` |
| Clases / Tipos / Interfaces | `PascalCase` | `GestorDeArchivos`, `InterfazPedido` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `MAXIMO_INTENTOS_LOGIN`, `PI_APROXIMADO` |
| Ficheros y carpetas | `kebab-case` | `gestor-datos.js`, `componentes-ui/` |

### Reglas adicionales

- **Evitar abreviaturas:** salvo universalmente reconocidas (ej. HTTP, URL), escribe la palabra completa. En lugar de `datCli`, usa `datosCliente`.
- **Booleanos:** deben comenzar con verbos que impliquen pregunta o estado (ej. `esValido`, `tienePermiso`, `debeActualizar`).
## Nombres de documentación y de código

- **Nombres de ficheros de documentación**: usar prefijos según `AGENTS.md` y `docs/META - Guideline oficial.md` (`GUIA - `, `REF - `, `CHK - `, `LEGAL - `, …). El estado y la versión van en el frontmatter, nunca en el nombre.
- **Estado**: usar solo los valores de `META - Guideline oficial.md` → `borrador`, `activo`, `congelado`, `archivado`.

## Tematización CSS y visuales

- Todo CSS usa variables de `assets/themes.css`; **sin colores hardcodeados** en estilos ni en JavaScript.
- Los HTML de la extensión cargan `themes.css` antes que su CSS propio y llevan `data-theme="samjoko"` en el `<html>`.
- No usar `.style.color` ni `.style.background` en JS: usar clases temáticas (`.mensaje-error`, `.mensaje-exito`, `.mensaje-info`).
- Los hover usan `filter: brightness(…)` en vez de colores fijos, para adaptarse a cualquier tema.
- Los iconos son **SVG inline** (tipo Heroicons) con `fill="none"` o `fill="currentColor"` y `stroke="currentColor"`.
- Cambiar de tema = cambiar `data-theme` en el `<html>`. Temas: `samjoko` (oscuro, por defecto), `vivero`, `nautilus`, `akkoro`.

## Castellano de España

- Tuteo («tú», «selecciona», «abre»); **sin voseo** («seleccioná», «abrí», «querés»).

## Dependencias externas

- Toda librería externa debe poder incluirse como fichero `.js` descargado en `componentes/` (kebab-case), sin npm, CDN ni gestores de paquetes en producción.
- Se usa el build de navegador (no Node.js, ni ESModule incompatible con service worker).
- CDN solo en desarrollo; en producción el archivo va embebido, con comentario de cabecera (nombre, versión, URL y fecha de descarga).

## Gestión de versión

Al cerrar una sesión de trabajo: leer `version` de `manifest.json`, incrementar el **último dígito** (ej. `0.4.1` → `0.4.2`) y guardarlo. La página de opciones muestra la versión automáticamente (`chrome.runtime.getManifest().version`), sin edición manual.
