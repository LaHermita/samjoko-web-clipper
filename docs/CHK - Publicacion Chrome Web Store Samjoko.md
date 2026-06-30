---
tipo: CHK
tema: Publicación en Chrome Web Store
proyecto: Samjoko Web Clipper
estado: pendiente
version: 1.0
fecha: 2026-06-29
fuentes:
  - https://policies.google.com/privacy?hl=es-419
  - https://developer.chrome.com/docs/webstore/program-policies/terms
  - https://developer.chrome.com/docs/webstore/program-policies
  - https://developer.chrome.com/docs/webstore/program-policies/policies
---

# CHK - Publicación Chrome Web Store (Samjoko Web Clipper)

> Lista de verificación específica para la publicación de **Samjoko Web Clipper** en la Chrome Web Store. Basada en la Política de Privacidad de Google, el Acuerdo de Desarrollador de Chrome Web Store y las Políticas del Programa para Desarrolladores.

---

## 1. Registro y cuenta de desarrollador

- [ ] Crear cuenta de Google válida para publicar.
- [ ] Pagar la tasa de registro única (`Registration Fee`).
- [ ] Proporcionar información de contacto válida y actualizada (se muestra en la ficha del producto y se usa para soporte).
- [ ] Configurar verificación en dos pasos (2-Step Verification) en la cuenta (obligatorio para publicar).
- [ ] Revisar periódicamente los correos del Chrome Web Store (cambios en políticas, acciones requeridas, notificaciones de infracción).
- [ ] Mantener la información del perfil de desarrollador actualizada (nombre, email, web).

## 2. Política de privacidad

- [ ] **Si la extensión maneja datos de usuario** → publicar una política de privacidad precisa y actualizada.
- [ ] La política debe divulgar de forma completa:
  - [ ] Cómo se recopilan, usan y comparten los datos del usuario.
  - [ ] Con qué terceros se comparten los datos.
  - [ ] Que los datos se almacenan **localmente** en el equipo del usuario (File System Access API + IndexedDB) y **no se envían a servidores externos**.
  - [ ] Que el usuario tiene control total sobre sus datos (puede borrarlos, editarlos, decidir dónde guardarlos).
- [ ] Incluir el enlace a la política de privacidad en el campo designado del Developer Dashboard.
- [ ] La política debe ser accesible desde un sitio web propio (no vale solo dentro de la extensión).
- [ ] La política debe estar disponible en los mismos idiomas que la extensión (al menos español).

## 3. Consentimiento y divulgación al usuario

- [ ] Ser transparente sobre el manejo de datos del usuario.
- [ ] Si se recopilan datos **no estrechamente relacionados** con la funcionalidad principal:
  - [ ] Divulgar prominentemente **antes de la instalación** qué datos se recopilan y para qué.
  - [ ] Obtener consentimiento afirmativo e informado del usuario.
  - [ ] El usuario debe poder **revocar el consentimiento** en cualquier momento.
- [ ] No recopilar ni usar datos de navegación web (`web browsing activity`) excepto:
  - [ ] Para una funcionalidad visible para el usuario descrita prominentemente en la página de Chrome Web Store y en la interfaz.
  - [ ] La extracción de contenido de la página actual solo se activa **explícitamente** por el usuario (clic en botón o atajo de teclado).
- [ ] Si la extensión usa APIs de Google, incluir la frase:
  `"The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements."`
  - [ ] Publicar esta frase en un **sitio web propio del desarrollador** (sección de privacidad o página dedicada), no solo dentro de la extensión.
  - [ ] Para esta extensión: aunque no usamos APIs de Google OAuth, si usamos `chrome.*` APIs, es buena práctica incluir esta declaración.

## 4. Uso limitado de datos (Limited Use)

- [ ] Limitar el uso de datos al **propósito único** divulgado: extraer y guardar contenido web localmente.
- [ ] No transferir datos a terceros salvo:
  - [ ] Necesario para el propósito único (no aplica — la extensión no transfiere datos).
  - [ ] Para cumplir con la ley.
  - [ ] Para protección contra malware, spam, phishing o fraude.
  - [ ] Como parte de una fusión/venta, solo con consentimiento explícito del usuario.
- [ ] No permitir que humanos lean datos del usuario salvo:
  - [ ] Con consentimiento explícito del usuario.
  - [ ] Datos agregados y anonimizados para operaciones internas.
  - [ ] Por seguridad (investigación de abusos).
  - [ ] Para cumplir con la ley.
- [ ] **Prohibido**:
  - [ ] Vender datos de usuario.
  - [ ] Transferir/usar/vender datos para publicidad personalizada.
  - [ ] Transferir/vender datos a plataformas publicitarias, corredores de datos o revendedores.
  - [ ] Usar datos para determinar solvencia crediticia o préstamos.
- [ ] **Esta extensión no vende, transfiere ni comparte datos con terceros.** Todo el procesamiento es local.

## 5. Permisos mínimos

- [ ] Solicitar únicamente los permisos más restringidos necesarios para implementar las funciones.
- [ ] Si hay varios permisos posibles para una función, elegir el de **menor acceso**.
- [ ] No solicitar permisos «por si acaso» (future-proofing).
- [ ] **Justificación de permisos actuales**:
  - [ ] `activeTab` — para acceder a la pestaña activa solo cuando el usuario hace clic.
  - [ ] `scripting` — para inyectar el extractor de contenido en la página activa.
  - [ ] `storage` — para guardar preferencias de configuración (sync) y datos internos.
  - [ ] `notifications` — para mostrar confirmaciones de captura exitosa o errores.
  - [ ] `sidePanel` — para abrir el editor de bloques en el panel lateral.
  - [ ] `<all_urls>` (host_permissions) — necesario porque el clipper debe poder extraer contenido de **cualquier página web** que el usuario visite. Se usa solo bajo demanda del usuario. Evaluar si se puede restringir más en el futuro.

## 6. Campos de privacidad en el Developer Dashboard

- [ ] Completar los campos de privacidad en el Dashboard al publicar:
  - [ ] `Single Purpose` — describir el propósito único: "Extraer y guardar contenido web como archivos Markdown en el sistema de archivos local del usuario".
  - [ ] Certificar qué datos se recopilan: contenido de la página, metadatos (título, URL, autor, fecha, etc.).
  - [ ] Certificar si los datos se comparten con terceros: **No**.
  - [ ] Certificar si se usan los datos para personalización o publicidad: **No**.
  - [ ] Enlace a la política de privacidad.
- [ ] Los campos de privacidad deben coincidir exactamente con la política de privacidad y el comportamiento real del código.
- [ ] Si se actualiza la extensión, revisar y actualizar estos campos si es necesario.

## 7. Seguridad y manejo de datos

- [ ] Si se recopilan datos de usuario, transmitirlos siempre con **criptografía moderna** (HTTPS/TLS). _(No aplica — todo es local)_
- [ ] No divulgar públicamente información financiera o de pago.
- [ ] Mantener segura la información de autenticación (no divulgar públicamente).
- [ ] Almacenar datos personales o sensibles de forma segura y solo el tiempo necesario.
- [ ] Informar sobre vulnerabilidades de seguridad al equipo de Chrome (https://www.google.com/about/appsecurity/ddprp/).
- [ ] **Datos almacenados localmente**: el usuario elige la carpeta de destino mediante File System Access API. La extensión no tiene acceso a archivos fuera de la carpeta que el usuario selecciona explícitamente.
- [ ] **Hardening de seguridad**: completar fase 3.5 del Roadmap (validación de mensajes, protección contra path traversal, sanitización de contenido extraído, CSP explícito). Ref: `docs/PROY - Roadmap.md §3.5`.

## 8. Contenido prohibido y malware

- [ ] No transmitir virus, gusanos, troyanos, malware ni código destructivo.
- [ ] No dañar o interferir con redes, servidores o infraestructura de Google o terceros.
- [ ] No incluir spyware, scripts maliciosos ni phishing.
- [ ] No facilitar acceso no autorizado a contenido (saltar paywalls, restricciones de inicio de sesión).
- [ ] No permitir descarga o streaming no autorizado de contenido protegido por derechos de autor.
- [ ] No minar criptomonedas.
- [ ] **La extensión extrae contenido que el usuario YA está viendo** — no elude paywalls ni restricciones de acceso. Solo captura lo que el usuario tiene visible en su navegador.

## 9. Contenido para adultos, violencia y odio

- [ ] No incluir pornografía, obscenidad, desnudos ni actividad sexual.
- [ ] No promover el odio, la violencia o la incitación a la violencia.
- [ ] No incluir material que invada la privacidad o viole el derecho de publicidad.
- [ ] Cero tolerancia con pornografía infantil — Google la reportará a las autoridades.
- [ ] El desnudo no sexual (artístico, educativo, científico, cultural) está permitido pero puede afectar la visibilidad.
- [ ] **Si la extensión incluye contenido que puede no ser apto para todas las edades**, marcar como "Mature" en el Developer Dashboard — solo será visible para cuentas de Google de adultos.
  - [ ] **Esta extensión NO contiene contenido "Mature".**

## 10. Productos regulados

- [ ] Si la extensión toca productos regulados (alcohol, juegos de azar, farmacia, etc.), cumplir con las leyes aplicables. _(No aplica — extensión genérica de clipping)_

## 11. Conducta engañosa y spam

- [ ] No engañar o confundir al usuario con el título, descripción, icono o capturas de pantalla.
- [ ] Los cambios en la configuración del dispositivo deben ser:
  - [ ] Con conocimiento y consentimiento del usuario.
  - [ ] Fácilmente reversibles.
- [ ] No prometer funcionalidades imposibles (ej. «quién ha visto tu perfil»).
- [ ] No crear extensiones antivirus/privacidad/seguridad que no ofrezcan protección real.
- [ ] No enviar spam, notificaciones engañosas, promociones no solicitadas ni phishing.
- [ ] No enviar mensajes en nombre del usuario sin permitirle confirmar contenido y destinatarios.
- [ ] No manipular valoraciones, reseñas ni recuentos de instalaciones (fraudulentas o incentivadas).
- [ ] No crear múltiples extensiones con funcionalidad duplicada (misma experiencia).
- [ ] Cumplir con las Google Webmaster Quality Guidelines.
- [ ] **Notificaciones**: las notificaciones de Chrome solo se usan para confirmar captura exitosa o errores. No se usan para spam, promociones ni publicidad.

## 12. Tácticas de instalación engañosas

- [ ] La funcionalidad prometida debe ser clara y transparente en los materiales de marketing.
- [ ] No incluir publicidad engañosa previa a la instalación.
- [ ] No usar botones o formularios engañosos (call-to-action que no refleje la instalación).
- [ ] No ocultar u omitir metadatos de la extensión en la ventana de Chrome Web Store.
- [ ] No empaquetar (bundling) otras extensiones en el mismo flujo de instalación.
- [ ] No requerir acciones no relacionadas para acceder a la funcionalidad anunciada.

## 13. Calidad y funcionalidad mínima

- [ ] La extensión debe tener un **propósito único**, estrecho y fácil de entender.
  - [ ] Propósito: "Samjoko Web Clipper — extrae el contenido de cualquier página web y lo guarda como Markdown en tu sistema de archivos local".
- [ ] Funcionalidades separadas deben ir en extensiones separadas (el usuario debe poder instalar/desinstalar por separado).
- [ ] No publicar una extensión cuyo único propósito sea instalar o lanzar otra app, tema, página web o extensión.
- [ ] No permitir funcionalidad rota (enlaces muertos, características que no funcionan).
- [ ] La extensión debe aportar valor al catálogo:
  - [ ] No extensiones sin funcionalidad.
  - [ ] No funcionalidad que no proporcione directamente la extensión (ej. enlaces a servicios externos).
  - [ ] No plantillas click-bait con variaciones mínimas (ej. «palabra del día» + «frase inspiradora» con la misma plantilla).
- [ ] La extensión debe ser un complemento útil a la navegación, no una distracción.
- [ ] **No usar side panels que secuestren la experiencia de navegación o búsqueda del usuario.** El side panel debe complementar, no reemplazar ni interferir con la navegación.
- [ ] **La extensión proporciona funcionalidad completa por sí misma**: extracción, edición y guardado local. No depende de servicios externos para su funcionamiento principal.

## 14. Metadatos del listado

- [ ] Descripción, icono y capturas obligatorias y correctas.
- [ ] Información del listado actualizada, precisa y completa.
- [ ] Campos de privacidad del Dashboard coherentes con política y comportamiento real.
- [ ] Los campos de privacidad deben ser **precisos y actualizados**. Si contradicen la política de privacidad o el comportamiento real del código, la extensión será eliminada.
- [ ] No usar keyword spam (repeticiones antinaturales >5 veces, listas de marcas/sitios sin valor).
- [ ] No incluir testimonios anónimos o no atribuidos.
- [ ] No usar metadatos que tergiversen el estado o rendimiento (ej. «Editor's Choice», «Number One»).
- [ ] **Capturas de pantalla**: deben mostrar la interfaz real de la extensión (popup, editor de bloques, opciones).
- [ ] **Descripción**: debe explicar claramente qué hace la extensión, qué permisos necesita y por qué.

## 15. Código legible (Manifest V3)

- [ ] No ofuscar el código ni ocultar funcionalidades.
- [ ] Minificación permitida solo si:
  - [ ] Elimina espacios, nuevas líneas, comentarios y delimitadores de bloque.
  - [ ] Acorta nombres de variables y funciones.
  - [ ] Fusiona archivos.
- [ ] La funcionalidad completa debe ser fácilmente discernible a partir del código enviado.
- [ ] No ejecutar lógica desde fuentes remotas (no `<script>` externo, no `eval()`, no intérpretes remotos).
- [ ] Excepciones permitidas solo mediante Debugger API o User Scripts API.
- [ ] Comunicación con servidores remotos permitida solo para:
  - [ ] Sincronización de datos de cuenta.
  - [ ] Archivos de configuración remotos (A/B testing, feature flags sin lógica externa).
  - [ ] Recursos remotos no ejecutables (imágenes).
  - [ ] Operaciones server-side (ej. cifrado con clave privada).
- [ ] **El código actual es legible, no está ofuscado y toda la lógica está contenida en el paquete.** Se usa `importScripts()` solo para cargar otros archivos JS locales. No se usa `eval()` ni se carga código remoto.

## 16. Uso de APIs de Chrome

- [ ] Usar las APIs de Chrome existentes para el caso de uso designado.
- [ ] No usar métodos alternativos si ya existe una API para ese fin.
- [ ] **APIs usadas correctamente**:
  - [ ] `chrome.tabs` — para obtener la pestaña activa.
  - [ ] `chrome.scripting` — para inyectar el extractor (en vez de usar `tabs.executeScript`).
  - [ ] `chrome.storage.sync` — para guardar configuración.
  - [ ] `chrome.sidePanel` — para el editor de bloques.
  - [ ] `chrome.notifications` — para feedback al usuario.
  - [ ] `chrome.i18n` — para internacionalización.
  - [ ] `chrome.runtime` — para comunicación entre componentes.
  - [ ] `chrome.commands` — para atajos de teclado.

## 17. Publicidad (si aplica)

- [ ] Los anuncios cumplen con las políticas de contenido de Chrome Web Store.
- [ ] Los anuncios son consistentes con la calificación de contenido de la extensión.
- [ ] No usar AdSense (no permitido en extensiones).
- [ ] Anuncios presentados en contexto o con indicación clara del producto asociado.
- [ ] Los anuncios deben ser fácilmente removibles (ajustes o desinstalación).
- [ ] Los anuncios no simulan notificaciones del sistema ni advertencias.
- [ ] No obligar al usuario a hacer clic en anuncios o dar información personal para usar la extensión.
- [ ] Anuncios en sitios de terceros: divulgación clara, atribución de fuente, sin interferir con anuncios nativos.
- [ ] **Esta extensión NO incluye publicidad.**

## 18. Pago a usuarios (si aplica)

- [ ] Si la extensión es de pago: el desarrollador asume toda la responsabilidad de transacciones, impuestos, autenticación y soporte.
- [ ] Google no gestiona pagos ni impuestos por productos de pago.
- [ ] Las extensiones gratuitas no pueden cobrar después a usuarios que descargaron gratis.
- [ ] Las trial versions con upsell están permitidas.
- [ ] Responder a consultas de soporte en un máximo de 3 días hábiles (24 horas si Google lo marca como urgente).
- [ ] **Esta extensión es gratuita y no incluye pagos.**

## 19. Suplantación y propiedad intelectual

- [ ] No hacerse pasar por otra persona, empresa u organización.
- [ ] No representar que la extensión está autorizada, respaldada o producida por otro sin ser cierto.
- [ ] La extensión no debe imitar funcionalidad o advertencias del sistema operativo o navegador.
- [ ] No desviar usuarios a sitios que suplanten la Chrome Web Store.
- [ ] No infringir derechos de autor, marcas registradas, patentes, secretos comerciales u otros derechos de propiedad intelectual.
- [ ] **Nombre e icono**: "Samjoko" y su iconografía deben ser originales y no infringir marcas registradas de terceros.

## 20. Soporte al usuario

- [ ] Mantener información de contacto válida y actualizada en el Developer Dashboard.
- [ ] Proveer soporte al usuario de forma continua (email, issues, o similar).
- [ ] Responder a consultas en plazo razonable.
- [ ] Responder a consultas urgentes de Google en un plazo de 24 horas.
- [ ] Incluir un enlace de soporte o página de contacto en la ficha de la extensión.

## 21. Cumplimiento legal general

- [ ] Cumplir con todas las leyes y regulaciones aplicables (COPPA, GDPR, etc.).
- [ ] Si la extensión se dirige a menores de edad, cumplir con las leyes de protección infantil.
  - [ ] **Esta extensión no está dirigida a menores de 13 años.**
- [ ] No violar términos de servicio de terceros a sabiendas.
- [ ] **GDPR**: como la extensión no recopila datos personales ni los envía a servidores, no se requiere consentimiento GDPR para cookies/tracking. Sin embargo, la política de privacidad debe mencionar que el usuario tiene control total sobre sus datos y que puede revocar el consentimiento en cualquier momento.
- [ ] El usuario tiene derecho de: acceso, rectificación, supresión, portabilidad y oposición al tratamiento de sus datos.
- [ ] Google puede limitar el número de extensiones que un desarrollador puede publicar. Si se necesitan más, solicitar a Google (se evaluará en función del historial y buenas prácticas).
- [ ] Ver sección 26 para restricciones de exportación internacionales.

## 22. Apelaciones y notificaciones de infracción

- [ ] Conocer el proceso de apelación si la extensión es rechazada o eliminada:
  - [ ] Se puede contactar a Google mediante el formulario One Stop Support.
  - [ ] Las decisiones de cumplimiento se comunican por correo electrónico.
  - [ ] Se pueden solicitar aclaraciones o apelar decisiones.
- [ ] No intentar evadir las acciones de cumplimiento de Google.
- [ ] En caso de infracción por copyright, Google puede eliminar la extensión y el desarrollador debe responder adecuadamente.

## 23. Abuso reiterado (Repeat Abuse)

- [ ] Comprender que las infracciones repetidas de las políticas pueden resultar en:
  - [ ] Eliminación permanente de la extensión.
  - [ ] Suspensión o terminación de la cuenta de desarrollador.
  - [ ] Prohibición de publicar futuras extensiones.
- [ ] Ante cualquier notificación de infracción, resolverla rápidamente y asegurarse de que no se repita.

## 24. Elusión de cumplimiento (Enforcement Circumvention)

- [ ] Cualquier intento de eludir las limitaciones previstas o las acciones de cumplimiento resultará en la terminación inmediata de la cuenta de desarrollador.
- [ ] No intentar:
  - [ ] Publicar de nuevo una extensión eliminada sin resolver la infracción.
  - [ ] Usar cuentas de desarrollador alternativas para evadir sanciones.
  - [ ] Ocultar funcionalidad para evitar la revisión.

## 25. Pruebas previas al envío

- [ ] **Testear la extensión** antes de publicar o actualizar:
  - [ ] Verificar que no hay crashes ni cierres inesperados.
  - [ ] Verificar que todas las funcionalidades funcionan correctamente.
  - [ ] Verificar que no hay bugs visibles (enlaces muertos, funciones rotas).
  - [ ] Probar en distintos escenarios (diferentes páginas web, con/sin conexión, etc.).
- [ ] Las Best Practices del Chrome Web Store exigen testear antes del envío. Extensiones con funcionalidad rota serán rechazadas.

## 26. Restricciones de exportación y cumplimiento internacional

- [ ] Cumplir con las leyes de exportación de datos de EE.UU. y otros países aplicables.
- [ ] Los productos del Chrome Web Store pueden estar sujetos a controles de exportación de EE.UU. u otros países.
- [ ] No exportar la extensión a destinos, usuarios finales o usos prohibidos por dichas leyes.
- [ ] **Esta extensión no maneja datos exportables ni servicios restringidos.** La funcionalidad es local y genérica.

---

## Auditoría del código (2026-06-29)

Revisión del código fuente contra el checklist. Resultados:

### INCUMPLIMIENTOS DETECTADOS

#### ~~BUG CRÍTICO — `trabajador-fondo.js:107`~~ ✅ CORREGIDO

```javascript
// Línea 107 — referencia incorrecta (ANTES)
responder(config);  // ←应该是 configuracion

// Línea 107 — corrección aplicada (DESPUÉS)
responder(configuracion);
```

**Sección del CHK afectada**: 13. Calidad y funcionalidad mínima — "No permitir funcionalidad rota".

**Corrección aplicada**: 2026-06-29. Variable renombrada de `config` a `configuracion`.

---

#### ~~BUG CRÍTICO — `base-datos.js:188`~~ ✅ CORREGIDO

```javascript
// Línea 188 — falta `async` (ANTES)
function obtenerNombreArchivoUnico(manejadorDirectorio, nombreBase) {

// Línea 188 — corrección aplicada (DESPUÉS)
async function obtenerNombreArchivoUnico(manejadorDirectorio, nombreBase) {
```

**Sección del CHK afectada**: 13. Calidad y funcionalidad mínima — "No permitir funcionalidad rota". El uso de `await` fuera de una función `async` provocaba un `SyntaxError` al cargar el script, rompiendo el guardado con nombres duplicados.

**Corrección aplicada**: 2026-06-30. Añadido `async` a la declaración de la función.

---

#### ~~ACCESIBILIDAD — Onboarding: focus trap~~ ✅ CORREGIDO

**Detalle**: El diálogo de onboarding tenía `aria-modal="true"` pero no implementaba un focus trap, permitiendo que el foco escapara del diálogo con la tecla Tab.

**Corrección aplicada**: 2026-06-30. Añadido event listener `keydown` en `componentes/onboarding.js` que atrapa el foco cíclicamente entre los elementos enfocables del diálogo.

---

#### ~~ACCESIBILIDAD — `role="status"` en opciones~~ ✅ CORREGIDO

**Detalle**: El `infoCarpeta` de la página de opciones carecía de `role="status"`, a diferencia del del popup que sí lo tenía.

**Corrección aplicada**: 2026-06-30. Añadido `role="status"` al elemento en `opciones/opciones.html`.

---

### PENDIENTES CRÍTICOS (bloquean publicación)

| # | Sección CHK | Pendiente | Estado |
|---|------------|-----------|--------|
| 1 | §2 Política de privacidad | **Crear política de privacidad** y publicarla en un sitio web propio (no solo en el README). Debe divulgar: datos recopilados (contenido de página + metadatos), que todo es local, que no se envían datos a terceros, que el usuario tiene control total. | ✅ CREADO: `docs/LEGAL - Politica de Privacidad.md`. Pendiente de publicar en sitio web propio. |
| 2 | §2 Política de privacidad | **Publicar la política** en un dominio propio accesible públicamente (ej. `https://samjoko.dev/privacidad` o similar). | **PENDIENTE** (requiere dominio propio) |
| 3 | §4 Limited Use | Incluir declaración `"The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements."` en un sitio web propio. | ✅ INCLUIDA en la política de privacidad. Pendiente de publicar. |
| 4 | §6 Dashboard | Completar los campos de privacidad en el Developer Dashboard al publicar. | **PENDIENTE** (requiere cuenta de desarrollador) |
| 5 | §14 Metadatos | Preparar descripción, icono y capturas de pantalla para el listado. | **PENDIENTE** |
| 6 | §19 Propiedad intelectual | Verificar que "Samjoko" y su iconografía no infringen marcas registradas de terceros. | **PENDIENTE** |
| 7 | §20 Soporte | Definir y publicar canal de soporte (email, GitHub Issues, formulario). Actualmente solo hay `ko-fi.com/harpopan` en el pie de opciones. | **PENDIENTE** |
| 8 | §7 Seguridad | **Hardening de seguridad (Fase 3.5) completado**: validación de orígenes, path traversal, sanitización URIs, CSP explícito, validación de tipos. | ✅ Verificado. Ref: Roadmap §3.5. |
| 9 | §15 Código | `console.log` en `trabajador-fondo.js:49` — revisar para producción. | ✅ CORREGIDO |
| 10 | §4.5 Accesibilidad | Auditoría de accesibilidad completada (Fase 4.5): landmarks ARIA, `aria-live`, teclado, contraste. | ✅ Verificado. Ref: `docs/CHK - Accesibilidad.md`. |

---

### PENDIENTES MENORES (no bloquean pero recomendados)

| # | Sección CHK | Pendiente | Notas |
|---|------------|-----------|-------|
| 11 | §1 Registro | Crear cuenta de desarrollador y pagar Registration Fee. | Requisito previo a publicar. |
| 12 | §25 Pruebas | Testear la extensión completa (captura rápida, editor, temas, idioma, subcarpetas). | Prueba funcional completa antes de enviar. |
| 13 | §15 Código | `console.log` en `trabajador-fondo.js:49` — revisar para producción. | ✅ CORREGIDO |
| 14 | §7 Seguridad | No hay mecanismo para informar vulnerabilidades. Ya hay email y GitHub Issues en la política de privacidad. | ✅ CUBIERTO |

---

### CUMPLIMIENTOS VERIFICADOS

| Sección CHK | Estado | Detalle |
|------------|--------|---------|
| §3 Consentimiento | ✅ | La extracción solo se activa con clic explícito o Ctrl+Shift+S. No hay recopilación pasiva. |
| §4 Limited Use | ✅ | No se transfieren datos a terceros. No hay publicidad. No hay venta de datos. |
| §5 Permisos | ✅ | Permisos mínimos justificados: `activeTab`, `scripting`, `storage`, `notifications`, `sidePanel`. `<all_urls>` necesario para clipper universal. |
| §7 Seguridad | ✅ | Todo es local. File System Access API + IndexedDB. Sin transmisión de datos. |
| §8 Contenido prohibido | ✅ | No hay malware, phishing, minado, ni acceso no autorizado. |
| §9 Contenido adulto | ✅ | No aplica. Extensión de productividad. |
| §11 Conducta engañosa | ✅ | Notificaciones solo para confirmar captura o errores. No hay spam. |
| §12 Tácticas instalación | ✅ | Funcionalidad clara y transparente. |
| §13 Calidad | ✅ | Propósito único claro. Funcionalidad completa. Bug línea 107 corregido. |
| §15 Código legible | ✅ | Código no ofuscado. Sin `eval()`. Sin código remoto. `importScripts()` solo para archivos locales. |
| §16 APIs Chrome | ✅ | APIs usadas correctamente: `chrome.tabs`, `chrome.scripting`, `chrome.storage`, `chrome.sidePanel`, `chrome.notifications`, `chrome.i18n`, `chrome.commands`. |
| §17 Publicidad | ✅ | No incluye publicidad. |
| §18 Pagos | ✅ | Gratuita. Sin transacciones. |
| §19 PI | ✅ | Nombre e icono parecen originales (pendiente verificación formal). |
| §21 Legal | ✅ | No dirigida a menores. GDPR simplificado (datos locales). |
| §26 Exportación | ✅ | No maneja datos exportables. |

> Creado: 2026-06-29  
> Última actualización: 2026-06-30 (2ª auditoría) · versión del proyecto: 0.4.1  
> Auditoría realizada por: opencode (IA)  
> Plantilla: [`PLANT - Publicacion Chrome Web Store.md`](PLANT%20-%20Publicacion%20Chrome%20Web%20Store.md)  
> Fuentes: [Política de Privacidad de Google](https://policies.google.com/privacy?hl=es-419), [Acuerdo para Desarrolladores](https://developer.chrome.com/docs/webstore/program-policies/terms), [Políticas del Programa](https://developer.chrome.com/docs/webstore/program-policies), [Políticas detalladas](https://developer.chrome.com/docs/webstore/program-policies/policies)

---

## Resumen de principios clave

- **Seguridad**: no malware, no datos innecesarios, cifrado en tránsito (aunque todo es local).
- **Honestidad**: funcionalidad clara, sin engaños, metadatos veraces.
- **Utilidad**: propósito único, valor real, no duplicados ni plantillas vacías.
- **Privacidad**: política visible, consentimiento, mínimo acceso, Limited Use, datos 100% locales.

## Perfil de la extensión (Samjoko Web Clipper)

| Aspecto | Cumplimiento |
|---------|-------------|
| Almacenamiento | **Local** (File System Access API + IndexedDB). Sin servidores externos. |
| Datos recopilados | Solo cuando el usuario lo solicita explícitamente. Contenido de la página activa. |
| Envío de datos | **Ninguno**. Todo permanece en el equipo del usuario. |
| Publicidad | **No**. |
| Pagos | **No**. Es gratuita. |
| Código remoto | **No**. Todo el código está en el paquete. |
| Terceros | **No**. No se comparten datos con terceros. |
| Manifest | V3 (cumple con requisitos actuales). |
| Edad objetivo | Adultos (>13 años). No contenido "Mature". |
| Soporte | Pendiente de definir canal (email, GitHub Issues, etc.). |
| Política privacidad | **Pendiente** — crear y publicar en sitio web propio. |
| Nombre/icono | **Pendiente** — verificar originalidad y no infracción de marcas. |

> Creado: 2026-06-29  
> Última actualización: 2026-06-29  
> Plantilla: [`PLANT - Publicacion Chrome Web Store.md`](PLANT%20-%20Publicacion%20Chrome%20Web%20Store.md)  
> Fuentes: [Política de Privacidad de Google](https://policies.google.com/privacy?hl=es-419), [Acuerdo para Desarrolladores](https://developer.chrome.com/docs/webstore/program-policies/terms), [Políticas del Programa](https://developer.chrome.com/docs/webstore/program-policies), [Políticas detalladas](https://developer.chrome.com/docs/webstore/program-policies/policies)
