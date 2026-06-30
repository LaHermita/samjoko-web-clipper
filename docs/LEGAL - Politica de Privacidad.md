---
tipo: LEGAL
tema: Política de Privacidad
proyecto: Samjoko Web Clipper
version: 1.0
fecha: 2026-06-30
---

# Política de Privacidad de Samjoko Web Clipper

**Última actualización**: 30 de junio de 2026

## 1. Introducción

Samjoko Web Clipper («la extensión») es una extensión de navegador que permite extraer el contenido de páginas web y guardarlo como archivos Markdown en el sistema de archivos local del usuario.

Esta política de privacidad explica qué datos recopila la extensión, cómo los usa y qué control tienes sobre ellos.

## 2. Datos que recopilamos

La extensión solo recopila datos cuando **tú la activas explícitamente** (haciendo clic en un botón o usando un atajo de teclado). Nunca recopila datos de forma pasiva o automática.

Cuando activas la extensión, puede acceder a:

- **Contenido de la página web activa**: el texto, las imágenes, las tablas y otros elementos de la página que estás viendo, con el único propósito de convertirlos a formato Markdown.
- **Metadatos de la página**: título, URL, autor (si está disponible en las metaetiquetas), fecha de publicación, idioma, nombre del sitio y otros metadatos públicos de la página.
- **Configuración de la extensión**: tus preferencias de idioma, tema visual, carpeta de destino y qué campos de metadatos incluir en las capturas.

## 3. Cómo almacenamos los datos

- **Tus capturas (archivos Markdown)** se guardan exclusivamente en la carpeta que tú seleccionas en tu sistema de archivos local mediante la File System Access API. La extensión no tiene acceso a archivos fuera de esa carpeta.
- **Tu configuración** se almacena en `chrome.storage.sync` (sincronizada entre dispositivos si tienes la sincronización de Chrome activada).
- **El manejador de la carpeta de destino** se almacena en IndexedDB localmente en tu navegador.

Ninguno de estos datos se envía a servidores externos. Todo permanece en tu dispositivo.

## 4. Compartición de datos con terceros

**No compartimos ningún dato con terceros.** La extensión:
- No envía datos a servidores externos.
- No utiliza servicios de análisis o telemetría.
- No incluye publicidad.
- No vende datos de usuario.
- No transfiere datos a plataformas publicitarias, corredores de datos ni revendedores.

## 5. Control del usuario sobre sus datos

Tienes control total sobre tus datos:
- Puedes **elegir la carpeta de destino** donde se guardan tus capturas.
- Puedes **editar o eliminar** cualquier captura directamente en tu sistema de archivos.
- Puedes **cambiar o eliminar** la carpeta de destino en cualquier momento desde las opciones de la extensión.
- Puedes **desinstalar** la extensión en cualquier momento, lo que eliminará toda la configuración almacenada. Tus archivos Markdown permanecerán en tu sistema de archivos.

## 6. Limitación de uso (Limited Use)

El uso de la información recibida a través de las APIs de Chrome se adhiere a la Chrome Web Store User Data Policy, incluidos los requisitos de Limited Use. En particular:

- Los datos solo se usan para el propósito único divulgado: extraer y guardar contenido web localmente.
- No se transfieren datos a terceros.
- No se permite que humanos lean los datos del usuario sin su consentimiento explícito.
- Los datos no se usan para personalización de anuncios ni para determinar solvencia crediticia.

## 7. Permisos de la extensión

La extensión solicita los siguientes permisos, cada uno con un propósito específico:

| Permiso | Propósito |
|---------|-----------|
| `activeTab` | Acceder a la pestaña activa solo cuando el usuario hace clic en un botón |
| `scripting` | Inyectar el extractor de contenido en la página activa |
| `storage` | Guardar preferencias de configuración |
| `notifications` | Mostrar confirmaciones de captura exitosa o errores |
| `sidePanel` | Abrir el editor de bloques en el panel lateral |
| `<all_urls>` | Poder extraer contenido de cualquier página web que el usuario visite (solo bajo demanda del usuario) |

## 8. Seguridad

Todas las operaciones de la extensión ocurren localmente en tu dispositivo:
- La extracción de contenido se realiza mediante scripts inyectados en la página activa.
- El guardado usa la File System Access API, que requiere permiso explícito del usuario para cada carpeta.
- No hay transmisión de datos por red.

## 9. Cumplimiento con GDPR y otras regulaciones

Dado que la extensión no recopila datos personales ni los envía a servidores, no se requiere consentimiento GDPR para cookies o tracking. Sin embargo, reconocemos tus derechos bajo el GDPR:

- **Derecho de acceso**: puedes ver toda la configuración almacenada en las opciones de la extensión.
- **Derecho de rectificación**: puedes modificar tu configuración en cualquier momento.
- **Derecho de supresión**: puedes eliminar tu configuración desinstalando la extensión.
- **Derecho de portabilidad**: tu configuración se puede exportar mediante la sincronización de Chrome.
- **Derecho de oposición**: puedes dejar de usar la extensión en cualquier momento.

## 10. Actualizaciones de esta política

Podemos actualizar esta política de privacidad ocasionalmente. Los cambios se publicarán en esta misma URL. Te recomendamos revisarla periódicamente.

## 11. Contacto

Si tienes preguntas sobre esta política de privacidad, puedes contactar a través de:

- **GitHub Issues**: https://github.com/harpopan/samjoko-web-clipper/issues
- **Email**: harpodev@proton.me

---

*El uso de la información recibida de las APIs de Google se adherirá a la Chrome Web Store User Data Policy, incluidos los requisitos de Limited Use.*
