---
version: 0.1
estado: borrador
---

> [!summary] Resumen
> Brainstorming sobre el verdadero propósito: extraer contenido web para alimentar una bóveda de conocimiento en Obsidian.

## Cambio de paradigma

No es un "capturador de páginas a Markdown genérico".
Es una **puerta de entrada web para una bóveda Obsidian**.

Cada captura debe llegar lista para integrarse: con metadata, contexto, enlaces y formato Obsidian nativo.

## Implicaciones

### Frontmatter YAML (obligatorio)

```yaml
---
titulo: "Título del artículo"
fecha: 2026-06-17
fuente: https://...
etiquetas: [web, referencia, extraido]
autor: Nombre del autor
---
```

### Wikis en lugar de Markdown links

- Los enlaces internos del artículo → `[[wikilink]]`
- Enlace a la fuente original en frontmatter + al pie

### Ruta dentro de la bóveda

- ✅ El selector de carpeta de opciones apunta directo a la vault
- Guardado directo, sin bandeja de entrada
- En el futuro: posibilidad de elegir subcarpeta dentro de la vault al capturar

### Templates

- Template único para todas las capturas
- El frontmatter incluirá un campo `tipo` con una taxonomía propia (pendiente de definir)
- El template vivirá dentro de la extensión (configurable en opciones más adelante)

### Limpieza de contenido

- Extraer solo el contenido relevante (artículo principal, no menús ni sidebar)
- Detectar autor, fecha de publicación, etiquetas de la página automáticamente
- Respetar bloques de código, tablas, listas

### Tags

- Extraer tags de la página (categorías, keywords)
- Tags predefinidos por dominio (todo lo de `midu.dev` → tag `desarrollo`)
- Tags manuales desde el popup antes de guardar

### Integración futura

- **Obsidian URI** (`obsidian://open?vault=...`) para abrir la nota después de guardar
- Plugins de Obsidian companion
- Sincronización bidireccional (capturar, editar en Obsidian, actualizar desde la web)
- Web clipper versión completo (seleccionar qué parte capturar)

## Decisiones tomadas

| Aspecto | Decisión |
|---------|----------|
| Nombre de archivo | ✅ Descriptivo: `SAM - {titulo}.md` |
| Flujo de guardado | ✅ Directo a la vault (sin inbox) |
| Templates | ✅ Único, con campo `tipo` en frontmatter (taxonomía propia pendiente) |

## Pendiente: taxonomía `tipo`

Definir una taxonomía de tipos para clasificar las capturas (ej: `articulo`, `tutorial`, `documentacion`, `referencia`, `foro`, `nota`). Se usará en el frontmatter. Pendiente de diseñar.
