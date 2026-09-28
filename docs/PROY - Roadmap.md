---
version: 2.1
estado: activo
objetivo: ESTABLE-EQUIPOINTERNO
alcance: carga en modo desarrollador (Chrome y Firefox)
publicacion_tienda: diferida-hasta-nuevo-aviso
fase_activa: estabilidad
fase: estabilidad, bloqueantes-manual, 5.2-pendiente, 5.9-parcial, 5.10-parcial, 5.11-parcial, 5.12-parcial, 5.14-pendiente, 5.17-parcial, 4.5-congelada
---

> [!summary] Resumen
> Hoja de ruta de Samjoko Web Clipper. **Objetivo actual: versión interna estable para el equipo de desarrolladores** — la extensión se carga en **modo desarrollador en Chrome y Firefox**; **hasta nuevo aviso no se publica en la Chrome Web Store** (su CHK queda `congelado`). Prioridad: que la extensión sea **operativa, eficaz y estable** (ver §Prioridad actual). Los bloqueantes de código de la auditoría de septiembre 2026 (**B1–B3** y **B8–B10**) están **corregidos y verificados con pruebas automatizadas**; queda la prueba manual en los dos navegadores. Las fases completadas (0–4, 5.1, 5.3, 5.4, 5.8 y los parciales 5.9, 5.10, 5.11, 5.12 y 5.14) están archivadas en `docs/LOG - Historial de fases.md`. La deuda técnica **B4–B7** está cerrada, la fase **5.13** (imágenes, URLs y embeds) está completa y existe la **5.17** (fórmulas matemáticas, parcial).

---

## Prioridad actual — operativa, eficaz y estabilidad 🔧

**Contexto**: el grupo de desarrolladores va a usar la extensión cargándola directamente en el navegador en **modo desarrollador** (Chrome y Firefox). Hasta nuevo aviso **no se publica en la Chrome Web Store**: por eso los trabajos de publicación (CHK de tienda, política de privacidad en dominio propio, cuenta de desarrollador, firma AMO, WCAG como requisito) quedan **congelados**.

Orden de prioridad:

1. **Estabilidad de la captura** — ni contenido perdido ni duplicado. Asegurado por los bloqueantes B1–B8 y sostenido por la suite de regresión de **5.9 / 5.10** (`pruebas/`).
2. **Robustez del pipeline** — **5.13** ✅ (URLs relativas, lazy-load, imágenes decorativas y embeds), **5.2** (detectar «leer más»), **5.14** (tablas de presentación).
3. **Los dos navegadores objetivo operan igual** — prueba manual del flujo completo en Chrome (modo desarrollador) y Firefox (carga temporal desde `dist-firefox/`).
4. **Deuda técnica que afecta a la estabilidad** — cerrada en esta sesión: **B4** (lista de extractores duplicada), **B5** (detección de FSA unificada), **B6** (toast accesible con teclado) y **B7** (`.gitignore`).
5. **Puesta a punto del equipo** — instrucciones cortas de carga, de actualización tras cada `git pull` y canal para reportar fallos (captura + URL + navegador).

**Primer entregable bajo este objetivo:**

- [x] **Onboarding del equipo**: consolidar en `README.md` la sección de carga en modo desarrollador (ya escrita) y añadir plantilla de reporte de fallo (navegador + URL + pasos + captura) con enlace a `pruebas/`. **Hecho**: sección «Reportar un fallo / Report a bug» añadida al README.

> [!note] Congelado hasta nuevo aviso
> **Fase 4.5 (accesibilidad)**, **publicación en Chrome Web Store** (`CHK - Publicacion...`), **Brave (5.16)** y **firma AMO**. Se retoman si cambia el alcance.

---

## Bloqueantes de estabilidad ⚠️

Defectos detectados en la auditoría de código (septiembre 2026). **B1, B2, B3, B8, B9 y B10 están corregidos y verificados con pruebas automatizadas**; antes de distribuir el paquete al equipo queda la prueba manual en los dos navegadores (último ítem de la sección).

- [x] **B1 — `ajustarTexto()` se usa sin `await`**: la función se declaraba `async` en `base-datos.js:162` sin ningún `await` dentro, y sus 5 call sites la asignan sincrónicamente (`editor-bloques/editor.js:202` y `:592`, `ventana-emergente/ventana.js:283` y `:368`, `trabajador-fondo.js:365`). Con «Ajuste de línea» activo (80/100/120) la variable contiene una `Promise`: guardar en carpeta falla con *object could not be cloned* y descargar genera un `.md` con `[object Promise]`. **Corrección mínima**: quitar `async` de `base-datos.js:162` (no awaita nada). Afecta a **5.8**, marcada como completada. **Corregido** y verificado con `pruebas/prueba-ajuste-linea.html`: devuelve `string` (no `Promise`) y el ajuste a 80 produce líneas de 79 caracteres.
- [x] **B2 — `data-bloque-procesado` persiste en el DOM de la página**: `nucleo-extraccion.js:620` marca los contenedores (`ul`, `ol`, `table`, `pre`, `blockquote`, `figure`) y la línea 545 los salta en cada corrida; no existía ningún `removeAttribute`. En la **segunda captura de la misma pestaña** (botón ⟳ re-escanear o captura repetida) desaparecen listas, tablas, código, citas e imágenes. Además muta el DOM del sitio visitado. **Corregido**: el control vive en memoria (`contenedoresProcesados` + `ns.tieneAncestroProcesado()`) y `extraer()` limpia los marcadores heredados al arrancar. Verificado con `pruebas/prueba-reescaneo.html`: 0 marcadores en el DOM y 2ª captura idéntica a la 1ª.
- [x] **B3 — Falta `downloads` en `manifest.json` (Chrome)**: `chrome.downloads.download` se usa en `trabajador-fondo.js:50`, `editor-bloques/editor.js:610` y `ventana-emergente/ventana.js:379`, pero el manifest de Chrome no declaraba el permiso (`manifest.json:7`; sí lo añade el script de empaquetado Firefox) mientras que README y Política de Privacidad sí lo listaban. **Corregido**: `"downloads"` añadido a `permissions`. Habilita el fallback de **5.16 (Brave)**.
- [x] **B8 — Las tablas nunca se extraían**: `componentes/extraccion/extractor-tablas.js` hacía `return !elemento.closest('table')` en `esAplicable()`, pero `closest()` **incluye el propio elemento** → siempre devolvía `false` y toda tabla se descartaba (regresión de **5.3**, que está cerrada como ✅). **Corregido**: `elemento.closest('table') === elemento` (solo la tabla exterior; las anidadas siguen excluidas). Verificado: tabla con `rowspan` correcta y sin duplicados.
- [x] **B9 — Elementos inline duplicados como bloques**: `<code>` e `<img>` dentro de un `<p>` o de un encabezado se volvían a extraer como bloque propio (solo `blockquote`, `pre`, `table`, `figure`, `ul` y `ol` contaban como contenedores) → el párrafo salía dos veces con su código o imagen. **Corregido**: cualquier bloque ya convertido excluye a sus descendientes (`ns.tieneAncestroProcesado()` sobre `nodosProcesados`). Detectado por el harness de **5.10** («código en párrafos»).
- [x] **B10 — Lista dentro de cita pegada sin saltos**: un `<ul>` dentro de un `<blockquote>` se aplanaba a `Primer puntoSegundo punto`. **Corregido** en `componentes/extraccion/extractor-citas.js`: cada ítem en su línea con su marca (`> - ítem`, `> 1. ítem`). Detectado por el harness de **5.10** («listas dentro de citas»).
- [ ] **Prueba manual en Chrome y Firefox** antes de distribuir al equipo _(Chrome superó el primer pase; repetir el pase tras **B4**/**5.17** — en especial capturar una página de Wikipedia con fórmulas y verificar la recarga de la extensión)_:
  - **Chrome**: recargar en `chrome://extensions` → popup (captura rápida + descarga), editor (capturar → ⟳ re-escanear → capturar otra vez), opciones (ajuste de línea 80 → guardar).
  - **Firefox**: `./empaquetar-firefox.sh` → `about:debugging#/runtime/this-firefox` → cargar `dist-firefox/manifest.json` como complemento temporal → mismo flujo (el guardado va por Downloads API).
  - Las pruebas automatizadas son `pruebas/prueba-reescaneo.html` y `pruebas/prueba-ajuste-linea.html`: se abren en Chrome y pintan el resultado en la propia página.

**Deuda técnica (no bloqueantes):**

- [x] **B4 — Lista de scripts del content script duplicada en 4 sitios**: `manifest.json:52-66`, `trabajador-fondo.js`, `ventana-emergente/ventana.js` y `editor-bloques/editor.js` repetían la misma lista de 10 scripts. **Corregido**: única fuente = `manifest.json`; la función `obtenerScriptsExtraccion()` (`componentes/configuracion.js`) la lee de `chrome.runtime.getManifest().content_scripts` y SW, popup y editor la usan en `chrome.scripting.executeScript({ files: obtenerScriptsExtraccion() })`. Añadir un extractor nuevo = añadirlo al manifest (y a los harness de `pruebas/`).
- [x] **B5 — Detección de FSA inconsistente**: el SW usaba `typeof FileSystemDirectoryHandle !== 'undefined'` (`trabajador-fondo.js:24`) y las opciones `typeof window.showDirectoryPicker === 'function'` (`opciones/opciones.js:16`); en Brave podían discrepar y mostrar avisos contradictorios. **Corregido**: criterio único `esFsaDisponible()` en `componentes/configuracion.js` (cargado por el SW, popup, editor y opciones) basado en los tipos de manejador — la única comprobación con el mismo resultado en ventana y en worker (`showDirectoryPicker` es API de Window y no existe en workers). El botón de seleccionar carpeta queda protegido con guardia defensiva por si un navegador retirara el selector.
- [x] **B6 — Toast expandible solo accesible con ratón**: `ventana-emergente/ventana.js:101` creaba un `<div>` clicable sin `role`, `tabindex`, activación por teclado ni `aria-expanded`. **Corregido**: `role="button"` + `tabindex="0"` + activación con Enter/Espacio (función compartida `alternarToast`) + `aria-expanded` dinámico y foco visible (`:focus-visible` en `ventana.css`). Cierra el ítem «Toasts expandibles» de [`CHK - Accesibilidad.md`](CHK%20-%20Accesibilidad.md).
- [x] **B7 — Falta `.gitignore`**: `dist-firefox/` y `dist-firefox.xpi` son artefactos de build que el script regenera con `rm -rf`. **Corregido**: `.gitignore` creado en la raíz (ignora `dist-firefox/`, `dist-firefox.xpi` y ruido de sistema/editores). Si estaban trackeados, des-trackearlos con `git rm -r --cached` (operación del usuario).

---

## Fase 4.5 — Accesibilidad integral ⏸️ (congelada)

Objetivo: que la extensión sea utilizable con lectores de pantalla, navegación exclusiva por teclado, y cumpla WCAG 2.1 nivel AA. **Congelada hasta nuevo aviso**: al distribuirse internamente en modo desarrollador deja de ser requisito de publicación (`CHK - Accesibilidad.md` → `estado: congelado`); se retoma a petición del equipo.

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

Mejoras pendientes del pipeline de extracción para la versión interna estable. Las sub-fases completadas (5.1, 5.3, 5.4, 5.8, 5.9-parcial, 5.10-parcial, 5.11-parcial, 5.12-parcial, 5.14-parcial) están en `docs/LOG - Historial de fases.md`.

**Principio rector**: cada bloque nuevo debe poder añadirse sin tocar el núcleo del extractor (patrón **estrategia/plugin** interno).

### 5.2 — Pipeline de extracción (pendientes)

- **Tablas con `rowspan`** → **cerrado en 5.3** (`componentes/extraccion/extractor-tablas.js` ya deja la celda vacía en las filas siguientes; ver `docs/LOG - Historial de fases.md`). Ítem retirado por duplicado.
- [ ] **Detectar "leer más" / "seguir leyendo"** y cortar el contenido en ese punto _(riesgo de falsos positivos — pendiente de diseño)_

### 5.9 — Formato inline (pruebas) ✅ automatizadas

- [x] **Suite de fixtures HTML → Markdown** (`pruebas/`): 11 fixtures con su Markdown esperado, ejecutor doble (comparación + re-escaneo) y lanzador en terminal, sin dependencias. Ejecutar con `./pruebas/ejecutar-pruebas.sh` (Chrome headless) o abriendo `pruebas/ejecutor-fixtures.html` en el navegador. Cubre `**negrita**`, `*cursiva*`, `` `código` ``, `[enlaces](url)`, `~subíndice~`, `^superíndice^`, formato anidado, código inline vs bloque, limpieza de `utm_*` y filtro de densidad de enlaces.
- [ ] **Pruebas manuales en sitios reales**: Wikipedia, Medium y documentación técnica con enlaces y código inline (abrir la página → capturar → revisar en el editor).

### 5.10 — Anti-duplicación (pruebas) ✅ automatizadas

- [x] **Pruebas de regresión** incluidas en `pruebas/`: citas anidadas, listas dentro de citas, figuras con caption, código en párrafos, párrafo de alta densidad de enlaces y una estructura mixta (tabla + lista + cita + código + figura).
- [x] **Caso de regresión mínimo**: cada fixture se extrae **dos veces** y se exige Markdown idéntico y **0 marcadores** `data-bloque-procesado` → ligado a **B2**.
- [ ] **Pruebas manuales en sitios reales**: capturar dos veces la misma página desde el editor (⟳ re-escanear) y verificar que no se pierde ni se duplica contenido.

### 5.11 — Detección inteligente de contenido principal 🔧 (parcial)

Mejorar la selección de raíz más allá de `<article>`. **Implementado en `componentes/extraccion/nucleo-extraccion.js:103-160`** (archivado en el LOG).

- [x] **Función `detectarRaizContenido(documento)`** en `nucleo-extraccion.js` con cascada:
  1. `<article>` (si existe)
  2. `main`, `[role="main"]`, `[role="document"]`
  3. Selectores de contenido (`.entry-content`, `.post-content`, `#content`, `#primary`, `[itemprop="articleBody"]`…)
  4. **Scoring de candidatos** (`puntuarCandidato`, línea 136): densidad de texto, H1/H2/H3, ratio párrafos/enlaces, palabras clave en `id`/`class`; umbral ≥ 20
  5. Fallback a `document.body`
- [ ] **Reglas por dominio** (nivel 3): archivo `assets/reglas-sitio.json` mantenible para sitios frecuentes
- [ ] **Readability.js embebido** (nivel 4, opcional): fallback cuando heurísticas fallen (~30-45 KB)

### 5.12 — Metadatos enriquecidos (sin NLP) 🔧 (parcial)

Ampliar `extraerMetadatos()` sin dependencias externas. **Implementado en `componentes/extraccion/nucleo-extraccion.js:215-390`** (archivado en el LOG).

- [x] **`url_origen` canónica**: `<link rel="canonical">` con fallback a `document.URL` (línea 310)
- [x] **`fecha_publicacion` desde `<time>`**: `meta` → `<time datetime="...">` (línea 293) → JSON-LD
- [x] **JSON-LD `@graph`**: todos los `<script type="application/ld+json">` y grafos `@graph` de primer nivel (línea 248)
- [ ] **JSON-LD recursivo**: recorrer grafos y nodos anidados dentro de otros (hoy solo el `@graph` de primer nivel)
- [x] **Twitter Cards parcial**: `twitter:description` y `twitter:image` ya actúan como fallback de OpenGraph (líneas 364 y 330)
- [ ] **`twitter:title`**: usarlo como fallback del título cuando `document.title` y JSON-LD no aporten
- [x] **Detección de idioma heurística**: `heuristicaIdioma()` (línea 192), ratio de palabras frecuentes es/en como fallback de `<html lang>`

### 5.13 — Multimedia e imágenes ✅

Resolver URLs relativas, lazy-load, filtrar ruido visual y preservar embeds.

- [x] **Resolver URLs relativas** en cuerpo Markdown (no solo metadatos): `ns.limpiarUrl()` resuelve contra la base de la extracción (`ns.baseExtraccion` = URL de origen si se pasa —pruebas— o `document.baseURI`, con `<base>` incluido y restaurada tras extracciones anidadas de iframes) y devuelve absolutas las relativas, incluidas las protocolo-relativas `//host/…` (heredan el esquema de la base; https si la base no es http(s)). Aplica a enlaces, imágenes y embeds.
- [x] **Soporte lazy-load**: `ns.obtenerSrcImagen()` — `src` normal (los `data:` placeholder se posponen), `data-src`, `data-lazy-src`, `data-original`, `data-lazy` y primer candidato de `srcset` (de la imagen o de su `<picture>`).
- [x] **Filtrar imágenes decorativas**: `ns.esImagenDecorativa()` — `alt=""`, dimensiones 1×1/0 y nombres de fichero de tracking (pixel, spacer, 1x1, transparent, tracking, beacon). En figuras se degrada al pie de figura. Se comprueba **después** del detector de fórmulas (el fallback de Wikimedia lleva `aria-hidden` y no es decorativo).
- [x] **Placeholder para embeds cross-origin**: `> [!embed] URL` en `extractor-iframes.js` para iframes http(s) de otro origen (publicidad/tracking excluido por patrones). Detección de origen **por URL**, no por `contentDocument`: mientras el iframe navega, `contentDocument` es `about:blank` y parecía same-origin (verificado con sonda en Chrome headless).
- [x] **Fixture `imagenes-lazy-y-embeds`** (11.º) y verificación con página real (Wikipedia): 0 URLs relativas, 0 restos de MathML y 0 marcadores.

### 5.14 — Código inline vs bloque (pendiente)

- [ ] **Tablas layout**: detectar tablas de presentación (`role="presentation"`) y omitir o degradar

### 5.17 — Fórmulas matemáticas 🔧 (parcial)

Capturar fórmulas como LaTeX para Obsidian (`$…$` en línea, `$$…$$` display) en vez de glifos MathML sueltos, LaTeX duplicado o imágenes de render. Detectado al capturar artículos de Wikipedia: el `<math>` oculto se colaba con sus saltos de línea y la fórmula salía rota «línea a línea».

- [x] **`componentes/extraccion/detector-formulas.js`**: `ns.extraerFormula(elemento)` reconoce `.mwe-math-element` (Wikipedia), `<math>` (MathML), `.katex` y la imagen fallback de Wikimedia. Fuentes LaTeX por prioridad: `data-mw.extsrc` → `<annotation application/x-tex>` → `math[alttext]` → `img[alt]`. El delimitador (`$`/`$$`) se decide según si la fórmula ocupa sola su bloque (`p`, `dd`, `figcaption`…); en listas, tablas y encabezados se queda en línea.
- [x] **Integración**: rama nueva en `extractor-inline.js` (párrafos, listas, citas, encabezados) y en `extractor-multimedia.js` (figuras e imágenes sueltas). Los pies de figura ahora se generan con `extraerInline()` (antes `textContent` perdía las fórmulas del caption).
- [x] **Fixture `formulas-matematicas`** en `pruebas/` (10.º fixture): inline con `data-mw`, inline con `annotation`, KaTeX, display en `p` e imagen fallback suelta; con doble captura y 0 marcadores.
- [x] **Verificación con página real**: «Integral de Gauss» (Wikipedia) → 38 fórmulas en línea + 40 bloques `$$`, 0 restos de MathML/annotation y 0 saltos de línea espurios.
- [ ] **Fórmulas dentro de tablas**: `extractor-tablas.js` usa `textContent` plano para las celdas (glifos + LaTeX del annotation).
- [ ] **MathJax v3 (`mjx-container`)**: sin fuente LaTeX accesible en el DOM; de momento sale el texto de glifos por la recursión genérica.

---

## Diferidas — hasta consolidar la versión interna

Estas funcionalidades se diferirán hasta que la versión interna para el equipo esté operativa, eficaz y estable, por prioridad o complejidad.

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

> [!note] Congelado
> Brave deja de ser objetivo hasta nuevo aviso (alcance actual: **Chrome y Firefox**). El trabajo ya hecho (detección de FSA, fallback por descargas) se conserva.

- [ ] **Probar extensión en Brave stable**: popup, side panel, captura rápida, guardado FSA
- [x] **Detección de FSA no disponible**: aviso en opciones (`#avisoModoDescarga`) y popup (`#infoCarpeta.aviso`) cuando `typeof window.showDirectoryPicker === 'undefined'`; el background enruta el guardado a la Downloads API (`FSA_DISPONIBLE` en `trabajador-fondo.js`)
- [ ] **Aviso específico Brave**: instrucciones del flag `brave://flags/#file-system-access-api`
- [ ] **Fallback UX**: guardar como descarga (Downloads API) en editor y popup, manteniendo Copiar/Descargar cuando guardado en carpeta no esté disponible _(se marcó [x] prematuramente: el código existe pero depende del permiso `downloads`, ausente en el manifest de Chrome → ver bloqueante **B3**; re-verificar tras el fix)_
- [ ] **Documentación**: sección Brave en README + `docs/GUIA - Instalacion Brave.md`

---

## Fase 6 — Madurez

- [ ] Migrar a Firefox _(paquete listo: `empaquetar-firefox.ps1` (Windows) / `empaquetar-firefox.sh` (Linux/macOS) → `dist-firefox/` + `dist-firefox.xpi`; background como event page, `sidebar_action`, guardado por Downloads API. Validado: `web-ext lint` = **0 errores** y carga temporal verificada en Firefox 156; ref: `docs/GUIA - Instalacion Firefox.md`. Pendiente: **prueba manual del flujo completo** (ahora prioritaria: Firefox es navegador objetivo) y firma para AMO _(congelada: se carga temporal en `about:debugging`, no requiere firma)_)
- [x] **Apertura del panel lateral multi-navegador**: `ventana-emergente/ventana.js:218-233` ya detecta el entorno — `chrome.sidePanel.open()` en Chrome, `chrome.sidebarAction.open()` en Firefox y apertura en pestaña como último recurso. La advertencia «`sidePanel.open` no soportado en Firefox» queda resuelta en código (la refleja `docs/GUIA - Instalacion Firefox.md` §83)
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
