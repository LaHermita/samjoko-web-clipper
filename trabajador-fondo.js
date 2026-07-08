importScripts('base-datos.js', 'componentes/configuracion.js');

const ID_EXTENSION = chrome.runtime.id;
const URL_MANIFEST_REMOTO = 'https://raw.githubusercontent.com/LaHermita/samjoko-web-clipper/main/manifest.json';
const CLAVE_ALMACENAMIENTO_VERSION = 'versionRemota';
const INTERVALO_COMPROBACION = 86400000;
const ACCIONES_SENSIBLES = [
  'guardarArchivo',
  'guardarConfiguracion',
  'restablecerConfiguracion',
  'establecerDirectorio',
  'limpiarDirectorio'
];

let manejadorDirectorio = null;
let promesaInicializacion;
let tokenSesion = '';

function generarToken(longitud) {
  var array = new Uint8Array(Math.ceil(longitud / 2));
  crypto.getRandomValues(array);
  return Array.from(array, function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('').substring(0, longitud);
}

function compararVersiones(a, b) {
  var partesA = a.split('.').map(Number);
  var partesB = b.split('.').map(Number);
  for (var i = 0; i < Math.max(partesA.length, partesB.length); i++) {
    var numA = partesA[i] || 0;
    var numB = partesB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

async function obtenerVersionRemota() {
  var respuesta = await fetch(URL_MANIFEST_REMOTO);
  var manifiesto = await respuesta.json();
  return manifiesto.version;
}

async function comprobarActualizacion() {
  try {
    var versionRemota = await obtenerVersionRemota();
    var versionActual = chrome.runtime.getManifest().version;
    var resultado = {
      versionActual: versionActual,
      versionRemota: versionRemota,
      hayActualizacion: compararVersiones(versionRemota, versionActual) > 0,
      ultimaComprobacion: Date.now()
    };
    await chrome.storage.local.set({ [CLAVE_ALMACENAMIENTO_VERSION]: resultado });
    return resultado;
  } catch (error) {
    return null;
  }
}

function esRemitenteExtension(remitente) {
  return remitente && remitente.id === ID_EXTENSION;
}

function esPaginaInterna(remitente) {
  if (!remitente || !remitente.url) return false;
  try {
    var url = new URL(remitente.url);
    return url.protocol === 'chrome-extension:' && url.hostname === ID_EXTENSION;
  } catch (e) {
    return false;
  }
}

function inicializar() {
  promesaInicializacion = cargarDirectorio().catch(() => {});
  tokenSesion = generarToken(32);
  chrome.storage.session.set({ tokenSesion: tokenSesion });
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
    await guardarDirectorio(null).catch(() => {});
    throw new Error(chrome.i18n.getMessage('errorSWPermisoDenegado'));
  }

  let directorioDestino = manejadorDirectorio;
  const configuracion = await obtenerConfiguracion();
  if (configuracion.subcarpeta) {
    const partes = configuracion.subcarpeta.replace(/\\/g, '/').split('/').filter(Boolean);
    for (const parte of partes) {
      if (/^\.\.?$/.test(parte) || /[~<>:"|?*]/.test(parte) || parte.length > 100 || parte.length === 0) {
        throw new Error('Subcarpeta invalida: ' + parte);
      }
      try {
        directorioDestino = await directorioDestino.getDirectoryHandle(parte, { create: true });
      } catch (error) {
        if (error && error.name === 'NotFoundError') {
          return manejarDirectorioInvalido();
        }
        throw error;
      }
    }
  }

  try {
    const nombreUnico = await obtenerNombreArchivoUnico(directorioDestino, nombreArchivo);
    const archivoHandle = await directorioDestino.getFileHandle(nombreUnico, { create: true });
    const flujoEscritura = await archivoHandle.createWritable();
    await flujoEscritura.write(contenido);
    await flujoEscritura.close();

    return nombreUnico;
  } catch (error) {
    if (error && error.name === 'NotFoundError') {
      return manejarDirectorioInvalido();
    }
    throw error;
  }
}

async function manejarDirectorioInvalido() {
  manejadorDirectorio = null;
  await guardarDirectorio(null).catch(() => {});
  throw new Error(chrome.i18n.getMessage('errorSWDirectorioInvalido'));
}

chrome.runtime.onInstalled.addListener(function(detalles) {
  if (detalles.reason === 'install' || detalles.reason === 'update') {
    comprobarActualizacion();
  }
});

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  if (!esRemitenteExtension(remitente)) return;

  if (ACCIONES_SENSIBLES.includes(mensaje.accion)) {
    if (!esPaginaInterna(remitente)) return;
    if (mensaje.tokenSesion !== tokenSesion) return;
  }

  if (mensaje.accion === 'comprobarActualizacion') {
    (async () => {
      var almacenado = await chrome.storage.local.get(CLAVE_ALMACENAMIENTO_VERSION);
      var datos = almacenado[CLAVE_ALMACENAMIENTO_VERSION];

      if (datos && datos.ultimaComprobacion && Date.now() - datos.ultimaComprobacion < INTERVALO_COMPROBACION) {
        responder(datos);
      } else {
        var resultado = await comprobarActualizacion();
        responder(resultado || { hayActualizacion: false });
      }
    })();
    return true;
  }

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
      const configuracion = await obtenerConfiguracion();
      responder(configuracion);
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
      const configuracion = await restablecerConfiguracion();
      responder(configuracion);
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
          files: [
            'componentes/extraccion/nucleo-extraccion.js',
            'componentes/extraccion/extractor-inline.js',
            'componentes/extraccion/extractor-texto.js',
            'componentes/extraccion/extractor-listas.js',
            'componentes/extraccion/extractor-codigo.js',
            'componentes/extraccion/extractor-tablas.js',
            'componentes/extraccion/extractor-citas.js',
            'componentes/extraccion/extractor-multimedia.js',
            'componentes/extraccion/extractor-iframes.js',
            'extractor-contenido.js'
          ]
        });
        extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
      } catch (errorInyeccion) {
        chrome.notifications.create('captura-rapida-error', {
          type: 'basic',
          iconUrl: 'assets/icons/Samjoko-Icono_LowP_128px.png',
          title: chrome.i18n.getMessage('nombreExtension'),
          message: chrome.i18n.getMessage('errorSinContenido')
        });
        return;
      }
    }

    if (!extraido || !extraido.markdown) {
      chrome.notifications.create('captura-rapida-error', {
        type: 'basic',
        iconUrl: 'assets/icons/Samjoko-Icono_LowP_128px.png',
        title: chrome.i18n.getMessage('nombreExtension'),
        message: chrome.i18n.getMessage('errorSinContenido')
      });
      return;
    }

    await promesaInicializacion;

    if (!manejadorDirectorio) {
      chrome.notifications.create('captura-rapida-error', {
        type: 'basic',
        iconUrl: 'assets/icons/Samjoko-Icono_LowP_128px.png',
        title: chrome.i18n.getMessage('nombreExtension'),
        message: chrome.i18n.getMessage('errorSWCarpetaNoConfigurada')
      });
      return;
    }

    const tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
    const configuracionTrabajador = await obtenerConfiguracion();
    const metadatosFrontales = generarMetadatosFrontales(extraido.metadata, configuracionTrabajador.usarMetadatosFrontales, '', configuracionTrabajador.camposFrontmatter);
    var contenidoFinal = metadatosFrontales + extraido.markdown;
    if (configuracionTrabajador.ajusteLinea && configuracionTrabajador.ajusteLinea !== 'ninguno') {
      contenidoFinal = ajustarTexto(contenidoFinal, configuracionTrabajador.ajusteLinea);
    }
    const nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
    const nombreGuardado = await guardarArchivoEnCarpeta(contenidoFinal, nombreBase);

    chrome.notifications.create('captura-rapida-exito', {
      type: 'basic',
      iconUrl: 'assets/icons/Samjoko-Icono_LowP_128px.png',
      title: chrome.i18n.getMessage('nombreExtension'),
      message: chrome.i18n.getMessage('notificacionGuardadoExitoso', nombreGuardado)
    });
  } catch (errorIgnorado) {
    chrome.notifications.create('captura-rapida-error', {
      type: 'basic',
      iconUrl: 'assets/icons/Samjoko-Icono_LowP_128px.png',
      title: chrome.i18n.getMessage('nombreExtension'),
      message: chrome.i18n.getMessage('notificacionErrorGuardado')
    });
  }
});

inicializar();
