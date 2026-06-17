const botonSeleccionar = document.getElementById('botonSeleccionar');
const infoCarpeta = document.getElementById('infoCarpeta');
const nombreCarpeta = document.getElementById('nombreCarpeta');
const botonLimpiar = document.getElementById('botonLimpiar');
const mensajeEstado = document.getElementById('mensajeEstado');

function mostrarMensaje(texto, esError = false) {
  mensajeEstado.textContent = texto;
  mensajeEstado.style.color = esError ? '#e94560' : '#4ade80';
}

async function actualizarInfoCarpeta() {
  const manejador = await obtenerDirectorio();
  if (manejador) {
    nombreCarpeta.textContent = manejador.name;
    infoCarpeta.classList.remove('oculto');
  } else {
    infoCarpeta.classList.add('oculto');
  }
}

botonSeleccionar.addEventListener('click', async () => {
  try {
    const manejador = await window.showDirectoryPicker({ mode: 'readwrite' });
    await guardarDirectorio(manejador);
    await actualizarInfoCarpeta();
    mostrarMensaje('Carpeta seleccionada: ' + manejador.name);
  } catch (error) {
    if (error.name !== 'AbortError' && error.name !== 'SecurityError') {
      mostrarMensaje('Error al seleccionar carpeta: ' + error.message, true);
    }
  }
});

botonLimpiar.addEventListener('click', async () => {
  await guardarDirectorio(null);
  await actualizarInfoCarpeta();
  mostrarMensaje('Carpeta eliminada');
});

actualizarInfoCarpeta();
