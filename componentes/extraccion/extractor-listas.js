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
        return prefijo + ns.extraerInline(li);
      }).join('\n');

      return { md: md, tipo: 'list' };
    }
  });

  SamjokoExtraccion.registrarExtractor({
    nombre: 'definiciones',
    etiquetas: ['dl'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var grupos = [];
      var hijos = Array.from(elemento.children);
      var terminoActual = null;

      for (var i = 0; i < hijos.length; i++) {
        var hijo = hijos[i];
        if (hijo.tagName === 'DT') {
          terminoActual = ns.extraerInline(hijo);
        } else if (hijo.tagName === 'DD' && terminoActual) {
          var def = ns.extraerInline(hijo);
          grupos.push(terminoActual + '\n: ' + def);
          terminoActual = null;
        }
      }

      if (grupos.length === 0) return null;
      return { md: grupos.join('\n\n'), tipo: 'list' };
    }
  });
})();
