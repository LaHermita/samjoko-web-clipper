class BarraProgreso {

  constructor(contenedor) {
    this.elemento = this._crearElemento();
    this.pista = this.elemento.querySelector('.barra-progreso-pista');
    this.relleno = this.elemento.querySelector('.barra-progreso-relleno');
    this.texto = this.elemento.querySelector('.barra-progreso-texto');
    contenedor.appendChild(this.elemento);
  }

  _crearElemento() {
    const raiz = document.createElement('div');
    raiz.className = 'barra-progreso oculto';
    raiz.setAttribute('role', 'progressbar');
    raiz.setAttribute('aria-live', 'polite');
    raiz.innerHTML = `
      <div class="barra-progreso-pista">
        <div class="barra-progreso-relleno"></div>
      </div>
      <span class="barra-progreso-texto"></span>
    `;
    return raiz;
  }

  mostrar(modo = 'indeterminado', texto = '') {
    this.elemento.classList.remove('oculto');
    this.elemento.classList.toggle('barra-progreso--determinado', modo === 'determinado');

    if (modo === 'indeterminado') {
      this.relleno.style.width = '';
    }

    if (texto) {
      this.texto.textContent = texto;
      this.texto.classList.remove('oculto');
    } else {
      this.texto.classList.add('oculto');
    }
  }

  ocultar() {
    this.elemento.classList.add('oculto');
    this.relleno.style.width = '';
  }

  establecerProgreso(porcentaje, texto = '') {
    this.mostrar('determinado', texto);
    this.relleno.style.width = `${Math.min(100, Math.max(0, porcentaje))}%`;
  }

  establecerTexto(texto) {
    this.texto.textContent = texto;
    this.texto.classList.remove('oculto');
  }

}
