---
tipo: LEGAL
tema: Política de Privacidad
proyecto: Samjoko Web Clipper
version: 1.2
estado: activo
fecha: 2026-09-23
idiomas: [es, en]
---

# Política de Privacidad / Privacy Policy — Samjoko Web Clipper

**Última actualización / Last updated: 23 de septiembre de 2026 / September 23, 2026**

---

## Español

### 1. Resumen ejecutivo

**Samjoko Web Clipper no recopila, transmite ni almacena datos personales en servidores externos.** Todo el procesamiento de datos ocurre localmente en tu navegador y en tu sistema de archivos. Tú tienes control total sobre tu información.

Samjoko Web Clipper («la extensión») es una extensión de navegador para Chrome y Firefox desarrollada por HarpoPan. Esta política describe cómo se maneja la información cuando utilizas la extensión.

### 2. Información que se procesa

La extensión solo accede a datos cuando **tú la activas explícitamente** (haciendo clic en un botón o usando un atajo de teclado). Nunca recopila datos de forma pasiva o automática. Cuando la activas, puede acceder a:

- **Contenido de la página web activa**: texto, encabezados, listas, enlaces, código, citas, tablas e imágenes de la página que estás viendo, con el único propósito de convertirlos a Markdown.
- **Metadatos de la página**: título, URL, autor, fecha de publicación, idioma, nombre del sitio, tipo de contenido, imagen destacada y tiempo estimado de lectura. Se extraen de las etiquetas `<meta>` (OpenGraph, Schema.org, Dublin Core) y del propio contenido.
- **Configuración de la extensión**: tus preferencias de idioma, tema visual, carpeta de destino y campos de metadatos incluidos en las capturas.

**La extensión NO recopila:**

- Datos de navegación generales (historial, búsquedas, sitios visitados)
- Datos de geolocalización o de ubicación
- Información de la cuenta de Google
- Datos de contacto (nombre, correo electrónico, teléfono)
- Información financiera o de pago
- Contraseñas o credenciales de acceso
- Cookies de rastreo

### 3. Cómo se procesan los datos

El procesamiento es completamente local:

1. Cuando haces clic en el botón de captura o usas el atajo, la extensión extrae el contenido de la pestaña activa.
2. El contenido se convierte a formato Markdown en tu navegador.
3. En Chrome, la extensión te pide que selecciones una carpeta mediante la File System Access API y el archivo se guarda directamente en ella.
4. En Firefox, que no dispone de esa API, el archivo se guarda como descarga mediante la Downloads API.
5. La configuración (idioma, tema, subcarpeta, preferencias) se almacena en `chrome.storage.sync` e IndexedDB.

**En ningún momento los datos salen de tu navegador o de tu equipo.**

### 4. Uso de los datos

Los datos se usan exclusivamente para extraer y convertir páginas a Markdown, permitirte revisar y editar los bloques, guardar el archivo en la carpeta que designes y recordar tus preferencias.

Los datos **no se usan** para publicidad personalizada, análisis o estadísticas, perfilado del usuario, creación de perfiles de intereses, ni determinación de solvencia crediticia o préstamos.

### 5. Compartición de datos con terceros

**No compartimos, vendemos ni transferimos datos a terceros.** La extensión:

- No envía datos a servidores externos.
- No utiliza servicios de análisis ni telemetría.
- No incluye publicidad ni vende datos de usuario.
- No transfiere datos a plataformas publicitarias, corredores de datos ni revendedores.

Las únicas excepciones son: si tú compartes el archivo Markdown manualmente, y si la ley lo requiere.

### 6. Almacenamiento y seguridad

- **Capturas (archivos Markdown)**: se guardan en la carpeta que tú seleccionas; la extensión no accede a archivos fuera de esa carpeta.
- **Configuración**: `chrome.storage.sync` (sincronizada entre dispositivos si lo tienes activado) y el manejador de carpeta en IndexedDB local.
- **Permisos de archivos**: solo escritura sobre la carpeta que eliges explícitamente; puedes revocarla en cualquier momento.

No se usan tecnologías de cifrado adicionales porque los datos nunca abandonan tu dispositivo. Las operaciones de extracción ocurren mediante scripts inyectados en la pestaña activa y no hay transmisión de datos por red.

### 7. Control del usuario sobre sus datos

- **Acceso**: puedes ver todos los archivos generados en la carpeta elegida.
- **Edición y supresión**: puedes editar o eliminar cualquier captura desde tu sistema de archivos.
- **Carpeta**: puedes cambiarla o revocar el permiso en cualquier momento desde las opciones.
- **Configuración**: puedes restablecerla desde la página de opciones.
- **Desinstalación**: al desinstalar se elimina la configuración almacenada; tus archivos Markdown permanecen en tu equipo.

### 8. Permisos de la extensión

| Permiso | Propósito |
|---------|-----------|
| `activeTab` | Acceder a la pestaña activa solo cuando haces clic en un botón |
| `scripting` | Inyectar el extractor de contenido en la página activa |
| `storage` | Guardar preferencias de configuración |
| `notifications` | Mostrar confirmaciones de captura o errores |
| `sidePanel` | Abrir el editor de bloques en el panel lateral (Chrome) |
| `downloads` | Guardar capturas como descargas en navegadores sin File System Access API (Firefox) |
| `<all_urls>` | Extraer contenido de cualquier página, solo bajo demanda explícita del usuario |

### 9. Menores de edad

La extensión no está dirigida a menores de 13 años y no recopila intencionadamente datos de menores de edad.

### 10. Cumplimiento con GDPR y otras regulaciones

Dado que no se recopilan datos personales ni se envían a servidores, no se requiere consentimiento para cookies o tracking. No obstante, reconocemos tus derechos:

- **Acceso**: consulta la configuración almacenada en las opciones.
- **Rectificación**: modifica tu configuración en cualquier momento.
- **Supresión**: elimina la configuración desinstalando la extensión.
- **Portabilidad**: tu configuración se sincroniza entre dispositivos con Chrome.
- **Oposición**: puedes dejar de usar la extensión en cualquier momento.

### 11. Limitación de uso (Limited Use)

El uso de la información recibida a través de las APIs de Chrome y Google se adhiere a la Chrome Web Store User Data Policy, incluidos los requisitos de Limited Use: los datos solo se usan para extraer y guardar contenido web localmente, no se transfieren a terceros, no se permite que humanos los lean sin consentimiento explícito y no se usan para anuncios ni para determinar solvencia crediticia.

### 12. Actualizaciones de esta política y contacto

Los cambios se publicarán en este mismo documento y en el repositorio del proyecto. Te recomendamos revisarlo periódicamente.

- **GitHub Issues**: https://github.com/LaHermita/samjoko-web-clipper/issues
- **Correo electrónico**: harpodev@proton.me

---

## English

### 1. Executive summary

**Samjoko Web Clipper does not collect, transmit, or store personal data on external servers.** All data processing occurs locally in your browser and on your file system. You have full control over your information.

Samjoko Web Clipper ("the extension") is a browser extension for Chrome and Firefox developed by HarpoPan. This policy describes how information is handled when you use the extension.

### 2. Information processed

The extension only accesses data when **you explicitly trigger it** (by clicking a button or using a keyboard shortcut). It never collects data passively or automatically. When triggered, it may access:

- **Active tab content**: text, headings, lists, links, code, blockquotes, tables and images from the page you are viewing, solely to convert them to Markdown.
- **Page metadata**: title, URL, author, publication date, language, site name, content type, featured image and estimated reading time, extracted from `<meta>` tags (OpenGraph, Schema.org, Dublin Core) and from the content itself.
- **Extension configuration**: your language, theme, destination folder and metadata preferences.

**The extension does NOT collect:**

- General browsing data (history, searches, visited sites)
- Geolocation or location data
- Google account information
- Contact information (name, email, phone)
- Financial or payment information
- Passwords or access credentials
- Tracking cookies

### 3. How data is processed

Processing is entirely local:

1. When you click the capture button or use the shortcut, the extension extracts content from the active tab.
2. The content is converted to Markdown in your browser.
3. On Chrome, the extension asks you to pick a folder through the File System Access API and saves the file directly there.
4. On Firefox, which does not provide that API, the file is saved as a browser download through the Downloads API.
5. Configuration (language, theme, subfolder, preferences) is stored in `chrome.storage.sync` and IndexedDB.

**At no point do data leave your browser or your device.**

### 4. Data usage

Data is used exclusively to extract and convert pages to Markdown, let you review and edit the blocks, save the file to the folder you designate, and remember your preferences.

Data is **not** used for personalized advertising, analytics or statistics, user profiling, interest profiling, or credit-worthiness determination or lending.

### 5. Data sharing

**We do not share, sell, or transfer data to third parties.** The extension:

- Sends no data to external servers.
- Uses no analytics or telemetry services.
- Includes no advertising and sells no user data.
- Transfers no data to advertising platforms, data brokers, or resellers.

The only exceptions are: if you manually share the generated Markdown file, and if required by law.

### 6. Storage and security

- **Captures (Markdown files)**: saved to the folder you select; the extension does not access files outside it.
- **Configuration**: `chrome.storage.sync` (synced across devices if enabled) and the folder handle in local IndexedDB.
- **File permissions**: write access only to the folder you explicitly choose, revocable at any time.

No additional encryption is used because data never leaves your device. Extraction runs in scripts injected into the active tab and no data is transmitted over the network.

### 7. User control

- **Access**: view all generated files in the chosen folder.
- **Editing and deletion**: edit or delete any capture from your file system.
- **Folder**: change it or revoke access at any time from the options.
- **Configuration**: reset it from the options page.
- **Uninstallation**: uninstalling removes stored configuration; your Markdown files remain on your device.

### 8. Extension permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access the active tab only when you click a button |
| `scripting` | Inject the content extractor into the active page |
| `storage` | Store configuration preferences |
| `notifications` | Show capture confirmations or errors |
| `sidePanel` | Open the block editor in the side panel (Chrome) |
| `downloads` | Save captures as downloads on browsers without the File System Access API (Firefox) |
| `<all_urls>` | Extract content from any page, only on the user's explicit request |

### 9. Children

The extension is not directed at children under 13 years of age and does not intentionally collect data from minors.

### 10. GDPR compliance

Since no personal data is collected or sent to servers, no cookie or tracking consent is required. We still recognize your rights of access, rectification, erasure, portability and objection, exercisable through the options page, uninstallation, or by ceasing use of the extension.

### 11. Limited Use statement

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements: data is used only to extract and save web content locally, is not transferred to third parties, is not read by humans without explicit consent, and is not used for advertising or credit scoring.

### 12. Policy updates and contact

Changes will be published in this document and in the project repository. We recommend reviewing it periodically.

- **GitHub Issues**: https://github.com/LaHermita/samjoko-web-clipper/issues
- **Email**: harpodev@proton.me
