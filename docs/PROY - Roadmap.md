---
version: 1.1
estado: en-progreso
fase: 4-completada, 4.5-completada, 5.1-completada, 5.2-mejoras, 5.3-tablas, 5.4-completada, 5.8-completada, 5.9-completada, 5.10-completada, 5.11-pendiente, 5.12-pendiente, 5.13-pendiente, 5.14-completada, 5.15-pendiente, 5.16-pendiente
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
- [x] **Eliminación de código legacy**: auditoría completa de todo el proyecto para detectar variables, funciones, parámetros, bloques condicionales y alias de compatibilidad que hayan quedado huérfanos tras los refactors. Eliminarlos cuando sea seguro. Incluye: alias `t` → `traducir` si ya ningún código usa `t`, funciones sin llamar, parámetros sin uso, compatibilidad hacia atrás ya innecesaria.

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

## Fase 3.5 — Seguridad y Hardening

Refuerzo de la postura de seguridad de la extensión contra abusos, inyección de código y ataques de supply-chain. Resultado de auditoría de seguridad (junio 2026).

### 3.5.1 — Validación de mensajes y orígenes

- [x] **Verificar `sender` en `onMessage`** (`trabajador-fondo.js`): validar que los mensajes provienen de la extensión (popup, editor, options), no de content scripts externos. Usar `remitente.url` con patrón `chrome-extension://` o comparar `remitente.id` contra pestañas internas conocidas
- [x] **Filtrar acciones por contexto**: solo el popup y editor deben poder ejecutar `guardarConfiguracion` / `restablecerConfiguracion`; el content script solo debe poder responder a `extraerMarkdown`
- [x] **Token interno de sesión**: generar un token aleatorio al iniciar el service worker y exigirlo en mensajes sensibles (guardado, configuración)

### 3.5.2 — Protección contra path traversal

- [x] **Validar subcarpeta** (`trabajador-fondo.js:32`): rechazar partes de la ruta que contengan `..`, `~`, o caracteres especiales del sistema de archivos
- [x] **Sanitizar nombre de archivo** (`base-datos.js:49`): limitar estrictamente a `[a-z0-9áéíóúñü\s-]` + extensión; rechazar nombres vacíos o que empiecen por punto
- [x] **Límite de longitud de ruta**: evitar acumulación de subcarpetas anidadas que excedan límites del sistema de archivos

### 3.5.3 — Sanitización de contenido extraído

- [x] **Filtrar URIs peligrosas en `extractor-multimedia.js`**: validar que `src` de imágenes no contenga `javascript:`, `data:text/html`, o `vbscript:` antes de incluirlo en markdown
- [x] **Sanitizar `title`/`src` de iframes** (`extractor-iframes.js:157-158`): escapar caracteres markdown antes de interpolar en el string de salida
- [x] **Sanitizar campos YAML** (`base-datos.js:66-126`): usar `escaparValorYaml()` de forma consistente en TODOS los campos del frontmatter, no solo algunos. Escapar saltos de línea, dos puntos sin comillas, y caracteres YAML reservados
- [x] **Validar URLs de metadatos**: verificar que `url_origen`, `imagen_destacada` y demás URLs sean `http://` o `https://` antes de incluirlas

### 3.5.4 — CSP y manifest

- [x] **Declarar `content_security_policy` explícito** en `manifest.json`: reforzar las restricciones por defecto de MV3
- [x] **Revisar `host_permissions`**: documentar por qué `<all_urls>` es necesario; considerar si se puede acotar en el futuro
- [ ] **Auditar `web_accessible_resources`**: si se añaden en el futuro, asegurar que no expongan archivos internos a sitios web (no hay WAR definidos actualmente)

### 3.5.5 — Almacenamiento seguro

- [ ] **Cifrar datos sensibles en `chrome.storage`**: si en el futuro se guardan tokens o credenciales, usar cifrado antes de almacenar (no aplica actualmente)
- [x] **Validar integridad de configuración**: al leer de `chrome.storage.sync`, verificar que los campos tienen tipos esperados (string, boolean, array) antes de usarlos
- [x] **Límites de tamaño**: rechazar configuraciones o contenido que exceda límites razonables (previene abuso de almacenamiento)

---

## Fase 4 — Experiencia de usuario (UX/UI)

Refinamientos de usabilidad, feedback visual y accesibilidad en todos los componentes.

### Popup
- [x] **Iconos con texto visible**: cada botón en el popup ya muestra icono SVG + etiqueta de texto siempre visible (`<span class="etiqueta-boton">` dentro de cada `<button>`). Implementado en HTML+CSS+JS desde fase 1.
- [x] **Embellecer popup**: sombras en botones (`box-shadow: var(--sombra-caja)`), bordes pulidos (`border-radius: 12px`), foco visible (`:focus-visible`), separación visual mejorada. Info carpeta con sombra y colores de estado. Notas con borde superior separador.
- [x] **Toast expandible**: en captura rápida, mostrar un mini-resumen del Markdown obtenido en un toast que se pueda expandir
- [x] **Estado de carpeta**: indicador visual en el popup con clase `.ok`/`.error` y texto descriptivo. Implementado en `actualizarInfoCarpeta()` en ventana.js.

### Side panel (editor de bloques)
- [x] **Estado vacío**: when no contenido, mostrar icono + mensaje amigable en `#zonaVacia` con card, sombra y borde. Implementado desde fase 2.
- [x] **Seleccionar / Deseleccionar todos**: botón toggle en `#cabeceraBloques` con texto dinámico. Implementado desde fase 2.
- [x] **Filtro por tipo de bloque**: permitir filtrar bloques por tipo (solo headings, solo listas, solo código, etc.)
- [x] **Contador de palabras y bloques**: en la vista previa, mostrar estadísticas (palabras, párrafos, caracteres)
- [x] **Reordenar bloques por arrastre**: drag & drop para cambiar el orden de los bloques seleccionados

### Onboarding
- [x] **Mini-tutorial primera instalación**: guía de 3 pasos al abrir la extensión por primera vez (1. Configurar carpeta, 2. Capturar página, 3. Revisar en editor)
- [x] **Tooltips más descriptivos**: popup con `title` + atajo teclado en captura rápida. Editor con `title` en reescanear y botones de acción. Tooltips visibles con texto en etiqueta-boton popup y `.tooltip-editor` hover en editor.

### Opciones y feedback
- [x] **Vista previa de tema**: cuando se reactive el selector, mostrar una previsualización del tema antes de aplicarlo (el selector ya aplica el tema en tiempo real)
- [x] **Feedback visual al guardar configuración**: animación `pulso-guardado` con `scale(1.02)` + borde acento + sombra. Corregido error de variable `--color-acento-rgb` inexistente.

---

## Fase 4.5 — Accesibilidad integral

Auditoría y mejora de accesibilidad en todos los componentes de la extensión. El objetivo es que la extensión sea utilizable con lectores de pantalla, navegación exclusiva por teclado, y cumpla un nivel AA de WCAG 2.1.

### Auditoría general
- [x] **Auditar estructura HTML semántica**: popup con `<header>` + `<main>` + `<nav>`, opciones con `<main>` + `<section>` + `<footer>`, editor con `<header>` + `<main>`, onboarding con `role="dialog"`. Sin `<aside>` porque no hay contenido complementario.
- [x] **Jerarquía de encabezados**: popup `<h1>`, opciones `<h1>` + `<h3>`, editor `<h1>` + `<h2>`. Sin saltos de nivel.
- [x] **Landmarks ARIA**: `<nav id="barraAcciones">` con `aria-label` dinámico. Secciones semánticas nativas (`<main>`, `<section>`, `<header>`, `<footer>`) sin necesidad de roles extra.
- [x] **Idioma declarado**: `lang` dinámico en `document.documentElement.lang` al cambiar idioma en los 3 componentes (ventana, opciones, editor).
- [ ] **Zoom y escalado**: comprobar que la extensión funciona correctamente con zoom al 200% sin recortes ni solapamientos

### Contraste y color
- [ ] **Verificar ratios de contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande)** en los 4 temas: samjoko, vivero, nautilus, akkoro
- [ ] **Contraste en estados**: `:hover`, `:focus`, `:active`, `:disabled` deben mantener contraste suficiente
- [ ] **Independencia del color**: asegurar que ninguna información se transmite solo mediante color (ej. iconos de estado deben tener texto o icono adicional)

### Teclado
- [ ] **Navegación por teclado completa**: Tab debe recorrer todos los elementos interactivos en orden lógico en popup, opciones y editor de bloques
- [x] **Trampas de foco**: onboarding oculta el contenido trasero (`display: none`), sin elementos enfocables fuera del diálogo. Foco inicial en botón Siguiente.
- [x] **Atajos de teclado documentados**: listados en el pie de página de opciones (`#textoAtajos`) y en `title` del botón captura rápida del popup.

### Lectores de pantalla
- [x] **Textos alternativos en iconos**: todos los SVG decorativos tienen `aria-hidden="true"`. Iconos funcionales dentro de botones con `aria-label`.
- [x] **Mensajes de estado dinámicos**: `#zonaToast` con `aria-live="polite"`, barra de progreso con `role="progressbar"` + `aria-live="polite"`.
- [x] **Campos de formulario**: todos los `<input>`, `<select>` y `<textarea>` con `<label for="...">` asociado.
- [x] **Anuncio de cambios de contenido**: `#infoCarpeta` con `role="status"`, `#zonaProgreso` con `aria-live="polite"`.
- [x] **Descripciones accesibles para onboarding**: `aria-describedby="onboardingPasoDescripcion"` en el diálogo, texto del paso actual siempre presente.

### ARIA y roles
- [x] **Roles explícitos en navegación**: `<nav id="barraAcciones">` con `aria-label` dinámico.
- [ ] **Estado de elementos interactivos**: botones con `aria-pressed`, `aria-expanded` o `aria-disabled` según corresponda
- [x] **Diálogos y overlays**: onboarding con `role="dialog"`, `aria-modal="true"`, `aria-label`, foco inicial gestionado.
- [x] **Regiones vivas**: `#zonaToast` con `aria-live="polite"`, `#zonaProgreso` con `aria-live="polite"`, barra de progreso con `role="progressbar"`.

### Documentación y pruebas
- [x] **Checklist de accesibilidad**: `docs/CHK - Accesibilidad.md` generado con items verificables por componente y criterio WCAG
- [ ] **Prueba con lectores de pantalla**: verificar flujo completo (abrir popup → capturar → revisar en editor → guardar) con NVDA o VoiceOver
- [ ] **Prueba solo teclado**: completar todas las acciones sin usar el ratón

---

## Fase 5 — Calidad de captura para Obsidian

Mejora del pipeline de extracción y generación de notas pensando en una bóveda Obsidian. 

**Principio rector**: cada bloque nuevo debe poder añadirse sin tocar el núcleo del extractor (patrón **estrategia/plugin** interno).

### 5.1 — Arquitectura de extractores extensible

- [x] **Refactor del pipeline de extracción**: separar `extractor-contenido.js` en módulos especializados dentro de `componentes/extraccion/`:
  - `nucleo-extraccion.js` — orquestador que recorre el DOM y delega en extractores específicos
  - `extractor-texto.js` — párrafos, headings
  - `extractor-listas.js` — `<ul>`, `<ol>`, `<dl>`
  - `extractor-codigo.js` — `<pre>`, `<code>`
  - `extractor-tablas.js` — `<table>` con colspan/rowspan (mejorar)
  - `extractor-citas.js` — `<blockquote>`, `<q>`
  - `extractor-multimedia.js` — `<figure>`, `<img>`, `<video>`
  - `extractor-enlaces.js` — enlaces del contenido válido (integrado en `nucleo-extraccion.js`)
  - `extractor-iframes.js` — captura de contenido dentro de `<iframe>` same-origin (recursivo, fusiona bloques y metadatos)
- [x] **Registro de extractores**: que cada extractor se auto-registre en el núcleo, de forma que añadir uno nuevo solo sea crear el archivo y registrar su tipo

### 5.2 — Pipeline de extracción (niveles 2 y 3)

- [x] **Tablas complejas con `colspan`** → celdas fusionadas horizontalmente (repetir celda vacía en las columnas sobrantes)
- [ ] **Tablas con `rowspan`** → dejar la celda vacía en las filas siguientes
- [x] **Citas `<blockquote>` anidadas** → blockquotes Markdown anidados (`>` / `>>`)
- [x] **Definiciones `<dl>`** → listas de definición Markdown o formato `término: descripción`
- [x] **Figuras `<figure>` + `<figcaption>`** → imagen con pie de foto
- [x] **Fragmentos de código con `data-language` o clase** → bloques de código con lenguaje
- [x] **Soporte de iframes same-origin**: recorrer `document.querySelectorAll('iframe')`, acceder a `contentDocument`, y extraer bloques + metadatos de cada uno. Fusionar resultados. Los iframes cross-domain (YouTube, Twitter) quedan fuera por seguridad del navegador
- [ ] **Nivel 3 — Inteligencia contextual**:
  - [x] Detectar y excluir zonas de ruido por patrones en clases/IDs y densidad de enlaces
  - [x] Normalización jerárquica de headings: si aparece un H3 sin H2 predecesor, subirlo a H2
  - [ ] Detectar "leer más" / "seguir leyendo" y cortar el contenido en ese punto _(riesgo de falsos positivos — pendiente de diseño)_

### 5.3 — Tablas Markdown correctas

- [x] **`colspan`** → celdas fusionadas horizontalmente (repetir celda vacía en las columnas sobrantes)
- [x] **`rowspan`** → dejar la celda vacía en las filas siguientes
- [x] **Tablas anidadas** → representar como Markdown plano o ignorar la anidación
- [x] **Encabezados `<thead>` vs cuerpo `<tbody>`** → separación correcta con línea `|---|`
- [x] **Celdas vacías correctamente representadas**
- [x] **Tablas sin `thead`** (solo filas de datos) → inferir que la primera fila es cabecera si todas son `<th>`

### 5.4 — Frontmatter YAML completo (Schema REF-Vivero)

Implementar el schema completo definido en `docs/REF - WEB-CLIPPER.md`. La extensión genera estos campos al capturar; Vivero añade los suyos propios (NLP) sin pisarlos.

**Campos obligatorios de la extensión:**
- [x] **`url_origen`**: `document.URL` o `location.href` — URL canónica de la página
- [x] **`fecha_captura`**: `new Date().toISOString().split('T')[0]` — fecha del clip
- [x] **`titulo`**: `document.title` sanitizado (quitar emojis, saltos de línea, HTML entities)
- [x] **`tipo: fuente`**: valor fijo para todo web clipping (no se detecta por dominio)

**Campos opcionales de la extensión:**
- [x] **`autor`**: extraer de `<meta name="author">` o `<meta property="article:author">` (omitir si no existe)
- [x] **`fecha_publicacion`**: extraer de `<meta property="article:published_time">`, `<meta name="date">`, elementos `<time>`, o schema.org JSON-LD (omitir si no se encuentra)
- [x] **`descripcion`**: `<meta name="description">` o primer párrafo relevante, truncado a ~200 caracteres (omitir si no hay)
- [x] **`tags`**: input del usuario al clipear; omitir campo entero si no añade ninguno
- [x] **`idioma`**: `<html lang="...">` → código ISO 639-1 minúscula (`es`, `en`, `pt`). Fallback: detección por contenido futura (CompromiseJS). Omitir si no se detecta
- [x] **`sitio_nombre`**: `<meta property="og:site_name">` → nombre del sitio. Fallback: dominio de `url_origen` sin `www.` ni path (ej: `calnewport.com`). Omitir si no se puede determinar
- [x] **`tipo_contenido`**: mapear de `<meta property="og:type">` o schema.org `@type`:
  - `article`/`blogposting`/`newsarticle` → `articulo`
  - `tutorial`/`howto` → `tutorial`
  - `documentation`/`techarticle` → `documentacion`
  - `news`/`newscollection` → `noticia`
  - `video`/`videoobject` → `video`
  - cualquier otro → `otro`. Omitir si no se detecta
- [x] **`imagen_destacada`**: `<meta property="og:image">` o `<link rel="image_src">`. Validar que es URL absoluta (relativizar contra `url_origen` si es relativa). Omitir si no existe
- [x] **`tiempo_lectura`**: cálculo `Math.ceil(bodyText.split(/\s+/).length / 238)` (238 wpm). Omitir si no se puede calcular
- [x] **`notas_personales`**: textarea en popup de captura. Omitir campo entero si el usuario no escribe nada
- [x] **`estado: ACTIVO`**: valor por defecto (opcional)

**Reglas de formato y compatibilidad:**
- [x] **Formato fecha estricto `YYYY-MM-DD`**: si solo se dispone de datetime completo, truncar a fecha
- [x] **Compatibilidad hacia atrás (parser K1)**: debe aceptar documentos legacy sin frontmatter o con solo `fecha:`. La extensión **no debe** generar ese formato legacy
- [x] **Sanitización de `titulo`**: convertir a texto plano (quitar emojis, saltos de línea, HTML entities)
- [x] **Escape de caracteres especiales Markdown** en títulos y metadatos (barras, pipes, corchetes)
- [x] **Sanitización YAML completa** (ver §3.5.3): usar `escaparValorYaml()` en todos los campos del frontmatter

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

- [x] **Plantilla de frontmatter configurable**: usuario puede definir qué campos opcionales incluir y sus valores por defecto

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

- [x] **Sanitización de URLs**: eliminar parámetros de tracking (`utm_*`, `fbclid`, `ref=*`)
- [x] **Opciones de wrapping**: hard-wrap (80/120 columnas) vs soft-wrap configurable
- [x] **Normalización de espacios**: colapsar espacios múltiples, eliminar espacios al final de línea

### 5.9 — Formato inline en Markdown

Preservar formato inline (`**negrita**`, `*cursiva*`, `` `código` ``, `[enlaces](url)`) que actualmente se pierde al usar `textContent` plano.

- [x] **Extractor inline recursivo** (`componentes/extraccion/extractor-inline.js`): función `extraerInline(elemento)` que recorra nodos DOM hijos y genere Markdown inline:
  - `<strong>` / `<b>` → `**texto**`
  - `<em>` / `<i>` → `*texto*`
  - `<code>` → `` `texto` `` (sin fenced block)
  - `<a href="url">` → `[texto](url)`
  - `<sub>` → `~texto~` / `<sup>` → `^texto^`
- [x] **Integrar en extractores de bloque**: `extractor-texto.js`, `extractor-listas.js`, `extractor-citas.js` usan `extraerInline()` en lugar de `textContent`
- [ ] **Pruebas manuales**: Wikipedia, Medium, documentación técnica con enlaces y código inline

> **Fuente**: LAB §1 — Pérdida de formato inline

### 5.10 — Anti-duplicación en recorrido DOM

Evitar que nodos anidados se capturen más de una vez (ej: `<p>` dentro de `<blockquote>`).

- [x] **Recorrido en profundidad**: sustituir o complementar `querySelectorAll` plano en `nucleo-extraccion.js` por walker que marque nodos ya procesados
- [x] **Exclusión de descendientes**: no procesar hijos de bloques ya convertidos (`blockquote`, `pre`, `table`, `figure`, `ul`, `ol`)
- [ ] **Pruebas de regresión**: blockquotes anidados, listas dentro de citas, figuras con caption, código en párrafos

> **Fuente**: LAB §2 — Duplicación y orden del DOM

### 5.11 — Detección inteligente de contenido principal

Mejorar la selección de raíz más allá de `<article>`.

- [ ] **Función `detectarRaizContenido(documento)`** en `nucleo-extraccion.js` con cascada:
  1. `<article>` (si existe)
  2. `main`, `[role="main"]`, `.entry-content`, `.post-content`, `#content`
  3. **Scoring de candidatos**: puntuar contenedores por densidad de texto, ratio párrafos/enlaces, presencia de H1
  4. Fallback a `document.body`
- [ ] **Reglas por dominio** (nivel 3): archivo `assets/reglas-sitio.json` mantenible para sitios frecuentes
- [ ] **Readability.js embebido** (nivel 4, opcional): fallback cuando heurísticas fallen (~30-45 KB)

> **Fuente**: LAB §3 — Detección de contenido principal

### 5.12 — Metadatos enriquecidos (sin NLP)

Ampliar `extraerMetadatos()` sin dependencias externas.

- [ ] **`url_origen` canónica**: extraer de `<link rel="canonical">` con fallback a `document.URL`
- [ ] **`fecha_publicacion` desde `<time>`**: elementos `<time datetime="...">` en el artículo
- [ ] **JSON-LD `@graph`**: parsear múltiples scripts y grafos anidados (no solo el primer `<script type="application/ld+json">`)
- [ ] **Twitter Cards**: `twitter:title`, `twitter:description`, `twitter:image` como fallback de OpenGraph
- [ ] **Detección idioma heurística**: ratio de palabras frecuentes es/en como fallback de `<html lang>`

> **Fuente**: LAB §4 — Metadatos incompletos

### 5.13 — Multimedia e imágenes

Resolver URLs relativas, lazy-load y filtrar ruido visual.

- [ ] **Resolver URLs relativas** en cuerpo Markdown (no solo metadatos): relativizar contra `document.baseURI`
- [ ] **Soporte lazy-load**: leer `data-src`, `data-lazy-src`, primer valor de `srcset`
- [ ] **Filtrar imágenes decorativas**: `alt=""`, dimensiones 1×1, patrones de tracking
- [ ] **Placeholder para embeds cross-origin**: YouTube, Twitter/X, Gist con bloque semántico `> [!embed] URL`
- [ ] **Descarga local de imágenes** (futuro): opción en configuración para guardar assets en subcarpeta

> **Fuente**: LAB §5 — Multimedia e imágenes

### 5.14 — Código inline vs bloque

Distinguir `<code>` suelto de `<code>` dentro de `<pre>`.

- [x] **Distinguir inline de bloque**: en `extractor-codigo.js`, solo generar fenced block si `elemento.closest('pre')` existe; si no, generar `` `texto` ``
- [ ] **Tablas layout**: detectar tablas de presentación (`role="presentation"`) y omitir o degradar

> **Fuente**: LAB §6 — Código y tablas

### 5.15 — Captura de conversaciones IA (chats)

Extractor especializado para conversaciones con IA: Gemini, ChatGPT, Claude, Copilot y similares. La extensión ya funciona decentemente con estos sitios gracias al `<article>` detection y el extractor de iframes recursivo, pero se pierde formato inline, se duplican bloques de código y se cuela UI del chat.

**Plataformas objetivo**: ChatGPT (chatgpt.com), Gemini (gemini.google.com), Claude (claude.ai), Copilot (copilot.microsoft.com), y cualquier chat IA que use estructura conversacional semántica.

- [ ] **Extractor `extractor-chats-ia.js`** (`componentes/extraccion/`):
  - Detectar patrones de chat: `[data-message-author-role]`, `.message-content`, `.conversation-turn`, `[data-testid*="message"]`
  - Etiquetas: `div, article, section` (solo cuando contenga patrones de chat detectados)
  - `esAplicable()`: verificar que el elemento o su padre contenga marcadores de chat IA
- [ ] **Preservación de código**: bloques ` ``` ` generados por el chat se capturan con lenguaje detectado (`data-language`, clases `language-*`)
- [ ] **Filtrado de UI del chat**: excluir botones "copiar código", votos (👍👎), thinking/reasoning expandible (`<details>`, `.thinking`), indicators de "escribiendo..."
- [ ] **Etiquetas de rol en Markdown**: `**Usuario**` / `**Asistente**` antes de cada bloque de mensaje
- [ ] **Metadatos extra**: `tipo_contenido: conversacion_ia`, `modelo` (si se detecta del DOM o URL), `plataforma` (chatgpt/gemini/claude/copilot)
- [ ] **Pruebas manuales**: capturar conversaciones reales en cada plataforma, verificar preservación de código y formato

> **Fuente**: Análisis de comportamiento de la extensión con chats IA (2026-07-08)

### 5.16 — Compatibilidad Brave

La extensión funciona en Brave (basado en Chromium, MV3) con un solo `manifest.json`. La principal diferencia es la File System Access API desactivada por defecto.

- [ ] **Probar extensión en Brave stable**: popup, side panel, captura rápida, guardado FSA
- [ ] **Detección de FSA no disponible**: aviso en opciones y popup cuando `typeof window.showDirectoryPicker === 'undefined'`
- [ ] **Aviso específico Brave**: instrucciones del flag `brave://flags/#file-system-access-api`
- [ ] **Fallback UX**: destacar Copiar/Descargar cuando guardado en carpeta no esté disponible
- [ ] **Documentación**: sección Brave en README + `docs/GUIA - Instalacion Brave.md`

> **Fuente**: LAB Parte 2 — Compatibilidad con Brave

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
