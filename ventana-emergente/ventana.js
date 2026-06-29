const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);
const zonaToast = document.getElementById('zonaToast');

const botonCapturaRapida = document.getElementById('botonCapturaRapida');
const botonEditorBloques = document.getElementById('botonEditorBloques');
const botonConfiguracion = document.getElementById('botonConfiguracion');

const zonaNotas = document.getElementById('zonaNotas');
const notasRapidas = document.getElementById('notasRapidas');
const etiquetaNotasRapidas = document.getElementById('etiquetaNotasRapidas');

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

  etiquetaNotasRapidas.textContent = t('etiquetaNotasPersonales');
  notasRapidas.placeholder = t('placeholderNotasPersonales');
  document.getElementById('botonGuardarNotas').textContent = t('botonGuardar');
  document.getElementById('botonCancelarNotas').textContent = t('botonCancelar');
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

    var tituloPagina = extraido.metadata && extraido.metadata.titulo ? extraido.metadata.titulo : pestania.title || '';

    zonaNotas.classList.remove('oculto');
    document.getElementById('accionesNotas').classList.remove('oculto');
    botonCapturaRapida.disabled = true;

    var datosPendientes = {
      metadata: extraido.metadata,
      markdown: extraido.markdown,
      tituloPagina: tituloPagina
    };
    zonaNotas._datosPendientes = datosPendientes;

    barra.ocultar();
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

async function guardarConNotas() {
  var datos = zonaNotas._datosPendientes;
  if (!datos) return;

  var botonGuardar = document.getElementById('botonGuardarNotas');
  botonGuardar.disabled = true;

  try {
    var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

    if (!verificacion.tieneCarpeta) {
      mostrarToast(t('errorSinCarpeta'), 'error');
      botonGuardar.disabled = false;
      return;
    }

    var nombreBase = obtenerNombreDesdeTitulo(datos.tituloPagina) + '.md';
    var notas = notasRapidas.value.trim();

    var configPop = await obtenerConfiguracion();
    var frontmatter = generarFrontmatter(datos.metadata, configPop.usarFrontmatter, notas);
    var contenidoFinal = frontmatter + datos.markdown;

    barra.establecerTexto(t('barraProgresoGuardando'));
    barra.mostrar('indeterminado', t('barraProgresoGuardando'));

    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: contenidoFinal,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || t('errorGuardado', ''), 'error');
      botonGuardar.disabled = false;
    } else {
      mostrarToast(t('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
      setTimeout(function () {
        window.close();
      }, 1200);
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(t('errorGenerico', error.message), 'error');
    botonGuardar.disabled = false;
  }
}

function cancelarNotas() {
  zonaNotas.classList.add('oculto');
  document.getElementById('accionesNotas').classList.add('oculto');
  botonCapturaRapida.disabled = false;
  notasRapidas.value = '';
  delete zonaNotas._datosPendientes;
}

botonCapturaRapida.addEventListener('click', capturaRapida);

botonEditorBloques.addEventListener('click', abrirEditorBloques);

botonConfiguracion.addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});

document.getElementById('botonGuardarNotas').addEventListener('click', guardarConNotas);
document.getElementById('botonCancelarNotas').addEventListener('click', cancelarNotas);
