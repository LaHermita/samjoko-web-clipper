<p align="center">
  <picture>
    <img alt="Samjoko Web Clipper" src="assets/icons/Samjoko-Icono_LowP_128px.png" width="96" height="96">
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
  <img alt="Versión" src="https://img.shields.io/badge/Versión-0.4.1-d47a2c?style=flat-square">
</p>

---

## Acerca del proyecto / About

**Samjoko Web Clipper** es el companion de navegador de Samjoko, la mascota del ecosistema Vivero. Sam te permite capturar el contenido de cualquier página web, convertirlo en Markdown limpio mediante un pipeline inteligente de extracción, y guardarlo directamente en tu bóveda de conocimiento. Como un cuervo recolector, Samjoko selecciona y transporta lo valioso de la web hasta tu espacio de conocimiento personal, ayudándote a conservar ideas, artículos y referencias de forma sencilla.

> Samjoko Web Clipper is the browser companion of Samjoko, the mascot of the Vivero ecosystem. Sam allows you to capture the content of any web page, convert it into clean Markdown through an intelligent extraction pipeline, and save it directly to your knowledge vault. Like a gathering raven, Samjoko collects and carries valuable knowledge from the web to your personal space, helping you preserve ideas, articles, and references with ease.

---

## Características / Features

| Característica                                                      | Feature                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Extrae el contenido principal de la página como Markdown             | Extracts main page content as Markdown                      |
| Pipeline inteligente de limpieza (filtro boilerplate, enlaces, etc.) | Smart cleaning pipeline (boilerplate filter, link density)  |
| Editor de bloques en panel lateral para revisar antes de guardar     | Side panel block editor to review before saving             |
| Enlaces recolectados solo del contenido válido, toggleables          | Links collected only from valid content, toggleable         |
| Scoping automático a `<article>` si la página lo usa                 | Auto-scoping to `<article>` when the page uses it           |
| Frontmatter YAML configurable campo por campo                        | Configurable YAML frontmatter, field by field               |
| Captura rápida con atajo de teclado y notas personales               | Quick capture with keyboard shortcut and personal notes     |
| 4 temas visuales intercambiables                                     | 4 interchangeable visual themes                             |
| Onboarding interactivo de 3 pasos                                    | Interactive 3-step onboarding                               |
| Página de opciones con diseño responsive en cards                    | Options page with responsive card layout                    |
| Copia al portapapeles con un clic                                    | One-click copy to clipboard                                 |
| Descarga como archivo `.md`                                          | Download as `.md` file                                      |
| Guarda directamente en una carpeta local (File System Access API)    | Save directly to a local folder (File System Access API)    |
| Accesibilidad: ARIA, teclado, lector de pantalla, contraste          | Accessibility: ARIA, keyboard, screen reader, contrast      |
| Sin dependencias externas                                            | No external dependencies                                    |
| Página de opciones integrada                                         | Built-in options page                                       |

---

## Temas / Themes

| Tema     | Modo            | `data-theme` |
| -------- | --------------- | ------------ |
| Samjoko  | Oscuro (cuervo) | `samjoko`    |
| Vivero   | Claro natural   | `vivero`     |
| Nautilus | Cálido          | `nautilus`   |
| Akkoro   | Cyberpunk       | `akkoro`     |

El tema por defecto es **Samjoko**. Para cambiar de tema, modifica el atributo `data-theme` en el `<html>` o persiste la preferencia con `chrome.storage`.

---

## Instalación / Installation

### Para usuarios / For users

1. Descarga la extensión desde la [Chrome Web Store](#) _(próximamente)_.
2. Haz clic en el icono de Samjoko en la barra de herramientas.
3. Navega a cualquier página y captúrala.

### Para desarrollo / For development

```bash
# Clonar el repositorio
git clone https://github.com/usuario/samjoko-nav-extension.git

# Cargar en Chrome
# 1. Abre chrome://extensions
# 2. Activa «Modo desarrollador»
# 3. Clic en «Cargar descomprimida»
# 4. Selecciona la carpeta del proyecto
```

---

## Arquitectura / Architecture

```
samjoko-nav-extension/
├── manifest.json              # Chrome Extension Manifest V3
├── AGENTS.md                  # Instrucciones para asistentes IA
├── _locales/                  # Traducciones i18n (es, en)
├── assets/
│   ├── themes.css             # Variables CSS de los 4 temas
│   ├── comun.css              # Estilos compartidos (body, button, foco)
│   └── icons/                 # Iconos LowP de la extensión
├── componentes/
│   ├── configuracion.js       # Gestión de configuración (chrome.storage)
│   ├── traduccion.js          # Motor de traducción con override
│   ├── barra-progreso.js/css  # Componente de barra de progreso
│   ├── onboarding.js/css      # Tutorial de primera instalación
│   └── extraccion/            # Pipeline de extracción por tipos
│       ├── nucleo-extraccion.js
│       ├── extractor-texto.js
│       ├── extractor-listas.js
│       ├── extractor-codigo.js
│       ├── extractor-tablas.js
│       ├── extractor-citas.js
│       ├── extractor-multimedia.js
│       ├── extractor-iframes.js
│       └── extractor-enlaces.js
├── ventana-emergente/         # Popup
├── editor-bloques/            # Side panel (editor de bloques)
├── opciones/                  # Página de opciones
├── docs/                      # Documentación del proyecto
├── trabajador-fondo.js        # Service worker
├── extractor-contenido.js     # Content script (orquestador)
└── base-datos.js              # IndexedDB + generación frontmatter
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
