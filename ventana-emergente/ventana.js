const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);

const botonCapturar = document.getElementById('botonCapturar');
const areaResultado = document.getElementById('areaResultado');
const textoMarkdown = document.getElementById('textoMarkdown');
const botonCopiar = document.getElementById('botonCopiar');
const botonDescargar = document.getElementById('botonDescargar');
const botonGuardar = document.getElementById('botonGuardar');
const mensajeEstado = document.getElementById('mensajeEstado');
const abrirOpciones = document.getElementById('abrirOpciones');

let tituloPagina = '';

(function inicializarI18n() {
  document.title = chrome.i18n.getMessage('tituloPopup');
  document.querySelector('h1').textContent = chrome.i18n.getMessage('tituloPopup');
  botonCapturar.textContent = chrome.i18n.getMessage('botonCapturar');
  botonCopiar.textContent = chrome.i18n.getMessage('botonCopiar');
  botonDescargar.textContent = chrome.i18n.getMessage('botonDescargar');
  botonGuardar.textContent = chrome.i18n.getMessage('botonGuardar');
  abrirOpciones.textContent = chrome.i18n.getMessage('enlaceOpciones');
})();

function mostrarMensaje(texto, esError = false) {
  mensajeEstado.textContent = texto;
  mensajeEstado.className = esError ? 'mensaje-error' : 'mensaje-info';
}

async function capturarPagina() {
  botonCapturar.disabled = true;
  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoExtrayendo'));
  mostrarMensaje('');

  try {
    const [pestania] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!pestania?.id) {
      barra.ocultar();
      mostrarMensaje(chrome.i18n.getMessage('errorPestaniaActiva'), true);
      return;
    }

    let resultado;
    try {
      resultado = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch {
      barra.establecerTexto(chrome.i18n.getMessage('barraProgresoConectando'));
      await chrome.scripting.executeScript({
        target: { tabId: pestania.id },
        files: ['extractor-contenido.js']
      });
      resultado = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    }

    barra.ocultar();

    if (resultado?.markdown) {
      textoMarkdown.value = resultado.markdown;
      tituloPagina = resultado.metadata?.titulo || pestania.title || '';
      areaResultado.classList.remove('oculto');
      mostrarMensaje(chrome.i18n.getMessage('mensajeCapturaExitosa'));
    } else {
      mostrarMensaje(chrome.i18n.getMessage('errorSinContenido'), true);
    }
  } catch (error) {
    barra.ocultar();
    mostrarMensaje(chrome.i18n.getMessage('errorGenerico', error.message), true);
  } finally {
    botonCapturar.disabled = false;
  }
}

async function guardarEnCarpeta() {
  const verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

  if (!verificacion.tieneCarpeta) {
    mostrarMensaje(chrome.i18n.getMessage('errorSinCarpeta'), true);
    return;
  }

  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoPreparando'));
  mostrarMensaje('');
  botonGuardar.disabled = true;

  try {
    const nombreBase = `${obtenerNombreDesdeTitulo(tituloPagina)}.md`;

    barra.establecerTexto(chrome.i18n.getMessage('barraProgresoGuardando'));
    const resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: textoMarkdown.value,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarMensaje(resultado.mensaje || chrome.i18n.getMessage('errorGuardado', ''), true);
    } else {
      mostrarMensaje(chrome.i18n.getMessage('mensajeGuardadoComo', resultado.nombreArchivo));
    }
  } catch (error) {
    barra.ocultar();
    mostrarMensaje(chrome.i18n.getMessage('errorGuardado', error.message), true);
  } finally {
    botonGuardar.disabled = false;
  }
}

botonCapturar.addEventListener('click', capturarPagina);

botonCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(textoMarkdown.value);
    mostrarMensaje(chrome.i18n.getMessage('mensajeCopiado'));
  } catch {
    mostrarMensaje(chrome.i18n.getMessage('errorCopiado'), true);
  }
});

botonDescargar.addEventListener('click', () => {
  const nombreArchivoFinal = `${obtenerNombreDesdeTitulo(tituloPagina)}.md`;
  const blob = new Blob([textoMarkdown.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivoFinal;
  enlace.click();
  URL.revokeObjectURL(url);
  mostrarMensaje(chrome.i18n.getMessage('mensajeDescargadoComo', nombreArchivoFinal));
});

botonGuardar.addEventListener('click', guardarEnCarpeta);

abrirOpciones.addEventListener('click', (evento) => {
  evento.preventDefault();
  chrome.runtime.openOptionsPage();
});
