// Prueba del bloqueante B2: extraer dos veces el mismo documento debe dar el
// mismo Markdown y no debe dejar ningún data-bloque-procesado en la página.

// Shim de i18n (esta página no corre como extensión).
window.chrome = window.chrome || {};
window.chrome.i18n = {
  getMessage: function (clave) {
    var diccionario = { seccionEnlaces: 'Enlaces', seccionFuente: 'Fuente', textoSinTitulo: 'Sin titulo' };
    return diccionario[clave] || clave;
  }
};

(function () {
  var salida = {};
  try {
    var r1 = SamjokoExtraccion.extraer(document);
    salida.markdownPrimeraVez = r1.markdown;
    var marcadosTrasPrimera = document.querySelectorAll('[data-bloque-procesado]').length;

    var r2 = SamjokoExtraccion.extraer(document);
    salida.markdownSegundaVez = r2.markdown;
    var marcadosTrasSegunda = document.querySelectorAll('[data-bloque-procesado]').length;

    salida.marcadoresDOM = marcadosTrasPrimera + '/' + marcadosTrasSegunda;
    salida.segundaIgualQuePrimera = r1.markdown === r2.markdown;
    salida.diferencias = [];

    var p1 = r1.markdown.split('\n');
    var p2 = r2.markdown.split('\n');
    p2.forEach(function (linea) { if (p1.indexOf(linea) === -1) salida.diferencias.push('solo en 1ª: ' + linea); });
    p1.forEach(function (linea) { if (p2.indexOf(linea) === -1) salida.diferencias.push('PERDIDO en 2ª: ' + linea); });
  } catch (error) {
    salida.error = error.message;
  }
  document.getElementById('resultado').textContent = JSON.stringify(salida, null, 2);
})();
