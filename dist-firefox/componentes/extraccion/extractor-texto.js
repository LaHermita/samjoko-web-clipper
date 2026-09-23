(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'texto',
    etiquetas: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'],
    convertir: function(elemento) {
      var etiqueta = elemento.tagName.toLowerCase();
      var ns = SamjokoExtraccion;

      if (etiqueta.startsWith('h') && etiqueta.length === 2) {
        var nivel = parseInt(etiqueta[1]);
        var prefijo = '#'.repeat(nivel);
        return { md: prefijo + ' ' + ns.extraerInline(elemento), tipo: 'heading' };
      }

      if (etiqueta === 'p') {
        return { md: ns.extraerInline(elemento), tipo: 'text' };
      }

      return null;
    }
  });
})();
