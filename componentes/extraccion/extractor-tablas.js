(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'tablas',
    etiquetas: ['table'],
    esAplicable: function(elemento) {
      return elemento.tagName === 'TABLE';
    },
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var filas = [];

      var procesarFila = function(fila) {
        var celdas = Array.from(fila.querySelectorAll('th, td'));
        return celdas.map(function(celda) {
          var colspan = parseInt(celda.getAttribute('colspan')) || 1;
          var texto = ns.colapsarEspacios(celda.textContent).replace(/\|/g, '\\|');
          var celdasRepetidas = [];
          for (var c = 0; c < colspan; c++) {
            celdasRepetidas.push(texto);
          }
          return celdasRepetidas;
        }).flat();
      };

      var cabeceras = elemento.querySelectorAll('thead tr');
      if (cabeceras.length > 0) {
        for (var h = 0; h < cabeceras.length; h++) {
          filas.push(procesarFila(cabeceras[h]));
        }
      }

      var cuerpo = elemento.querySelector('tbody');
      var filasCuerpo = cuerpo
        ? Array.from(cuerpo.querySelectorAll('tr'))
        : Array.from(elemento.querySelectorAll('tr'));

      if (cabeceras.length === 0 && filasCuerpo.length > 0) {
        var primera = filasCuerpo[0];
        var celdasPrimera = Array.from(primera.querySelectorAll('th, td'));
        var todasTh = celdasPrimera.every(function(c) { return c.tagName === 'TH'; });
        if (todasTh) {
          filas.push(procesarFila(primera));
          filasCuerpo = filasCuerpo.slice(1);
        }
      }

      for (var r = 0; r < filasCuerpo.length; r++) {
        filas.push(procesarFila(filasCuerpo[r]));
      }

      if (filas.length === 0) return null;

      var maxColumnas = 0;
      for (var i = 0; i < filas.length; i++) {
        if (filas[i].length > maxColumnas) maxColumnas = filas[i].length;
      }

      for (var i = 0; i < filas.length; i++) {
        while (filas[i].length < maxColumnas) {
          filas[i].push('');
        }
      }

      var md = '';
      for (var i = 0; i < filas.length; i++) {
        md += '| ' + filas[i].join(' | ') + ' |\n';
        if (i === 0) {
          var separador = [];
          for (var s = 0; s < maxColumnas; s++) {
            separador.push('---');
          }
          md += '| ' + separador.join(' | ') + ' |\n';
        }
      }

      return { md: md.trim(), tipo: 'table' };
    }
  });
})();
