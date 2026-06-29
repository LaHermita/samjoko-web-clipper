const MENSAJES_CARGADOS = {};

async function cargarIdioma(idioma) {
  try {
    const respuesta = await fetch(chrome.runtime.getURL(`_locales/${idioma}/messages.json`));
    const datos = await respuesta.json();
    Object.keys(MENSAJES_CARGADOS).forEach(k => delete MENSAJES_CARGADOS[k]);
    Object.assign(MENSAJES_CARGADOS, datos);
    return true;
  } catch {
    return false;
  }
}

function traducir(clave, sustituciones) {
  const definicion = MENSAJES_CARGADOS[clave];

  if (definicion) {
    let mensaje = definicion.message;

    if (definicion.placeholders && sustituciones !== undefined) {
      const valores = Array.isArray(sustituciones) ? sustituciones : [sustituciones];
      for (const [nombre, placeholder] of Object.entries(definicion.placeholders)) {
        const indice = parseInt(placeholder.content.replace('$', ''), 10) - 1;
        if (valores[indice] !== undefined) {
          mensaje = mensaje.replaceAll(`$${nombre}$`, String(valores[indice]));
        }
      }
    }

    return mensaje;
  }

  try {
    const mensaje = chrome.i18n.getMessage(clave, sustituciones);
    if (mensaje && mensaje !== '') return mensaje;
  } catch {
    // fall through
  }

  return clave;
}

var t = traducir;
