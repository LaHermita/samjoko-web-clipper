const botonCapturar = document.getElementById('botonCapturar');
const areaResultado = document.getElementById('areaResultado');
const textoMarkdown = document.getElementById('textoMarkdown');
const botonCopiar = document.getElementById('botonCopiar');
const botonDescargar = document.getElementById('botonDescargar');
const botonGuardar = document.getElementById('botonGuardar');
const mensajeEstado = document.getElementById('mensajeEstado');
const abrirOpciones = document.getElementById('abrirOpciones');

function mostrarMensaje(texto, esError = false) {
  mensajeEstado.textContent = texto;
  mensajeEstado.style.color = esError ? '#e94560' : '#a0a0a0';
}

async function capturarPagina() {
  botonCapturar.disabled = true;
  botonCapturar.textContent = 'Capturando...';
  mostrarMensaje('Extrayendo contenido...');

  try {
    const [pestania] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!pestania?.id) {
      mostrarMensaje('No se pudo acceder a la pestaña activa', true);
      return;
    }

    let resultado;
    try {
      resultado = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    } catch {
      mostrarMensaje('Conectando con la página...');
      await chrome.scripting.executeScript({
        target: { tabId: pestania.id },
        files: ['extractor-contenido.js']
      });
      resultado = await chrome.tabs.sendMessage(pestania.id, { accion: 'extraerMarkdown' });
    }

    if (resultado?.markdown) {
      textoMarkdown.value = resultado.markdown;
      areaResultado.classList.remove('oculto');
      mostrarMensaje('Contenido capturado correctamente');
    } else {
      mostrarMensaje('No se encontró contenido en la página', true);
    }
  } catch (error) {
    mostrarMensaje('Error: ' + error.message, true);
  } finally {
    botonCapturar.disabled = false;
    botonCapturar.textContent = 'Capturar página como Markdown';
  }
}

async function guardarEnCarpeta() {
  const manejador = await obtenerDirectorio();

  if (!manejador) {
    mostrarMensaje('Primero configurá una carpeta en Opciones', true);
    return;
  }

  const tienePermiso = await verificarPermiso(manejador);
  if (!tienePermiso) {
    mostrarMensaje('Permiso denegado para la carpeta', true);
    return;
  }

  try {
    const nombreBase = `${obtenerNombreDesdeTitulo(document.title)}.md`;
    const nombreArchivo = await obtenerNombreArchivoUnico(manejador, nombreBase);
    const archivoHandle = await manejador.getFileHandle(nombreArchivo, { create: true });
    const writable = await archivoHandle.createWritable();
    await writable.write(textoMarkdown.value);
    await writable.close();
    mostrarMensaje(`Guardado como ${nombreArchivo}`);
  } catch (error) {
    mostrarMensaje('Error al guardar: ' + error.message, true);
  }
}

botonCapturar.addEventListener('click', capturarPagina);

botonCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(textoMarkdown.value);
    mostrarMensaje('Copiado al portapapeles');
  } catch {
    mostrarMensaje('No se pudo copiar', true);
  }
});

botonDescargar.addEventListener('click', () => {
  const nombreArchivo = `${obtenerNombreDesdeTitulo(document.title)}.md`;
  const blob = new Blob([textoMarkdown.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
  mostrarMensaje(`Descargado como ${nombreArchivo}`);
});

botonGuardar.addEventListener('click', guardarEnCarpeta);

abrirOpciones.addEventListener('click', (evento) => {
  evento.preventDefault();
  chrome.runtime.openOptionsPage();
});
