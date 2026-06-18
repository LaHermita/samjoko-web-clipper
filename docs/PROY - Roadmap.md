---
version: 0.5
estado: en-progreso
fase: 1-completada
---

> [!summary] Resumen
> Hoja de ruta de Samjoko Nav Extension. El objetivo final es ser el companion de navegador del ecosistema Vivero: capturar contenido web, convertirlo a Markdown estructurado y llevarlo a la bóveda de conocimiento.

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

- [ ] `sidePanel` en `manifest.json`, página `editor-bloques/editor.html`
- [ ] Content script devuelve bloques individuales (párrafos, headers, listas, código, tablas, imágenes)
- [ ] Cada bloque: checkbox para incluir/excluir + preview del contenido
- [ ] Markdown final se regenera al marcar/desmarcar bloques
- [ ] Metadatos detectados: autor, fecha (de meta tags), título limpio
- [ ] Botones: Guardar en bóveda, Descargar, Copiar, Cancelar
- [ ] Barra de progreso durante guardado

---

## Fase 3 — Configuración completa

Página de opciones expandida con todas las preferencias del usuario.

- [ ] **Idioma**: selector ES / EN (extensible a más)
- [ ] **Apariencia**: selector de tema visual (samjoko, vivero, nautilus, akkoro)
- [ ] **Bóveda**: selector de carpeta (ya existe) + subcarpetas configurables
- [ ] **Formato de nota**: template de frontmatter YAML configurable
- [ ] **Extracción**: elementos HTML a incluir/excluir, selectores CSS custom
- [ ] **Atajos**: configuración de comandos de teclado
- [ ] Persistencia en `chrome.storage.sync` para sincronización entre dispositivos
- [ ] Service worker: mensajes CRUD de configuración

---

## Fase 4 — Obsidian / Vivero nativo

Integración profunda con el ecosistema de la bóveda.

- [ ] **Frontmatter YAML** en cada captura (fecha, fuente, etiquetas, tipo)
- [ ] **Template de nota** con campo `tipo` para taxonomía propia
- [ ] **Limpieza inteligente** de contenido (excluir header, footer, nav, sidebars configurable)
- [ ] **Detección automática** de autor y fecha de publicación
- [ ] **Tags**: extraer keywords de la página + tags por dominio
- [ ] **`[[wikilinks]]`** para enlaces internos
- [ ] **URI de Vivero** para abrir la nota directamente en la app

---

## Fase 5 — Madurez

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
