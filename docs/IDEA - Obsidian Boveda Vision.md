---
version: 0.2
fecha: 2026-07-08
estado: ACTIVO
descripcion: Visión estratégica de Samjoko Web Clipper como puerta de entrada web para la bóveda Obsidian. Resumen ejecutivo de decisiones de diseño y su mapeo al ROADMAP.
tipo: Visión
---

> [!summary] Resumen
> Samjoko Web Clipper no es un "capturador de páginas a Markdown genérico". Es una **puerta de entrada web para una bóveda Obsidian**. Cada captura debe llegar lista para integrarse: con metadata, contexto, enlaces y formato Obsidian nativo.

---

## Paradigma

**Extractor web → Bóveda Obsidian.** La extensión es el primer paso de un pipeline: capturar contenido web estructurado, convertirlo a Markdown compatible con Obsidian y guardarlo directo en la bóveda del usuario.

Todo el diseño se rige por esta regla: **la nota que sale de la extensión debe ser útil sin edición previa en Obsidian.**

---

## Pilares de diseño

### 1. Frontmatter YAML completo

La extensión genera un frontmatter alineado con el schema REF-Vivero (`docs/REF - WEB-CLIPPER.md`). Ejemplo de lo que genera la extensión:

```yaml
---
url_origen: https://ejemplo.com/articulo-profundo
fecha_captura: 2026-07-08
fecha_publicacion: 2026-03-15
autor: Autor del artículo
titulo: Título del artículo
tipo: fuente
tags: [desarrollo, javascript]
descripcion: Resumen breve del contenido
idioma: es
sitio_nombre: Ejemplo
tipo_contenido: articulo
imagen_destacada: https://ejemplo.com/imagen.jpg
tiempo_lectura: 12
notas_personales: Referencia para comparar con...
estado: ACTIVO
---
```

**Campos obligatorios**: `url_origen`, `fecha_captura`, `titulo`, `tipo`.
**Campos opcionales**: todos los demás (se omiten si no se detectan).
**Merge rule**: cuando Vivero procese el doc con NLP, añade `tags_auto`, `entidades`, `temas`, `palabras` sin pisar los campos de la extensión.

Ver schema completo: `docs/REF - WEB-CLIPPER.md §1`

### 2. Wikilinks (`[[...]]`)

- Los enlaces internos del artículo original se convierten a `[[wikilink]]` cuando el dominio coincide con la fuente
- Toggle en opciones: activar/desactivar wikilinks
- Resolver título de página enlazada: `[[Título real|texto ancla]`

**ROADMAP**: Fase 5.6 — Enlaces internos

### 3. Ruta en la bóveda

- Selector de carpeta de opciones → apunta directo a la vault
- Guardado directo, sin bandeja de entrada
- Subcarpetas configurables con creación automática de jerarquía

**ROADMAP**: Fase 3 (completada)

### 4. Plantillas de nota

- Archivos `.md` en subcarpeta `plantillas/` dentro de la extensión
- Variables: `{{titulo}}`, `{{fecha}}`, `{{url}}`, `{{tags}}`, `{{contenido}}`, `{{tipo}}`
- Selector de plantilla en opciones
- Integración con Templater (opcional)

**ROADMAP**: Fase 5.7 — Plantillas de nota

### 5. Limpieza y calidad de contenido

- Extraer solo el contenido relevante (artículo principal, no menús ni sidebar)
- Detección inteligente de raíz del contenido (heurísticas + scoring)
- Formato inline preservado: `**negrita**`, `*cursiva*`, `` `código` ``, `[enlaces](url)`
- Anti-duplicación: nodos anidados no se capturan dos veces
- Código inline vs bloque distinguido correctamente
- Lazy images, filtrado de decorativas, placeholder para embeds cross-origin
- Bloques de código con lenguaje detectado
- Tablas Markdown correctas (colspan/rowspan)

**ROADMAP**: Fases 5.9–5.14

### 6. Tags

- Extraer tags de la página (keywords, categorías)
- Tags predefinidos por dominio via `assets/reglas-sitio.json`
- Tags manuales desde el popup antes de guardar
- Tags auto-generados por NLP en Vivero (`tags_auto`) sin pisar manuales

**ROADMAP**: Fase 5.5 (NLP), Fase 5.11 (reglas por dominio)

### 7. Captura de conversaciones IA

Extractor dedicado para chats con IA (ChatGPT, Gemini, Claude, Copilot):
- Detecta patrones de chat, preserva código, filtra UI del chat
- Etiquetas de rol: `**Usuario**` / `**Asistente**`
- Metadatos: `tipo_contenido: conversacion_ia`, `modelo`, `plataforma`

**ROADMAP**: Fase 5.15 — **Prioridad alta**

### 8. Compatibilidad multi-navegador

- Chrome: completo, todas las APIs
- Brave: compatible (requiere flag FSA para guardado en bóveda)
- Firefox: futuro (requiere polyfill `browser.*`, manifiesto alternativo)

**ROADMAP**: Fase 5.16 (Brave), Fase 6 (Firefox)

---

## Decisiones tomadas

| Aspecto | Decisión | ROADMAP |
|---------|----------|---------|
| Frontmatter | Schema REF-Vivero completo (obligatorios: `url_origen`, `fecha_captura`, `titulo`, `tipo`) | 5.4 |
| Flujo de guardado | Directo a la vault (sin inbox) | 3 |
| Templates | Sistema de plantillas `.md` con variables | 5.7 |
| Wikilinks | Conversión automática + toggle en opciones | 5.6 |
| Tags por dominio | `assets/reglas-sitio.json` mantenible | 5.11 |
| Taxonomía `tipo` | `articulo`, `tutorial`, `documentacion`, `noticia`, `video`, `otro` | REF §1.1 |
| Nombre archivo | Descriptivo en `kebab-case` (convención del proyecto) | Convención |
| Chats IA | Extractor dedicado con preservación de código | 5.15 |
| Brave | Mismo repo, detección FSA, docs | 5.16 |

---

## Roadmap关联 (referencia rápida)

| Fase | Estado | Contenido |
|------|--------|-----------|
| 3 | ✅ Completada | Configuración, guardado en bóveda, selector carpeta |
| 5.4 | ✅ Completada | Frontmatter YAML completo (schema REF-Vivero) |
| 5.5 | Pendiente | Enriquecimiento semántico NLP (Vivero, no extensión) |
| 5.6 | Pendiente | Wikilinks internos |
| 5.7 | Pendiente | Plantillas de nota |
| 5.9 | Pendiente | Formato inline en Markdown |
| 5.10 | Pendiente | Anti-duplicación DOM |
| 5.11 | Pendiente | Detección inteligente de contenido principal |
| 5.12 | Pendiente | Metadatos enriquecidos |
| 5.13 | Pendiente | Multimedia e imágenes |
| 5.14 | Pendiente | Código inline vs bloque |
| 5.15 | Pendiente | Captura de conversaciones IA (prioridad alta) |
| 5.16 | Pendiente | Compatibilidad Brave |
| 6 | Futuro | Firefox, selección manual, vista previa, historial |

---

## Integración futura (largo plazo)

- **Obsidian URI** (`obsidian://open?vault=...`) para abrir la nota después de guardar
- Plugins de Obsidian companion
- Sincronización bidireccional (capturar, editar en Obsidian, actualizar desde la web)
- Web clipper completo (seleccionar qué parte capturar)
- Auto-etiquetado por IA
- Exportación a más formatos (HTML, PDF)
