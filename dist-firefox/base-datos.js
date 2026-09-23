const NOMBRE_BASE_DE_DATOS = 'samjoko-nav';
const VERSION_BASE_DE_DATOS = 1;
const ALMACEN_DIRECTORIO = 'directorio';
const LONGITUD_MAXIMA_RUTA = 200;

function abrirBase() {
  return new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_BASE_DE_DATOS, VERSION_BASE_DE_DATOS);
    peticion.onupgradeneeded = (evento) => {
      const db = evento.target.result;
      if (!db.objectStoreNames.contains(ALMACEN_DIRECTORIO)) {
        db.createObjectStore(ALMACEN_DIRECTORIO);
      }
    };
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}

async function guardarDirectorio(manejador) {
  const baseDeDatos = await abrirBase();
  return new Promise((resolver, rechazar) => {
    const transaccion = baseDeDatos.transaction(ALMACEN_DIRECTORIO, 'readwrite');
    const almacen = transaccion.objectStore(ALMACEN_DIRECTORIO);
    almacen.put(manejador, 'carpetaDestino');
    transaccion.oncomplete = () => resolver();
    transaccion.onerror = () => rechazar(transaccion.error);
  });
}

async function obtenerDirectorio() {
  const baseDeDatos = await abrirBase();
  return new Promise((resolver, rechazar) => {
    const transaccion = baseDeDatos.transaction(ALMACEN_DIRECTORIO, 'readonly');
    const almacen = transaccion.objectStore(ALMACEN_DIRECTORIO);
    const peticion = almacen.get('carpetaDestino');
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}

async function verificarPermiso(manejador) {
  if (await manejador.queryPermission({ mode: 'readwrite' }) !== 'granted') {
    const resultado = await manejador.requestPermission({ mode: 'readwrite' });
    return resultado === 'granted';
  }
  return true;
}

function obtenerNombreDesdeTitulo(titulo) {
  if (!titulo || titulo.trim().length === 0) {
    return 'SAM - ' + chrome.i18n.getMessage('fallbackTituloArchivo');
  }
  var nombreLimpio = titulo
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60);
  if (!nombreLimpio || nombreLimpio === '' || nombreLimpio.startsWith('.')) {
    nombreLimpio = chrome.i18n.getMessage('fallbackTituloArchivo');
  }
  var nombreFinal = 'SAM - ' + nombreLimpio;
  if (nombreFinal.length + '.md'.length > LONGITUD_MAXIMA_RUTA) {
    nombreFinal = nombreFinal.substring(0, LONGITUD_MAXIMA_RUTA - '.md'.length);
  }
  return nombreFinal;
}

function escaparValorYaml(valor) {
  if (typeof valor === 'string') {
    return '"' + valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return String(valor);
}

function esUrlSegura(url) {
  if (!url) return false;
  return url.indexOf('http://') === 0 || url.indexOf('https://') === 0;
}

function generarMetadatosFrontales(metadata, usarMetadatosFrontales, notasPersonales, camposFrontmatter, tagsUsuario) {
  if (!usarMetadatosFrontales) return '';
  if (!camposFrontmatter) camposFrontmatter = {};

  function debeIncluir(campo) {
    return camposFrontmatter[campo] !== false;
  }

  var fechaCaptura = new Date().toISOString().split('T')[0];
  var lineas = ['---'];

  if (debeIncluir('url_origen')) {
    lineas.push('url_origen: ' + escaparValorYaml(metadata.urlOrigen || metadata.url || ''));
  }

  if (debeIncluir('fecha_captura')) {
    lineas.push('fecha_captura: ' + fechaCaptura);
  }

  if (debeIncluir('titulo')) {
    lineas.push('titulo: ' + escaparValorYaml(metadata.titulo || ''));
  }

  if (debeIncluir('tipo')) {
    lineas.push('tipo: fuente');
  }

  if (debeIncluir('autor') && metadata.autor) {
    lineas.push('autor: ' + escaparValorYaml(metadata.autor));
  }

  if (debeIncluir('fecha_publicacion') && (metadata.fechaPublicacion || metadata.fecha)) {
    lineas.push('fecha_publicacion: ' + escaparValorYaml(metadata.fechaPublicacion || metadata.fecha));
  }

  if (debeIncluir('tags')) {
    var tags = tagsUsuario || metadata.tags || metadata.etiquetas;
    if (tags && tags.length > 0) {
      var tagsStr = tags.map(function (t) { return escaparValorYaml(t); }).join(', ');
      lineas.push('tags: [' + tagsStr + ']');
    }
  }

  if (debeIncluir('descripcion') && metadata.descripcion) {
    lineas.push('descripcion: ' + escaparValorYaml(metadata.descripcion));
  }

  if (debeIncluir('idioma') && metadata.idioma) {
    lineas.push('idioma: ' + escaparValorYaml(metadata.idioma));
  }

  if (debeIncluir('sitio_nombre') && metadata.sitioNombre) {
    lineas.push('sitio_nombre: ' + escaparValorYaml(metadata.sitioNombre));
  }

  if (debeIncluir('tipo_contenido') && metadata.tipoContenido) {
    lineas.push('tipo_contenido: ' + escaparValorYaml(metadata.tipoContenido));
  }

  if (debeIncluir('imagen_destacada') && metadata.imagenDestacada && esUrlSegura(metadata.imagenDestacada)) {
    lineas.push('imagen_destacada: ' + escaparValorYaml(metadata.imagenDestacada));
  }

  if (debeIncluir('tiempo_lectura') && metadata.tiempoLectura) {
    lineas.push('tiempo_lectura: ' + metadata.tiempoLectura);
  }

  if (debeIncluir('notas_personales') && notasPersonales) {
    lineas.push('notas_personales: ' + escaparValorYaml(notasPersonales));
  }

  if (debeIncluir('estado')) {
    lineas.push('estado: ACTIVO');
  }

  lineas.push('---');
  lineas.push('');
  return lineas.join('\n');
}

async function ajustarTexto(texto, ancho) {
  if (!ancho || ancho === 'ninguno') return texto;
  var maxCol = parseInt(ancho, 10);
  if (!maxCol || maxCol < 40) return texto;

  return texto.split('\n\n').map(function(parrafo) {
    if (parrafo.startsWith('```') || parrafo.startsWith('|') || parrafo.startsWith('> ')) {
      return parrafo;
    }
    var palabras = parrafo.split(/\s+/);
    var lineas = [];
    var lineaActual = '';
    for (var i = 0; i < palabras.length; i++) {
      var conPalabra = lineaActual ? lineaActual + ' ' + palabras[i] : palabras[i];
      if (conPalabra.length > maxCol && lineaActual) {
        lineas.push(lineaActual);
        lineaActual = palabras[i];
      } else {
        lineaActual = conPalabra;
      }
    }
    if (lineaActual) lineas.push(lineaActual);
    return lineas.join('\n');
  }).join('\n\n');
}

async function obtenerNombreArchivoUnico(manejadorDirectorio, nombreBase) {
  let contador = 0;
  while (true) {
    const sufijo = contador === 0 ? '' : `-${contador}`;
    const punto = nombreBase.lastIndexOf('.');
    const base = punto !== -1 ? nombreBase.substring(0, punto) : nombreBase;
    const extension = punto !== -1 ? nombreBase.substring(punto) : '';
    const nombre = `${base}${sufijo}${extension}`;

    try {
      await manejadorDirectorio.getFileHandle(nombre);
      contador++;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return nombre;
      }
      throw error;
    }
  }
}
