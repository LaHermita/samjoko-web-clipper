(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'multimedia',
    etiquetas: ['img', 'figure'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var etiqueta = elemento.tagName.toLowerCase();

      if (etiqueta === 'img') {
        var src = elemento.getAttribute('src') || '';
        var alt = elemento.getAttribute('alt') || '';
        if (!src) return null;
        var srcNormalizada = src.toLowerCase();
        if (srcNormalizada.indexOf('javascript:') === 0 || srcNormalizada.indexOf('vbscript:') === 0 || srcNormalizada.indexOf('data:text/html') === 0) return null;
        if (src.indexOf('data:') === 0) {
          if (alt) return { md: alt, tipo: 'text' };
          return null;
        }
        var md = '![' + alt + '](' + src + ')';
        return { md: md, tipo: 'other', saltarVacio: true, datos: { contenido: md, src: src, alt: alt } };
      }

      if (etiqueta === 'figure') {
        var img = elemento.querySelector('img');
        var figcaption = elemento.querySelector('figcaption');

        if (img) {
          var src = img.getAttribute('src') || '';
          var alt = img.getAttribute('alt') || '';
          if (!src) {
            if (figcaption) return { md: ns.colapsarEspacios(figcaption.textContent), tipo: 'text' };
            return null;
          }
          var srcNormalizada = src.toLowerCase();
          if (srcNormalizada.indexOf('javascript:') === 0 || srcNormalizada.indexOf('vbscript:') === 0 || srcNormalizada.indexOf('data:text/html') === 0) return null;
          if (src.indexOf('data:') === 0) {
            if (figcaption) return { md: ns.colapsarEspacios(figcaption.textContent), tipo: 'text' };
            if (alt) return { md: alt, tipo: 'text' };
            return null;
          }
          var md = '![' + alt + '](' + src + ')';
          if (figcaption) {
            md += '\n\n*' + ns.colapsarEspacios(figcaption.textContent) + '*';
          }
          return { md: md, tipo: 'other', saltarVacio: true, datos: { contenido: md, src: src, alt: alt, caption: figcaption ? figcaption.textContent : null } };
        }

        return null;
      }

      return null;
    }
  });
})();
