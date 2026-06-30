if (typeof window.traducir !== 'function') { window.traducir = function (c) { return c; }; }

const zonaProgreso = document.getElementById('zonaProgreso');
const barra = new BarraProgreso(zonaProgreso);
const zonaToast = document.getElementById('zonaToast');

const botonCapturaRapida = document.getElementById('botonCapturaRapida');
const botonEditorBloques = document.getElementById('botonEditorBloques');
const botonConfiguracion = document.getElementById('botonConfiguracion');

const zonaNotas = document.getElementById('zonaNotas');
const notasRapidas = document.getElementById('notasRapidas');
const etiquetaNotasRapidas = document.getElementById('etiquetaNotasRapidas');

const infoCarpeta = document.getElementById('infoCarpeta');

async function inicializarInternacionalizacion() {
  var configuracion = await obtenerConfiguracion();
  document.documentElement.setAttribute('data-theme', configuracion.tema);
  await cargarIdioma(configuracion.idioma);

  document.title = traducir('tituloPopup');
  document.querySelector('h1').textContent = traducir('tituloPopup');

  document.getElementById('etiquetaCapturaRapida').textContent = traducir('botonCapturaRapidaTitulo');
  botonCapturaRapida.setAttribute('aria-label', traducir('botonCapturaRapidaTitulo'));

  document.getElementById('etiquetaEditorBloques').textContent = traducir('botonEditorBloquesTitulo');
  botonEditorBloques.setAttribute('aria-label', traducir('botonEditorBloquesTitulo'));

  document.getElementById('etiquetaConfiguracion').textContent = traducir('botonConfiguracionTitulo');
  botonConfiguracion.setAttribute('aria-label', traducir('botonConfiguracionTitulo'));

  etiquetaNotasRapidas.textContent = traducir('etiquetaNotasPersonales');
  notasRapidas.placeholder = traducir('placeholderNotasPersonales');
  document.getElementById('botonGuardarNotas').textContent = traducir('botonGuardar');
  document.getElementById('botonCancelarNotas').textContent = traducir('botonCancelar');

  actualizarInfoCarpeta();
}

async function actualizarInfoCarpeta() {
  try {
    var respuesta = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });
    if (respuesta.tieneCarpeta) {
      infoCarpeta.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14" style="vertical-align:middle;margin-right:4px"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>' + respuesta.nombre;
      infoCarpeta.className = 'ok';
    } else {
      infoCarpeta.textContent = traducir('mensajeSinCarpeta');
      infoCarpeta.className = 'error';
    }
  } catch {
    infoCarpeta.textContent = traducir('mensajeSinCarpeta');
    infoCarpeta.className = 'error';
  }
  infoCarpeta.classList.remove('oculto');
}

inicializarInternacionalizacion().then(function () {
  return necesitaOnboarding();
}).then(function (mostrar) {
  if (mostrar) {
    crearOnboarding();
  }
});

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
    barra.establecerTexto(traducir('barraProgresoConectando'));
    await chrome.scripting.executeScript({
      target: { tabId: pestania.id },
      files: [
        'componentes/extraccion/nucleo-extraccion.js',
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
    return await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
  }
}

async function capturaRapida() {
  botonCapturaRapida.disabled = true;
  barra.mostrar('indeterminado', traducir('barraProgresoExtrayendo'));

  try {
    var resultadoConsulta = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoConsulta[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      mostrarToast(traducir('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido = await extraerContenido(pestania);

    if (!extraido || !extraido.markdown) {
      barra.ocultar();
      mostrarToast(traducir('errorSinContenido'), 'error');
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
    mostrarToast(traducir('errorGenerico', error.message), 'error');
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
    mostrarToast(traducir('errorGenerico', error.message), 'error');
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
      mostrarToast(traducir('errorSinCarpeta'), 'error');
      botonGuardar.disabled = false;
      return;
    }

    var nombreBase = obtenerNombreDesdeTitulo(datos.tituloPagina) + '.md';
    var notas = notasRapidas.value.trim();

    var configuracionVentanaEmergente = await obtenerConfiguracion();
    var metadatosFrontales = generarMetadatosFrontales(datos.metadata, configuracionVentanaEmergente.usarMetadatosFrontales, notas);
    var contenidoFinal = metadatosFrontales + datos.markdown;

    barra.establecerTexto(traducir('barraProgresoGuardando'));
    barra.mostrar('indeterminado', traducir('barraProgresoGuardando'));

    var tokenResultado = await chrome.storage.session.get('tokenSesion');
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: contenidoFinal,
      nombreArchivo: nombreBase,
      tokenSesion: tokenResultado.tokenSesion || ''
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || traducir('errorGuardado', ''), 'error');
      botonGuardar.disabled = false;
    } else {
      mostrarToast(traducir('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
      setTimeout(function () {
        window.close();
      }, 1200);
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(traducir('errorGenerico', error.message), 'error');
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
