var SamjokoExtraccion = SamjokoExtraccion || {};

(function(ns) {
  ns.CONFIG = {
    esActivo: true,
    debeFiltrarIrrelevante: true,
    patronesIrrelevantes: /nav|menu|footer|sidebar|comment|ad-|ads|widget|social|share|breadcrumb|pagination|related|recommended|newsletter|subscribe|cookie|popup|modal|banner|promo|sponsor/i,
    densidadMaximaEnlaces: 0.5,
    debeFiltrarCalidad: false,
    longitudMinimaParrafo: 8,
    debeDetectarEncabezadosVisuales: true
  };

  ns.registroExtractores = [];

  ns.registrarExtractor = function(extractor) {
    ns.registroExtractores.push(extractor);
  };

  ns.colapsarEspacios = function(texto) {
    return texto.replace(/\s+/g, ' ').trim();
  };

  ns.esTextoVacio = function(textoPlano) {
    var normalizado = textoPlano.replace(/\s+/g, ' ').trim();
    if (!normalizado) return true;
    return /^[.,;:!¡¿?()[\]{}'"«»\-–—·•…\s]+$/.test(normalizado);
  };

  ns.obtenerGrupo = function(etiqueta) {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(etiqueta)) return 'heading';
    if (['p', 'blockquote'].includes(etiqueta)) return 'text';
    if (['ul', 'ol'].includes(etiqueta)) return 'list';
    if (['pre', 'code'].includes(etiqueta)) return 'code';
    if (etiqueta === 'table') return 'table';
    return 'other';
  };

  ns.tienePatronIrrelevante = function(elemento) {
    var textoClases = (elemento.className || '') + ' ' + (elemento.id || '');
    var ancestro = elemento.parentElement;
    var profundidad = 0;
    while (ancestro && profundidad < 4) {
      var etiquetaAncestro = ancestro.tagName;
      if (etiquetaAncestro === 'BODY' || etiquetaAncestro === 'HTML') break;
      textoClases += ' ' + (ancestro.className || '') + ' ' + (ancestro.id || '');
      ancestro = ancestro.parentElement;
      profundidad++;
    }
    return ns.CONFIG.patronesIrrelevantes.test(textoClases.toLowerCase());
  };

  ns.tieneAltaDensidadEnlaces = function(elemento) {
    if (elemento.tagName !== 'P') return false;
    var textoTotal = elemento.textContent.trim().length;
    if (textoTotal === 0) return false;
    var enlaces = elemento.querySelectorAll('a');
    var textoEnlaces = 0;
    for (var i = 0; i < enlaces.length; i++) {
      textoEnlaces += enlaces[i].textContent.trim().length;
    }
    return (textoEnlaces / textoTotal) > ns.CONFIG.densidadMaximaEnlaces;
  };

  ns.esParrafoCorto = function(etiqueta, grupo, textoPlano) {
    if (grupo !== 'text') return false;
    var normalizado = textoPlano.replace(/\s+/g, ' ').trim();
    return normalizado.length < ns.CONFIG.longitudMinimaParrafo;
  };

  ns.esEncabezadoVisual = function(elemento) {
    if (!ns.CONFIG.debeDetectarEncabezadosVisuales) return false;
    var etiqueta = elemento.tagName;
    if (etiqueta === 'STRONG' || etiqueta === 'B') return true;
    var textoClases = ((elemento.className || '') + ' ' + (elemento.id || '')).toLowerCase();
    return /title|heading|subtitle|headline|caption/i.test(textoClases);
  };

  ns.esBloqueValido = function(elemento, etiqueta, grupo, textoPlano) {
    if (!ns.CONFIG.esActivo) return true;
    if (ns.CONFIG.debeFiltrarIrrelevante) {
      if (ns.tienePatronIrrelevante(elemento)) return false;
      if (ns.tieneAltaDensidadEnlaces(elemento)) return false;
    }
    if (ns.CONFIG.debeFiltrarCalidad) {
      if (ns.esParrafoCorto(etiqueta, grupo, textoPlano)) return false;
    }
    return true;
  };

  ns.sanitizarTitulo = function(titulo) {
    return titulo
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  ns.extraerTextoCuerpo = function(documento) {
    var articulo = documento.querySelector('article');
    var raiz = articulo || documento.body;
    return raiz ? raiz.textContent : '';
  };

  ns.obtenerTipoContenido = function(tipoOpenGraph, tipoSchema) {
    var tipo = (tipoOpenGraph || tipoSchema || '').toLowerCase();
    var mapa = {
      'article': 'articulo',
      'blogposting': 'articulo',
      'newsarticle': 'articulo',
      'tutorial': 'tutorial',
      'howto': 'tutorial',
      'documentation': 'documentacion',
      'techarticle': 'documentacion',
      'news': 'noticia',
      'newscollection': 'noticia',
      'video': 'video',
      'videoobject': 'video'
    };
    return mapa[tipo] || null;
  };

  ns.extraerMetadatos = function(documento, urlOrigenExterno) {
    function obtenerMeta(nombres) {
      for (var i = 0; i < nombres.length; i++) {
        var nombre = nombres[i];
        var elemento = documento.querySelector('meta[name="' + nombre + '"], meta[property="' + nombre + '"]');
        if (elemento && elemento.content) return elemento.content.trim();
      }
      return null;
    }

    function obtenerMetadatosMultiples(nombre) {
      var elementos = documento.querySelectorAll('meta[name="' + nombre + '"], meta[property="' + nombre + '"]');
      return Array.from(elementos).map(function(el) {
        return el.content ? el.content.trim() : null;
      }).filter(Boolean);
    }

    var tituloCrudo = documento.title || (typeof chrome !== 'undefined' ? chrome.i18n.getMessage('textoSinTitulo') : '(sin titulo)');
    var tituloLimpio = tituloCrudo.replace(/\s*[-–|]\s*.*$/, '').trim();
    var titulo = ns.sanitizarTitulo(tituloLimpio);

    var tipoOpenGraph = obtenerMeta(['og:type']);
    var tipoSchema = null;
    var scriptJsonLd = documento.querySelector('script[type="application/ld+json"]');
    if (scriptJsonLd) {
      try {
        var datos = JSON.parse(scriptJsonLd.textContent);
        tipoSchema = datos['@type'] || null;
      } catch (e) {}
    }

    var textoCuerpo = ns.extraerTextoCuerpo(documento);
    var palabras = textoCuerpo.split(/\s+/).filter(Boolean).length;

    var urlOrigen = ns.limpiarUrl(urlOrigenExterno || documento.URL || '');

    var idiomaMeta = (documento.documentElement.getAttribute('lang') || '').toLowerCase();
    var idioma = idiomaMeta && /^[a-z]{2}(-[a-z]{2})?$/.test(idiomaMeta) ? idiomaMeta.substring(0, 2) : null;

    var sitioNombre = obtenerMeta(['og:site_name']);
    if (!sitioNombre && urlOrigen) {
      try {
        sitioNombre = new URL(urlOrigen).hostname.replace(/^www\./, '');
      } catch (e) {}
    }

    var imagenDestacada = obtenerMeta(['og:image']);
    if (!imagenDestacada) {
      var enlaceImagen = documento.querySelector('link[rel="image_src"]');
      if (enlaceImagen) imagenDestacada = enlaceImagen.getAttribute('href');
    }
    if (imagenDestacada && imagenDestacada.startsWith('/') && urlOrigen) {
      try {
        var base = new URL(urlOrigen);
        imagenDestacada = base.origin + imagenDestacada;
      } catch (e) {}
    }
    if (imagenDestacada && imagenDestacada.indexOf('http://') !== 0 && imagenDestacada.indexOf('https://') !== 0) {
      imagenDestacada = null;
    }
    if (imagenDestacada) imagenDestacada = ns.limpiarUrl(imagenDestacada);

    return {
      titulo: titulo,
      url: urlOrigen,
      urlOrigen: urlOrigen,
      autor: obtenerMeta(['autor', 'article:author', 'twitter:creator']),
      fecha: obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']),
      fechaPublicacion: obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']),
      etiquetas: obtenerMetadatosMultiples('keywords').flatMap(function(k) {
        return k.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
      }),
      descripcion: (function() {
        var desc = obtenerMeta(['description', 'og:description']);
        if (desc) return desc.length > 200 ? desc.substring(0, 197) + '...' : desc;
        var primerParrafo = documento.querySelector('p');
        if (primerParrafo) {
          var texto = primerParrafo.textContent.trim();
          return texto.length > 200 ? texto.substring(0, 197) + '...' : texto;
        }
        return null;
      })(),
      idioma: idioma,
      sitioNombre: sitioNombre,
      tipoContenido: ns.obtenerTipoContenido(tipoOpenGraph, tipoSchema),
      imagenDestacada: imagenDestacada,
      tiempoLectura: palabras > 0 ? Math.ceil(palabras / 238) : null
    };
  };

  ns.limpiarUrl = function(url) {
    if (!url) return url;
    try {
      var u = new URL(url, window.location.origin);
      var parametrosIgnorar = /^(utm_|fbclid|gclid|mc_cid|mc_eid|ref|source|ref_src|ref_url)/i;
      var claves = Array.from(u.searchParams.keys());
      var cambio = false;
      for (var i = 0; i < claves.length; i++) {
        if (parametrosIgnorar.test(claves[i])) {
          u.searchParams.delete(claves[i]);
          cambio = true;
        }
      }
      return cambio ? u.toString() : url;
    } catch (e) {
      return url;
    }
  };

  ns.extraerEnlacesDeBloque = function(elemento) {
    var enlaces = [];
    var elementosEnlace = elemento.querySelectorAll('a[href]');
    for (var j = 0; j < elementosEnlace.length; j++) {
      var a = elementosEnlace[j];
      var href = a.getAttribute('href');
      if (href && href.indexOf('javascript:') !== 0 && href.indexOf('#') !== 0) {
        enlaces.push({ texto: ns.colapsarEspacios(a.textContent), url: ns.limpiarUrl(href) });
      }
    }
    return enlaces;
  };

  ns.ensamblarMarkdown = function(bloques, metadata, enlaces) {
    var resultado = '';
    for (var i = 0; i < bloques.length; i++) {
      resultado += bloques[i].texto + '\n\n';
    }

    var urlsVistas = {};
    var enlacesFormateados = '';
    for (var k = 0; k < enlaces.length; k++) {
      var enlace = enlaces[k];
      if (enlace.texto && enlace.url && !urlsVistas[enlace.url]) {
        urlsVistas[enlace.url] = true;
        enlacesFormateados += '- [' + enlace.texto + '](' + enlace.url + ')\n';
      }
    }
    enlacesFormateados = enlacesFormateados.trim();

    if (enlacesFormateados) {
      var tituloEnlaces = typeof chrome !== 'undefined' ? chrome.i18n.getMessage('seccionEnlaces') : 'Enlaces';
      bloques.push({
        tipo: 'links',
        texto: '## ' + tituloEnlaces + '\n\n' + enlacesFormateados,
        contenido: enlacesFormateados,
        incluido: false
      });
    }

    var tituloPagina = metadata && metadata.titulo ? metadata.titulo : '';
    var encabezado = tituloPagina ? '# ' + tituloPagina + '\n\n' : '';
    var seccionEnlaces = enlacesFormateados
      ? '\n\n## ' + (typeof chrome !== 'undefined' ? chrome.i18n.getMessage('seccionEnlaces') : 'Enlaces') + '\n\n' + enlacesFormateados
      : '';
    var fuente = metadata && metadata.url
      ? '\n\n---\n*' + (typeof chrome !== 'undefined' ? chrome.i18n.getMessage('seccionFuente') : 'Fuente') + ': ' + metadata.url + '*'
      : '';

    return {
      bloques: bloques,
      metadata: metadata,
      enlaces: enlacesFormateados,
      markdown: encabezado + resultado.trim() + seccionEnlaces + fuente
    };
  };

  ns.normalizarJerarquiaEncabezados = function(bloques) {
    var nivelMinimo = 6;
    var tieneEncabezados = false;

    for (var i = 0; i < bloques.length; i++) {
      if (bloques[i].tipo === 'heading' && bloques[i].nivel) {
        if (bloques[i].nivel < nivelMinimo) nivelMinimo = bloques[i].nivel;
        tieneEncabezados = true;
      }
    }

    if (!tieneEncabezados || nivelMinimo <= 1) return bloques;

    var desplazamiento = nivelMinimo - 1;

    for (var i = 0; i < bloques.length; i++) {
      var bloque = bloques[i];
      if (bloque.tipo === 'heading' && bloque.nivel) {
        bloque.nivel -= desplazamiento;
        var prefijo = '';
        for (var n = 0; n < bloque.nivel; n++) prefijo += '#';
        bloque.texto = prefijo + ' ' + (bloque.contenido || '');
      }
    }

    return bloques;
  };

  ns.extraer = function(documento, opciones) {
    opciones = opciones || {};
    var urlExterna = opciones.urlOrigen || '';

    var articulo = documento.querySelector('article');
    var raiz = articulo || documento;

    var todasEtiquetas = [];
    for (var e = 0; e < ns.registroExtractores.length; e++) {
      var tags = ns.registroExtractores[e].etiquetas;
      if (tags) {
        for (var t = 0; t < tags.length; t++) {
          if (todasEtiquetas.indexOf(tags[t]) === -1) {
            todasEtiquetas.push(tags[t]);
          }
        }
      }
    }

    var selector = todasEtiquetas.join(', ');

    var elementos = Array.from(raiz.querySelectorAll(selector));

    var elementosFiltrados = elementos.filter(function(elemento) {
      return !elemento.closest('script, style, nav, footer, header, aside');
    });

    var metadata = ns.extraerMetadatos(documento, urlExterna);

    var bloques = [];
    var enlacesAcumulados = [];

    for (var i = 0; i < elementosFiltrados.length; i++) {
      var elemento = elementosFiltrados[i];
      var etiqueta = elemento.tagName.toLowerCase();
      var grupoActual = ns.obtenerGrupo(etiqueta);

      var md = null;
      var datosBloque = null;
      var saltarVacio = false;
      var extractorEncontrado = false;

      for (var j = 0; j < ns.registroExtractores.length; j++) {
        var ext = ns.registroExtractores[j];
        if (ext.etiquetas && ext.etiquetas.indexOf(etiqueta) !== -1) {
          if (ext.esAplicable && !ext.esAplicable(elemento)) continue;
          var conversion = ext.convertir(elemento);
          if (conversion) {
            md = conversion.md;
            grupoActual = conversion.tipo || grupoActual;
            datosBloque = conversion.datos || null;
            saltarVacio = conversion.saltarVacio || false;
            extractorEncontrado = true;
            break;
          }
        }
      }

      if (!extractorEncontrado || !md) continue;

      const textoPlano = elemento.textContent;

      if (!saltarVacio && ns.esTextoVacio(textoPlano)) continue;

      if (!ns.esBloqueValido(elemento, elemento.tagName, grupoActual, textoPlano)) continue;

      var enlaces = ns.extraerEnlacesDeBloque(elemento);
      for (var l = 0; l < enlaces.length; l++) {
        enlacesAcumulados.push(enlaces[l]);
      }

      if (ns.CONFIG.debeDetectarEncabezadosVisuales) {
        if (ns.esEncabezadoVisual(elemento) && grupoActual === 'text') {
          md = '## ' + ns.colapsarEspacios(textoPlano);
          grupoActual = 'heading';
        }
      }

      var bloque = { tipo: grupoActual, texto: md };

      if (grupoActual === 'heading' && !etiqueta.startsWith('h')) {
        bloque.contenido = ns.colapsarEspacios(textoPlano);
        bloque.nivel = 2;
      } else if (etiqueta.startsWith('h') && etiqueta.length === 2) {
        bloque.contenido = ns.colapsarEspacios(textoPlano);
        bloque.nivel = parseInt(etiqueta[1]);
      } else if (etiqueta === 'ul' || etiqueta === 'ol') {
        var itemsLi = Array.from(elemento.children).filter(function(li) { return li.tagName === 'LI'; });
        bloque.contenido = itemsLi.map(function(li) { return ns.colapsarEspacios(li.textContent); });
        bloque.ordenada = etiqueta === 'ol';
      } else if (datosBloque) {
        for (var prop in datosBloque) {
          if (datosBloque.hasOwnProperty(prop)) {
            bloque[prop] = datosBloque[prop];
          }
        }
        if (!bloque.contenido) {
          bloque.contenido = ns.colapsarEspacios(textoPlano);
        }
      } else {
        bloque.contenido = ns.colapsarEspacios(textoPlano);
      }

      bloques.push(bloque);
    }

    bloques = ns.normalizarJerarquiaEncabezados(bloques);

    return ns.ensamblarMarkdown(bloques, metadata, enlacesAcumulados);
  };

  ns.fusionarResultados = function(resultados) {
    if (!resultados || resultados.length === 0) return null;
    if (resultados.length === 1) return resultados[0];

    var principal = resultados[0];
    var todosBloques = [];
    var enlacesVistos = {};
    var enlacesUnidos = [];

    for (var p = 0; p < resultados.length; p++) {
      var r = resultados[p];

      for (var b = 0; b < r.bloques.length; b++) {
        var bloq = r.bloques[b];
        if (bloq.tipo !== 'links' && bloq.incluido !== false) {
          todosBloques.push(bloq);
        }
      }

      var enlacesRotos = (r.enlaces || '').split('\n');
      for (var e = 0; e < enlacesRotos.length; e++) {
        var linea = enlacesRotos[e].trim();
        if (linea && !enlacesVistos[linea]) {
          enlacesVistos[linea] = true;
          enlacesUnidos.push(linea);
        }
      }
    }

    var metadataFusionada = Object.assign({}, principal.metadata);
    for (var m = 1; m < resultados.length; m++) {
      var metaSec = resultados[m].metadata;
      if (metaSec.titulo && !metadataFusionada.titulo) metadataFusionada.titulo = metaSec.titulo;
      if (metaSec.autor && !metadataFusionada.autor) metadataFusionada.autor = metaSec.autor;
      if (metaSec.descripcion && !metadataFusionada.descripcion) metadataFusionada.descripcion = metaSec.descripcion;
      if (metaSec.etiquetas) {
        metadataFusionada.etiquetas = (metadataFusionada.etiquetas || []).concat(metaSec.etiquetas);
      }
    }

    var enlacesStr = enlacesUnidos.join('\n');

    var tituloEnlaces = typeof chrome !== 'undefined' ? chrome.i18n.getMessage('seccionEnlaces') : 'Enlaces';
    var tituloFuente = typeof chrome !== 'undefined' ? chrome.i18n.getMessage('seccionFuente') : 'Fuente';
    var markdown = '';
    for (var i = 0; i < todosBloques.length; i++) {
      markdown += todosBloques[i].texto + '\n\n';
    }

    if (metadataFusionada.titulo) {
      markdown = '# ' + metadataFusionada.titulo + '\n\n' + markdown;
    }

    if (enlacesStr) {
      markdown += '## ' + tituloEnlaces + '\n\n' + enlacesStr;
    }

    if (metadataFusionada.url) {
      markdown += '\n\n---\n*' + tituloFuente + ': ' + metadataFusionada.url + '*';
    }

    return {
      bloques: todosBloques,
      metadata: metadataFusionada,
      enlaces: enlacesStr,
      markdown: markdown.trim()
    };
  };
})(SamjokoExtraccion);
