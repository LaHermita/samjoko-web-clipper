(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarExtractor({
    nombre: 'multimedia',
    etiquetas: ['img', 'figure'],
    convertir: function(elemento) {
      var ns = SamjokoExtraccion;
      var etiqueta = elemento.tagName.toLowerCase();

      if (etiqueta === 'img') {
        // Imagen fallback de una fórmula (Wikipedia): se emite como LaTeX.
        var formula = ns.extraerFormula(elemento);
        if (formula) {
          return { md: formula, tipo: 'text', saltarVacio: true };
        }
        if (ns.esImagenDecorativa(elemento)) return null;
        var src = ns.limpiarUrl(ns.obtenerSrcImagen(elemento)) || '';
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
          // Figura con fórmula: LaTeX en lugar de la imagen de render.
          var formulaFigura = ns.extraerFormula(img);
          if (formulaFigura) {
            var mdFormula = formulaFigura;
            if (figcaption) {
              mdFormula += '\n\n*' + ns.extraerInline(figcaption) + '*';
            }
            return { md: mdFormula, tipo: 'text', saltarVacio: true };
          }

          // Imagen decorativa: se degrada al pie de figura si lo hay.
          if (ns.esImagenDecorativa(img)) {
            if (figcaption) return { md: ns.extraerInline(figcaption), tipo: 'text' };
            return null;
          }

          var src = ns.limpiarUrl(ns.obtenerSrcImagen(img)) || '';
          var alt = img.getAttribute('alt') || '';

          if (!src) {
            if (figcaption) return { md: ns.extraerInline(figcaption), tipo: 'text' };
            return null;
          }
          var srcNormalizada = src.toLowerCase();
          if (srcNormalizada.indexOf('javascript:') === 0 || srcNormalizada.indexOf('vbscript:') === 0 || srcNormalizada.indexOf('data:text/html') === 0) return null;
          if (src.indexOf('data:') === 0) {
            if (figcaption) return { md: ns.extraerInline(figcaption), tipo: 'text' };
            if (alt) return { md: alt, tipo: 'text' };
            return null;
          }
          var md = '![' + alt + '](' + src + ')';
          if (figcaption) {
            md += '\n\n*' + ns.extraerInline(figcaption) + '*';
          }
          return { md: md, tipo: 'other', saltarVacio: true, datos: { contenido: md, src: src, alt: alt, caption: figcaption ? figcaption.textContent : null } };
        }

        return null;
      }

      return null;
    }
  });
})();
