---
version: 1.3
estado: activo
objetivo: RC-1.0
fase_activa: 4.5
fase: 4.5-accesibilidad, 5.2-pendiente, 5.9-pendiente, 5.10-pendiente, 5.11-pendiente, 5.12-pendiente, 5.13-pendiente, 5.14-pendiente
---

> [!summary] Resumen
> Hoja de ruta de Samjoko Web Clipper. Objetivo actual: **Release Candidate 1.0** — extensión funcional, accesible y lista para publicación. Las fases completadas (0–4, 5.1, 5.3, 5.4, 5.8) están archivadas en `docs/LOG - Historial de fases.md`.

---

## Fase 4.5 — Accesibilidad integral 🔧

Objetivo: que la extensión sea utilizable con lectores de pantalla, navegación exclusiva por teclado, y cumpla WCAG 2.1 nivel AA. **Requisito para RC 1.0.**

> [!info] Fuente única de verdad
> El detalle verificable y **los estados** viven en [`docs/CHK - Accesibilidad.md`](CHK%20-%20Accesibilidad.md). Aquí solo se resume el alcance: **no duplicar casillas en este documento.**

Ámbitos cubiertos:

- **Contraste y color** — ratios WCAG AA (4.5:1 texto normal, 3:1 texto grande) en los 4 temas, contraste en `:hover`/`:focus`/`:active`/`:disabled` e independencia del color.
- **Teclado** — recorrido completo con Tab en popup, opciones y editor; foco visible con `:focus-visible`; sin trampas de foco; atajos documentados.
- **Zoom y escalado** — correcto al 200% en popup, opciones y editor.
- **ARIA y roles** — estados de elementos (`aria-pressed`, `aria-expanded`, `aria-checked`), navegación con `aria-label`, diálogo de onboarding y regiones vivas.
- **Pruebas manuales** — flujo completo con NVDA/VoiceOver, navegación solo teclado y cambio de idioma.

---

## Fase 5 — Calidad de captura para Obsidian 🔧

Mejoras pendientes del pipeline de extracción para RC 1.0. Las sub-fases completadas (5.1, 5.3, 5.4, 5.8, 5.9-parcial, 5.10-parcial, 5.14-parcial) están en `docs/LOG - Historial de fases.md`.

**Principio rector**: cada bloque nuevo debe poder añadirse sin tocar el núcleo del extractor (patrón **estrategia/plugin** interno).

### 5.2 — Pipeline de extracción (pendientes)

- [ ] **Tablas con `rowspan`** → dejar la celda vacía en las filas siguientes
- [ ] **Detectar "leer más" / "seguir leyendo"** y cortar el contenido en ese punto _(riesgo de falsos positivos — pendiente de diseño)_

### 5.9 — Formato inline (pruebas)

- [ ] **Pruebas manuales de formato inline**: Wikipedia, Medium, documentación técnica con enlaces y código inline. Verificar que `**negrita**`, `*cursiva*`, `` `código` `` y `[enlaces](url)` se preservan correctamente.

### 5.10 — Anti-duplicación (pruebas)

- [ ] **Pruebas de regresión**: blockquotes anidados, listas dentro de citas, figuras con caption, código en párrafos. Verificar que no hay contenido duplicado.

### 5.11 — Detección inteligente de contenido principal

Mejorar la selección de raíz más allá de `<article>`.

- [ ] **Función `detectarRaizContenido(documento)`** en `nucleo-extraccion.js` con cascada:
  1. `<article>` (si existe)
  2. `main`, `[role="main"]`, `.entry-content`, `.post-content`, `#content`
  3. **Scoring de candidatos**: puntuar contenedores por densidad de texto, ratio párrafos/enlaces, presencia de H1
  4. Fallback a `document.body`
- [ ] **Reglas por dominio** (nivel 3): archivo `assets/reglas-sitio.json` mantenible para sitios frecuentes
- [ ] **Readability.js embebido** (nivel 4, opcional): fallback cuando heurísticas fallen (~30-45 KB)

### 5.12 — Metadatos enriquecidos (sin NLP)

Ampliar `extraerMetadatos()` sin dependencias externas.

- [ ] **`url_origen` canónica**: extraer de `<link rel="canonical">` con fallback a `document.URL`
- [ ] **`fecha_publicacion` desde `<time>`**: elementos `<time datetime="...">` en el artículo
- [ ] **JSON-LD `@graph`**: parsear múltiples scripts y grafos anidados (no solo el primer `<script type="application/ld+json">`)
- [ ] **Twitter Cards**: `twitter:title`, `twitter:description`, `twitter:image` como fallback de OpenGraph
- [ ] **Detección idioma heurística**: ratio de palabras frecuentes es/en como fallback de `<html lang>`

### 5.13 — Multimedia e imágenes

Resolver URLs relativas, lazy-load y filtrar ruido visual.

- [ ] **Resolver URLs relativas** en cuerpo Markdown (no solo metadatos): relativizar contra `document.baseURI`
- [ ] **Soporte lazy-load**: leer `data-src`, `data-lazy-src`, primer valor de `srcset`
- [ ] **Filtrar imágenes decorativas**: `alt=""`, dimensiones 1×1, patrones de tracking
- [ ] **Placeholder para embeds cross-origin**: YouTube, Twitter/X, Gist con bloque semántico `> [!embed] URL`

### 5.14 — Código inline vs bloque (pendiente)

- [ ] **Tablas layout**: detectar tablas de presentación (`role="presentation"`) y omitir o degradar

---

## Post-RC 1.0 — Funcionalidades diferidas

Estas funcionalidades están implementadas pero se diferirán hasta después del RC 1.0 por prioridad o complejidad.

### 5.5 — Enriquecimiento semántico (NLP ligero)

Campos que genera el pipeline NLP (Vivero, no la extensión). Ref: `docs/REF - WEB-CLIPPER.md §2`.

- [ ] **`tags_auto`**: keywords extraídas del contenido mediante heurísticas (iteración 1) o CompromiseJS (iteración 2). Merge rule: se fusionan con `tags` en UI sin pisarlas
- [ ] **`entidades`**: personas, lugares, organizaciones detectadas por NER. Iteración 1: heurísticas (nombres propios mayúscula no inicio de frase). Iteración 2: CompromiseJS POS tagging
- [ ] **`temas`**: conceptos principales del contenido. TF-IDF o diccionario interno
- [ ] **`palabras`**: word count preciso del contenido. Refina el `tiempo_lectura` que la extensión calcula al capturar
- [ ] **`autogenerado_por`**: marca `vivero-compromise` indicando que el documento fue analizado por el pipeline NLP
- [ ] **CompromiseJS** (iteración 2, ~250kB descargado en `componentes/procesador-lenguaje.js`):
  - POS tagging para identificar mejor nombres propios, verbos y adjetivos
  - Análisis TF-IDF para generar keywords relevantes → `tags_auto` y `temas`
  - Detección de idioma del contenido (fallback para `idioma` de la extensión)
  - Generación de resumen automático (extractivo: primeras frases con alto score)
- [ ] **Diccionario de tecnologías/términos**: archivo JSON en `assets/diccionario-entidades.json` mantenible, con categorías (lenguajes, frameworks, herramientas, conceptos)

### 5.6 — Enlaces internos (`[[wikilinks]]`)

- [ ] **Convertir enlaces absolutos a `[[wikilinks]]`** cuando el dominio coincida con la fuente actual
- [ ] **Resolver título de página enlazada**: fetch opcional al vuelo para obtener el título real y generar `[[Título real|texto ancla]]`
- [ ] **Toggle en opciones**: activar/desactivar wikilinks, configurar patrón de dominios para enlazar internamente

### 5.7 — Plantillas de nota

- [ ] **Sistema de plantillas**: archivos `.md` en una subcarpeta `plantillas/` dentro de la extensión
- [ ] **Variables de plantilla**: `{{titulo}}`, `{{fecha}}`, `{{url}}`, `{{tags}}`, `{{contenido}}`, `{{tipo}}`
- [ ] **Selector de plantilla en opciones**: elegir qué plantilla usar por defecto (incluye frontmatter + estructura base)
- [ ] **Integración con Templater**: opción de pre-procesar con sintaxis `{{title}}` de Templater si se detecta

### 5.15 — Captura de conversaciones IA (chats)

Extractor especializado para conversaciones con IA: Gemini, ChatGPT, Claude, Copilot y similares.

**Plataformas objetivo**: ChatGPT (chatgpt.com), Gemini (gemini.google.com), Claude (claude.ai), Copilot (copilot.microsoft.com).

- [ ] **Extractor `extractor-chats-ia.js`** (`componentes/extraccion/`):
  - Detectar patrones de chat: `[data-message-author-role]`, `.message-content`, `.conversation-turn`, `[data-testid*="message"]`
  - Etiquetas: `div, article, section` (solo cuando contenga patrones de chat detectados)
  - `esAplicable()`: verificar que el elemento o su padre contenga marcadores de chat IA
- [ ] **Preservación de código**: bloques ` ``` ` generados por el chat se capturan con lenguaje detectado
- [ ] **Filtrado de UI del chat**: excluir botones "copiar código", votos, thinking/reasoning expandible
- [ ] **Etiquetas de rol en Markdown**: `**Usuario**` / `**Asistente**` antes de cada bloque de mensaje
- [ ] **Metadatos extra**: `tipo_contenido: conversacion_ia`, `modelo`, `plataforma`
- [ ] **Pruebas manuales**: capturar conversaciones reales en cada plataforma

### 5.16 — Compatibilidad Brave

La extensión funciona en Brave (basado en Chromium, MV3) con un solo `manifest.json`. La principal diferencia es la File System Access API desactivada por defecto.

- [ ] **Probar extensión en Brave stable**: popup, side panel, captura rápida, guardado FSA
- [x] **Detección de FSA no disponible**: aviso en opciones (`#avisoModoDescarga`) y popup (`#infoCarpeta.aviso`) cuando `typeof window.showDirectoryPicker === 'undefined'`; el background enruta el guardado a la Downloads API (`FSA_DISPONIBLE` en `trabajador-fondo.js`)
- [ ] **Aviso específico Brave**: instrucciones del flag `brave://flags/#file-system-access-api`
- [x] **Fallback UX**: guardar como descarga (Downloads API) en editor y popup, manteniendo Copiar/Descargar cuando guardado en carpeta no esté disponible
- [ ] **Documentación**: sección Brave en README + `docs/GUIA - Instalacion Brave.md`

---

## Fase 6 — Madurez

- [ ] Migrar a Firefox _(paquete listo: `empaquetar-firefox.ps1` (Windows) / `empaquetar-firefox.sh` (Linux/macOS) → `dist-firefox/` + `dist-firefox.xpi`; background como event page, `sidebar_action`, guardado por Downloads API. Validado: `web-ext lint` = **0 errores** y carga temporal verificada en Firefox 156; ref: `docs/GUIA - Instalacion Firefox.md`. Pendiente: prueba manual del flujo completo, **`sidePanel.open` no soportado en Firefox** (usar `chrome.sidebarAction.open()`) y firma para AMO)_
- [ ] Seleccionar elementos específicos de la página (clic para elegir)
- [ ] Vista previa del Markdown renderizado
- [ ] Historial local de capturas
- [ ] Exportación por lote

---

## Futuro remoto

- Auto-etiquetado por IA
- Sincronización bidireccional (web ↔ Vivero)
- Soporte para más formatos de exportación (HTML, PDF)
- Integración con APIs de lectura posterior (Pocket, Readwise)
