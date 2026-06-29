(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'listas',
    etiquetas: ['ul', 'ol'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var etiqueta = elemento.tagName.toLowerCase();
      var items = Array.from(elemento.children).filter(function(li) {
        return li.tagName === 'LI';
      });

      var md = items.map(function(li, idx) {
        var prefijo = etiqueta === 'ol' ? (idx + 1) + '. ' : '- ';
        return prefijo + ns.colapsarEspacios(li.textContent);
      }).join('\n');

      return { md: md, tipo: 'list' };
    }
  });
})();
