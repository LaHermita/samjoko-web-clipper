---
tipo: CHK
tema: Accesibilidad
---

# CHK - Accesibilidad

Checklist verificable de accesibilidad para Samjoko Web Clipper. Basada en WCAG 2.1 nivel AA.

## Estructura semántica

- [ ] **Popup**: `<header>` + `<main>` + `<nav>` correctos
- [ ] **Opciones**: `<main>` con `<section>`s, `<footer>`, `<h1>` + `<h3>` jerarquía correcta
- [ ] **Editor**: `<header>` + `<main>` + `<h1>` + `<h2>` jerarquía correcta
- [ ] **Onboarding**: `role="dialog"`, `aria-modal="true"`, foco inicial gestionado
- [ ] **Landmarks**: `<nav>` con `aria-label` dinámico
- [ ] **Idioma**: `lang` en `<html>` se actualiza al cambiar idioma (popup, opciones, editor)

## Teclado

- [ ] **Popup**: Tab recorre header, 3 botones, info carpeta, notas, acciones notas
- [ ] **Opciones**: Tab recorre selectores, input, botones, checkboxes, footer
- [ ] **Editor**: Tab recorre reescanear, metadatos, botón seleccionar, bloques, acciones
- [ ] **Onboarding**: Tab cíclico dentro del diálogo, sin escapes
- [ ] **Focus visible**: todos los elementos interactivos tienen `:focus-visible`
- [ ] **Atajos documentados**: Ctrl+Shift+K y Ctrl+Shift+S visibles en opciones y popup

## Lectores de pantalla

- [ ] **SVG decorativos**: `aria-hidden="true"` en todos los iconos decorativos
- [ ] **Botones funcionales**: todos con `aria-label` descriptivo
- [ ] **Formularios**: todos `<input>`/`<select>`/`<textarea>` con `<label for="...">`
- [ ] **Toasts**: `#zonaToast` con `aria-live="polite"`
- [ ] **Barra progreso**: `role="progressbar"` + `aria-live="polite"`
- [ ] **Info carpeta**: `role="status"` para anunciar cambios dinámicos
- [ ] **Onboarding**: `aria-describedby` vinculado a la descripción del paso
- [ ] **Select all toggle**: `aria-pressed` dinámico

## Contraste y color

- [ ] **Tema Samjoko (oscuro)**: verificar ratio 4.5:1 texto normal, 3:1 texto grande
- [ ] **Tema Vivero (claro)**: verificar ratio 4.5:1
- [ ] **Tema Nautilus (cálido)**: verificar ratio 4.5:1
- [ ] **Tema Akkoro (cyberpunk)**: verificar ratio 4.5:1
- [ ] **Estados hover/focus/active/disabled**: mantener contraste suficiente
- [ ] **Independencia del color**: info carpeta usa icono + texto + color (no solo color)

## Zoom y escalado

- [ ] **Popup**: funciona a 200% sin recortes
- [ ] **Opciones**: cuadrícula responsive se adapta
- [ ] **Editor**: reflujo correcto a 200%

## Pruebas manuales

- [ ] **Flujo completo con NVDA/VoiceOver**: abrir popup → capturar → revisar editor → guardar
- [ ] **Solo teclado**: completar todas las acciones sin ratón
- [ ] **Cambio de idioma**: verificar que `lang` y traducciones se actualizan
