(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'citas',
    etiquetas: ['blockquote'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;

      function procesarBlockquote(bloque, profundidad) {
        var prefijo = '> '.repeat(profundidad);
        var partes = [];
        var hijos = Array.from(bloque.childNodes);

        for (var i = 0; i < hijos.length; i++) {
          var hijo = hijos[i];
          if (hijo.nodeType === 3) {
            var texto = hijo.textContent.trim();
            if (texto) {
              partes.push(prefijo + texto);
            }
          } else if (hijo.nodeType === 1) {
            if (hijo.tagName === 'BLOCKQUOTE') {
              var anidadas = procesarBlockquote(hijo, profundidad + 1);
              partes.push(anidadas);
            } else if (hijo.tagName === 'P') {
              var textoP = ns.extraerInline(hijo);
              if (textoP) {
                partes.push(prefijo + textoP);
              }
            } else {
              var textoEl = ns.extraerInline(hijo);
              if (textoEl) {
                partes.push(prefijo + textoEl);
              }
            }
          }
        }

        return partes.join('\n');
      }

      var md = procesarBlockquote(elemento, 1);
      if (!md) return null;

      return { md: md, tipo: 'text' };
    }
  });
})();
