---
version: 0.8
estado: en-progreso
fase: 3-completada
---

> [!summary] Resumen
> Hoja de ruta de Samjoko Web Clipper. El objetivo final es ser el companion de navegador del ecosistema Vivero: capturar contenido web, convertirlo a Markdown estructurado y llevarlo a la bóveda de conocimiento.

---

## Fase 0 — Saneamiento

Fundamentos técnicos antes de seguir construyendo. Sin esto, cada feature nueva acumula deuda.

- [x] **i18n foundation**: `default_locale` en manifest, carpeta `_locales/`, `chrome.i18n.getMessage()` en todos los JS
- [x] **Service Worker robusto**: corrección de race condition (top-level await → promesa de inicialización)
- [x] **Bug título de archivo**: ahora usa el título real de la página web, no el del popup
- [x] **CSS unificado**: extraer `assets/comun.css` con estilos compartidos (body, button, mensajes)
- [x] **Variable `--texto-boton`** en `themes.css` — los botones usan `color: #fff` hardcodeado
- [x] **Refactor content script**: `extraerMarkdown()` devuelve `{bloques, metadata}` en vez de string plano
- [x] **`BarraProgreso` portable**: su CSS se mueve a `componentes/barra-progreso.css`

---

## Fase 1 — Popup 3 iconos + captura rápida

Rediseño del popup con 3 botones-icono SVG inline (Heroicons outline, `currentColor`).

- [x] Layout de 3 iconos: Captura rápida, Captura con revisión, Configuración
- [x] Captura rápida: extrae → barra de progreso → guarda directo a la bóveda
- [x] Notificación toast de éxito/error (reemplaza `mensajeEstado`)
- [x] Tooltips en cada icono
- [x] Barra de progreso con texto descriptivo durante guardado
- [x] Atajo de teclado (`commands` en manifest)

---

## Fase 2 — Editor por bloques (Side Panel)

Panel lateral de Chrome que muestra los bloques extraídos para revisar antes de guardar.

- [x] `sidePanel` en `manifest.json`, página `editor-bloques/editor.html`
- [x] Content script devuelve bloques individuales (párrafos, headers, listas, código, tablas, imágenes)
- [x] Cada bloque: checkbox para incluir/excluir + preview del contenido
- [x] Markdown final se regenera al marcar/desmarcar bloques
- [x] Metadatos detectados: autor, fecha (de meta tags), título limpio
- [x] Botones: Guardar en bóveda, Descargar, Copiar, Cancelar
- [x] Barra de progreso durante guardado
- [x] **Refinamiento extractor**: colapso de espacios redundantes y filtro de bloques vacíos/puntuación
- [x] **Botón re-escaneo** (⟳) en side panel para recapturar al cambiar de página
- [x] **host_permissions** (`<all_urls>`) para que el side panel funcione al navegar entre pestañas
- [x] **Corrección i18n**: voseo argentino → español de España en todos los strings
- [x] **Enlaces solo de bloques filtrados**: recolectados de contenido válido + toggleables en side panel (desmarcados por defecto)
- [x] **Scoping a `<article>`**: extracción limitada al contenido semántico si existe la etiqueta

---

## Fase 3 — Configuración completa

Página de opciones expandida con todas las preferencias del usuario.

- [x] **Sistema de configuración global**: módulo `componentes/configuracion.js` con `chrome.storage.sync`, valores por defecto y escucha de cambios en tiempo real
- [x] **i18n con override de idioma**: módulo `componentes/traduccion.js` con función `t()` que carga el `messages.json` del idioma elegido vía `fetch()`, con fallback a `chrome.i18n.getMessage()`
- [x] **Idioma**: selector ES / EN en página de opciones
- [x] **Apariencia**: selector de tema visual (pausado — solo Samjoko por defecto)
- [x] **Bóveda**: selector de carpeta + subcarpetas configurables (con creación automática de jerarquía al guardar)
- [x] **Formato de nota**: toggle para incluir frontmatter YAML (fecha, fuente, título, autor, fecha_publicación)
- [x] **Service worker**: mensajes CRUD de configuración (`obtenerConfiguracion`, `guardarConfiguracion`, `restablecerConfiguracion`)
- [x] **Popup y editor**: lectura de configuración al abrirse, aplicación del tema y traducción correctos
- [x] **Frontmatter YAML** en captura rápida (popup y atajo de teclado) y en editor de bloques

---

## Fase 4 — Experiencia de usuario (UX/UI)

Refinamientos de usabilidad, feedback visual y accesibilidad en todos los componentes.

### Popup
- [ ] **Iconos con texto visible**: rediseñar el layout del popup para que cada botón muestre icono + etiqueta de texto siempre visible (no solo en tooltip hover). Layout tipo tarjeta o fila con icono y texto.
- [ ] **Toast expandible**: en captura rápida, mostrar un mini-resumen del Markdown obtenido en un toast que se pueda expandir
- [ ] **Estado de carpeta**: indicar visualmente si hay carpeta configurada directamente en el popup (sin tener que abrir opciones)

### Side panel (editor de bloques)
- [ ] **Estado vacío**: cuando no hay contenido, mostrar ilustración/mensaje amigable con icono en vez de un toast de error
- [ ] **Seleccionar / Deseleccionar todos**: botón toggle para marcar o desmarcar todos los bloques de una vez
- [ ] **Filtro por tipo de bloque**: permitir filtrar bloques por tipo (solo headings, solo listas, solo código, etc.)
- [ ] **Contador de palabras y bloques**: en la vista previa, mostrar estadísticas (palabras, párrafos, caracteres)
- [ ] **Reordenar bloques por arrastre**: drag & drop para cambiar el orden de los bloques seleccionados

### Onboarding
- [ ] **Mini-tutorial primera instalación**: guía de 3 pasos al abrir la extensión por primera vez (1. Configurar carpeta, 2. Capturar página, 3. Revisar en editor)
- [ ] **Tooltips más descriptivos** en los iconos del popup y editor

### Accesibilidad
- [ ] **Navegación por teclado**: soporte completo de Tab/Enter/Espacio en el editor de bloques y popup
- [ ] **Focus states visibles**: estilos de foco en todos los elementos interactivos
- [ ] **Contraste**: verificar y ajustar ratios de contraste en los 4 temas

### Opciones y feedback
- [ ] **Vista previa de tema**: cuando se reactive el selector, mostrar una previsualización del tema antes de aplicarlo
- [ ] **Feedback visual más claro** al guardar configuración (animación de check en el botón o sección)

---

## Fase 5 — Calidad de captura para Obsidian

Mejora del pipeline de extracción y generación de notas pensando en una bóveda Obsidian. 

**Principio rector**: cada bloque nuevo debe poder añadirse sin tocar el núcleo del extractor (patrón **estrategia/plugin** interno).

### 5.1 — Arquitectura de extractores extensible

- [ ] **Refactor del pipeline de extracción**: separar `extractor-contenido.js` en módulos especializados dentro de `componentes/extraccion/`:
  - `nucleo-extraccion.js` — orquestador que recorre el DOM y delega en extractores específicos
  - `extractor-texto.js` — párrafos, headings (ya funciona)
  - `extractor-listas.js` — `<ul>`, `<ol>`, `<dl>` (ya funciona)
  - `extractor-codigo.js` — `<pre>`, `<code>` (ya funciona)
  - `extractor-tablas.js` — `<table>` con colspan/rowspan (mejorar)
  - `extractor-citas.js` — `<blockquote>`, `<q>` (nuevo)
  - `extractor-multimedia.js` — `<figure>`, `<img>`, `<video>` (nuevo)
  - `extractor-enlaces.js` — enlaces del contenido válido (ya funciona)
- [ ] **Registro de extractores**: que cada extractor se auto-registre en el núcleo, de forma que añadir uno nuevo solo sea crear el archivo y registrar su tipo

### 5.2 — Pipeline de extracción (niveles 2 y 3)

- [ ] **Nivel 2 — Estructura semántica completa**:
  - Tablas complejas con `colspan`/`rowspan` → tablas Markdown con celdas fusionadas
  - Citas `<blockquote>` anidadas → blockquotes Markdown anidados (`>` / `>>`)
  - Definiciones `<dl>` → listas de definición Markdown o formato `término: descripción`
  - Figuras `<figure>` + `<figcaption>` → imagen con pie de foto
  - Fragmentos de código con `data-language` o clase → bloques de código con lenguaje
- [ ] **Nivel 3 — Inteligencia contextual**:
  - Detectar y excluir zonas de ruido (comentarios, relacionados, sidebar) incluso sin marcado semántico, por análisis de densidad de enlaces y posición en el layout
  - Normalización jerárquica de headings: si aparece un H3 sin H2 predecesor, subirlo a H2
  - Detectar "leer más" / "seguir leyendo" y cortar el contenido en ese punto

### 5.3 — Tablas Markdown correctas

- [ ] **Mejorar `extractor-tablas.js`** para manejar:
  - `colspan` → celdas fusionadas horizontalmente (repetir celda vacía en las columnas sobrantes)
  - `rowspan` → dejar la celda vacía en las filas siguientes
  - Tablas anidadas → representar como Markdown plano o ignorar la anidación
  - Encabezados `<thead>` vs cuerpo `<tbody>` → separación correcta con línea `|---|`
  - Celdas vacías correctamente representadas
  - Tablas sin `thead` (solo filas de datos) → inferir que la primera fila es cabecera si todas son `<th>`
- [ ] **Vista previa en editor**: mostrar la tabla formateada correctamente en el bloque de vista previa

### 5.4 — Frontmatter YAML completo (Schema REF-Vivero)

Implementar el schema completo definido en `docs/REF - WEB-CLIPPER.md`. La extensión genera estos campos al capturar; Vivero añade los suyos propios (NLP) sin pisarlos.

**Campos obligatorios de la extensión:**
- [ ] **`url_origen`**: `document.URL` o `location.href` — URL canónica de la página
- [ ] **`fecha_captura`**: `new Date().toISOString().split('T')[0]` — fecha del clip
- [ ] **`titulo`**: `document.title` sanitizado (quitar emojis, saltos de línea, HTML entities)
- [ ] **`tipo: fuente`**: valor fijo para todo web clipping (no se detecta por dominio)

**Campos opcionales de la extensión:**
- [ ] **`autor`**: extraer de `<meta name="author">` o `<meta property="article:author">` (omitir si no existe)
- [ ] **`fecha_publicacion`**: extraer de `<meta property="article:published_time">`, `<meta name="date">`, elementos `<time>`, o schema.org JSON-LD (omitir si no se encuentra)
- [ ] **`descripcion`**: `<meta name="description">` o primer párrafo relevante, truncado a ~200 caracteres (omitir si no hay)
- [ ] **`tags`**: input del usuario al clipear; omitir campo entero si no añade ninguno
- [ ] **`idioma`**: `<html lang="...">` → código ISO 639-1 minúscula (`es`, `en`, `pt`). Fallback: detección por contenido futura (CompromiseJS). Omitir si no se detecta
- [ ] **`sitio_nombre`**: `<meta property="og:site_name">` → nombre del sitio. Fallback: dominio de `url_origen` sin `www.` ni path (ej: `calnewport.com`). Omitir si no se puede determinar
- [ ] **`tipo_contenido`**: mapear de `<meta property="og:type">` o schema.org `@type`:
  - `article`/`blogposting`/`newsarticle` → `articulo`
  - `tutorial`/`howto` → `tutorial`
  - `documentation`/`techarticle` → `documentacion`
  - `news`/`newscollection` → `noticia`
  - `video`/`videoobject` → `video`
  - cualquier otro → `otro`. Omitir si no se detecta
- [ ] **`imagen_destacada`**: `<meta property="og:image">` o `<link rel="image_src">`. Validar que es URL absoluta (relativizar contra `url_origen` si es relativa). Omitir si no existe
- [ ] **`tiempo_lectura`**: cálculo `Math.ceil(bodyText.split(/\s+/).length / 238)` (238 wpm). Omitir si no se puede calcular
- [ ] **`notas_personales`**: textarea en popup de captura. Omitir campo entero si el usuario no escribe nada
- [ ] **`estado: ACTIVO`**: valor por defecto (opcional)

**Reglas de formato y compatibilidad:**
- [ ] **Formato fecha estricto `YYYY-MM-DD`**: si solo se dispone de datetime completo, truncar a fecha
- [ ] **Compatibilidad hacia atrás (parser K1)**: debe aceptar documentos legacy sin frontmatter o con solo `fecha:`. La extensión **no debe** generar ese formato legacy
- [ ] **Sanitización de `titulo`**: convertir a texto plano (quitar emojis, saltos de línea, HTML entities)
- [ ] **Escape de caracteres especiales Markdown** en títulos y metadatos (barras, pipes, corchetes)

**Schema completo de ejemplo (lo que genera la extensión):**
```yaml
---
url_origen: <string>           # obligatorio
fecha_captura: <YYYY-MM-DD>    # obligatorio
fecha_publicacion: <YYYY-MM-DD> # si disponible
autor: <string>                 # si disponible
titulo: <string>                # obligatorio
tipo: fuente                    # fijo
tags: [<string>, ...]           # manuales del usuario
descripcion: <string>           # opcional
idioma: <string>                # opcional, ISO 639-1
sitio_nombre: <string>          # opcional
tipo_contenido: <string>        # opcional (articulo/tutorial/documentacion/noticia/video/otro)
imagen_destacada: <string>      # opcional, URL
tiempo_lectura: <integer>       # opcional, minutos
notas_personales: <string>      # opcional
estado: ACTIVO                  # opcional
---
```

- [ ] **Plantilla de frontmatter configurable**: usuario puede definir qué campos opcionales incluir y sus valores por defecto

**Merge rule (tags manuales vs NLP):** cuando el pipeline NLP procese el documento, los campos generados por la extensión **no se sobrescriben**:
  - `tags` (manual del usuario) y `tags_auto` (NLP) coexisten; en UI se fusionan, pero cada grupo persiste en su campo
  - `tipo: fuente` nunca se sobrescribe (el usuario puede cambiarlo manualmente después a `síntesis`/`entidad`/`concepto`/`moc`)
  - El resto de campos de origen (`url_origen`, `autor`, `idioma`, `sitio_nombre`, `tipo_contenido`, `imagen_destacada`, `tiempo_lectura`, `notas_personales`) son inmutables por el NLP

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

### 5.8 — Limpieza y formateo de salida

- [ ] **Sanitización de URLs**: eliminar parámetros de tracking (`utm_*`, `fbclid`, `ref=*`)
- [ ] **Opciones de wrapping**: hard-wrap (80/120 columnas) vs soft-wrap configurable
- [ ] **Normalización de espacios**: colapsar espacios múltiples, eliminar espacios al final de línea

---

## Fase 6 — Madurez

- [ ] Migrar a Firefox
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
