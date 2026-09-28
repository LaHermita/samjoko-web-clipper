// Ejecutor del harness de fixtures HTML → Markdown (fases 5.9 y 5.10).
//
// Modos:
//   ejecutor-fixtures.html                → compara cada fixture con «esperado».
//   ejecutor-fixtures.html?modo=generar   → imprime el Markdown obtenido para
//                                           pegarlo en fixtures.js (revisarlo a mano).
//
// En ambos modos cada fixture se extrae DOS veces: se comprueba además que la
// segunda captura sea idéntica (regresión B2) y que no quede ningún
// data-bloque-procesado en el DOM del documento.
//
// Sin dependencias externas: se abre en Chrome (file://) y también funciona
// servido como página de la extensión (todo el JS va en ficheros externos,
// compatible con la CSP script-src 'self').

// Shim de i18n: estas páginas no corren como extensión, pero el extractor
// consulta chrome.i18n para los títulos de sección.
window.chrome = window.chrome || {};
window.chrome.i18n = {
  getMessage: function (clave) {
    var diccionario = {
      seccionEnlaces: 'Enlaces',
      seccionFuente: 'Fuente',
      textoSinTitulo: 'Sin titulo'
    };
    return diccionario[clave] || clave;
  }
};

(function () {
  var marco = null;

  function normalizar(texto) {
    return String(texto)
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(function (linea) { return linea.replace(/\s+$/, ''); })
      .join('\n')
      .trim();
  }

  function construirDocumento(fixture) {
    if (!marco) {
      marco = document.createElement('iframe');
      marco.style.display = 'none';
      document.body.appendChild(marco);
    }
    var doc = marco.contentDocument;
    doc.open();
    doc.write(
      '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<title>' + fixture.titulo + '</title></head><body>' +
      fixture.cuerpo + '</body></html>'
    );
    doc.close();
    return doc;
  }

  function extraerDosVeces(fixture) {
    var doc = construirDocumento(fixture);
    var primera = normalizar(SamjokoExtraccion.extraer(doc, { urlOrigen: fixture.urlOrigen }).markdown);
    var segunda = normalizar(SamjokoExtraccion.extraer(doc, { urlOrigen: fixture.urlOrigen }).markdown);
    var marcadores = doc.querySelectorAll('[data-bloque-procesado]').length;
    return { primera: primera, segunda: segunda, marcadores: marcadores };
  }

  function diff(esperado, obtenido) {
    var lineasEsperadas = esperado.split('\n');
    var lineasObtenidas = obtenido.split('\n');
    return {
      faltan: lineasEsperadas.filter(function (l) {
        return l.trim() !== '' && lineasObtenidas.indexOf(l) === -1;
      }),
      sobran: lineasObtenidas.filter(function (l) {
        return l.trim() !== '' && lineasEsperadas.indexOf(l) === -1;
      })
    };
  }

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function pintar(fila, resultado) {
    var cuerpo =
      '<tr>' +
        '<td>' + fila.nombre + '</td>' +
        '<td>' + (resultado.ok ? 'APROBADO' : 'FALLIDO') + '</td>' +
        '<td>' + (resultado.coincideConEsperado ? 'si' : 'no') + '</td>' +
        '<td>' + (resultado.segundaIgualQuePrimera ? 'si' : 'no') + '</td>' +
        '<td>' + resultado.marcadores + '</td>' +
      '</tr>';
    document.getElementById('tablaResultados').insertAdjacentHTML('beforeend', cuerpo);

    if (!resultado.ok) {
      var detalle = 'FIXTURE: ' + fila.nombre + '\n' +
        (resultado.coincideConEsperado ? '' : '--- DIFERENCIA vs ESPERADO ---\n' +
          'FALTAN:\n  ' + (resultado.diff.faltan.join('\n  ') || '(nada)') + '\n' +
          'SOBRAN:\n  ' + (resultado.diff.sobran.join('\n  ') || '(nada)') + '\n' +
          '--- ESPERADO ---\n' + (fila.esperado || '(null)') + '\n' +
          '--- OBTENIDO ---\n' + resultado.obtenido + '\n') +
        (resultado.segundaIgualQuePrimera ? '' : '\n--- SEGUNDA CAPTURA DIFIERE DE LA PRIMERA ---\n');
      document.getElementById('detalleFallos').insertAdjacentHTML(
        'beforeend',
        '<pre>' + escapar(detalle) + '</pre>'
      );
    }
  }

  function ejecutar() {
    var parametros = new URLSearchParams(window.location.search);
    var modo = parametros.get('modo') || 'comparar';
    var fixtures = window.FIXTURES || [];
    var salida = { modo: modo, total: fixtures.length, aprobadas: 0, fallidas: 0, resultados: [] };

    if (typeof SamjokoExtraccion === 'undefined') {
      salida.estado = 'error';
      salida.mensaje = 'SamjokoExtraccion no esta definido: faltan los scripts de componentes/extraccion/';
      document.getElementById('resultado').textContent = JSON.stringify(salida, null, 2);
      document.getElementById('resumen').textContent = salida.mensaje;
      return;
    }

    fixtures.forEach(function (fixture) {
      var extraccion = extraerDosVeces(fixture);
      var fila;

      if (modo === 'generar') {
        fila = { nombre: fixture.nombre, obtenido: extraccion.primera };
        salida.resultados.push(fila);
        return;
      }

      var coincide = fixture.esperado != null && normalizar(fixture.esperado) === extraccion.primera;
      var segundIgual = extraccion.primera === extraccion.segunda;
      var sinMarcadores = extraccion.marcadores === 0;
      fila = {
        nombre: fixture.nombre,
        ok: coincide && segundIgual && sinMarcadores,
        coincideConEsperado: coincide,
        segundaIgualQuePrimera: segundIgual,
        marcadores: extraccion.marcadores,
        obtenido: extraccion.primera,
        diff: coincide ? { faltan: [], sobran: [] } : diff(normalizar(fixture.esperado || ''), extraccion.primera)
      };
      if (fila.ok) salida.aprobadas++; else salida.fallidas++;
      salida.resultados.push(fila);
      pintar(fixture, fila);
    });

    if (modo !== 'generar') {
      salida.estado = salida.fallidas === 0 && salida.total > 0 ? 'aprobado' : 'fallido';
      document.getElementById('resumen').textContent =
        'Estado: ' + salida.estado.toUpperCase() +
        ' — ' + salida.aprobadas + '/' + salida.total + ' fixtures correctos.';
      document.title = 'Samjoko harness: ' + salida.estado;
    } else {
      document.getElementById('resumen').textContent =
        'Modo generar: ' + salida.resultados.length + ' Markdown listos para pegar en fixtures.js.';
      document.title = 'Samjoko harness: generar';
    }

    document.getElementById('resultado').textContent = JSON.stringify(salida, null, 2);
  }

  ejecutar();
})();
