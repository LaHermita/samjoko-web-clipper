importScripts('base-datos.js', 'componentes/configuracion.js');

let manejadorDirectorio = null;
let promesaInicializacion;

function inicializar() {
  promesaInicializacion = cargarDirectorio().catch(() => {});
}

async function cargarDirectorio() {
  try {
    manejadorDirectorio = await obtenerDirectorio();
  } catch {
    manejadorDirectorio = null;
  }
}

async function guardarArchivoEnCarpeta(contenido, nombreArchivo) {
  if (!manejadorDirectorio) {
    throw new Error(chrome.i18n.getMessage('errorSWCarpetaNoConfigurada'));
  }

  const tienePermiso = await verificarPermiso(manejadorDirectorio);
  if (!tienePermiso) {
    manejadorDirectorio = null;
    throw new Error(chrome.i18n.getMessage('errorSWPermisoDenegado'));
  }

  let directorioDestino = manejadorDirectorio;
  const config = await obtenerConfiguracion();
  if (config.subcarpeta) {
    const partes = config.subcarpeta.replace(/\\/g, '/').split('/').filter(Boolean);
    for (const parte of partes) {
      directorioDestino = await directorioDestino.getDirectoryHandle(parte, { create: true });
    }
  }

  const nombreUnico = await obtenerNombreArchivoUnico(directorioDestino, nombreArchivo);
  const archivoHandle = await directorioDestino.getFileHandle(nombreUnico, { create: true });
  const writable = await archivoHandle.createWritable();
  await writable.write(contenido);
  await writable.close();

  return nombreUnico;
}

chrome.runtime.onInstalled.addListener((detalles) => {
  if (detalles.reason === 'install') {
    console.log('Samjoko Web Clipper instalada');
  }
});

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  if (mensaje.accion === 'establecerDirectorio') {
    (async () => {
      await cargarDirectorio();
      responder({
        tieneCarpeta: !!manejadorDirectorio,
        nombre: manejadorDirectorio?.name || ''
      });
    })();
    return true;
  }

  if (mensaje.accion === 'limpiarDirectorio') {
    (async () => {
      manejadorDirectorio = null;
      await guardarDirectorio(null);
      responder({ tieneCarpeta: false, nombre: '' });
    })();
    return true;
  }

  if (mensaje.accion === 'verificarDirectorio') {
    (async () => {
      await promesaInicializacion;
      responder({
        tieneCarpeta: !!manejadorDirectorio,
        nombre: manejadorDirectorio?.name || ''
      });
    })();
    return true;
  }

  if (mensaje.accion === 'guardarArchivo') {
    (async () => {
      try {
        const nombreGuardado = await guardarArchivoEnCarpeta(
          mensaje.contenido,
          mensaje.nombreArchivo
        );
        responder({ exito: true, nombreArchivo: nombreGuardado });
      } catch (error) {
        if (!manejadorDirectorio) {
          responder({ error: 'carpeta-no-configurada', mensaje: error.message });
        } else {
          responder({ error: 'fallo-guardado', mensaje: error.message });
        }
      }
    })();
    return true;
  }

  if (mensaje.accion === 'obtenerConfiguracion') {
    (async () => {
      const config = await obtenerConfiguracion();
      responder(config);
    })();
    return true;
  }

  if (mensaje.accion === 'guardarConfiguracion') {
    (async () => {
      const nuevaConfig = await guardarConfiguracion(mensaje.datos);
      responder(nuevaConfig);
    })();
    return true;
  }

  if (mensaje.accion === 'restablecerConfiguracion') {
    (async () => {
      const config = await restablecerConfiguracion();
      responder(config);
    })();
    return true;
  }
});

chrome.commands.onCommand.addListener(async (comando) => {
  if (comando !== 'captura-rapida') return;

  try {
    const [pestania] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!pestania || !pestania.id) return;

    let extraido;
    try {
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch (errorIgnorado) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: pestania.id },
          files: ['extractor-contenido.js']
        });
        extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
      } catch (errorInyeccion) {
        chrome.notifications.create('captura-rapida-error', {
          type: 'basic',
          iconUrl: 'assets/icons/Samjoko-Icono_Circular_128px.png',
          title: chrome.i18n.getMessage('nombreExtension'),
          message: chrome.i18n.getMessage('errorSinContenido')
        });
        return;
      }
    }

    if (!extraido || !extraido.markdown) {
      chrome.notifications.create('captura-rapida-error', {
        type: 'basic',
        iconUrl: 'assets/icons/Samjoko-Icono_Circular_128px.png',
        title: chrome.i18n.getMessage('nombreExtension'),
        message: chrome.i18n.getMessage('errorSinContenido')
      });
      return;
    }

    await promesaInicializacion;

    if (!manejadorDirectorio) {
      chrome.notifications.create('captura-rapida-error', {
        type: 'basic',
        iconUrl: 'assets/icons/Samjoko-Icono_Circular_128px.png',
        title: chrome.i18n.getMessage('nombreExtension'),
        message: chrome.i18n.getMessage('errorSWCarpetaNoConfigurada')
      });
      return;
    }

    const tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
    const configSW = await obtenerConfiguracion();
    const frontmatter = generarFrontmatter(extraido.metadata, configSW.usarFrontmatter);
    const contenidoFinal = frontmatter + extraido.markdown;
    const nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
    const nombreGuardado = await guardarArchivoEnCarpeta(contenidoFinal, nombreBase);

    chrome.notifications.create('captura-rapida-exito', {
      type: 'basic',
      iconUrl: 'assets/icons/Samjoko-Icono_Circular_128px.png',
      title: chrome.i18n.getMessage('nombreExtension'),
      message: chrome.i18n.getMessage('notificacionGuardadoExitoso', nombreGuardado)
    });
  } catch (errorIgnorado) {
    chrome.notifications.create('captura-rapida-error', {
      type: 'basic',
      iconUrl: 'assets/icons/Samjoko-Icono_Circular_128px.png',
      title: chrome.i18n.getMessage('nombreExtension'),
      message: chrome.i18n.getMessage('notificacionErrorGuardado')
    });
  }
});

inicializar();
