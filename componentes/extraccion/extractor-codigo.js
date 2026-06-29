(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'codigo',
    etiquetas: ['pre', 'code'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var lenguaje = '';

      var pre = elemento.tagName === 'PRE' ? elemento : elemento.closest('pre');
      if (pre) {
        var clase = pre.className || '';
        var matchCodigo = clase.match(/(?:lang|language|syntax)-(\w+)/i);
        if (matchCodigo) {
          lenguaje = matchCodigo[1];
        }
        var datosLenguaje = pre.getAttribute('data-language');
        if (datosLenguaje) {
          lenguaje = datosLenguaje;
        }
      }

      if (pre) {
        var md = lenguaje
          ? '```' + lenguaje + '\n' + pre.textContent.trim() + '\n```'
          : '```\n' + pre.textContent.trim() + '\n```';
        return { md: md, tipo: 'code' };
      }

      return { md: '```\n' + elemento.textContent.trim() + '\n```', tipo: 'code' };
    }
  });
})();
