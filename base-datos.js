const NOMBRE_DB = 'samjoko-nav';
const VERSION_DB = 1;
const ALMACEN_DIRECTORIO = 'directorio';

function abrirBase() {
  return new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_DB, VERSION_DB);
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
  const db = await abrirBase();
  return new Promise((resolver, rechazar) => {
    const transaccion = db.transaction(ALMACEN_DIRECTORIO, 'readwrite');
    const almacen = transaccion.objectStore(ALMACEN_DIRECTORIO);
    almacen.put(manejador, 'carpetaDestino');
    transaccion.oncomplete = () => resolver();
    transaccion.onerror = () => rechazar(transaccion.error);
  });
}

async function obtenerDirectorio() {
  const db = await abrirBase();
  return new Promise((resolver, rechazar) => {
    const transaccion = db.transaction(ALMACEN_DIRECTORIO, 'readonly');
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
  const nombreLimpio = titulo
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60) || chrome.i18n.getMessage('fallbackTituloArchivo');
  return `SAM - ${nombreLimpio}`;
}

function escaparValorYaml(valor) {
  if (typeof valor === 'string') {
    return '"' + valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return String(valor);
}

function generarFrontmatter(metadata, usarFrontmatter, notasPersonales) {
  if (!usarFrontmatter) return '';

  var fechaCaptura = new Date().toISOString().split('T')[0];
  var lineas = ['---'];

  lineas.push('url_origen: ' + (metadata.url_origen || metadata.url || ''));
  lineas.push('fecha_captura: ' + fechaCaptura);

  var titulo = (metadata.titulo || '').replace(/"/g, '\\"');
  lineas.push('titulo: "' + titulo + '"');

  lineas.push('tipo: fuente');

  if (metadata.autor) {
    lineas.push('autor: ' + escaparValorYaml(metadata.autor));
  }

  if (metadata.fecha_publicacion || metadata.fecha) {
    lineas.push('fecha_publicacion: ' + (metadata.fecha_publicacion || metadata.fecha));
  }

  var tags = metadata.tags || metadata.etiquetas;
  if (tags && tags.length > 0) {
    var tagsStr = tags.map(function (t) { return escaparValorYaml(t); }).join(', ');
    lineas.push('tags: [' + tagsStr + ']');
  }

  if (metadata.descripcion) {
    lineas.push('descripcion: ' + escaparValorYaml(metadata.descripcion));
  }

  if (metadata.idioma) {
    lineas.push('idioma: ' + metadata.idioma);
  }

  if (metadata.sitio_nombre) {
    lineas.push('sitio_nombre: ' + escaparValorYaml(metadata.sitio_nombre));
  }

  if (metadata.tipo_contenido) {
    lineas.push('tipo_contenido: ' + metadata.tipo_contenido);
  }

  if (metadata.imagen_destacada) {
    lineas.push('imagen_destacada: ' + escaparValorYaml(metadata.imagen_destacada));
  }

  if (metadata.tiempo_lectura) {
    lineas.push('tiempo_lectura: ' + metadata.tiempo_lectura);
  }

  if (notasPersonales) {
    lineas.push('notas_personales: ' + escaparValorYaml(notasPersonales));
  }

  lineas.push('estado: ACTIVO');
  lineas.push('---');
  lineas.push('');
  return lineas.join('\n');
}

async function obtenerNombreArchivoUnico(manejadorDirectorio, nombreBase) {
  let contador = 0;
  while (true) {
    const sufijo = contador === 0 ? '' : `-${contador}`;
    const punto = nombreBase.lastIndexOf('.');
    const base = punto !== -1 ? nombreBase.substring(0, punto) : nombreBase;
    const ext = punto !== -1 ? nombreBase.substring(punto) : '';
    const nombre = `${base}${sufijo}${ext}`;

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
