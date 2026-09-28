// Detector de fórmulas matemáticas (fase 5.17).
//
// Reconoce los envoltorios habituales y devuelve LaTeX listo para Obsidian:
//   - Wikipedia:  <span class="mwe-math-element"> (MathML oculto + img fallback)
//   - MathML:     <math> con <annotation encoding="application/x-tex"> o alttext
//   - KaTeX:      cualquier elemento con clase que contenga "katex"
//   - Imagen fallback de Wikimedia: <img class="mwe-math-fallback-image-*">
//
// Prioridad de la fuente LaTeX: data-mw.extsrc (Wikipedia) → <annotation> →
// alttext del <math> → alt de la imagen. Se emite `$...$` en línea y
// `$$...$$` cuando la fórmula ocupa sola su bloque (ecuación display).
(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  var ns = SamjokoExtraccion;

  function obtenerClases(elemento) {
    if (!elemento || !elemento.className) return '';
    if (typeof elemento.className === 'string') return elemento.className;
    return elemento.className.toString();
  }

  function esEnvoltorioFormula(elemento) {
    var etiqueta = elemento.tagName;
    if (etiqueta === 'MATH') return true;
    var clases = obtenerClases(elemento);
    if (clases.indexOf('mwe-math-element') !== -1) return true;
    if (clases.indexOf('mwe-math-fallback') !== -1) return true;
    if (/(^|\s)katex(-display)?(\s|$)/.test(clases)) return true;
    return false;
  }

  function normalizarLatex(latex) {
    var limpio = (latex || '').replace(/\s+/g, ' ').trim();
    var envoltorio = limpio.match(/^\{\\displaystyle\s*([\s\S]+)\}$/);
    if (envoltorio) limpio = envoltorio[1].trim();
    return limpio;
  }

  function obtenerLatex(elemento) {
    // La imagen fallback y el <math> anidados se resuelven desde su envoltorio:
    // así heredan el data-mw de Wikipedia.
    elemento = obtenerEnvoltorioFormula(elemento);

    // 1. Fuente original del wiki (Wikipedia): data-mw = { body: { extsrc } }
    var dataMw = elemento.getAttribute && elemento.getAttribute('data-mw');
    if (dataMw) {
      try {
        var datos = JSON.parse(dataMw);
        if (datos && datos.body && datos.body.extsrc) {
          return normalizarLatex(datos.body.extsrc);
        }
      } catch (errorDeJson) {
        // data-mw no es JSON válido: se sigue con el resto de fuentes.
      }
    }

    // 2. Anotación LaTeX del propio MathML / KaTeX.
    var anotacion = elemento.querySelector &&
      elemento.querySelector('annotation[encoding="application/x-tex"]');
    if (anotacion && anotacion.textContent) {
      var latexAnotacion = normalizarLatex(anotacion.textContent);
      if (latexAnotacion) return latexAnotacion;
    }

    // 3. alttext del <math> (estándar MathML).
    var math = elemento.tagName === 'MATH'
      ? elemento
      : (elemento.querySelector ? elemento.querySelector('math') : null);
    if (math) {
      var alttext = math.getAttribute('alttext');
      if (alttext) {
        var latexAlttext = normalizarLatex(alttext);
        if (latexAlttext) return latexAlttext;
      }
    }

    // 4. alt de la imagen fallback de Wikimedia.
    var imagen = elemento.tagName === 'IMG'
      ? elemento
      : (elemento.querySelector ? elemento.querySelector('img[alt]') : null);
    if (imagen) {
      var latexAlt = normalizarLatex(imagen.getAttribute('alt'));
      if (latexAlt) return latexAlt;
    }

    return null;
  }

  // El "objeto fórmula": el propio elemento o su envoltorio (la imagen fallback
  // vive dentro de <span class="mwe-math-element"> y hay que medir el bloque
  // desde el envoltorio, no desde la imagen).
  function obtenerEnvoltorioFormula(elemento) {
    if (elemento.closest) {
      var envoltorio = elemento.closest('.mwe-math-element, [class*="katex"]');
      if (envoltorio) return envoltorio;
    }
    return elemento;
  }

  // true cuando la fórmula es el contenido de su bloque (p, dd, figcaption…) →
  // ecuación display ($$). En listas, tablas y encabezados se queda en línea
  // para no romper su estructura.
  function esFormulaSuelta(elemento) {
    var envoltorio = obtenerEnvoltorioFormula(elemento);
    var bloque = envoltorio.closest
      ? envoltorio.closest('p, figcaption, blockquote, dd, dt')
      : null;
    if (!bloque) {
      var padre = envoltorio.parentElement;
      if (!padre) return false;
      if (['LI', 'TD', 'TH', 'UL', 'OL', 'DL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(padre.tagName) !== -1) {
        return false;
      }
      bloque = padre;
    }
    var resto = bloque.textContent.replace(envoltorio.textContent, '');
    return ns.colapsarEspacios(resto) === '';
  }

  // Devuelve la fórmula ya delimitada ($…$ / $$…$$), '' si el envoltorio se
  // consume pero no hay LaTeX recuperable, o null si no es una fórmula.
  ns.extraerFormula = function(elemento) {
    if (!elemento || elemento.nodeType !== 1) return null;
    if (!esEnvoltorioFormula(elemento)) return null;
    var latex = obtenerLatex(elemento);
    if (!latex) return null;
    var delimitador = esFormulaSuelta(elemento) ? '$$' : '$';
    return delimitador + latex + delimitador;
  };
})();
