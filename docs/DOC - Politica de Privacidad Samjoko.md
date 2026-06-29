---
tipo: DOC
tema: Política de Privacidad
proyecto: Samjoko Web Clipper
estado: borrador
version: 1.0
fecha: 2026-06-29
idiomas: [es, en]
---

# Política de Privacidad / Privacy Policy

**Última actualización / Last updated: 29 de junio de 2026 / June 29, 2026**

---

## Español

Samjoko Web Clipper ("la extensión") es una extensión de navegador para Google Chrome desarrollada por HarpoPan. Esta política de privacidad describe cómo se maneja la información cuando utilizas la extensión.

### Resumen ejecutivo

**Samjoko Web Clipper no recopila, transmite ni almacena datos personales en servidores externos.** Todo el procesamiento de datos ocurre localmente en tu navegador y en tu sistema de archivos. Tú tienes control total sobre tu información.

---

### 1. Información que se procesa

La extensión procesa únicamente el contenido de la página web que tú seleccionas explícitamente para capturar. Esto incluye:

- **Contenido de la página**: texto, encabezados, listas, enlaces, código y bloque de citación del artículo o página visible.
- **Metadatos de la página**: título, URL, autor, fecha de publicación, etiquetas, descripción, idioma, nombre del sitio, tipo de contenido, imagen destacada y tiempo estimado de lectura. Estos metadatos se extraen de las etiquetas `<meta>` de la página (OpenGraph, Schema.org, Dublin Core) y del propio contenido.

**La extensión NO recopila:**

- Datos de navegación generales (historial, búsquedas, sitios visitados).
- Datos de geolocalización.
- Información de la cuenta de Google.
- Datos de contacto (nombre, correo electrónico, teléfono).
- Información financiera o de pago.
- Contraseñas o credenciales de acceso.
- Datos de ubicación.
- Cookies de rastreo.

### 2. Cómo se procesan los datos

El procesamiento es completamente local:

1. Cuando haces clic en el botón de captura o usas el atajo de teclado, la extensión extrae el contenido de la pestaña activa.
2. El contenido se convierte a formato Markdown en tu navegador.
3. La extensión te solicita que selecciones una carpeta de destino en tu sistema de archivos mediante la File System Access API.
4. El archivo Markdown se guarda directamente en la carpeta que tú elegiste.
5. Los metadatos de configuración (idioma, tema, subcarpeta, preferencias) se almacenan localmente en `chrome.storage.sync` e IndexedDB.

**En ningún momento los datos salen de tu navegador o de tu equipo.**

### 3. Uso de los datos

Los datos se utilizan exclusivamente para:

- Extraer y convertir el contenido de páginas web a formato Markdown.
- Permitirte revisar, editar y seleccionar bloques de contenido antes de guardarlos.
- Guardar el archivo resultante en la carpeta local que tú designes.
- Recordar tus preferencias de configuración (tema, idioma, subcarpeta).

Los datos **no se utilizan** para:

- Publicidad personalizada.
- Análisis o estadísticas.
- Perfilado del usuario.
- Creación de perfiles de intereses.
- Determinación de solvencia crediticia o préstamos.

### 4. Uso compartido de datos

**Samjoko Web Clipper no comparte, vende ni transfiere datos a terceros.**

No existen servidores propios, servicios de análisis, redes publicitarias ni proveedores de terceros que reciban información de la extensión.

Las únicas excepciones son:

- Si tú decides compartir el archivo Markdown generado manualmente (por ejemplo, enviándolo por correo electrónico o subiéndolo a un servicio).
- Si la ley lo requiere.

### 5. Almacenamiento y seguridad

- **Archivo Markdown**: se guarda en la carpeta de tu sistema de archivos que tú seleccionas. La extensión no tiene acceso a archivos fuera de esa carpeta.
- **Configuración**: se almacena en `chrome.storage.sync` e IndexedDB, que están protegidos por el navegador y vinculados a tu sesión de Chrome.
- **Permisos de archivos**: la extensión solicita permiso de escritura únicamente sobre la carpeta que tú seleccionas explícitamente. Puedes revocar este permiso en cualquier momento desde la configuración de la extensión.

No se utilizan tecnologías de cifrado adicionales porque los datos nunca abandonan tu dispositivo.

### 6. Control del usuario

Tienes control total sobre tus datos:

- **Acceso**: puedes ver todos los archivos generados en la carpeta que elegiste.
- **Edición**: puedes editar o eliminar cualquier archivo Markdown generado.
- **Supresión**: puedes borrar los archivos directamente desde tu sistema de archivos.
- **Configuración**: puedes restablecer la configuración de la extensión en cualquier momento desde la página de opciones.
- **Carpeta**: puedes cambiar la carpeta de destino o revocar el permiso de acceso en cualquier momento.
- **Desinstalación**: al desinstalar la extensión, se eliminan automáticamente los datos de configuración almacenados en el navegador.

### 7. Extensiones de menores de edad

Samjoko Web Clipper no está dirigida a menores de 13 años. No recopila intencionadamente datos de menores de edad.

### 8. Cambios en esta política

Si esta política de privacidad se modifica, la versión actualizada se publicará en la página de la extensión en la Chrome Web Store y en el repositorio del proyecto. Se recomienda revisar esta política periódicamente.

### 9. Contacto

Si tienes preguntas sobre esta política de privacidad o sobre el manejo de datos de la extensión, puedes contactar a través de:

- **Correo electrónico**: [pendiente de definir]
- **GitHub Issues**: [repositorio del proyecto]

### 10. Declaración de uso limitado (Limited Use)

El uso de la información recibida de las APIs de Google se adherirá a la Política de Datos de Usuario de Chrome Web Store, incluidos los requisitos de Uso Limitado.

---

## English

Samjoko Web Clipper ("the extension") is a browser extension for Google Chrome developed by HarpoPan. This privacy policy describes how information is handled when you use the extension.

### Executive summary

**Samjoko Web Clipper does not collect, transmit, or store personal data on external servers.** All data processing occurs locally in your browser and on your file system. You have full control over your information.

---

### 1. Information processed

The extension only processes the content of the web page you explicitly select to capture. This includes:

- **Page content**: text, headings, lists, links, code, and blockquotes from the visible article or page.
- **Page metadata**: title, URL, author, publication date, tags, description, language, site name, content type, featured image, and estimated reading time. This metadata is extracted from the page's `<meta>` tags (OpenGraph, Schema.org, Dublin Core) and from the content itself.

**The extension does NOT collect:**

- General browsing data (history, searches, visited sites).
- Geolocation data.
- Google account information.
- Contact information (name, email, phone).
- Financial or payment information.
- Passwords or access credentials.
- Location data.
- Tracking cookies.

### 2. How data is processed

Processing is entirely local:

1. When you click the capture button or use the keyboard shortcut, the extension extracts content from the active tab.
2. The content is converted to Markdown format in your browser.
3. The extension prompts you to select a destination folder on your file system using the File System Access API.
4. The Markdown file is saved directly to the folder you chose.
5. Configuration metadata (language, theme, subfolder, preferences) is stored locally in `chrome.storage.sync` and IndexedDB.

**At no point do data leave your browser or your device.**

### 3. Data usage

Data is used exclusively to:

- Extract and convert web page content to Markdown format.
- Allow you to review, edit, and select content blocks before saving.
- Save the resulting file to the local folder you designate.
- Remember your configuration preferences (theme, language, subfolder).

Data is **not** used for:

- Personalized advertising.
- Analytics or statistics.
- User profiling.
- Interest profiling.
- Credit-worthiness determination or lending.

### 4. Data sharing

**Samjoko Web Clipper does not share, sell, or transfer data to third parties.**

There are no proprietary servers, analytics services, advertising networks, or third-party providers that receive information from the extension.

The only exceptions are:

- If you choose to share the generated Markdown file manually (for example, by emailing it or uploading it to a service).
- If required by law.

### 5. Storage and security

- **Markdown file**: saved to the folder on your file system that you selected. The extension has no access to files outside that folder.
- **Configuration**: stored in `chrome.storage.sync` and IndexedDB, which are protected by the browser and linked to your Chrome session.
- **File permissions**: the extension requests write permission only for the folder you explicitly select. You can revoke this permission at any time from the extension settings.

No additional encryption technologies are used because data never leaves your device.

### 6. User control

You have full control over your data:

- **Access**: you can view all generated files in the folder you chose.
- **Editing**: you can edit or delete any generated Markdown file.
- **Deletion**: you can delete files directly from your file system.
- **Configuration**: you can reset the extension settings at any time from the options page.
- **Folder**: you can change the destination folder or revoke access permissions at any time.
- **Uninstallation**: when you uninstall the extension, stored configuration data is automatically removed from the browser.

### 7. Children's extensions

Samjoko Web Clipper is not directed at children under 13 years of age. It does not intentionally collect data from minors.

### 8. Policy changes

If this privacy policy is modified, the updated version will be published on the extension's Chrome Web Store page and on the project repository. It is recommended to review this policy periodically.

### 9. Contact

If you have questions about this privacy policy or about the extension's data handling, you can contact us through:

- **Email**: [to be defined]
- **GitHub Issues**: [project repository]

### 10. Limited Use statement

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.
