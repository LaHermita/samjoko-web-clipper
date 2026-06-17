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
- **Nombres de archivo y carpeta** en castellano descriptivo (`kebab-case`). Se exceptúan los nombres estándar exigidos por el navegador (`manifest.json`, `README.md`, `AGENTS.md`).

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

## Alcance

Estas reglas aplican a:
1. Todo el código fuente del proyecto.
2. Toda la documentación que se genere en el repositorio.
3. Nombres de archivos, carpetas, variables, funciones, clases, constantes.
