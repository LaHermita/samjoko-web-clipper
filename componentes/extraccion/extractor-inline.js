(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  var ns = SamjokoExtraccion;

  ns.extraerInline = function(elemento) {
    if (!elemento) return '';

    var partes = [];
    var hijos = Array.from(elemento.childNodes);

    for (var i = 0; i < hijos.length; i++) {
      var hijo = hijos[i];

      if (hijo.nodeType === 3) {
        var texto = hijo.textContent;
        if (texto) partes.push(texto);
        continue;
      }

      if (hijo.nodeType !== 1) continue;

      var etiqueta = hijo.tagName.toLowerCase();

      if (etiqueta === 'strong' || etiqueta === 'b') {
        var interior = ns.extraerInline(hijo);
        if (interior.trim()) partes.push('**' + interior + '**');
        continue;
      }

      if (etiqueta === 'em' || etiqueta === 'i') {
        var interior = ns.extraerInline(hijo);
        if (interior.trim()) partes.push('*' + interior + '*');
        continue;
      }

      if (etiqueta === 'code') {
        var pre = hijo.closest('pre');
        if (!pre) {
          var codigo = hijo.textContent;
          if (codigo) partes.push('`' + codigo + '`');
        } else {
          var interior = ns.extraerInline(hijo);
          if (interior) partes.push(interior);
        }
        continue;
      }

      if (etiqueta === 'a') {
        var href = hijo.getAttribute('href');
        var textoEnlace = ns.extraerInline(hijo);
        if (href && textoEnlace.trim() && href.indexOf('javascript:') !== 0 && href.indexOf('#') !== 0) {
          partes.push('[' + textoEnlace.trim() + '](' + ns.limpiarUrl(href) + ')');
        } else if (textoEnlace.trim()) {
          partes.push(textoEnlace);
        }
        continue;
      }

      if (etiqueta === 'sub') {
        var interior = ns.extraerInline(hijo);
        if (interior.trim()) partes.push('~' + interior + '~');
        continue;
      }

      if (etiqueta === 'sup') {
        var interior = ns.extraerInline(hijo);
        if (interior.trim()) partes.push('^' + interior + '^');
        continue;
      }

      if (etiqueta === 'br') {
        partes.push('\n');
        continue;
      }

      if (etiqueta === 'img') {
        var src = hijo.getAttribute('src') || '';
        var alt = hijo.getAttribute('alt') || '';
        if (src && src.indexOf('data:') !== 0 && src.indexOf('javascript:') !== 0) {
          partes.push('![' + alt + '](' + src + ')');
        }
        continue;
      }

      var interior = ns.extraerInline(hijo);
      if (interior) partes.push(interior);
    }

    var resultado = partes.join('');
    resultado = resultado.replace(/ {2,}/g, ' ');
    resultado = resultado.replace(/\n{3,}/g, '\n\n');

    return resultado;
  };

})();
