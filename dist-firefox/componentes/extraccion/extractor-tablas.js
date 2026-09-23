(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'tablas',
    etiquetas: ['table'],
    esAplicable: function(elemento) {
      if (elemento.tagName !== 'TABLE') return false;
      return !elemento.closest('table');
    },
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;

      function recolectarFilas(elemento) {
        var filasHtml = [];
        var cabeceras = elemento.querySelectorAll('thead tr');
        for (var h = 0; h < cabeceras.length; h++) {
          filasHtml.push(cabeceras[h]);
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
            filasHtml.push(primera);
            filasCuerpo = filasCuerpo.slice(1);
          }
        }

        for (var r = 0; r < filasCuerpo.length; r++) {
          filasHtml.push(filasCuerpo[r]);
        }

        return filasHtml;
      }

      var filasHtml = recolectarFilas(elemento);
      if (filasHtml.length === 0) return null;

      var filasProcesadas = [];
      var rowspanActivo = {};

      for (var i = 0; i < filasHtml.length; i++) {
        var fila = filasHtml[i];
        var celdas = Array.from(fila.querySelectorAll('th, td'));
        var filaActual = [];
        var columna = 0;

        while (rowspanActivo[columna]) {
          filaActual.push('');
          delete rowspanActivo[columna];
          columna++;
        }

        for (var c = 0; c < celdas.length; c++) {
          while (rowspanActivo[columna]) {
            rowspanActivo[columna]--;
            if (rowspanActivo[columna] <= 0) delete rowspanActivo[columna];
            filaActual.push('');
            columna++;
          }

          var celda = celdas[c];
          var colspan = parseInt(celda.getAttribute('colspan')) || 1;
          var rowspan = parseInt(celda.getAttribute('rowspan')) || 1;
          var texto = ns.colapsarEspacios(celda.textContent).replace(/\|/g, '\\|');

          for (var rep = 0; rep < colspan; rep++) {
            filaActual.push(texto);
            if (rowspan > 1) {
              rowspanActivo[columna + rep] = (rowspanActivo[columna + rep] || 0) + (rowspan - 1);
            }
          }

          columna += colspan;
        }

        filasProcesadas.push(filaActual);
      }

      var maxColumnas = 0;
      for (var i = 0; i < filasProcesadas.length; i++) {
        if (filasProcesadas[i].length > maxColumnas) maxColumnas = filasProcesadas[i].length;
      }

      for (var i = 0; i < filasProcesadas.length; i++) {
        while (filasProcesadas[i].length < maxColumnas) {
          filasProcesadas[i].push('');
        }
      }

      var md = '';
      for (var i = 0; i < filasProcesadas.length; i++) {
        md += '| ' + filasProcesadas[i].join(' | ') + ' |\n';
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
