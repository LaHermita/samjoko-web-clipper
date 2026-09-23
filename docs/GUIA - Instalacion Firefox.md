---
version: 1.0
estado: en-progreso
---

> [!summary] Resumen
> Cómo empaquetar, cargar y probar Samjoko Web Clipper en Firefox. La extensión mantiene un único código base: el paquete Firefox se genera con `empaquetar-firefox.ps1` en `dist-firefox/`.

---

## Diferencias clave Chrome vs Firefox

| Elemento | Chrome | Firefox |
|----------|--------|---------|
| Background | Service worker | Event page (`background.scripts`) |
| Panel lateral | `side_panel` + `chrome.sidePanel` | `sidebar_action` + `chrome.sidebarAction` |
| Guardado en carpeta | File System Access API | **No disponible** → Downloads API (`.md` descargado) |
| Permisos de host | Concedidos al instalar | Aprobados en la instalación (MV3) |
| ID de complemento | Opcional | Obligatorio (`browser_specific_settings.gecko.id`) |

## Pasos de instalación

1. **Empaquetar** (en Windows, desde la raíz del proyecto):

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File empaquetar-firefox.ps1
   ```

   Esto genera `dist-firefox/` con el `manifest.json` transformado (event page, `sidebar_action`, permiso `downloads`, `gecko.id` y `data_collection_permissions`) y copia el resto del código sin modificar.

2. **Cargar en Firefox**:
   - Abre `about:debugging#/runtime/this-firefox`.
   - Clic en «Cargar complemento temporal...».
   - Selecciona cualquier archivo del paquete, por ejemplo `dist-firefox/manifest.json`.

   > [!note] Nota
> Los complementos temporales se pierden al reiniciar Firefox. Para uso diario, firma el paquete con `web-ext sign` o instálalo desde addons.mozilla.org.

3. **Probar el flujo básico**:
   - Captura rápida: popup → «Captura rápida» → notas/tags → «Guardar en carpeta» (se descarga el `.md`).
   - Editor de bloques: popup → «Editor de bloques» (abre la barra lateral de Firefox).
   - Copiar y Descargar desde el editor: funcionan igual que en Chrome.

## Verificación (checklist rápida)

- [ ] El background arranca sin errores (consola de `about:debugging` → «Inspeccionar»).
- [ ] El sidebar muestra el editor de bloques y extrae la pestaña web activa.
- [ ] La captura rápida descarga el `.md` con frontmatter correcto.
- [ ] El popup muestra el aviso de modo descarga.
- [ ] Opciones muestra el aviso «File System Access API no disponible».
- [ ] Cambio de tema e idioma funcionales.

## Empaquetado para AMO

```bash
npx web-ext build --source-dir dist-firefox
npx web-ext lint --source-dir dist-firefox
```

## Pendientes conocidos (Firefox)

- Captura rápida por atajo (`Ctrl+Shift+S`): verificar que la inyección de emergencia funciona igual que en Chrome.
- Probar la subcarpeta en la descarga (Firefox normaliza la ruta relativa dentro de la carpeta de descargas).
- Firmar el add-on para instalación permanente.
