// Criterio único de disponibilidad de la File System Access API (B5).
// Se comprueba la existencia de los tipos de manejador porque es la única
// comprobación con el mismo resultado en la ventana (popup, editor, opciones)
// y en el service worker / event page: showDirectoryPicker es API de Window y
// no existe en workers, así que usarlo aquí haría que los contextos discreparan.
function esFsaDisponible() {
  return (
    typeof FileSystemDirectoryHandle !== 'undefined' &&
    typeof FileSystemFileHandle !== 'undefined'
  );
}

// Lista de scripts de extracción (B4): única fuente = manifest.json.
// El manifest tiene que declararlos estáticamente, así que el service worker,
// el popup y el editor los leen desde ahí en lugar de duplicar la lista.
function obtenerScriptsExtraccion() {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getManifest) {
    throw new Error('obtenerScriptsExtraccion() solo funciona dentro de la extensión');
  }
  var manifiesto = chrome.runtime.getManifest();
  var grupos = manifiesto.content_scripts || [];
  for (var i = 0; i < grupos.length; i++) {
    var scripts = grupos[i].js || [];
    if (scripts.indexOf('componentes/extraccion/nucleo-extraccion.js') !== -1) {
      return scripts.slice();
    }
  }
  throw new Error('manifest.json no declara los scripts de extracción (content_scripts)');
}

var ESQUEMA_CONFIG = {
  idioma: 'string',
  tema: 'string',
  subcarpeta: 'string',
  usarMetadatosFrontales: 'boolean',
  camposFrontmatter: 'object',
  ajusteLinea: 'string'
};

var TAMANO_MAXIMO_CONFIG = 10240;

const CAMPOS_FRONTMATTER_PREDETERMINADOS = Object.freeze({
  url_origen: true,
  fecha_captura: true,
  titulo: true,
  tipo: true,
  autor: true,
  fecha_publicacion: true,
  tags: true,
  descripcion: true,
  idioma: true,
  sitio_nombre: true,
  tipo_contenido: true,
  imagen_destacada: true,
  tiempo_lectura: true,
  notas_personales: true,
  estado: true
});

const CONFIG_PREDETERMINADA = Object.freeze({
  idioma: 'es',
  tema: 'samjoko',
  subcarpeta: '',
  usarMetadatosFrontales: true,
  camposFrontmatter: { ...CAMPOS_FRONTMATTER_PREDETERMINADOS },
  ajusteLinea: 'ninguno'
});

const CLAVE_CONFIG = 'configuracion';

function validarConfiguracion(datos) {
  if (typeof datos !== 'object' || datos === null) return false;
  for (var clave in datos) {
    if (datos.hasOwnProperty(clave)) {
      var tipo = ESQUEMA_CONFIG[clave];
      if (tipo && typeof datos[clave] !== tipo) return false;
      if (clave === 'camposFrontmatter' && typeof datos[clave] === 'object') {
        for (var campo in datos[clave]) {
          if (CAMPOS_FRONTMATTER_PREDETERMINADOS.hasOwnProperty(campo) && typeof datos[clave][campo] !== 'boolean') {
            return false;
          }
        }
      }
    }
  }
  var serializado = JSON.stringify(datos);
  if (serializado.length > TAMANO_MAXIMO_CONFIG) return false;
  return true;
}

async function obtenerConfiguracion() {
  try {
    const resultado = await chrome.storage.sync.get(CLAVE_CONFIG);
    const guardada = resultado[CLAVE_CONFIG] || {};
    if (!validarConfiguracion(guardada)) {
      return { ...CONFIG_PREDETERMINADA };
    }
    return { ...CONFIG_PREDETERMINADA, ...guardada };
  } catch {
    return { ...CONFIG_PREDETERMINADA };
  }
}

async function guardarConfiguracion(datos) {
  if (!validarConfiguracion(datos)) {
    throw new Error('Configuracion invalida');
  }
  const actual = await obtenerConfiguracion();
  const nueva = { ...actual, ...datos };
  await chrome.storage.sync.set({ [CLAVE_CONFIG]: nueva });
  return nueva;
}

async function restablecerConfiguracion() {
  await chrome.storage.sync.set({ [CLAVE_CONFIG]: { ...CONFIG_PREDETERMINADA } });
  return { ...CONFIG_PREDETERMINADA };
}

if (typeof document !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(function (cambios, area) {
    if (area === 'sync' && cambios[CLAVE_CONFIG]) {
      var nuevaConfig = cambios[CLAVE_CONFIG].newValue || CONFIG_PREDETERMINADA;
      if (nuevaConfig.tema) {
        document.documentElement.setAttribute('data-theme', nuevaConfig.tema);
      }
    }
  });
}
