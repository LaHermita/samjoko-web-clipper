const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);
const zonaToast = document.getElementById('zonaToast');

const botonCapturaRapida = document.getElementById('botonCapturaRapida');
const botonCapturaRevision = document.getElementById('botonCapturaRevision');
const botonConfiguracion = document.getElementById('botonConfiguracion');

const areaResultado = document.getElementById('areaResultado');
const textoMarkdown = document.getElementById('textoMarkdown');
const botonCopiar = document.getElementById('botonCopiar');
const botonDescargar = document.getElementById('botonDescargar');
const botonGuardar = document.getElementById('botonGuardar');

let tituloPagina = '';

(function inicializarI18n() {
  document.title = chrome.i18n.getMessage('tituloPopup');
  document.querySelector('h1').textContent = chrome.i18n.getMessage('tituloPopup');

  botonCapturaRapida.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonCapturaRapidaTitulo');
  botonCapturaRapida.setAttribute('aria-label', chrome.i18n.getMessage('botonCapturaRapidaTitulo'));

  botonCapturaRevision.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonCapturaRevisionTitulo');
  botonCapturaRevision.setAttribute('aria-label', chrome.i18n.getMessage('botonCapturaRevisionTitulo'));

  botonConfiguracion.querySelector('.tooltip').textContent = chrome.i18n.getMessage('botonConfiguracionTitulo');
  botonConfiguracion.setAttribute('aria-label', chrome.i18n.getMessage('botonConfiguracionTitulo'));

  botonCopiar.textContent = chrome.i18n.getMessage('botonCopiar');
  botonDescargar.textContent = chrome.i18n.getMessage('botonDescargar');
  botonGuardar.textContent = chrome.i18n.getMessage('botonGuardar');
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

    tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
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

async function capturaRevision() {
  botonCapturaRevision.disabled = true;
  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoExtrayendo'));
  areaResultado.classList.add('oculto');

  try {
    var resultadoQuery = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoQuery[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      mostrarToast(chrome.i18n.getMessage('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido = await extraerContenido(pestania);
    barra.ocultar();

    if (extraido && extraido.markdown) {
      textoMarkdown.value = extraido.markdown;
      tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
      areaResultado.classList.remove('oculto');
    } else {
      mostrarToast(chrome.i18n.getMessage('errorSinContenido'), 'error');
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(chrome.i18n.getMessage('errorGenerico', error.message), 'error');
  } finally {
    botonCapturaRevision.disabled = false;
  }
}

async function guardarEnCarpeta() {
  var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

  if (!verificacion.tieneCarpeta) {
    mostrarToast(chrome.i18n.getMessage('errorSinCarpeta'), 'error');
    return;
  }

  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoPreparando'));
  botonGuardar.disabled = true;

  try {
    var nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';

    barra.establecerTexto(chrome.i18n.getMessage('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: textoMarkdown.value,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || chrome.i18n.getMessage('errorGuardado', ''), 'error');
    } else {
      mostrarToast(chrome.i18n.getMessage('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(chrome.i18n.getMessage('errorGuardado', error.message), 'error');
  } finally {
    botonGuardar.disabled = false;
  }
}

botonCapturaRapida.addEventListener('click', capturaRapida);

botonCapturaRevision.addEventListener('click', capturaRevision);

botonConfiguracion.addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});

botonCopiar.addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(textoMarkdown.value);
    mostrarToast(chrome.i18n.getMessage('mensajeCopiado'), 'exito');
  } catch (errorIgnorado) {
    mostrarToast(chrome.i18n.getMessage('errorCopiado'), 'error');
  }
});

botonDescargar.addEventListener('click', function () {
  var nombreArchivoFinal = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
  var blob = new Blob([textoMarkdown.value], { type: 'text/markdown' });
  var url = URL.createObjectURL(blob);
  var enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivoFinal;
  enlace.click();
  URL.revokeObjectURL(url);
  mostrarToast(chrome.i18n.getMessage('mensajeDescargadoComo', nombreArchivoFinal), 'exito');
});

botonGuardar.addEventListener('click', guardarEnCarpeta);
