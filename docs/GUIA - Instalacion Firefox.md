---
version: 1.1
estado: activo
fecha: 2026-09-23
---

> [!summary] Resumen
> Cómo empaquetar, cargar y probar Samjoko Web Clipper en Firefox. La extensión mantiene un único código base: el paquete Firefox se genera con `empaquetar-firefox.ps1` (Windows) o `empaquetar-firefox.sh` (Linux/macOS), que producen la carpeta `dist-firefox/` y el fichero único `dist-firefox.xpi`.

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

1. **Empaquetar** (desde la raíz del proyecto):

   - En Windows:

     ```powershell
     powershell -NoProfile -ExecutionPolicy Bypass -File empaquetar-firefox.ps1
     ```

   - En Linux/macOS:

     ```bash
     ./empaquetar-firefox.sh
     ```

     > [!note] Requisito
     > El script necesita `python3` (incluido en la mayoría de distribuciones) o, en su defecto, `jq` para transformar el `manifest.json`.

   Esto genera dos salidas:

   - `dist-firefox/` con el `manifest.json` transformado (event page, `sidebar_action`, permiso `downloads`, `gecko.id` y `data_collection_permissions` dentro de `browser_specific_settings.gecko`) y el resto del código sin modificar.
   - `dist-firefox.xpi`, el mismo paquete comprimido en **un único fichero** con `manifest.json` en la raíz del zip.

2. **Cargar en Firefox**:

   - Abre `about:debugging#/runtime/this-firefox`.
   - Clic en «Cargar complemento temporal...».
   - Selecciona `dist-firefox/manifest.json` (Firefox carga toda la carpeta que lo contiene) o `dist-firefox.xpi` (fichero único).

   > [!warning] Errores frecuentes
   > - **«No deja seleccionar el manifest»**: estás en `about:addons` → «Instalar complemento desde archivo…», cuyo filtro solo admite `*.xpi;*.jar;*.zip` y exige un complemento **firmado**. Para desarrollo usa siempre `about:debugging`.
   > - **«El complemento está dañado»**: el `.zip`/`.xpi` que has cargado tiene `manifest.json` anidado dentro (`dist-firefox/manifest.json`), típico de comprimir la carpeta desde el gestor de ficheros. Usa `dist-firefox.xpi`, que lo coloca en la raíz.

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
npx web-ext lint --source-dir dist-firefox    # 0 errores = paquete válido
npx addons-linter dist-firefox.xpi            # valida también el fichero único
npx web-ext build --source-dir dist-firefox   # genera web-ext-artifacts/*.zip para subir a AMO
```

## Pendientes conocidos (Firefox)

- `sidePanel.open` (popup → «Editor de bloques») **no está implementado en Firefox**: la lint marca `UNSUPPORTED_API`; hay que usar `chrome.sidebarAction.open()` con detección de navegador.
- Captura rápida por atajo (`Ctrl+Shift+S`): verificar que la inyección de emergencia funciona igual que en Chrome.
- Probar la subcarpeta en la descarga (Firefox normaliza la ruta relativa dentro de la carpeta de descargas).
- Firmar el add-on para instalación permanente.
