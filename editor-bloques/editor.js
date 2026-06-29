var zonaProgreso = document.getElementById('zonaProgreso');
var barra = new BarraProgreso(zonaProgreso);
var zonaToast = document.getElementById('zonaToast');

var panelMetadata = document.getElementById('panelMetadata');
var metaAutor = document.getElementById('metaAutor');
var metaSeparador = document.getElementById('metaSeparador');
var metaSeparador2 = document.getElementById('metaSeparador2');
var metaFecha = document.getElementById('metaFecha');
var metaFuente = document.getElementById('metaFuente');
var metaUrl = document.getElementById('metaUrl');
var metaTags = document.getElementById('metaTags');
var metaDetalles = document.getElementById('metaDetalles');
var metaDetallesResumen = document.getElementById('metaDetallesResumen');
var metaIdioma = document.getElementById('metaIdioma');
var metaTipoContenido = document.getElementById('metaTipoContenido');
var metaTiempoLectura = document.getElementById('metaTiempoLectura');
var etiquetaIdioma = document.getElementById('etiquetaIdioma');
var etiquetaTipoContenido = document.getElementById('etiquetaTipoContenido');
var etiquetaTiempoLectura = document.getElementById('etiquetaTiempoLectura');
var zonaNotasPersonales = document.getElementById('zonaNotasPersonales');
var notasPersonalesInput = document.getElementById('notasPersonalesInput');
var etiquetaNotas = document.getElementById('etiquetaNotas');

var zonaBloques = document.getElementById('zonaBloques');
var contadorBloques = document.getElementById('contadorBloques');
var listaBloques = document.getElementById('listaBloques');

var zonaPrevia = document.getElementById('zonaPrevia');
var textoPrevia = document.getElementById('textoPrevia');

var barraAcciones = document.getElementById('barraAcciones');
var botonGuardar = document.getElementById('botonGuardar');
var botonDescargar = document.getElementById('botonDescargar');
var botonCopiar = document.getElementById('botonCopiar');
var botonReescanear = document.getElementById('botonReescanear');

var bloquesExtraidos = [];
var metadataPagina = null;
var enlacesPagina = '';
var tituloPagina = '';
var configEditor = null;

async function inicializarI18n() {
  configEditor = await obtenerConfiguracion();
  document.documentElement.setAttribute('data-theme', configEditor.tema);
  await cargarIdioma(configEditor.idioma);

  document.title = t('tituloEditorBloques');
  document.querySelector('#encabezadoEditor h1').textContent = t('tituloEditorBloques');
  document.querySelector('#cabeceraBloques h2').textContent = t('etiquetaBloques');
  document.querySelector('#zonaPrevia h2').textContent = t('previaMarkdown');
  botonGuardar.textContent = t('botonGuardar');
  botonDescargar.textContent = t('botonDescargar');
  botonCopiar.textContent = t('botonCopiar');
  metaSeparador.textContent = '·';

  etiquetaIdioma.textContent = t('etiquetaIdioma');
  etiquetaTipoContenido.textContent = t('etiquetaTipoContenido');
  etiquetaTiempoLectura.textContent = t('etiquetaTiempoLectura');

  botonReescanear.querySelector('.tooltip-editor').textContent = t('botonReescanearTitulo');
  botonReescanear.setAttribute('aria-label', t('botonReescanearTitulo'));
}

inicializarI18n();

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

function obtenerEtiquetaTipo(tipo) {
  var etiquetas = {
    heading: 'H',
    text: 'P',
    list: '·',
    code: '<>',
    table: '⊞',
    links: '🔗',
    other: '?'
  };
  return etiquetas[tipo] || '?';
}

function actualizarContador() {
  var seleccionados = 0;
  var total = bloquesExtraidos.length;

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].incluido) {
      seleccionados++;
    }
  }

  contadorBloques.textContent = t('infoSeleccionados', [String(seleccionados), String(total)]);
}

function regenerarMarkdown() {
  var partes = [];
  var usarFrontmatter = configEditor ? configEditor.usarFrontmatter : false;
  var notas = notasPersonalesInput ? notasPersonalesInput.value.trim() : '';

  var fm = generarFrontmatter(metadataPagina, usarFrontmatter, notas);
  if (fm) partes.push(fm);

  if (metadataPagina && metadataPagina.titulo) {
    partes.push('# ' + metadataPagina.titulo);
    partes.push('');
  }

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].incluido) {
      partes.push(bloquesExtraidos[i].texto);
    }
  }

  if (metadataPagina && metadataPagina.url) {
    partes.push('');
    partes.push('---');
    partes.push('*' + t('seccionFuente') + ': ' + metadataPagina.url + '*');
  }

  return partes.join('\n');
}

function actualizarPrevia() {
  textoPrevia.textContent = regenerarMarkdown();
}

function renderizarBloques() {
  listaBloques.innerHTML = '';

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    (function (indice) {
      var bloque = bloquesExtraidos[indice];
      var item = document.createElement('div');
      item.className = 'bloque-item' + (bloque.incluido ? '' : ' bloque-excluido');

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'bloque-check';
      checkbox.checked = bloque.incluido;

      var contenido = document.createElement('div');
      contenido.className = 'bloque-contenido';

      var tipo = document.createElement('div');
      tipo.className = 'bloque-tipo';
      tipo.textContent = obtenerEtiquetaTipo(bloque.tipo);

      var previa = document.createElement('div');
      previa.className = 'bloque-previa';

      if (bloque.contenido && Array.isArray(bloque.contenido)) {
        previa.textContent = bloque.contenido.join(' · ');
      } else {
        previa.textContent = bloque.contenido || bloque.texto || '';
      }

      checkbox.addEventListener('change', function () {
        bloquesExtraidos[indice].incluido = checkbox.checked;
        if (checkbox.checked) {
          item.classList.remove('bloque-excluido');
        } else {
          item.classList.add('bloque-excluido');
        }
        actualizarContador();
        actualizarPrevia();
      });

      item.addEventListener('click', function (evento) {
        if (evento.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });

      contenido.appendChild(tipo);
      contenido.appendChild(previa);
      item.appendChild(checkbox);
      item.appendChild(contenido);
      listaBloques.appendChild(item);
    })(i);
  }

  actualizarContador();
  actualizarPrevia();
}

function mostrarMetadata() {
  if (!metadataPagina) return;

  var tieneAutor = !!metadataPagina.autor;
  var tieneFecha = !!(metadataPagina.fecha || metadataPagina.fecha_publicacion);
  var tieneFuente = !!(metadataPagina.sitio_nombre);
  var separadoresVisibles = 0;

  metaAutor.textContent = tieneAutor ? metadataPagina.autor : '';
  if (tieneAutor) separadoresVisibles++;

  metaFecha.textContent = tieneFecha ? (metadataPagina.fecha_publicacion || metadataPagina.fecha) : '';
  if (tieneFecha) separadoresVisibles++;

  metaFuente.textContent = tieneFuente ? metadataPagina.sitio_nombre : '';
  if (tieneFuente) separadoresVisibles++;

  metaSeparador.textContent = separadoresVisibles >= 2 ? '·' : '';
  metaSeparador2.textContent = separadoresVisibles >= 3 ? '·' : '';

  if (metadataPagina.url) {
    metaUrl.href = metadataPagina.url;
    metaUrl.textContent = metadataPagina.url;
  }

  var tags = metadataPagina.tags || metadataPagina.etiquetas;
  if (tags && tags.length > 0) {
    metaTags.textContent = tags.map(function (t) { return '#' + t; }).join(' ');
  } else {
    metaTags.textContent = '';
  }

  metaDetallesResumen.textContent = t('metaDetalles');

  metaIdioma.textContent = metadataPagina.idioma || t('textoSinMetadato');
  metaTipoContenido.textContent = metadataPagina.tipo_contenido || t('textoSinMetadato');
  metaTiempoLectura.textContent = metadataPagina.tiempo_lectura
    ? t('metaTiempoLecturaValor', [String(metadataPagina.tiempo_lectura)])
    : t('textoSinMetadato');

  if (tieneAutor || tieneFecha || metadataPagina.url) {
    metaDetalles.classList.remove('oculto');
  } else {
    metaDetalles.classList.add('oculto');
  }

  etiquetaNotas.textContent = t('etiquetaNotasPersonales');
  zonaNotasPersonales.classList.remove('oculto');

  panelMetadata.classList.remove('oculto');
}

function reiniciarUI() {
  panelMetadata.classList.add('oculto');
  zonaBloques.classList.add('oculto');
  zonaPrevia.classList.add('oculto');
  barraAcciones.classList.add('oculto');
  listaBloques.innerHTML = '';
  textoPrevia.textContent = '';
  bloquesExtraidos = [];
  metadataPagina = null;
  enlacesPagina = '';
  tituloPagina = '';
}

async function cargarContenido() {
  botonReescanear.disabled = true;
  barra.mostrar('indeterminado', t('barraProgresoExtrayendo'));

  reiniciarUI();

  try {
    var resultadoQuery = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoQuery[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      botonReescanear.disabled = false;
      mostrarToast(t('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido;
    try {
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch (errorIgnorado) {
      barra.establecerTexto(t('barraProgresoConectando'));
      await chrome.scripting.executeScript({
        target: { tabId: pestania.id },
        files: ['extractor-contenido.js']
      });
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    }

    barra.ocultar();

    if (!extraido || !extraido.bloques || extraido.bloques.length === 0) {
      botonReescanear.disabled = false;
      mostrarToast(t('errorSinContenido'), 'error');
      return;
    }

    metadataPagina = extraido.metadata || null;
    enlacesPagina = extraido.enlaces || '';
    tituloPagina = metadataPagina && metadataPagina.titulo ? metadataPagina.titulo : pestania.title || '';

    bloquesExtraidos = extraido.bloques.map(function (b) {
      return {
        tipo: b.tipo,
        texto: b.texto,
        contenido: b.contenido,
        nivel: b.nivel,
        ordenada: b.ordenada,
        incluido: true
      };
    });

    mostrarMetadata();
    renderizarBloques();
    zonaBloques.classList.remove('oculto');
    zonaPrevia.classList.remove('oculto');
    barraAcciones.classList.remove('oculto');
    botonReescanear.disabled = false;
  } catch (error) {
    barra.ocultar();
    botonReescanear.disabled = false;
    mostrarToast(t('errorGenerico', error.message), 'error');
  }
}

async function guardarEnCarpeta() {
  var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

  if (!verificacion.tieneCarpeta) {
    mostrarToast(t('errorSinCarpeta'), 'error');
    return;
  }

  barra.mostrar('indeterminado', t('barraProgresoPreparando'));
  botonGuardar.disabled = true;

  try {
    var nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
    var markdownFinal = regenerarMarkdown();

    barra.establecerTexto(t('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: markdownFinal,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || t('errorGuardado', ''), 'error');
    } else {
      mostrarToast(t('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(t('errorGuardado', error.message), 'error');
  } finally {
    botonGuardar.disabled = false;
  }
}

botonGuardar.addEventListener('click', guardarEnCarpeta);

botonCopiar.addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(regenerarMarkdown());
    mostrarToast(t('mensajeCopiado'), 'exito');
  } catch (errorIgnorado) {
    mostrarToast(t('errorCopiado'), 'error');
  }
});

botonDescargar.addEventListener('click', function () {
  var nombreArchivoFinal = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
  var markdownFinal = regenerarMarkdown();
  var blob = new Blob([markdownFinal], { type: 'text/markdown' });
  var url = URL.createObjectURL(blob);
  var enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivoFinal;
  enlace.click();
  URL.revokeObjectURL(url);
  mostrarToast(t('mensajeDescargadoComo', nombreArchivoFinal), 'exito');
});

botonReescanear.addEventListener('click', cargarContenido);

(async function iniciar() {
  await inicializarI18n();
  cargarContenido();
})();
