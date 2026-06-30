var botonSeleccionar = document.getElementById('botonSeleccionar');
var infoCarpeta = document.getElementById('infoCarpeta');
var nombreCarpeta = document.getElementById('nombreCarpeta');
var botonLimpiar = document.getElementById('botonLimpiar');
var zonaToast = document.getElementById('zonaToast');

var selectorIdioma = document.getElementById('selectorIdioma');
var selectorTema = document.getElementById('selectorTema');
var entradaSubcarpeta = document.getElementById('entradaSubcarpeta');
var interruptorMetadatosFrontales = document.getElementById('interruptorMetadatosFrontales');
var zonaCamposFrontmatter = document.getElementById('camposFrontmatter');
var listaCamposFrontmatter = document.getElementById('listaCamposFrontmatter');

var ETIQUETAS_CAMPOS = {
  url_origen: 'URL de origen',
  fecha_captura: 'Fecha de captura',
  titulo: 'Título',
  tipo: 'Tipo (fuente)',
  autor: 'Autor',
  fecha_publicacion: 'Fecha de publicación',
  tags: 'Etiquetas',
  descripcion: 'Descripción',
  idioma: 'Idioma',
  sitio_nombre: 'Nombre del sitio',
  tipo_contenido: 'Tipo de contenido',
  imagen_destacada: 'Imagen destacada',
  tiempo_lectura: 'Tiempo de lectura',
  notas_personales: 'Notas personales',
  estado: 'Estado (ACTIVO)'
};

var configuracionActual = null;

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
  opcionesIdioma[0].textContent = traducir('idiomaEs');
  opcionesIdioma[1].textContent = traducir('idiomaEn');

  var opcionesTema = selectorTema.options;
  opcionesTema[0].textContent = traducir('temaSamjoko');
  opcionesTema[1].textContent = traducir('temaVivero');
  opcionesTema[2].textContent = traducir('temaNautilus');
  opcionesTema[3].textContent = traducir('temaAkkoro');
}

function inicializarInternacionalizacionConConfiguracion(config) {
  document.title = traducir('tituloOpciones');
  document.querySelector('#infoMarca h1').textContent = traducir('nombreExtension');
  document.getElementById('subtituloPagina').textContent = traducir('subtituloOpciones');

  document.querySelector('#cabeceraGeneral h3').textContent = traducir('seccionGeneral');
  document.querySelector('#cabeceraSeccion h3').textContent = traducir('seccionCarpeta');
  document.querySelector('#cabeceraFormato h3').textContent = traducir('seccionFormato');

  document.getElementById('etiquetaIdioma').textContent = traducir('etiquetaIdioma');
  document.getElementById('etiquetaTema').textContent = traducir('etiquetaTema');

  document.getElementById('descripcionCarpeta').textContent = traducir('descripcionCarpeta');
  document.querySelector('#botonSeleccionar span').textContent = traducir('botonSeleccionar');
  document.getElementById('etiquetaCarpeta').textContent = traducir('etiquetaCarpetaActual');
  botonLimpiar.setAttribute('aria-label', traducir('botonQuitarCarpeta'));

  document.getElementById('etiquetaSubcarpeta').textContent = traducir('etiquetaSubcarpeta');
  entradaSubcarpeta.placeholder = traducir('etiquetaSubcarpeta');

  document.querySelector('#seccionFormato .campoEtiqueta').textContent = traducir('etiquetaFrontmatter');
  document.querySelector('#seccionFormato .campoDescripcion').textContent = traducir('descripcionFrontmatter');
  document.getElementById('etiquetaCamposFrontmatter').textContent = traducir('etiquetaCamposFrontmatter');

  document.getElementById('textoAtajos').textContent = traducir('textoAtajosTeclado');
  document.getElementById('textoCopyright').textContent = traducir('pieCopyright');
  document.querySelector('#textoApoyo span').textContent = traducir('pieTextoApoyo');

  llenarSelectores();
}

function crearCampoCheckbox(clave, etiqueta, activo) {
  var contenedor = document.createElement('label');
  contenedor.className = 'campo-checkbox-frontmatter';

  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = activo;
  checkbox.dataset.campo = clave;

  var texto = document.createElement('span');
  texto.textContent = etiqueta;

  contenedor.appendChild(checkbox);
  contenedor.appendChild(texto);

  checkbox.addEventListener('change', function () {
    var camposActuales = Object.assign({}, configuracionActual.camposFrontmatter);
    camposActuales[clave] = checkbox.checked;
    guardarCampo('camposFrontmatter', camposActuales);
  });

  return contenedor;
}

function sincronizarCamposFrontmatter(config) {
  listaCamposFrontmatter.innerHTML = '';
  var campos = config.camposFrontmatter || {};
  for (var clave in ETIQUETAS_CAMPOS) {
    var activo = campos[clave] !== false;
    var elemento = crearCampoCheckbox(clave, ETIQUETAS_CAMPOS[clave], activo);
    listaCamposFrontmatter.appendChild(elemento);
  }
  if (config.usarMetadatosFrontales) {
    zonaCamposFrontmatter.classList.remove('oculto');
  } else {
    zonaCamposFrontmatter.classList.add('oculto');
  }
}

function sincronizarInterfaz(config) {
  selectorIdioma.value = config.idioma || 'es';
  selectorTema.value = config.tema || 'samjoko';
  entradaSubcarpeta.value = config.subcarpeta || '';
  interruptorMetadatosFrontales.checked = config.usarMetadatosFrontales !== false;
  sincronizarCamposFrontmatter(config);
}

async function guardarCampo(clave, valor) {
  var antes = configuracionActual.idioma;
  configuracionActual = await guardarConfiguracion({ [clave]: valor });

  if (clave === 'tema') {
    aplicarTema(valor);
  }

  if (clave === 'idioma' && valor !== antes) {
    mostrarToast(traducir('mensajeConfigGuardada'), 'exito');
    setTimeout(function () {
      location.reload();
    }, 800);
    return;
  }

  var elemento = document.querySelector('[name="' + clave + '"]') || document.getElementById(clave);
  if (elemento) {
    elemento.classList.remove('feedback-guardado');
    void elemento.offsetWidth;
    elemento.classList.add('feedback-guardado');
    setTimeout(function () {
      elemento.classList.remove('feedback-guardado');
    }, 1000);
  }

  mostrarToast(traducir('mensajeConfigGuardada'), 'exito');
}

async function inicializar() {
  configuracionActual = await obtenerConfiguracion();

  aplicarTema(configuracionActual.tema);
  document.documentElement.lang = configuracionActual.idioma || 'es';

  await cargarIdioma(configuracionActual.idioma);
  inicializarInternacionalizacionConConfiguracion(configuracionActual);
  sincronizarInterfaz(configuracionActual);

  selectorIdioma.addEventListener('change', function () {
    guardarCampo('idioma', selectorIdioma.value);
  });

  selectorTema.addEventListener('change', function () {
    guardarCampo('tema', selectorTema.value);
  });

  entradaSubcarpeta.addEventListener('change', function () {
    guardarCampo('subcarpeta', entradaSubcarpeta.value.trim());
  });

  interruptorMetadatosFrontales.addEventListener('change', function () {
    guardarCampo('usarMetadatosFrontales', interruptorMetadatosFrontales.checked);
    if (interruptorMetadatosFrontales.checked) {
      zonaCamposFrontmatter.classList.remove('oculto');
    } else {
      zonaCamposFrontmatter.classList.add('oculto');
    }
  });

  botonSeleccionar.addEventListener('click', async function () {
    try {
      var manejador = await window.showDirectoryPicker({ mode: 'readwrite' });
      await guardarDirectorio(manejador);
      var resultadoToken = await chrome.storage.session.get('tokenSesion');
      await chrome.runtime.sendMessage({ accion: 'establecerDirectorio', tokenSesion: resultadoToken.tokenSesion || '' });
      await actualizarInfoCarpeta();
      mostrarToast(traducir('mensajeCarpetaSeleccionada', manejador.name), 'exito');
    } catch (error) {
      if (error.name !== 'AbortError' && error.name !== 'SecurityError') {
        mostrarToast(traducir('errorSeleccionCarpeta', error.message), 'error');
      }
    }
  });

  botonLimpiar.addEventListener('click', async function () {
    var resultadoToken = await chrome.storage.session.get('tokenSesion');
    await chrome.runtime.sendMessage({ accion: 'limpiarDirectorio', tokenSesion: resultadoToken.tokenSesion || '' });
    await actualizarInfoCarpeta();
    mostrarToast(traducir('mensajeCarpetaEliminada'), 'info');
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
