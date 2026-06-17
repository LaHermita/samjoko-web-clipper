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
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60) || 'pagina-sin-titulo';
  return `SAM - ${nombreLimpio}`;
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
