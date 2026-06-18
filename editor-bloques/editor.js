var zonaProgreso = document.getElementById('zonaProgreso');
var barra = new BarraProgreso(zonaProgreso);
var zonaToast = document.getElementById('zonaToast');

var panelMetadata = document.getElementById('panelMetadata');
var metaAutor = document.getElementById('metaAutor');
var metaSeparador = document.getElementById('metaSeparador');
var metaFecha = document.getElementById('metaFecha');
var metaUrl = document.getElementById('metaUrl');

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

(function inicializarI18n() {
  document.title = chrome.i18n.getMessage('tituloEditorBloques');
  document.querySelector('#encabezadoEditor h1').textContent = chrome.i18n.getMessage('tituloEditorBloques');
  document.querySelector('#cabeceraBloques h2').textContent = chrome.i18n.getMessage('etiquetaBloques');
  document.querySelector('#zonaPrevia h2').textContent = chrome.i18n.getMessage('previaMarkdown');
  botonGuardar.textContent = chrome.i18n.getMessage('botonGuardar');
  botonDescargar.textContent = chrome.i18n.getMessage('botonDescargar');
  botonCopiar.textContent = chrome.i18n.getMessage('botonCopiar');
  metaSeparador.textContent = '·';
  botonReescanear.querySelector('.tooltip-editor').textContent = chrome.i18n.getMessage('botonReescanearTitulo');
  botonReescanear.setAttribute('aria-label', chrome.i18n.getMessage('botonReescanearTitulo'));
})();

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

  contadorBloques.textContent = chrome.i18n.getMessage('infoSeleccionados', [String(seleccionados), String(total)]);
}

function regenerarMarkdown() {
  var partes = [];

  if (metadataPagina && metadataPagina.titulo) {
    partes.push('# ' + metadataPagina.titulo);
    partes.push('');
  }

  for (var i = 0; i < bloquesExtraidos.length; i++) {
    if (bloquesExtraidos[i].incluido) {
      partes.push(bloquesExtraidos[i].texto);
    }
  }

  if (enlacesPagina) {
    partes.push('');
    partes.push('## ' + chrome.i18n.getMessage('seccionEnlaces'));
    partes.push('');
    partes.push(enlacesPagina);
  }

  if (metadataPagina && metadataPagina.url) {
    partes.push('');
    partes.push('---');
    partes.push('*' + chrome.i18n.getMessage('seccionFuente') + ': ' + metadataPagina.url + '*');
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

  var partes = [];

  if (metadataPagina.autor) {
    metaAutor.textContent = metadataPagina.autor;
  } else {
    metaAutor.textContent = chrome.i18n.getMessage('textoSinMetadato');
  }

  if (metadataPagina.fecha) {
    metaFecha.textContent = metadataPagina.fecha;
  } else {
    metaFecha.textContent = '';
    metaSeparador.textContent = '';
  }

  if (metadataPagina.fecha) {
    metaSeparador.textContent = '·';
  } else {
    metaSeparador.textContent = '';
  }

  if (metadataPagina.url) {
    metaUrl.href = metadataPagina.url;
    metaUrl.textContent = metadataPagina.url;
  }

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
  barra.mostrar('indeterminado', chrome.i18n.getMessage('barraProgresoExtrayendo'));

  reiniciarUI();

  try {
    var resultadoQuery = await chrome.tabs.query({ active: true, currentWindow: true });
    var pestania = resultadoQuery[0];

    if (!pestania || !pestania.id) {
      barra.ocultar();
      botonReescanear.disabled = false;
      mostrarToast(chrome.i18n.getMessage('errorPestaniaActiva'), 'error');
      return;
    }

    var extraido;
    try {
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch (errorIgnorado) {
      barra.establecerTexto(chrome.i18n.getMessage('barraProgresoConectando'));
      await chrome.scripting.executeScript({
        target: { tabId: pestania.id },
        files: ['extractor-contenido.js']
      });
      extraido = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    }

    barra.ocultar();

    if (!extraido || !extraido.bloques || extraido.bloques.length === 0) {
      botonReescanear.disabled = false;
      mostrarToast(chrome.i18n.getMessage('errorSinContenido'), 'error');
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
    mostrarToast(chrome.i18n.getMessage('errorGenerico', error.message), 'error');
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
    var markdownFinal = regenerarMarkdown();

    barra.establecerTexto(chrome.i18n.getMessage('barraProgresoGuardando'));
    var resultado = await chrome.runtime.sendMessage({
      accion: 'guardarArchivo',
      contenido: markdownFinal,
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

botonGuardar.addEventListener('click', guardarEnCarpeta);

botonCopiar.addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(regenerarMarkdown());
    mostrarToast(chrome.i18n.getMessage('mensajeCopiado'), 'exito');
  } catch (errorIgnorado) {
    mostrarToast(chrome.i18n.getMessage('errorCopiado'), 'error');
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
  mostrarToast(chrome.i18n.getMessage('mensajeDescargadoComo', nombreArchivoFinal), 'exito');
});

botonReescanear.addEventListener('click', cargarContenido);

cargarContenido();
