---
version: 1.1
fecha: 2026-06-29
estado: ACTIVO
descripcion: Schema de frontmatter YAML para documentos capturados desde web (Chrome extension). Compatible con Vivero: parser K1, merge rule NLP, grafo, timeline, MAPAS, companions. v1.1: añadidos idioma, sitio_nombre, tipo_contenido, imagen_destacada, tiempo_lectura, notas_personales.
tipo: Referencia de integración
---

# REF - WEB CLIPPER — Frontmatter para captura web

**Propósito**: Definir los campos YAML que la Chrome extension debe generar para que los documentos clippeados sean 100% compatibles con las features actuales y futuras de Vivero (parser K1, merge rule NLP, grafo multidimensional, timeline, MAPAS, Naulux, Akkoro).

---

## 1. Schema — Campos que genera la extension

Son los que la extension **puede y debe** escribir al crear el markdown desde la web. Coinciden con la metadata que el scraper puede extraer de la página.

```yaml
---
url_origen: <string>           # URL canónica de la página (obligatorio)
fecha_captura: <YYYY-MM-DD>    # Fecha en que se hizo el clip (obligatorio)
fecha_publicacion: <YYYY-MM-DD> # Fecha de publicación del artículo (si disponible)
autor: <string>                 # Autor de la fuente original (si disponible)
titulo: <string>                # Título del documento (obligatorio)
tipo: fuente                    # Fijo para web clippings (obligatorio)
tags: [<string>, ...]           # Tags manuales que el usuario añade al hacer clip
descripcion: <string>           # Resumen breve de 1-2 líneas (opcional)
idioma: <string>                # Código ISO 639-1 (es, en, pt...) (opcional)
sitio_nombre: <string>          # Nombre del sitio web (og:site_name o dominio) (opcional)
tipo_contenido: <string>        # Subcategoría: articulo | tutorial | documentacion | noticia | video | otro (opcional)
imagen_destacada: <string>      # URL de la imagen destacada (og:image) (opcional)
tiempo_lectura: <integer>       # Minutos estimados de lectura (calculado) (opcional)
notas_personales: <string>      # Nota privada del usuario al capturar (opcional)
estado: ACTIVO                  # Recomendado (opcional, por defecto ACTIVO)
---
```

### 1.1 Detalle por campo

| Campo | Tipo | Obligatorio | Origen | Uso en Vivero |
|---|---|---|---|---|
| `url_origen` | string | Sí | `document.URL` o `location.href` | Citación, detección de duplicados (Naulux), dimensión de relación en grafo (§3.2), clustering por dominio |
| `fecha_captura` | date | Sí | `new Date().toISOString().split('T')[0]` | Timeline, health score frescura (Naulux), filtros temporales |
| `fecha_publicacion` | date | No | Meta tags (`article:published_time`, `datePublished`) | Timeline cronológico real, ordenación, visto bueno Naulux |
| `autor` | string | No | Meta tags (`author`, `article:author`) | Dimensión de relación (§3.2), filtro en MAPAS (§3.3), Naulux |
| `titulo` | string | Sí | `document.title` | Identificador del doc, grafo por título (actual), DataView |
| `tipo` | string | Sí | **Siempre `fuente`** | Coloreado G3 + §3.9, agrupación en MAPAS, health score |
| `tags` | string[] | No | Input del usuario al clipear | Filtros, DataView, Naulux consistencia de tags |
| `descripcion` | string | No | Primer párrafo o meta description | Vista cards MAPAS, preview en explorador |
| `idioma` | string | No | `<html lang="...">` o detección por contenido | Filtros en DataView (G4), health score Naulux, búsqueda semántica futura, Agrupación en MAPAS por idioma |
| `sitio_nombre` | string | No | `<meta property="og:site_name">` o dominio de `url_origen` | Dimensión de relación adicional (§3.2), agrupación en MAPAS por fuente, Naulux consistencia de fuentes |
| `tipo_contenido` | string | No | `<meta property="og:type">`, schema.org `@type` | Subcategoría de `tipo: fuente` — `articulo`, `tutorial`, `documentacion`, `noticia`, `video`, `otro`. Filtros en DataView, cards en MAPAS |
| `imagen_destacada` | string | No | `<meta property="og:image">` o `<link rel="image_src">` | Preview visual en cards MAPAS (§3.3), miniatura en DataView, enriquece explorador futuro |
| `tiempo_lectura` | integer | No | Calculado: `Math.ceil(palabras / 238)` (238 wpm promedio) | Sparkline en DataView, filtro "lectura rápida" en MAPAS, planificación personal. Se calcula al capturar y se persiste en frontmatter |
| `notas_personales` | string | No | Input del usuario (textarea en popup de captura) | Anotación privada "por qué clipeé esto". No se procesa con NLP. Se muestra en vista detalle del documento |
| `estado` | string | No | Por defecto `ACTIVO` | Filtro, ciclo de vida del doc |

---

## 2. Campos que NO genera la extension (los pone Vivero después)

Estos campos son responsabilidad del pipeline NLP (Sprint R, K5 — `servicioFrontmatterNLP`) y **no deben aparecer** en el markdown de salida de la extension.

| Campo | Generado por | Cuándo | Función |
|---|---|---|---|
| `tags_auto` | CompromiseJS (K3 + K5) | Al guardar/editar en Vivero | Tags extraídos del contenido. Merge rule: se unen con `tags` en UI sin pisarlos |
| `entidades` | CompromiseJS NER | Al guardar/editar en Vivero | Personas, lugares, organizaciones → dimensión de relación (§3.2) |
| `temas` | CompromiseJS | Al guardar/editar en Vivero | Conceptos principales del contenido |
| `palabras` | NLP pipeline | Al guardar/editar en Vivero | Word count para DataView, sparklines. Refina el `tiempo_lectura` que la extension calcula al capturar |
| `autogenerado_por` | servicioFrontmatterNLP | Al procesar el doc | Marca `vivero-compromise` indicando que fue analizado |
| `derivado_de` | File-back §3.7 | Solo en notas derivadas | Lista de docs fuente (no aplica a web clippings) |

**Nota sobre `tiempo_lectura` vs `palabras`**: la extension calcula `tiempo_lectura` al capturar usando el body del contenido (estimación rápida). Cuando Vivero procese el doc con NLP (K5), `palabras` proporciona un word count preciso que puede refinar `tiempo_lectura`. Ambos campos coexisten — el primero es una estimación inmediata, el segundo es el valor canónico post-procesamiento.

---

## 3. Merge rule (futura, documentada para compatibilidad)

Cuando el pipeline NLP (K5) procese el documento, seguirá esta regla para no pisar lo que la extension escribió:

```
tags: [tecno, javascript]           ← manual (escrito por extension/usuario)
tags_auto: [web, programacion, ui]  ← generado por CompromiseJS

→ En UI se muestran fusionados: tecno, javascript, web, programacion, ui
→ Al guardar, cada grupo permanece en su campo
→ El usuario puede borrar tags_auto sin perder tags manuales
```

Misma regla aplica a `tipo:` — la extension siempre pone `fuente`, y el usuario puede cambiarlo después a `síntesis` / `entidad` / `concepto` / `moc`. El NLP **nunca** sobrescribe `tipo`.

Los campos nuevos de la extension (`idioma`, `sitio_nombre`, `tipo_contenido`, `imagen_destacada`, `tiempo_lectura`, `notas_personales`) se comportan igual que `url_origen` o `autor`: la extension los escribe al capturar, y Vivero **nunca los sobrescribe** (son campos de origen, no de análisis).

---

## 4. Ejemplo completo

```markdown
---
url_origen: https://calnewport.com/deep-work-economia-conocimiento
fecha_captura: 2026-06-29
fecha_publicacion: 2016-01-05
autor: Cal Newport
titulo: Deep Work y la economía del conocimiento
tipo: fuente
tags: [productividad, foco]
descripcion: Reflexión sobre el trabajo profundo en la era de las distracciones digitales
idioma: es
sitio_nombre: Cal Newport
tipo_contenido: articulo
imagen_destacada: https://calnewport.com/wp-content/uploads/deep-work-cover.jpg
tiempo_lectura: 18
notas_personales: Referencia para comparar con pomodoro y bloques de tiempo
estado: ACTIVO
---

# Deep Work y la economía del conocimiento

Contenido del artículo...
```

Cuando Vivero lo procese con el pipeline NLP (post-K5), quedará así:

```markdown
---
url_origen: https://calnewport.com/deep-work-economia-conocimiento
fecha_captura: 2026-06-29
fecha_publicacion: 2016-01-05
autor: Cal Newport
titulo: Deep Work y la economía del conocimiento
tipo: fuente
tags: [productividad, foco]
tags_auto: [deep-work, conocimiento, concentracion, economia]
entidades: [Cal Newport, Georgetown University]
temas: [economía del conocimiento, trabajo profundo]
palabras: 4200
autogenerado_por: vivero-compromise
idioma: es
sitio_nombre: Cal Newport
tipo_contenido: articulo
imagen_destacada: https://calnewport.com/wp-content/uploads/deep-work-cover.jpg
tiempo_lectura: 18
notas_personales: Referencia para comparar con pomodoro y bloques de tiempo
estado: ACTIVO
---
```

Obsérvese que `tags_auto` se añade sin tocar `tags`, y el resto de campos manuales (`url_origen`, `autor`, `tipo`) se conservan intactos.

---

## 5. Proyección en features de Vivero

| Feature | Campo(s) clave | Sprint |
|---|---|---|
| **Grafo 2D** — coloreado por tipo | `tipo` | G3 + §3.9 |
| **Grafo 2D** — dimensión por autor | `autor` | G4 + §3.2 |
| **Grafo 2D** — dimensión por sitio | `sitio_nombre` | G4 + §3.2 (extensión) |
| **Tabla Bóveda / DataView** — filtros | `tags`, `autor`, `tipo`, `fecha_publicacion`, `idioma`, `tipo_contenido` | G4 |
| **Tabla Bóveda / DataView** — columnas | `tiempo_lectura`, `imagen_destacada` (miniatura) | G4 |
| **Timeline** | `fecha_captura`, `fecha_publicacion` | Backlog |
| **MAPAS** — cards agrupadas | `tipo`, `tags`, `autor`, `sitio_nombre`, `idioma` | §3.3 (backlog) |
| **MAPAS** — cards visuales | `imagen_destacada` (preview en card) | §3.3 (backlog) |
| **Naulux** — health score | `url_origen` (duplicados), `fecha_captura` (frescura), `idioma` (consistencia) | SPEC-COMPANIONS |
| **Naulux** — consistencia tags | `tags` | SPEC-COMPANIONS |
| **Naulux** — fuentes repetidas | `sitio_nombre` (agrupación por dominio) | SPEC-COMPANIONS |
| **Naulux** — validador frontmatter | Todos | SPEC-COMPANIONS (requiere K1) |
| **Akkoro** — log KM | `url_origen`, `autor` | Q8 |
| **Notas derivadas** (§3.7) | `url_origen`, `autor`, `fecha_publicacion` | Backlog |

---

## 6. Notas técnicas para la extension

1. **Sanitizar `titulo`**: convertir a texto plano (quitar emojis, saltos de línea, HTML entities)
2. **`fecha_publicacion`**: intentar extraer de `<meta property="article:published_time">`, `<meta name="date">`, `<time>` elements, o schema.org JSON-LD. Si no se encuentra, omitir el campo (no poner `null` ni string vacío)
3. **`tags`**: si el usuario no añade ninguno, omitir el campo entero en vez de `tags: []`
4. **`descripcion`**: usar `<meta name="description">` o el primer párrafo relevante, truncado a ~200 caracteres
5. **Formato fecha**: estricto `YYYY-MM-DD`. Si solo se dispone de datetime completo, truncar a fecha
6. **Compatibilidad hacia atrás**: el parser K1 debe aceptar documentos sin frontmatter o con solo `fecha:` (formato legacy del explorador). La extension **no debe** generar ese formato legacy
7. **`idioma`**: extraer de `<html lang="...">`. Si no existe, intentar detección por contenido (CompromiseJS futuro) o omitir. Código ISO 639-1 minúscula (`es`, `en`, `pt`, `fr`)
8. **`sitio_nombre`**: extraer de `<meta property="og:site_name">`. Fallback: dominio de `url_origen` sin `www.` ni path (ej: `calnewport.com`). Omitir si no se puede determinar
9. **`tipo_contenido`**: mapear de `<meta property="og:type">` o schema.org `@type`:
   - `article`, `blogposting`, `newsarticle` → `articulo`
   - `tutorial`, `howto` → `tutorial`
   - `documentation`, `techarticle` → `documentacion`
   - `news`, `newscollection` → `noticia`
   - `video`, `videoobject` → `video`
   - Cualquier otro → `otro`. Si no se detecta, omitir el campo
10. **`imagen_destacada`**: extraer de `<meta property="og:image">` o `<link rel="image_src" href="...">`. Validar que es URL absoluta (relativizar contra `url_origen` si es relativa). Omitir si no existe
11. **`tiempo_lectura`**: calcular con el body del contenido extraído. Fórmula: `Math.ceil(bodyText.split(/\s+/).length / 238)`. Redondear a entero superior. Si no se puede calcular, omitir
12. **`notas_personales`**: textarea en popup de captura. Si el usuario no escribe nada, omitir el campo entero. No sanitizar contenido (el usuario es el autor)

---

## 7. Referencias

- `docs/PROY - ROADMAP.md` — Sprint R (K1-K5), G3, G4, Q8
- `docs/LAB - INSPIRACIONES-PROYECTOS.md` — §3.1 Frontmatter enriquecido, §3.2 dimensiones, §3.9 tipo
- `docs/SPEC - COMPANIONS.md` — Naulux, Akkoro
- `docs/IDEA - BANCO-IDEAS.md` — DataView, Timeline, MAPAS
- `docs/REF - TAXONOMIA DEVS.md` — Convención de frontmatter en documentación
- `docs/GUIA - INTEGRACION-CODIGO-EXTERNO.md` — Política de librerías externas (js-yaml para K1)
