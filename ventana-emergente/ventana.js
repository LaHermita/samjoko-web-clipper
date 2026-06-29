const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);
const zonaToast = document.getElementById('zonaToast');

const botonCapturaRapida = document.getElementById('botonCapturaRapida');
const botonEditorBloques = document.getElementById('botonEditorBloques');
const botonConfiguracion = document.getElementById('botonConfiguracion');

async function inicializarI18n() {
  var config = await obtenerConfiguracion();
  document.documentElement.setAttribute('data-theme', config.tema);
  await cargarIdioma(config.idioma);

  document.title = t('tituloPopup');
  document.querySelector('h1').textContent = t('tituloPopup');

  botonCapturaRapida.querySelector('.tooltip').textContent = t('botonCapturaRapidaTitulo');
  botonCapturaRapida.setAttribute('aria-label', t('botonCapturaRapidaTitulo'));

  botonEditorBloques.querySelector('.tooltip').textContent = t('botonEditorBloquesTitulo');
  botonEditorBloques.setAttribute('aria-label', t('botonEditorBloquesTitulo'));

  botonConfiguracion.querySelector('.tooltip').textContent = t('botonConfiguracionTitulo');
  botonConfiguracion.setAttribute('aria-label', t('botonConfiguracionTitulo'));
}

inicializarI18n();

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
    barra.establecerTexto(t('barraProgresoConectando'));
    await chrome.scripting.executeScript({
      target: { tabId: pestania.id },
      files: ['extractor-contenido.js']
    });
    return await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
  }
}

async function capturaRapida() {
  botonCapturaRapida.disabled = true;
  barra.mostrar('indeterminado', t('barraProgresoExtrayendo'));

  try {
    var resultadoQuery = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoQuery[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      mostrarToast(t('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido = await extraerContenido(pestania);

    if (!extraido || !extraido.markdown) {
      barra.ocultar();
      mostrarToast(t('errorSinContenido'), 'error');
      return;
    }

    var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

    if (!verificacion.tieneCarpeta) {
      barra.ocultar();
      mostrarToast(t('errorSinCarpeta'), 'error');
      return;
    }

    var tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';
    var nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';

    var configPop = await obtenerConfiguracion();
    var frontmatter = generarFrontmatter(extraido.metadata, configPop.usarFrontmatter);
    var contenidoFinal = frontmatter + extraido.markdown;

    barra.establecerTexto(t('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: contenidoFinal,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || t('errorGuardado', ''), 'error');
    } else {
      mostrarToast(t('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
      setTimeout(function () {
        window.close();
      }, 1200);
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(t('errorGenerico', error.message), 'error');
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
    mostrarToast(t('errorGenerico', error.message), 'error');
  }
}

botonCapturaRapida.addEventListener('click', capturaRapida);

botonEditorBloques.addEventListener('click', abrirEditorBloques);

botonConfiguracion.addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});
