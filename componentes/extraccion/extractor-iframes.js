(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  var ns = SamjokoExtraccion;

  function esMismoOrigen(iframe) {
    try {
      return !!iframe.contentDocument;
    } catch (e) {
      return false;
    }
  }

  function tieneContenidoUtil(documento) {
    if (!documento || !documento.body) return false;
    var texto = documento.body.textContent.trim();
    if (!texto) return false;
    var elementos = documento.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, pre, code, blockquote, table, img');
    return elementos.length > 0;
  }

  function extraerIframesRecursivo(documento, urlOrigen, profundidad, maxProfundidad, visitados) {
    if (profundidad > maxProfundidad) return [];
    if (!documento) return [];

    var iframes = Array.from(documento.querySelectorAll('iframe'));
    var resultados = [];

    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];

      if (!esMismoOrigen(iframe)) continue;

      var docIframe = iframe.contentDocument;
      if (!docIframe) continue;

      var idIframe = docIframe.URL || iframe.src || iframe.id || '';
      if (visitados[idIframe]) continue;
      visitados[idIframe] = true;

      if (!tieneContenidoUtil(docIframe)) continue;

      try {
        var extraido = ns.extraer(docIframe, {
          urlOrigen: urlOrigen || (documento.URL || '')
        });

        if (extraido && extraido.bloques && extraido.bloques.length > 0) {
          var tieneContenidoReal = false;
          for (var b = 0; b < extraido.bloques.length; b++) {
            if (extraido.bloques[b].tipo !== 'links') {
              tieneContenidoReal = true;
              break;
            }
          }
          if (tieneContenidoReal) {
            resultados.push(extraido);
          }
        }

        var subResultados = extraerIframesRecursivo(
          docIframe, urlOrigen, profundidad + 1, maxProfundidad, visitados
        );
        for (var s = 0; s < subResultados.length; s++) {
          resultados.push(subResultados[s]);
        }
      } catch (e) {}
    }

    return resultados;
  }

  ns.registrarExtractor({
    nombre: 'iframes',
    etiquetas: ['iframe'],
    convertir: function(elemento) {
      if (!esMismoOrigen(elemento)) return null;

      var docIframe = elemento.contentDocument;
      if (!docIframe) return null;
      if (!tieneContenidoUtil(docIframe)) return null;

      var visitados = {};
      var idIframe = docIframe.URL || elemento.src || elemento.id || '';
      visitados[idIframe] = true;

      try {
        var extraido = ns.extraer(docIframe, {
          urlOrigen: document.URL || ''
        });

        if (!extraido || !extraido.bloques || extraido.bloques.length === 0) return null;

        var bloquesIframe = [];
        var textoIframe = '';

        for (var i = 0; i < extraido.bloques.length; i++) {
          var b = extraido.bloques[i];
          if (b.tipo !== 'links' && b.incluido !== false) {
            bloquesIframe.push(b);
            textoIframe += b.texto + '\n\n';
          }
        }

        if (!textoIframe.trim()) return null;

        var subResultados = extraerIframesRecursivo(
          docIframe, document.URL || '', 1, 3, visitados
        );

        if (subResultados.length > 0) {
          var todosResultados = [extraido].concat(subResultados);
          var fusionado = ns.fusionarResultados(todosResultados);
          if (fusionado) {
            bloquesIframe = [];
            textoIframe = '';
            for (var f = 0; f < fusionado.bloques.length; f++) {
              var fb = fusionado.bloques[f];
              if (fb.tipo !== 'links' && fb.incluido !== false) {
                bloquesIframe.push(fb);
                textoIframe += fb.texto + '\n\n';
              }
            }
          }
        }

        textoIframe = textoIframe.trim();

        var src = elemento.getAttribute('src') || '';
        var tituloIframe = elemento.getAttribute('title') || '';
        var encabezado = tituloIframe
          ? '### «' + tituloIframe + '» (iframe)\n\n'
          : '### (Contenido de iframe' + (src ? ': ' + src : '') + ')\n\n';

        return {
          md: encabezado + textoIframe,
          tipo: 'text',
          saltarVacio: true,
          datos: {
            contenido: textoIframe,
            fuenteIframe: src,
            tituloIframe: tituloIframe
          }
        };
      } catch (e) {
        return null;
      }
    }
  });
})();
