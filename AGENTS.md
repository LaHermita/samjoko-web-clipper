# AGENTS - Instrucciones para asistentes IA

Este proyecto sigue convenciones estrictas. Todo el código y documentación generados deben cumplir las reglas definidas en los documentos oficiales del proyecto.

---

## Documentos vinculados

- [`docs/GUIA - CODING GUIDELINES.md`](docs/GUIA%20-%20CODING%20GUIDELINES.md) — Normas de estilo y nomenclatura del código.
- [`docs/META - Guideline oficial.md`](docs/META%20-%20Guideline%20oficial.md) — Taxonomía documental del proyecto.

---

## Reglas de código (resumen)

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Variables / parámetros | `camelCase` | `numeroDeIntentos` |
| Funciones / métodos | `camelCase` (verbo/acción) | `calcularTotal()` |
| Clases / tipos / interfaces | `PascalCase` | `GestorDeArchivos` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `MAXIMO_INTENTOS` |
| Archivos / carpetas | `kebab-case` | `gestor-datos.js` |
| Booleanos | prefijo `es`, `tiene`, `debe` | `esValido` |

- **Todo identificador en castellano**, claro y sin abreviaturas.
- **El español debe ser de España** (tuteo: «tú», «selecciona», «abre», «quieres»). No usar voseo argentino («seleccioná», «abrí», «querés»).
- **Nombres de archivo y carpeta** en castellano descriptivo (`kebab-case`). Se exceptúan los nombres estándar exigidos por el navegador (`manifest.json`, `README.md`, `AGENTS.md`).

---

## Reglas de tematización (CSS)

- **Todo CSS debe usar variables** definidas en [`assets/themes.css`](assets/themes.css). No se permiten colores hardcodeados en los estilos ni en JavaScript.
- **Los HTML de la extensión deben cargar `themes.css` antes que su CSS propio** y llevar el atributo `data-theme="samjoko"` en el `<html>` (tema oscuro por defecto).
- **No usar `.style.color` ni `.style.background` en JS.** Usar clases CSS temáticas (`.mensaje-error` → `--estado-error`, `.mensaje-exito` → `--estado-exito`, `.mensaje-info` → `--texto-inactivo`).
- **Los estados hover** deben usar `filter: brightness(…)` en vez de colores fijos, para adaptarse a cualquier tema.
- **Los iconos deben ser SVG inline** (tipo [Heroicons](https://heroicons.dev/)), con `fill="none"` o `fill="currentColor"` y `stroke="currentColor"` para heredar el color del tema vía `var(--color-icono)` o la variable que corresponda. No usar PNG fuera de los assets requeridos por el navegador (`manifest.json`).
- Para cambiar de tema, modificar `data-theme` en el `<html>`. Temas disponibles:

| Tema | `data-theme` |
|------|-------------|
| Samjoko (oscuro, por defecto) | `samjoko` |
| Vivero (natural claro) | `vivero` |
| Nautilus (cálido) | `nautilus` |
| Akkoro (cyberpunk) | `akkoro` |

---

## Reglas de documentación (resumen)

Los documentos usan prefijo de tipo documental según la taxonomía V2:

`[TIPO] - [Tema principal] (calificador opcional).md`

| Tipo | Uso |
|------|-----|
| `META` | Documentos del propio sistema de la bóveda |
| `GUIA` | Paso a paso, proceso, onboarding |
| `REF` | Material de consulta, chuletas, listados |
| `DOC` | Documento general explicativo |
| `SPEC` | Especificación técnica o funcional |
| `PROY` | Documento hub de un proyecto |
| `CHK` | Checklist cerrada y verificable |
| `TAREA` | Lista de tareas abiertas / backlog |
| `TIP` | Consejo práctico breve |
| `LAB` | Exploración, experimentos, WIP |
| `NOTA` | Apunte rápido / nota efímera |
| `IDEA` | Banco de ideas |
| `LOG` | Bitácora / historial de trabajo |
| `ART` | Artículo redactado o reflexión |
| `CONOC` | Conocimiento consolidado |
| `FRAG` | Fragmento breve reutilizable |
| `PLANT` | Plantilla reutilizable |
| `LEGAL` | Licencias / avisos legales |
| `CITA` | Citas / colección de citas |
| `PROMPT` | Prompt individual o colección |
| `MAP` | Índice / mapa de conocimiento |

- Un solo prefijo por archivo.
- Sin números de versión en el nombre (salvo excepciones).
- Estado y versión van en frontmatter YAML, no en el nombre.

---

## Reglas de dependencias externas

- **Cualquier librería externa debe poder incluirse como un archivo `.js` descargado** directamente en el repositorio, sin depender de npm, CDN o gestores de paquetes en producción.
- Las librerías se colocan en `componentes/` con un nombre descriptivo en `kebab-case` (ej. `procesador-lenguaje.js`).
- Si la librería tiene múltiples builds, se elige el build para navegador (no Node.js, no ESModule si no es compatible con service worker).
- Se permite usar CDN solo durante desarrollo/pruebas; en producción el archivo debe estar embebido en el proyecto.
- El archivo descargado se documenta con un comentario al inicio indicando: nombre, versión, URL de origen y fecha de descarga.

---

## Gestión de versión

Al finalizar cada sesión de trabajo (cuando el usuario indique que ha terminado o se despidan), **subir la versión de la extensión** siguiendo estas reglas:

1. **Leer la versión actual** de `manifest.json` (campo `version`).
2. **Incrementar el número de revisión** (último dígito). Ejemplo: `0.4.1` → `0.4.2`.
3. **Actualizar `manifest.json`** con la nueva versión.
4. **La página de opciones** (`opciones/opciones.html`) muestra la versión junto al título de la extensión de forma automática (lee de `chrome.runtime.getManifest().version`), por lo que no requiere edición manual.

---

## Alcance

Estas reglas aplican a:
1. Todo el código fuente del proyecto.
2. Toda la documentación que se genere en el repositorio.
3. Nombres de archivos, carpetas, variables, funciones, clases, constantes.
