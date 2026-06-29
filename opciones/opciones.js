var botonSeleccionar = document.getElementById('botonSeleccionar');
var infoCarpeta = document.getElementById('infoCarpeta');
var nombreCarpeta = document.getElementById('nombreCarpeta');
var botonLimpiar = document.getElementById('botonLimpiar');
var zonaToast = document.getElementById('zonaToast');

var selectorIdioma = document.getElementById('selectorIdioma');
var selectorTema = document.getElementById('selectorTema');
var entradaSubcarpeta = document.getElementById('entradaSubcarpeta');
var interruptorFrontmatter = document.getElementById('interruptorFrontmatter');

var configActual = null;

function mostrarToast(texto, tipo) {
  tipo = tipo || 'exito';
  var toast = document.createElement('div');
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

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
}

function llenarSelectores() {
  var opcionesIdioma = selectorIdioma.options;
  opcionesIdioma[0].textContent = t('idiomaEs');
  opcionesIdioma[1].textContent = t('idiomaEn');

  var opcionesTema = selectorTema.options;
  opcionesTema[0].textContent = t('temaSamjoko');
  opcionesTema[1].textContent = t('temaVivero');
  opcionesTema[2].textContent = t('temaNautilus');
  opcionesTema[3].textContent = t('temaAkkoro');
}

function inicializarI18nConConfig(config) {
  document.title = t('tituloOpciones');
  document.querySelector('#infoMarca h1').textContent = t('nombreExtension');
  document.getElementById('subtituloPagina').textContent = t('subtituloOpciones');

  document.querySelector('#cabeceraGeneral h3').textContent = t('seccionGeneral');
  document.querySelector('#cabeceraSeccion h3').textContent = t('seccionCarpeta');
  document.querySelector('#cabeceraFormato h3').textContent = t('seccionFormato');

  document.getElementById('etiquetaIdioma').textContent = t('etiquetaIdioma');
  document.getElementById('etiquetaTema').textContent = t('etiquetaTema');

  document.getElementById('descripcionCarpeta').textContent = t('descripcionCarpeta');
  document.querySelector('#botonSeleccionar span').textContent = t('botonSeleccionar');
  document.getElementById('etiquetaCarpeta').textContent = t('etiquetaCarpetaActual');
  botonLimpiar.setAttribute('aria-label', t('botonQuitarCarpeta'));

  document.getElementById('etiquetaSubcarpeta').textContent = t('etiquetaSubcarpeta');
  entradaSubcarpeta.placeholder = t('etiquetaSubcarpeta');

  document.querySelector('#seccionFormato .campoEtiqueta').textContent = t('etiquetaFrontmatter');
  document.querySelector('#seccionFormato .campoDescripcion').textContent = t('descripcionFrontmatter');

  document.getElementById('textoCopyright').textContent = t('pieCopyright');
  document.querySelector('#textoApoyo span').textContent = t('pieTextoApoyo');

  llenarSelectores();
}

function sincronizarUI(config) {
  selectorIdioma.value = config.idioma || 'es';
  selectorTema.value = config.tema || 'samjoko';
  entradaSubcarpeta.value = config.subcarpeta || '';
  interruptorFrontmatter.checked = config.usarFrontmatter !== false;
}

async function guardarCampo(clave, valor) {
  var antes = configActual.idioma;
  configActual = await guardarConfiguracion({ [clave]: valor });

  if (clave === 'tema') {
    aplicarTema(valor);
  }

  if (clave === 'idioma' && valor !== antes) {
    mostrarToast(t('mensajeConfigGuardada'), 'exito');
    setTimeout(function () {
      location.reload();
    }, 800);
    return;
  }

  mostrarToast(t('mensajeConfigGuardada'), 'exito');
}

async function inicializar() {
  configActual = await obtenerConfiguracion();

  aplicarTema(configActual.tema);

  await cargarIdioma(configActual.idioma);
  inicializarI18nConConfig(configActual);
  sincronizarUI(configActual);

  selectorIdioma.addEventListener('change', function () {
    guardarCampo('idioma', selectorIdioma.value);
  });

  selectorTema.addEventListener('change', function () {
    guardarCampo('tema', selectorTema.value);
  });

  entradaSubcarpeta.addEventListener('change', function () {
    guardarCampo('subcarpeta', entradaSubcarpeta.value.trim());
  });

  interruptorFrontmatter.addEventListener('change', function () {
    guardarCampo('usarFrontmatter', interruptorFrontmatter.checked);
  });

  botonSeleccionar.addEventListener('click', async function () {
    try {
      var manejador = await window.showDirectoryPicker({ mode: 'readwrite' });
      await guardarDirectorio(manejador);
      await chrome.runtime.sendMessage({ accion: 'establecerDirectorio' });
      await actualizarInfoCarpeta();
      mostrarToast(t('mensajeCarpetaSeleccionada', manejador.name), 'exito');
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'SecurityError') {
        mostrarToast(t('errorSeleccionCarpeta', error.message), 'error');
      }
    }
  });

  botonLimpiar.addEventListener('click', async function () {
    await chrome.runtime.sendMessage({ accion: 'limpiarDirectorio' });
    await actualizarInfoCarpeta();
    mostrarToast(t('mensajeCarpetaEliminada'), 'info');
  });

  actualizarInfoCarpeta();
}

async function actualizarInfoCarpeta() {
  var respuesta = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });
  if (respuesta.tieneCarpeta) {
    nombreCarpeta.textContent = respuesta.nombre;
    infoCarpeta.classList.remove('oculto');
  } else {
    infoCarpeta.classList.add('oculto');
  }
}

inicializar();
