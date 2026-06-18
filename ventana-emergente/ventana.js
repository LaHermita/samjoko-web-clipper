const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);
const zonaToast = document.getElementById('zonaToast');

const botonCapturaRapida = document.getElementById('botonCapturaRapida');
const botonEditorBloques = document.getElementById('botonEditorBloques');
const botonConfiguracion = document.getElementById('botonConfiguracion');

(function inicializarI18n() {
  document.title = chrome.i18n.getMessage('tituloPopup');
  document.querySelector('h1').textContent = chrome.i18n.getMessage('tituloPopup');

  botonCapturaRapida.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonCapturaRapidaTitulo');
  botonCapturaRapida.setAttribute('aria-label', chrome.i18n.getMessage('botonCapturaRapidaTitulo'));

  botonEditorBloques.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonEditorBloquesTitulo');
  botonEditorBloques.setAttribute('aria-label', chrome.i18n.getMessage('botonEditorBloquesTitulo'));

  botonConfiguracion.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonConfiguracionTitulo');
  botonConfiguracion.setAttribute('aria-label', chrome.i18n.getMessage('botonConfiguracionTitulo'));
})();

function mostrarToast(texto, tipo) {
  tipo = tipo || 'exito';
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + tipo;
  toast.textContent = texto;
  zonaToast.appendChild(toast);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add('toast-visible');
    });
  });

  setTimeout(function () {
    toast.classList.remove('toast-visible');
    setTimeout(function () {
      toast.remove();
    }, 250);
  }, 3000);
}

async function extraerContenido(pestania) {
  try {
    return await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
  } catch (errorIgnorado) {
    barra.establecerTexto(chrome.i18n.getMessage('barraProgresoConectando'));
    await chrome.scripting.executeScript({
      target: { tabId: pestania.id },
      files: ['extractor-contenido.js']
    });
    return await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
  }
}

async function capturaRapida() {
  botonCapturaRapida.disabled = true;
  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoExtrayendo'));

  try {
    var resultadoQuery = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoQuery[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      mostrarToast(chrome.i18n.getMessage('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido = await extraerContenido(pestania);

    if (!extraido || !extraido.markdown) {
      barra.ocultar();
      mostrarToast(chrome.i18n.getMessage('errorSinContenido'), 'error');
      return;
    }

    var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

    if (!verificacion.tieneCarpeta) {
      barra.ocultar();
      mostrarToast(chrome.i18n.getMessage('errorSinCarpeta'), 'error');
      return;
    }

    var tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
    var nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';

    barra.establecerTexto(chrome.i18n.getMessage('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: extraido.markdown,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || chrome.i18n.getMessage('errorGuardado', ''), 'error');
    } else {
      mostrarToast(chrome.i18n.getMessage('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
      setTimeout(function () {
        window.close();
      }, 1200);
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(chrome.i18n.getMessage('errorGenerico', error.message), 'error');
  } finally {
    botonCapturaRapida.disabled = false;
  }
}

async function abrirEditorBloques() {
  try {
    var ventanaActual = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: ventanaActual.id });
    setTimeout(function () {
      window.close();
    }, 200);
  } catch (error) {
    mostrarToast(chrome.i18n.getMessage('errorGenerico', error.message), 'error');
  }
}

botonCapturaRapida.addEventListener('click', capturaRapida);

botonEditorBloques.addEventListener('click', abrirEditorBloques);

botonConfiguracion.addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});
