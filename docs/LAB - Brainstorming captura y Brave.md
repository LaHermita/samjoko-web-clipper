---
version: 1.1
fecha: 2026-07-07
fecha_decision: 2026-07-08
estado: DECIDIDO
descripcion: Análisis y brainstorming de mejoras en detección/captura de contenido, y opciones de compatibilidad con Brave. **Todas las propuestas integradas en ROADMAP v1.1 (Fases 5.9–5.16).** Incluye línea nueva de captura de chats IA.
tipo: Exploración
origen: conversación de análisis del proyecto (2026-07-07)
---

# LAB - Brainstorming captura y Brave

**Propósito**: recopilar el análisis de mejoras de detección y captura de contenido (Parte 1) y las indicaciones de compatibilidad con Brave (Parte 2). Cada sección está pensada para copiarse como bloques independientes al ROADMAP o a la documentación del proyecto.

---

## Parte 1 — Brainstorming: detección y captura

### Punto de partida (lo que ya funciona bien)

Samjoko Web Clipper ya tiene una base sólida:

- Arquitectura **plugin/estrategia** con extractores auto-registrados en `componentes/extraccion/`
- Scoping a `<article>`, filtro de boilerplate, densidad de enlaces
- Frontmatter alineado con Vivero (`docs/REF - WEB-CLIPPER.md`)
- Editor por bloques con filtros, drag & drop y re-escaneo
- Iframes same-origin, tablas con colspan/rowspan, normalización de headings

El roadmap marca la **Fase 5** como foco actual (calidad Obsidian/Vivero). Lo pendiente más relevante está ahí y en la **Fase 6**.

---

### Limitaciones actuales (diagnóstico técnico)

#### 1. Pérdida de formato inline — impacto alto

Los extractores de texto y listas usan `textContent` plano (`componentes/extraccion/extractor-texto.js`, `extractor-listas.js`).

**Consecuencia**: se pierden `<strong>`, `<em>`, `<a>`, `<code>` inline, `<sub>`, `<sup>`, etc. En artículos técnicos y Wikipedia esto degrada mucho la captura.

**Propuesta**: crear `extractor-inline.js` recursivo que recorra nodos DOM y genere Markdown inline (`**`, `_`, `` ` ``, `[texto](url)`). Los extractores de bloque lo usarían en lugar de `textContent`.

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Formato inline en Markdown

- [ ] **Extractor inline recursivo** (`extractor-inline.js`): convertir `<strong>`, `<em>`, `<a>`, `<code>`, `<sub>`, `<sup>` a Markdown inline
- [ ] **Integrar en extractores de bloque**: `extractor-texto.js`, `extractor-listas.js`, `extractor-citas.js` usan el inline en lugar de `textContent`
- [ ] **Pruebas manuales**: Wikipedia, Medium, documentación técnica con enlaces y código inline
```

---

#### 2. Duplicación y orden del DOM — impacto medio-alto

El núcleo hace `querySelectorAll` sobre **todos** los elementos que coinciden con las etiquetas registradas (`nucleo-extraccion.js`).

**Consecuencia**: un `<p>` dentro de `<blockquote>` puede capturarse dos veces (blockquote + párrafo). Lo mismo con tablas anidadas o figuras con párrafos internos.

**Propuesta**: recorrer el DOM en **profundidad** (walker) y marcar nodos ya procesados, o excluir descendientes de bloques ya convertidos (`elemento.closest('blockquote, pre, table, figure, ul, ol')`).

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Anti-duplicación en recorrido DOM

- [ ] **Recorrido en profundidad**: sustituir o complementar `querySelectorAll` plano por walker que evite nodos ya procesados
- [ ] **Exclusión de descendientes**: no procesar hijos de bloques ya convertidos (blockquote, pre, table, figure, ul, ol)
- [ ] **Pruebas de regresión**: blockquotes anidados, listas dentro de citas, figuras con caption
```

---

#### 3. Detección de contenido principal — impacto alto

**Estado actual**: `<article>` si existe; si no, **todo el documento**.

**Problemas típicos**:

- Medium, Substack, WordPress: el artículo no siempre está en `<article>`
- SPAs (React/Vue): contenido en `<div class="post-content">`
- Páginas con sidebar dentro de `<main>`: se cuela ruido
- Paywalls / «Leer más»: contenido truncado o duplicado

**Propuestas por nivel de esfuerzo**:

| Nivel | Enfoque | Esfuerzo |
|-------|---------|----------|
| **1** | Heurísticas: `main`, `[role="main"]`, `.entry-content`, `.post-content`, `#content` | Bajo |
| **2** | Puntuación por contenedor: densidad de texto, ratio párrafos/enlaces, presencia de H1 | Medio |
| **3** | Reglas por dominio (`assets/reglas-sitio.json`) para sitios frecuentes | Medio |
| **4** | Readability.js embebido (como Firefox Reader View) | Medio-alto, ~30–45 KB |
| **5** | Selección manual por clic (Fase 6 del roadmap) | Alto, UX distinta |

**Recomendación**: empezar por nivel 1+2 dentro de `nucleo-extraccion.js` como `detectarRaizContenido(documento)`.

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Detección inteligente de contenido principal

- [ ] **Heurísticas de contenedor** (nivel 1): `main`, `[role="main"]`, selectores frecuentes (`.entry-content`, `.post-content`, `#content`)
- [ ] **Scoring de candidatos** (nivel 2): puntuar contenedores por densidad de texto, ratio párrafos/enlaces, presencia de H1
- [ ] **Función `detectarRaizContenido()`** en `nucleo-extraccion.js`, con fallback a `<article>` → heurísticas → `body`
- [ ] **Reglas por dominio** (nivel 3): archivo `assets/reglas-sitio.json` mantenible
- [ ] **Readability.js embebido** (nivel 4, opcional): fallback cuando heurísticas fallen
- [ ] **Corte en «Leer más»** (nivel 2 del roadmap 5.2): detectar patrones «seguir leyendo» — diseño pendiente por riesgo de falsos positivos
```

---

#### 4. Metadatos incompletos — impacto medio

Ya se extraen meta tags y JSON-LD básico, pero faltan fuentes habituales:

- `<link rel="canonical">` para `url_origen`
- `<time datetime="...">` para `fecha_publicacion`
- JSON-LD con `@graph` (no solo el primer script)
- Open Graph múltiple (Twitter Cards)
- Detección de idioma por contenido (roadmap 5.5 con CompromiseJS)

**Propuesta rápida**: ampliar `extraerMetadatos()` sin dependencias externas.

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Metadatos enriquecidos (sin NLP)

- [ ] **`url_origen` canónica**: extraer de `<link rel="canonical">` con fallback a `document.URL`
- [ ] **`fecha_publicacion` desde `<time>`**: elementos `<time datetime="...">` en el artículo
- [ ] **JSON-LD `@graph`**: parsear múltiples scripts y grafos anidados
- [ ] **Twitter Cards**: `twitter:title`, `twitter:description`, `twitter:image` como fallback
- [ ] **Detección idioma heurística**: ratio de palabras frecuentes es/en como fallback de `<html lang>`
```

---

#### 5. Multimedia e imágenes — impacto medio

- URLs relativas: parcialmente resueltas en metadatos, no siempre en `![]()` del cuerpo
- Imágenes lazy (`data-src`, `srcset`): no se resuelven
- Imágenes decorativas / tracking pixels: no se filtran
- Vídeos: `<video>` está en el registro pero con soporte limitado
- Cross-origin iframes (YouTube, Twitter/X, Gist): solo placeholder

**Propuestas**:

- Resolver `src` absoluto contra `document.baseURI`
- Leer `data-src`, `data-lazy-src`, primer URL de `srcset`
- Placeholder semántico para embeds: `> [!embed] YouTube: URL`
- Opción «descargar imágenes locales» (fase futura, compleja)

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Multimedia e imágenes

- [ ] **Resolver URLs relativas** en cuerpo Markdown (no solo metadatos)
- [ ] **Soporte lazy-load**: `data-src`, `data-lazy-src`, primer valor de `srcset`
- [ ] **Filtrar imágenes decorativas**: `alt=""`, dimensiones 1×1, patrones de tracking
- [ ] **Placeholder para embeds cross-origin**: YouTube, Twitter/X, Gist con bloque semántico
- [ ] **Descarga local de imágenes** (futuro): opción en configuración para guardar assets en subcarpeta
```

---

#### 6. Código y tablas — impacto bajo-medio

**Código**: funciona bien en `<pre>`, pero `<code>` suelto genera bloques fenced completos (debería ser inline `` ` ``).

**Tablas**: rowspan implementado; casos edge con tablas muy anidadas o layout tables pueden fallar.

**Propuesta**: en `extractor-codigo.js`, distinguir inline vs bloque con `elemento.closest('pre')`.

**Bloque ROADMAP sugerido**:

```markdown
### 5.x — Código inline vs bloque

- [ ] **Distinguir `<code>` inline de bloque**: solo generar fenced block si está dentro de `<pre>`
- [ ] **Tablas layout**: detectar tablas de presentación (`role="presentation"`) y omitir o degradar
```

---

#### 7. Enlaces y wikilinks — roadmap 5.6

Los enlaces van a una sección aparte al final, desmarcados por defecto. Es conservador pero pierde contexto inline.

**Propuestas**:

- Enlaces inline en el texto (con el extractor inline)
- Modo Obsidian: convertir enlaces internos a `[[wikilinks]]`
- Tags automáticos por dominio (`midu.dev` → `desarrollo`) — idea en `docs/IDEA - Obsidian Boveda Vision.md`

**Bloque ROADMAP sugerido** (complementa §5.6 existente):

```markdown
### 5.6 — Enlaces (ampliación)

- [ ] **Enlaces inline en párrafos**: integrar con extractor inline (no solo sección final)
- [ ] **Tags predefinidos por dominio**: reglas en `assets/reglas-sitio.json` o configuración de usuario
```

---

#### 8. Captura UX — impacto medio

| Idea | Valor | Complejidad |
|------|-------|-------------|
| **Captura parcial** (selección o clic en zona) | Muy alto | Alta (Fase 6) |
| **Modos de captura**: artículo / página completa / selección | Alto | Media |
| **Vista previa Markdown renderizado** | Alto para confianza | Media |
| **Historial local de capturas** | Útil para deshacer/revisar | Media |
| **Perfiles por sitio** (reglas + tags + subcarpeta) | Alto para power users | Media |
| **Captura de pestaña archivada/offline** | Nicho | Baja prioridad |
| **Detección duplicados** (misma `url_origen`) | Integración Vivero/Naulux | Media |

**Bloque ROADMAP sugerido** (complementa Fase 6):

```markdown
### 6.x — Modos y perfiles de captura

- [ ] **Modos de captura**: artículo (por defecto) / página completa / selección manual
- [ ] **Perfiles por sitio**: subcarpeta, tags y reglas de extracción por dominio
- [ ] **Detección de duplicados**: aviso si `url_origen` ya fue capturada (historial local o hash)
```

---

#### 9. NLP ligero en extensión vs en Vivero — roadmap 5.5

El roadmap separa bien responsabilidades:

- **Extensión**: campos de origen (`url_origen`, `tags` manuales, `notas_personales`)
- **Vivero**: `tags_auto`, `entidades`, `temas`, `palabras`

**Opción intermedia en extensión (sin CompromiseJS)**:

- Keywords de `<meta name="keywords">` (ya parcialmente)
- Extracción de hashtags visibles
- Resumen extractivo (primeras N frases del contenido válido)
- Detección idioma por ratio de palabras frecuentes (es/en)

CompromiseJS (~250 KB) encaja con la política del proyecto si se embebe en `componentes/procesador-lenguaje.js`.

---

### Matriz de priorización sugerida

```
Impacto ↑
    │
    │  [Inline MD]     [Readability/heurísticas]
    │  [Anti-duplicación DOM]
    │
    │  [Metadatos+]    [Lazy images]
    │  [Modos captura]
    │
    │  [Code inline]   [Wikilinks]
    │  [Perfiles sitio]
    │
    └──────────────────────────────────→ Esfuerzo
```

### Quick wins (1–2 sprints)

1. Extractor inline para formato en párrafos/listas
2. Anti-duplicación en recorrido DOM
3. Heurísticas de contenido principal (main + scoring)
4. Canonical URL + `<time>` + JSON-LD `@graph`
5. Resolución de imágenes lazy/relativas

### Proyectos medianos

6. Readability.js embebido como fallback
7. Modos de captura (artículo / completo)
8. Vista previa renderizada en side panel
9. Reglas por dominio en JSON

### Largo plazo

10. Selección manual por clic
11. CompromiseJS / NLP local
12. Wikilinks + plantillas Templater

---

## Parte 2 — Migración y compatibilidad con Brave

### Respuesta corta

**No hace falta clonar el repositorio ni mantener un manifiesto separado.** Brave está basado en Chromium y soporta extensiones **Manifest V3** con las mismas APIs `chrome.*`. El mismo código debería funcionar cargándolo como extensión descomprimida o instalándolo desde la Chrome Web Store.

---

### Opciones de despliegue en Brave

| Opción | Qué implica | Cuándo usarla |
|--------|-------------|---------------|
| **A. Mismo repo, cero cambios** | Cargar descomprimida en `brave://extensions` | Desarrollo y uso personal |
| **B. Chrome Web Store** | Publicar una vez; Brave instala desde CWS | Distribución general |
| **C. Capa de abstracción `browser.*`** | Polyfill para compatibilidad futura (Firefox) | Solo si se planea multi-navegador |
| **D. Repo/fork separado** | Duplicar mantenimiento | **No recomendado** salvo branding distinto |
| **E. Build con variante Brave** | Script que ajuste textos/URLs de actualización | Solo si se quiere branding o canal de update propio |

**Recomendación**: opción **A** o **B** con un único repositorio. Añadir una guía de instalación Brave y detección de limitaciones en runtime.

---

### Diferencias reales Chrome vs Brave

#### 1. File System Access API — crítico para Samjoko

En Brave la API está **desactivada por defecto** por privacidad. El usuario debe activar:

1. Abrir `brave://flags/#file-system-access-api`
2. Cambiar a **Enabled**
3. Reiniciar el navegador

Sin esto, **guardar en bóveda local falla**; copiar al portapapeles y descargar `.md` sí funcionan.

**Mejora recomendada en la extensión**:

- Detectar `typeof window.showDirectoryPicker === 'undefined'` en opciones
- Mostrar aviso específico para Brave con instrucciones del flag
- Fallback claro: «Descargar archivo» cuando FSA no esté disponible

---

#### 2. Side Panel API

Hubo regresiones en versiones antiguas de Brave (panel que desaparecía a ~1 s); corregidas en stable ≥ 1.58.

**Matiz UX**: la sidebar nativa de Brave no integra tan bien las extensiones side panel como Chrome; a veces hay que abrirlas desde la burbuja de extensiones de la barra de herramientas. No es un bug de Samjoko, sino del navegador.

---

#### 3. Shields / bloqueo

Brave Shields no debería interferir con content scripts propios. Puede afectar recursos de la página (imágenes, iframes), no la extracción del DOM ya cargado.

---

#### 4. APIs usadas por Samjoko — compatibilidad

| API | Chrome | Brave |
|-----|--------|-------|
| `manifest_version: 3` | ✅ | ✅ |
| Service worker | ✅ | ✅ |
| `chrome.storage` | ✅ | ✅ |
| `chrome.scripting` | ✅ | ✅ |
| `chrome.sidePanel` | ✅ | ✅ (versiones recientes) |
| `chrome.commands` | ✅ | ✅ |
| File System Access API | ✅ | ⚠️ Flag requerido |
| IndexedDB (handle carpeta) | ✅ | ✅ (con FSA activo) |
| `host_permissions: <all_urls>` | ✅ | ✅ |

---

#### 5. Publicación

Brave **no tiene tienda propia** para extensiones genéricas. Opciones:

- Chrome Web Store (Brave la soporta)
- GitHub releases + «Cargar descomprimida»
- Brave solo hospeda extensiones MV2 curadas (uBlock, etc.) — no aplica a Samjoko

---

#### 6. Comprobación de actualizaciones

El service worker consulta GitHub raw (`trabajador-fondo.js`, URL del manifest remoto). Funciona igual en Brave; no depende de Chrome Web Store.

---

### ¿Cuándo sí tendría sentido un manifiesto alternativo?

Solo para **Firefox** (Fase 6 del roadmap), no para Brave:

- Firefox usa `browser.*` en lugar de `chrome.*` (con polyfill)
- Diferencias en `background` (service worker vs scripts)
- Side panel con soporte distinto
- File System Access API con soporte limitado

Para Brave: **un solo `manifest.json`**.

---

### Plan de acción Brave (sin fork)

1. Probar en Brave con «Cargar descomprimida» el repo actual
2. Activar flag FSA y verificar guardado en bóveda
3. Probar side panel + atajo `Ctrl+Shift+S`
4. Añadir detección Brave + aviso FSA en opciones/popup
5. Documentar en README sección «Brave»
6. Publicar en Chrome Web Store → usuarios Brave instalan desde ahí

**Detección opcional en código**:

```javascript
const esBrave = navigator.brave && typeof navigator.brave.isBrave === 'function';
// o userAgent incluye "Brave" en algunos contextos
```

---

### Bloque para README — sección Brave

```markdown
## Brave

Samjoko Web Clipper es compatible con **Brave** sin cambios en el código. Brave está basado en Chromium y soporta Manifest V3.

### Instalación

**Opción 1 — Chrome Web Store** (cuando esté publicada): instala desde la tienda como en Chrome.

**Opción 2 — Desarrollo**:
1. Abre `brave://extensions`
2. Activa «Modo desarrollador»
3. Clic en «Cargar descomprimida»
4. Selecciona la carpeta del proyecto

### Requisito: File System Access API

Brave desactiva la File System Access API por defecto. Para **guardar directamente en tu bóveda local**:

1. Abre `brave://flags/#file-system-access-api`
2. Cambia a **Enabled**
3. Reinicia Brave
4. Configura la carpeta destino en las opciones de Samjoko

Sin este flag, puedes seguir usando **Copiar** y **Descargar** desde el editor de bloques.

### Side panel

El editor de bloques usa la Side Panel API de Chrome. En versiones recientes de Brave funciona correctamente. Si no ves el panel, ábrelo desde la burbuja de extensiones en la barra de herramientas.

### Atajos de teclado

- `Ctrl+Shift+K` — abrir popup
- `Ctrl+Shift+S` — captura rápida (requiere carpeta configurada y FSA activo)
```

---

### Bloque para GUIA — instalación Brave (borrador)

```markdown
# GUIA - Instalación en Brave

## Requisitos

- Brave Browser (versión estable reciente, Chromium-based)
- Flag File System Access API activado (solo si quieres guardar en carpeta local)

## Pasos

### 1. Cargar la extensión

1. Clona o descarga el repositorio
2. Abre `brave://extensions`
3. Activa «Modo desarrollador»
4. «Cargar descomprimida» → selecciona la carpeta del proyecto

### 2. Activar guardado en bóveda (File System Access API)

1. Abre `brave://flags/#file-system-access-api`
2. Selecciona **Enabled**
3. Reinicia Brave
4. Abre las opciones de Samjoko → «Bóveda» → selecciona carpeta destino

### 3. Verificar funcionamiento

- [ ] Popup abre correctamente (`Ctrl+Shift+K`)
- [ ] Captura rápida guarda un `.md` en la carpeta (`Ctrl+Shift+S`)
- [ ] Editor de bloques abre en panel lateral
- [ ] Copiar y descargar funcionan sin FSA

## Solución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| «Carpeta no configurada» al guardar | FSA desactivado o permiso denegado | Activar flag FSA; re-seleccionar carpeta en opciones |
| Side panel no visible | UX de Brave distinta a Chrome | Abrir desde burbuja de extensiones |
| Contenido vacío | Página restringida o SPA sin DOM estático | Usar editor de bloques con re-escaneo |
```

---

### Bloque ROADMAP — compatibilidad Brave

```markdown
## Fase X — Compatibilidad Brave

- [ ] **Probar extensión en Brave stable**: popup, side panel, captura rápida, guardado FSA
- [ ] **Detección de FSA no disponible**: aviso en opciones y popup cuando `showDirectoryPicker` no existe
- [ ] **Aviso específico Brave**: instrucciones del flag `file-system-access-api`
- [ ] **Documentación**: sección Brave en README + `docs/GUIA - Instalacion Brave.md`
- [ ] **Fallback UX**: destacar Copiar/Descargar cuando guardado en carpeta no esté disponible
```

---

### Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Clonar repo para Brave? | **No** |
| ¿Manifiesto separado? | **No** (sí para Firefox en el futuro) |
| ¿Funciona out-of-the-box? | **Casi** — FSA requiere flag en Brave |
| ¿Qué mejorar primero en captura? | Inline Markdown, anti-duplicación, detección de contenido principal |
| ¿Mayor salto de calidad? | Readability.js + modos de captura |

---

## Referencias

- `docs/PROY - Roadmap.md` — fases 5, 5.5, 5.6, 5.9–5.16, 6
- `docs/REF - WEB-CLIPPER.md` — schema frontmatter Vivero
- `docs/IDEA - Obsidian Boveda Vision.md` — visión bóveda y tags por dominio
- [Brave blog — Manifest V3](https://brave.com/blog/brave-shields-manifest-v3/)
- [Brave — File System Access API (flag)](https://github.com/brave/brave-browser/issues/18979)
- [Brave — Side Panel API (regresiones corregidas)](https://github.com/brave/brave-browser/issues/32132)

---

## Decisiones tomadas (2026-07-08)

Todas las propuestas de este documento han sido integradas en el ROADMAP v1.1 como sub-fases 5.9–5.16.

| Propuesta | ROADMAP | Decisión |
|-----------|---------|----------|
| Extractor inline recursivo | **5.9** | Integrar ahora |
| Anti-duplicación DOM | **5.10** | Integrar ahora |
| Detección inteligente raíz | **5.11** | Integrar ahora (niveles 1+2+3) |
| Metadatos enriquecidos | **5.12** | Integrar ahora |
| Multimedia/lazy images | **5.13** | Integrar ahora |
| Code inline vs bloque | **5.14** | Integrar ahora |
| Captura de chats IA | **5.15** | **Prioridad alta** — nueva línea |
| Compatibilidad Brave | **5.16** | Integrar ahora |

### Nueva línea: Chats IA

Se crea `extractor-chats-ia.js` como extractor dedicado para conversaciones con IA. Platforms objetivo: ChatGPT, Gemini, Claude, Copilot. El extractor detecta patrones de chat, preserva código, filtra UI del chat y añade etiquetas de rol.

### Quick wins confirmados (1–2 sprints)

1. `extractor-inline.js` + integración en extractores de bloque
2. Anti-duplicación en recorrido DOM (walker)
3. `detectarRaizContenido()` con heurísticas + scoring
4. Canonical URL + `<time>` + JSON-LD `@graph`
5. Lazy images + filtrado decorativos

### Proyectos medianos

6. Readability.js embebido como fallback
7. `extractor-chats-ia.js` (plataformas principales)
8. Reglas por dominio en `assets/reglas-sitio.json`
9. Compatibilidad Brave (docs + detección FSA)

### Largo plazo

10. Wikilinks + plantillas Templater
11. CompromiseJS / NLP local
12. Selección manual por clic (Fase 6)
