<p align="center">
  <picture>
    <img alt="Samjoko Web Clipper" src="assets/icons/Samjoko-Icono_Circular_128px.png" width="96" height="96">
  </picture>
</p>

<h1 align="center">Samjoko Web Clipper</h1>

<p align="center">
  <strong lang="es">Companion de navegador del Vivero. Captura páginas web, conviértelas a Markdown y llévalas a tu bóveda de conocimiento.</strong>
  <br>
  <em lang="en">Browser companion for Vivero. Capture web pages, convert them to Markdown, and bring them into your knowledge vault.</em>
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-4a90d9?style=flat-square&logo=googlechrome&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2022-f7df1e?style=flat-square&logo=javascript&logoColor=black">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS-Themes-1572b6?style=flat-square&logo=css3&logoColor=white">
  <img alt="IndexedDB" src="https://img.shields.io/badge/Storage-IndexedDB-7a9b5f?style=flat-square&logo=databricks&logoColor=white">
  <img alt="Licencia" src="https://img.shields.io/badge/Licencia-MIT-8c8986?style=flat-square">
  <img alt="Versión" src="https://img.shields.io/badge/Versión-0.2.0-d47a2c?style=flat-square">
</p>

---

## Acerca del proyecto / About

**Samjoko Web Clipper** es el companion de navegador de Samjoko, la mascota del ecosistema Vivero. Sam te permite capturar el contenido de cualquier página web, convertirlo en Markdown limpio y guardarlo directamente en tu bóveda de conocimiento. Como un cuervo recolector, Samjoko selecciona y transporta lo valioso de la web hasta tu espacio de conocimiento personal, ayudándote a conservar ideas, artículos y referencias de forma sencilla.

> Samjoko Web Clipper is the browser companion of Samjoko, the mascot of the Vivero ecosystem. Sam allows you to capture the content of any web page, convert it into clean Markdown, and save it directly to your knowledge vault. Like a gathering raven, Samjoko collects and carries valuable knowledge from the web to your personal space, helping you preserve ideas, articles, and references with ease.

---

## Características / Features

| Característica                                                    | Feature                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------- |
| Extrae el contenido principal de la página como Markdown            | Extracts main page content as Markdown                   |
| Editor de bloques en panel lateral para revisar antes de guardar     | Side panel block editor to review before saving          |
| Copia al portapapeles con un clic                                   | One-click copy to clipboard                              |
| Descarga como archivo `.md`                                         | Download as `.md` file                                   |
| Guarda directamente en una carpeta local (File System Access API)   | Save directly to a local folder (File System Access API) |
| Captura rápida con atajo de teclado `Ctrl+Shift+S`                  | Quick capture with `Ctrl+Shift+S` keyboard shortcut      |
| 4 temas visuales intercambiables                                    | 4 interchangeable visual themes                          |
| Persistencia con IndexedDB                                          | IndexedDB persistence                                    |
| Página de opciones integrada                                        | Built-in options page                                    |
| Sin dependencias externas                                           | No external dependencies                                 |

---

## Temas / Themes

| Tema     | Modo            | `data-theme` |
| -------- | --------------- | ------------ |
| Samjoko  | Oscuro (cuervo) | `samjoko`    |
| Vivero   | Claro natural   | `vivero`     |
| Nautilus | Cálido          | `nautilus`   |
| Akkoro   | Cyberpunk       | `akkoro`     |

El tema por defecto es **Samjoko**. Para cambiar de tema, modificá el atributo `data-theme` en el `<html>` o persistí la preferencia con `chrome.storage`.

---

## Instalación / Installation

### Para usuarios / For users

1. Descargá la extensión desde la [Chrome Web Store](#) _(próximamente)_.
2. Hacé clic en el icono de Samjoko en la barra de herramientas.
3. Navegá a cualquier página y capturala.

### Para desarrollo / For development

```bash
# Clonar el repositorio
git clone https://github.com/usuario/samjoko-nav-extension.git

# Cargar en Chrome
# 1. Abrí chrome://extensions
# 2. Activá «Modo desarrollador»
# 3. Clic en «Cargar descomprimida»
# 4. Seleccioná la carpeta del proyecto
```

---

## Arquitectura / Architecture

```
samjoko-nav-extension/
├── manifest.json              # Chrome Extension Manifest V3
├── _locales/                  # Traducciones i18n
│   ├── es/
│   │   └── messages.json
│   └── en/
│       └── messages.json
├── assets/
│   ├── themes.css             # Variables CSS de los 4 temas
│   ├── comun.css              # Estilos compartidos (body, button, mensajes)
│   └── icons/                 # Iconos de la extensión
├── componentes/
│   ├── barra-progreso.js      # Componente de barra de progreso
│   └── barra-progreso.css     # Estilos de la barra de progreso
├── ventana-emergente/         # Popup (browser action)
│   ├── ventana.html
│   ├── ventana.css
│   └── ventana.js
├── editor-bloques/             # Side panel (block editor)
│   ├── editor.html
│   ├── editor.css
│   └── editor.js
├── opciones/                   # Página de opciones
│   ├── opciones.html
│   ├── opciones.css
│   └── opciones.js
├── trabajador-fondo.js        # Service worker
├── extractor-contenido.js     # Content script
└── base-datos.js              # IndexedDB helper
```

---

## Permisos / Permissions

| Permiso          | Motivo                                                     |
| ---------------- | ---------------------------------------------------------- |
| `activeTab`      | Acceder al contenido de la pestaña activa al hacer clic    |
| `scripting`      | Inyectar el extractor de contenido en la página            |
| `storage`        | Guardar preferencias de usuario                            |
| `notifications`  | Mostrar notificaciones del sistema al usar atajo de teclado |
| `sidePanel`      | Abrir el editor de bloques en el panel lateral             |
| `host: <all_urls>`| Permitir al panel lateral re-escanear al cambiar de página  |

La extensión **no recolecta, almacena ni transmite datos personales**. Todo el procesamiento ocurre localmente en tu navegador.

---

## Tecnologías / Technologies

| Tecnología                       | Uso                                      |
| -------------------------------- | ---------------------------------------- |
| **Chrome Extension Manifest V3** | Estructura de la extensión               |
| **JavaScript** (ES2022)          | Lógica de extracción, UI y base de datos |
| **HTML5 / CSS3**                 | Interfaces del popup y opciones          |
| **CSS Custom Properties**        | Sistema de 4 temas intercambiables       |
| **IndexedDB**                    | Persistencia de configuraciones          |
| **File System Access API**       | Escritura directa de archivos en disco   |

---

## Privacidad / Privacy

Samjoko Web Clipper:

- No envía datos a servidores externos.
- No utiliza servicios de terceros.
- No recolecta telemetría ni analíticas.
- Todo el código se ejecuta localmente en el navegador del usuario.
- Los permisos solicitados son los mínimos necesarios para su funcionamiento.

---

## Licencia / License

MIT © [HarpoPan](https://ko-fi.com/harpopan)
