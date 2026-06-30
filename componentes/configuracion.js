var ESQUEMA_CONFIG = {
  idioma: 'string',
  tema: 'string',
  subcarpeta: 'string',
  usarMetadatosFrontales: 'boolean'
};

var TAMANO_MAXIMO_CONFIG = 10240;

const CONFIG_PREDETERMINADA = Object.freeze({
  idioma: 'es',
  tema: 'samjoko',
  subcarpeta: '',
  usarMetadatosFrontales: true
});

const CLAVE_CONFIG = 'configuracion';

function validarConfiguracion(datos) {
  if (typeof datos !== 'object' || datos === null) return false;
  for (var clave in datos) {
    if (datos.hasOwnProperty(clave)) {
      var tipo = ESQUEMA_CONFIG[clave];
      if (tipo && typeof datos[clave] !== tipo) return false;
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
