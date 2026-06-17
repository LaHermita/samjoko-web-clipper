---
version: 0.2
estado: borrador
---

> [!summary] Resumen
> Hoja de ruta de Samjoko Nav Extension. El objetivo final es ser una puerta de entrada web para una bóveda Obsidian.

## V1 — Base funcional (actual)

- [x] Capturar contenido de páginas web a Markdown
- [x] Popup con botón capturar, copiar y descargar
- [x] Guardado directo a carpeta del disco vía `showDirectoryPicker`
- [x] Nombres `SAM - {titulo}.md`
- [x] Sin sobrescritura (sufijo -1, -2...)
- [x] Inyección automática del content script si falla la conexión
- [x] Página de opciones con selector de carpeta

## V2 — Obsidian nativo (siguiente)

- [ ] **Frontmatter YAML** en cada captura (fecha, fuente, etiquetas, tipo)
- [ ] Template único de nota con campo `tipo` para taxonomía propia
- [ ] Limpieza inteligente de contenido (excluir header, footer, nav, sidebars)
- [ ] Filtros configurables en opciones (qué elementos incluir/excluir)
- [ ] Detección automática de autor y fecha de publicación
- [ ] Tags: extraer keywords de la página + tags por dominio
- [ ] Usar `[[wikilinks]]` para enlaces internos
- [ ] Botón "Abrir en Obsidian" tras guardar (`obsidian://`)

## V3 — Madurez

- [ ] Migrar a Firefox
- [ ] Atajo de teclado para captura rápida
- [ ] Seleccionar elementos específicos de la página (clic para elegir)
- [ ] Varias carpetas de destino dentro de la vault (configurable)
- [ ] Vista previa del Markdown renderizado

## Futuro remoto

- Historial local de capturas
- Exportación por lote
- Auto-etiquetado por IA
- Sincronización bidireccional (web → Obsidian → web)
