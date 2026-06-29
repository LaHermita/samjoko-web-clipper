const CONFIG_PREDETERMINADA = Object.freeze({
  idioma: 'es',
  tema: 'samjoko',
  subcarpeta: '',
  usarMetadatosFrontales: true,
  elementosExcluir: [],
  elementosIncluir: []
});

const CLAVE_CONFIG = 'configuracion';

async function obtenerConfiguracion() {
  try {
    const resultado = await chrome.storage.sync.get(CLAVE_CONFIG);
    const guardada = resultado[CLAVE_CONFIG] || {};
    return { ...CONFIG_PREDETERMINADA, ...guardada };
  } catch {
    return { ...CONFIG_PREDETERMINADA };
  }
}

async function guardarConfiguracion(datos) {
  const actual = await obtenerConfiguracion();
  const nueva = { ...actual, ...datos };
  await chrome.storage.sync.set({ [CLAVE_CONFIG]: nueva });
  return nueva;
}

async function restablecerConfiguracion() {
  await chrome.storage.sync.set({ [CLAVE_CONFIG]: { ...CONFIG_PREDETERMINADA } });
  return { ...CONFIG_PREDETERMINADA };
}

var tipoDocumento = typeof document !== 'undefined' ? document : null;
if (tipoDocumento && chrome.storage) {
  chrome.storage.onChanged.addListener(function (cambios, area) {
    if (area === 'sync' && cambios[CLAVE_CONFIG]) {
      var nuevaConfig = cambios[CLAVE_CONFIG].newValue || CONFIG_PREDETERMINADA;
      if (nuevaConfig.tema) {
        document.documentElement.setAttribute('data-theme', nuevaConfig.tema);
      }
    }
  });
}
