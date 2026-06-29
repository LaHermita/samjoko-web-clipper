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

var zonaVacia = document.getElementById('zonaVacia');
var textoVacio = document.getElementById('textoVacio');
var zonaBloques = document.getElementById('zonaBloques');
var contadorBloques = document.getElementById('contadorBloques');
var listaBloques = document.getElementById('listaBloques');
var filtrosBloques = document.getElementById('filtrosBloques');
var botonSeleccionarTodos = document.getElementById('botonSeleccionarTodos');
var estanTodosSeleccionados = true;
var filtroActivo = null;

var zonaPrevia = document.getElementById('zonaPrevia');
var textoPrevia = document.getElementById('textoPrevia');
var estadisticasPrevia = document.getElementById('estadisticasPrevia');

var barraAcciones = document.getElementById('barraAcciones');
var botonGuardar = document.getElementById('botonGuardar');
var botonDescargar = document.getElementById('botonDescargar');
var botonCopiar = document.getElementById('botonCopiar');
var botonReescanear = document.getElementById('botonReescanear');

var bloquesExtraidos = [];
var metadataPagina = null;
var enlacesPagina = '';
var tituloPagina = '';
var configuracionEditor = null;

async function inicializarInternacionalizacion() {
  configuracionEditor = await obtenerConfiguracion();
  document.documentElement.setAttribute('data-theme', configuracionEditor.tema);
  await cargarIdioma(configuracionEditor.idioma);

  document.title = traducir('tituloEditorBloques');
  document.querySelector('#encabezadoEditor h1').textContent = traducir('tituloEditorBloques');
  document.querySelector('#cabeceraBloques h2').textContent = traducir('etiquetaBloques');
  document.querySelector('#zonaPrevia h2').textContent = traducir('previaMarkdown');
  botonGuardar.textContent = traducir('botonGuardar');
  botonDescargar.textContent = traducir('botonDescargar');
  botonCopiar.textContent = traducir('botonCopiar');
  metaSeparador.textContent = '·';

  etiquetaIdioma.textContent = traducir('etiquetaIdioma');
  etiquetaTipoContenido.textContent = traducir('etiquetaTipoContenido');
  etiquetaTiempoLectura.textContent = traducir('etiquetaTiempoLectura');

  botonReescanear.querySelector('.tooltip-editor').textContent = traducir('botonReescanearTitulo');
  botonReescanear.setAttribute('aria-label', traducir('botonReescanearTitulo'));

  botonSeleccionarTodos.textContent = traducir('botonDeseleccionarTodos');

  textoVacio.textContent = traducir('textoVacio');
}

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
    links: '[enlace]',
    other: '?'
  };
  return etiquetas[tipo] || '?';
}

function actualizarContador() {
  var seleccionados = 0;
  var total = bloquesExtraidos.length;

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].estaIncluido) {
      seleccionados++;
    }
  }

  contadorBloques.textContent = traducir('infoSeleccionados', [String(seleccionados), String(total)]);
}

function alternarSeleccionTodos() {
  estanTodosSeleccionados = !estanTodosSeleccionados;
  for (var i = 0; i < bloquesExtraidos.length; i++) {
    bloquesExtraidos[i].estaIncluido = estanTodosSeleccionados;
  }
  actualizarEstadoBotonSeleccion();
  renderizarBloques();
}

function actualizarEstadoBotonSeleccion() {
  estanTodosSeleccionados = true;
  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (!bloquesExtraidos[i].estaIncluido) {
      estanTodosSeleccionados = false;
      break;
    }
  }
  botonSeleccionarTodos.textContent = estanTodosSeleccionados
    ? traducir('botonDeseleccionarTodos')
    : traducir('botonSeleccionarTodos');
}

function actualizarEstadisticas() {
  var markdown = regenerarMarkdown();
  var palabras = markdown.split(/\s+/).filter(Boolean).length;
  var parrafos = markdown.split('\n\n').filter(function (b) { return b.trim(); }).length;
  var caracteres = markdown.length;
  var bloquesSel = 0;
  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].estaIncluido) bloquesSel++;
  }
  estadisticasPrevia.textContent = traducir('infoEstadisticas', [
    String(bloquesSel), String(palabras), String(parrafos), String(caracteres)
  ]);
  estadisticasPrevia.classList.remove('oculto');
}

function regenerarMarkdown() {
  var partes = [];
  var usarMetadatosFrontales = configuracionEditor ? configuracionEditor.usarMetadatosFrontales : false;
  var notas = notasPersonalesInput ? notasPersonalesInput.value.trim() : '';

  var metadatosFrontales = generarMetadatosFrontales(metadataPagina, usarMetadatosFrontales, notas);
  if (metadatosFrontales) partes.push(metadatosFrontales);

  if (metadataPagina && metadataPagina.titulo) {
    partes.push('# ' + metadataPagina.titulo);
    partes.push('');
  }

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].estaIncluido) {
      partes.push(bloquesExtraidos[i].texto);
    }
  }

  if (metadataPagina && metadataPagina.url) {
    partes.push('');
    partes.push('---');
    partes.push('*' + traducir('seccionFuente') + ': ' + metadataPagina.url + '*');
  }

  return partes.join('\n');
}

function actualizarPrevia() {
  textoPrevia.textContent = regenerarMarkdown();
  actualizarEstadisticas();
}

function crearFiltros() {
  var tipos = {};
  for (var i = 0; i < bloquesExtraidos.length; i++) {
    tipos[bloquesExtraidos[i].tipo] = true;
  }
  var tiposLista = Object.keys(tipos);
  if (tiposLista.length <= 1) {
    filtrosBloques.classList.add('oculto');
    filtrosBloques.innerHTML = '';
    return;
  }

  filtrosBloques.innerHTML = '';
  filtrosBloques.classList.remove('oculto');

  var botonTodo = document.createElement('button');
  botonTodo.className = 'filtro-bloque' + (filtroActivo === null ? ' activo' : '');
  botonTodo.textContent = traducir('filtroTodos');
  botonTodo.addEventListener('click', function () {
    filtroActivo = null;
    renderizarBloques();
  });
  filtrosBloques.appendChild(botonTodo);

  for (var indiceTipo = 0; indiceTipo < tiposLista.length; indiceTipo++) {
    (function (tipo) {
      var boton = document.createElement('button');
      boton.className = 'filtro-bloque' + (filtroActivo === tipo ? ' activo' : '');
      boton.textContent = obtenerEtiquetaTipo(tipo) + ' ' + tipo;
      boton.addEventListener('click', function () {
        filtroActivo = filtroActivo === tipo ? null : tipo;
        renderizarBloques();
      });
      filtrosBloques.appendChild(boton);
    })(tiposLista[indiceTipo]);
  }
}

function renderizarBloques() {
  listaBloques.innerHTML = '';

  crearFiltros();

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (filtroActivo && bloquesExtraidos[i].tipo !== filtroActivo) continue;
    (function (indice) {
      var bloque = bloquesExtraidos[indice];
      var item = document.createElement('div');
      item.className = 'bloque-item' + (bloque.estaIncluido ? '' : ' bloque-excluido');

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'bloque-check';
      checkbox.checked = bloque.estaIncluido;

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
        bloquesExtraidos[indice].estaIncluido = checkbox.checked;
        if (checkbox.checked) {
          item.classList.remove('bloque-excluido');
        } else {
          item.classList.add('bloque-excluido');
        }
        actualizarContador();
        actualizarEstadoBotonSeleccion();
        actualizarPrevia();
      });

      item.addEventListener('click', function (evento) {
        if (evento.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });

      item.draggable = true;
      item.addEventListener('dragstart', function (e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(indice));
        item.classList.add('bloque-arrastrando');
      });
      item.addEventListener('dragend', function () {
        item.classList.remove('bloque-arrastrando');
        Array.from(listaBloques.children).forEach(function (el) {
          el.classList.remove('bloque-destino');
        });
      });
      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        Array.from(listaBloques.children).forEach(function (el) {
          el.classList.remove('bloque-destino');
        });
        item.classList.add('bloque-destino');
      });
      item.addEventListener('dragleave', function () {
        item.classList.remove('bloque-destino');
      });
      item.addEventListener('drop', function (e) {
        e.preventDefault();
        item.classList.remove('bloque-destino');
        var origenIndice = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(origenIndice) || origenIndice === indice) return;

        var elemento = bloquesExtraidos.splice(origenIndice, 1)[0];
        var destinoIndice = origenIndice < indice ? indice - 1 : indice;
        bloquesExtraidos.splice(destinoIndice, 0, elemento);

        renderizarBloques();
      });

      contenido.appendChild(tipo);
      contenido.appendChild(previa);
      item.appendChild(checkbox);
      item.appendChild(contenido);
      listaBloques.appendChild(item);
    })(i);
  }

  actualizarContador();
  actualizarEstadoBotonSeleccion();
  actualizarPrevia();
}

function mostrarMetadata() {
  if (!metadataPagina) return;

  var tieneAutor = !!metadataPagina.autor;
  var tieneFecha = !!(metadataPagina.fecha || metadataPagina.fechaPublicacion);
  var tieneFuente = !!(metadataPagina.sitioNombre);
  var separadoresVisibles = 0;

  metaAutor.textContent = tieneAutor ? metadataPagina.autor : '';
  if (tieneAutor) separadoresVisibles++;

  metaFecha.textContent = tieneFecha ? (metadataPagina.fechaPublicacion || metadataPagina.fecha) : '';
  if (tieneFecha) separadoresVisibles++;

  metaFuente.textContent = tieneFuente ? metadataPagina.sitioNombre : '';
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

  metaDetallesResumen.textContent = traducir('metaDetalles');

  metaIdioma.textContent = metadataPagina.idioma || traducir('textoSinMetadato');
  metaTipoContenido.textContent = metadataPagina.tipoContenido || traducir('textoSinMetadato');
  metaTiempoLectura.textContent = metadataPagina.tiempoLectura
    ? traducir('metaTiempoLecturaValor', [String(metadataPagina.tiempoLectura)])
    : traducir('textoSinMetadato');

  if (tieneAutor || tieneFecha || metadataPagina.url) {
    metaDetalles.classList.remove('oculto');
  } else {
    metaDetalles.classList.add('oculto');
  }

  etiquetaNotas.textContent = traducir('etiquetaNotasPersonales');
  zonaNotasPersonales.classList.remove('oculto');

  panelMetadata.classList.remove('oculto');
}

function reiniciarUI() {
  panelMetadata.classList.add('oculto');
  zonaVacia.classList.add('oculto');
  zonaBloques.classList.add('oculto');
  zonaPrevia.classList.add('oculto');
  barraAcciones.classList.add('oculto');
  listaBloques.innerHTML = '';
  filtrosBloques.innerHTML = '';
  filtrosBloques.classList.add('oculto');
  textoPrevia.textContent = '';
  estadisticasPrevia.textContent = '';
  estadisticasPrevia.classList.add('oculto');
  bloquesExtraidos = [];
  metadataPagina = null;
  enlacesPagina = '';
  tituloPagina = '';
  estanTodosSeleccionados = true;
  filtroActivo = null;
}

async function cargarContenido() {
  botonReescanear.disabled = true;
  barra.mostrar('indeterminado', traducir('barraProgresoExtrayendo'));

  reiniciarUI();

  try {
    var resultadoConsulta = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoConsulta[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      botonReescanear.disabled = false;
      mostrarToast(traducir('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido;
    try {
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch (errorIgnorado) {
      barra.establecerTexto(traducir('barraProgresoConectando'));
      await chrome.scripting.executeScript({
        target: { tabId: pestania.id },
        files: ['extractor-contenido.js']
      });
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    }

    barra.ocultar();

    if (!extraido || !extraido.bloques || extraido.bloques.length === 0) {
      botonReescanear.disabled = false;
      zonaVacia.classList.remove('oculto');
      return;
    }
    zonaVacia.classList.add('oculto');

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
        estaIncluido: true
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
    mostrarToast(traducir('errorGenerico', error.message), 'error');
  }
}

async function guardarEnCarpeta() {
  var verificacion = await chrome.runtime.sendMessage({ accion: 'verificarDirectorio' });

  if (!verificacion.tieneCarpeta) {
    mostrarToast(traducir('errorSinCarpeta'), 'error');
    return;
  }

  barra.mostrar('indeterminado', traducir('barraProgresoPreparando'));
  botonGuardar.disabled = true;

  try {
    var nombreBase = obtenerNombreDesdeTitulo(tituloPagina) + '.md';
    var markdownFinal = regenerarMarkdown();

    barra.establecerTexto(traducir('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: markdownFinal,
      nombreArchivo: nombreBase
    });

    barra.ocultar();

    if (resultado.error) {
      mostrarToast(resultado.mensaje || traducir('errorGuardado', ''), 'error');
    } else {
      mostrarToast(traducir('mensajeGuardadoComo', resultado.nombreArchivo), 'exito');
    }
  } catch (error) {
    barra.ocultar();
    mostrarToast(traducir('errorGuardado', error.message), 'error');
  } finally {
    botonGuardar.disabled = false;
  }
}

botonGuardar.addEventListener('click', guardarEnCarpeta);

botonCopiar.addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(regenerarMarkdown());
    mostrarToast(traducir('mensajeCopiado'), 'exito');
  } catch (errorIgnorado) {
    mostrarToast(traducir('errorCopiado'), 'error');
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
  mostrarToast(traducir('mensajeDescargadoComo', nombreArchivoFinal), 'exito');
});

botonSeleccionarTodos.addEventListener('click', alternarSeleccionTodos);
botonReescanear.addEventListener('click', cargarContenido);

(async function iniciar() {
  await inicializarInternacionalizacion();
  cargarContenido();
})();
