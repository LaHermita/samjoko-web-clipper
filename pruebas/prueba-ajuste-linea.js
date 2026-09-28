// Prueba del bloqueante B1: ajustarTexto() debe devolver una string, nunca una
// Promise (antes se declaraba async y sus call sites no hacían await).

// Shim de i18n (esta página no corre como extensión; base-datos.js lo usa).
window.chrome = window.chrome || {};
window.chrome.i18n = {
  getMessage: function (clave) {
    var diccionario = { fallbackTituloArchivo: 'captura' };
    return diccionario[clave] || clave;
  }
};

(function () {
  var salida = {};
  try {
    var entrada = ('palabra '.repeat(60)).trim();
    var r80 = ajustarTexto(entrada, '80');
    salida.tipo80 = typeof r80;
    salida.lineas80 = typeof r80 === 'string' ? r80.split('\n').length : null;
    salida.longitudMaxima80 = typeof r80 === 'string'
      ? Math.max.apply(null, r80.split('\n').map(function (l) { return l.length; }))
      : null;
    salida.contienePromise = String(r80).indexOf('Promise') !== -1;
    salida.tipoNinguno = typeof ajustarTexto(entrada, 'ninguno');
    salida.ok = typeof r80 === 'string' && !salida.contienePromise && salida.longitudMaxima80 <= 80;
  } catch (e) {
    salida.error = e.message;
    salida.ok = false;
  }
  document.getElementById('resultado').textContent = JSON.stringify(salida, null, 2);
})();
