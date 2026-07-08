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

  ns.detectarRaizContenido = function(documento) {
    var articulo = documento.querySelector('article');
    if (articulo) return articulo;

    var semantico = documento.querySelector('main, [role="main"], [role="document"]');
    if (semantico) return semantico;

    var idClase = documento.querySelector(
      '.entry-content, .post-content, .content-area, .article-body, .post-body, ' +
      '#content, #main-content, #primary, #post-content, .content__main, ' +
      '[itemprop="articleBody"]'
    );
    if (idClase) return idClase;

    var mejorPuntaje = 0;
    var mejorCandidato = null;
    var candidatos = documento.body.querySelectorAll('div, section');

    for (var i = 0; i < candidatos.length; i++) {
      var el = candidatos[i];
      if (el.closest('nav, footer, header, aside, script, style')) continue;
      var puntos = ns.puntuarCandidato(el);
      if (puntos > mejorPuntaje) {
        mejorPuntaje = puntos;
        mejorCandidato = el;
      }
    }

    if (mejorCandidato && mejorPuntaje >= 20) return mejorCandidato;

    return documento.body;
  };

  ns.puntuarCandidato = function(elemento) {
    var texto = elemento.textContent.trim();
    if (texto.length < 300) return 0;

    var puntos = 0;

    puntos += Math.min(30, Math.floor(texto.length / 200));

    var h1 = elemento.querySelectorAll('h1').length;
    var h2 = elemento.querySelectorAll('h2').length;
    var h3 = elemento.querySelectorAll('h3').length;
    puntos += Math.min(20, h1 * 8 + h2 * 4 + h3 * 2);

    var parrafos = elemento.querySelectorAll('p').length;
    puntos += Math.min(15, parrafos * 2);

    var enlaces = elemento.querySelectorAll('a[href]');
    var textoEnlaces = '';
    for (var i = 0; i < enlaces.length; i++) {
      textoEnlaces += enlaces[i].textContent;
    }
    var ratio = texto.length > 0 ? textoEnlaces.length / texto.length : 0;
    if (ratio > 0.5) puntos -= 25;
    else if (ratio > 0.3) puntos -= 10;

    var idClases = ((elemento.className || '') + ' ' + (elemento.id || '')).toLowerCase();
    if (/content|article|post|entry|main/i.test(idClases)) puntos += 10;
    if (/page|wrap|container|body/i.test(idClases)) puntos += 3;
    if (/sidebar|widget|comment|footer|header|nav|menu|banner/i.test(idClases)) puntos -= 30;

    return Math.max(0, puntos);
  };

  ns.extraerTextoCuerpo = function(documento) {
    var raiz = ns.detectarRaizContenido(documento);
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

  ns.heuristicaIdioma = function(texto) {
    if (!texto) return null;
    var palabras = texto.toLowerCase().split(/\s+/).filter(Boolean);
    if (palabras.length < 30) return null;

    var es = { de:1, la:1, que:1, el:1, en:1, los:1, se:1, las:1, por:1, con:1, para:1, una:1, del:1, como:1, mas:1, pero:1, sus:1, entre:1, este:1, esta:1, porque:1, tambien:1, donde:1, muy:1, sobre:1, hasta:1, desde:1, segun:1, cada:1, otro:1, esa:1, ese:1, ello:1, era:1, han:1, esta:1, estan:1, fue:1, son:1, ser:1, sido:1, tiene:1, tenia:1, podria:1, puede:1, debe:1, ano:1, parte:1, forma:1, contra:1, durante:1, antes:1, despues:1, luego:1, entonces:1, aqui:1, alli:1, siempre:1, nunca:1, mismo:1, toda:1, todo:1, bajo:1, ante:1, cabe:1, segun:1, hacia:1, mediante:1, sin:1, tras:1, vez:1, veces:1, ambos:1, tampoco:1, solo:1, ya:1, bien:1, aunque:1, mientras:1, pues:1, cual:1, quien:1, cuyo:1, cuanto:1, nada:1, algo:1, nadie:1, algun:1, alguna:1, ningun:1, ninguna:1, siempre:1, tambien:1, tampoco:1, incluso:1, asi:1, alla:1, aca:1, entonces:1, finalmente:1, primer:1, ultimo:1, gran:1, mayor:1, menor:1, propio:1, nuevo:1, mismo:1, otro:1 };

    var en = { the:1, of:1, and:1, to:1, in:1, a:1, is:1, that:1, for:1, it:1, with:1, as:1, was:1, on:1, are:1, be:1, this:1, or:1, by:1, from:1, at:1, an:1, but:1, not:1, we:1, you:1, they:1, he:1, she:1, its:1, have:1, has:1, had:1, been:1, were:1, will:1, would:1, could:1, should:1, may:1, more:1, about:1, than:1, which:1, their:1, them:1, some:1, when:1, also:1, into:1, only:1, other:1, after:1, then:1, these:1, those:1, what:1, while:1, there:1, can:1, just:1, like:1, most:1, very:1, way:1, many:1, each:1, much:1, such:1, through:1, where:1, how:1, well:1, still:1, even:1, down:1, back:1, between:1, over:1, under:1, before:1, after:1, during:1, without:1, within:1, along:1, among:1, upon:1, about:1, around:1, above:1, below:1, whether:1, though:1, either:1, neither:1, than:1, then:1, else:1, off:1, out:1, up:1, here:1, there:1, because:1, been:1, being:1, having:1, doing:1, getting:1, make:1, made:1, take:1, took:1, given:1, using:1, used:1 };

    var puntEs = 0;
    var puntEn = 0;
    for (var i = 0; i < palabras.length; i++) {
      var p = palabras[i].replace(/[^a-z]/g, '');
      if (!p) continue;
      if (es[p]) puntEs++;
      if (en[p]) puntEn++;
    }

    var total = puntEs + puntEn;
    if (total < 5) return null;
    return puntEs > puntEn * 1.5 ? 'es' : (puntEn > puntEs * 1.5 ? 'en' : null);
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
    var jsonldFecha = null;
    var jsonldAutor = null;
    var jsonldImagen = null;
    var jsonldDescripcion = null;
    var jsonldTitulo = null;

    var scriptsLd = documento.querySelectorAll('script[type="application/ld+json"]');
    for (var s = 0; s < scriptsLd.length; s++) {
      try {
        var datos = JSON.parse(scriptsLd[s].textContent);
        var elementos = datos['@graph'] ? datos['@graph'] : [datos];

        for (var g = 0; g < elementos.length; g++) {
          var item = elementos[g];
          var tipo = item['@type'];
          if (!tipo) continue;

          var tipos = Array.isArray(tipo) ? tipo : [tipo];
          var tipoStr = '';
          for (var t = 0; t < tipos.length; t++) {
            tipoStr += tipos[t].toLowerCase() + ' ';
          }

          if (!tipoSchema && /article|blogposting|newsarticle|tutorial|howto|documentation|techarticle|news/.test(tipoStr)) {
            tipoSchema = tipos[0];
          }

          if (!jsonldFecha && item.datePublished) {
            var fp = String(item.datePublished).split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(fp)) jsonldFecha = fp;
          }

          if (!jsonldAutor && item.author) {
            if (typeof item.author === 'string') jsonldAutor = item.author;
            else if (item.author.name) jsonldAutor = item.author.name;
          }

          if (!jsonldImagen && item.image) {
            if (typeof item.image === 'string') jsonldImagen = item.image;
            else if (item.image.url) jsonldImagen = item.image.url;
          }

          if (!jsonldDescripcion && item.description) {
            jsonldDescripcion = item.description;
          }

          if (!jsonldTitulo && (item.headline || item.name)) {
            jsonldTitulo = item.headline || item.name;
          }
        }
      } catch (e) {}
    }

    var fechaDesdeMeta = obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']);
    if (!fechaDesdeMeta) {
      var timeEl = documento.querySelector('time[datetime]');
      if (timeEl) {
        var fechaTime = timeEl.getAttribute('datetime');
        if (fechaTime) {
          var soloFecha = fechaTime.split('T')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) fechaDesdeMeta = soloFecha;
        }
      }
    }
    if (!fechaDesdeMeta && jsonldFecha) {
      fechaDesdeMeta = jsonldFecha;
    }

    var textoCuerpo = ns.extraerTextoCuerpo(documento);
    var palabras = textoCuerpo.split(/\s+/).filter(Boolean).length;

    var urlOrigen = (function() {
      var canonico = documento.querySelector('link[rel="canonical"]');
      if (canonico && canonico.href) return ns.limpiarUrl(canonico.href);
      return ns.limpiarUrl(urlOrigenExterno || documento.URL || '');
    })();

    var idiomaMeta = (documento.documentElement.getAttribute('lang') || '').toLowerCase();
    var idioma = idiomaMeta && /^[a-z]{2}(-[a-z]{2})?$/.test(idiomaMeta) ? idiomaMeta.substring(0, 2) : null;
    if (!idioma) {
      idioma = ns.heuristicaIdioma(textoCuerpo);
    }

    var sitioNombre = obtenerMeta(['og:site_name']);
    if (!sitioNombre && urlOrigen) {
      try {
        sitioNombre = new URL(urlOrigen).hostname.replace(/^www\./, '');
      } catch (e) {}
    }

    var imagenDestacada = obtenerMeta(['og:image']);
    if (!imagenDestacada) {
      imagenDestacada = obtenerMeta(['twitter:image', 'twitter:image:src']);
    }
    if (!imagenDestacada) {
      var enlaceImagen = documento.querySelector('link[rel="image_src"]');
      if (enlaceImagen) imagenDestacada = enlaceImagen.getAttribute('href');
    }
    if (!imagenDestacada && jsonldImagen) {
      imagenDestacada = jsonldImagen;
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
      titulo: jsonldTitulo && (!titulo || titulo.length < 3) ? ns.sanitizarTitulo(jsonldTitulo) : titulo,
      url: urlOrigen,
      urlOrigen: urlOrigen,
      autor: (function() {
        var a = obtenerMeta(['autor', 'article:author', 'twitter:creator']);
        return a || jsonldAutor || null;
      })(),
      fecha: fechaDesdeMeta,
      fechaPublicacion: fechaDesdeMeta,
      etiquetas: obtenerMetadatosMultiples('keywords').flatMap(function(k) {
        return k.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
      }),
      descripcion: (function() {
        var desc = obtenerMeta(['description', 'og:description', 'twitter:description']);
        if (desc) return desc.length > 200 ? desc.substring(0, 197) + '...' : desc;
        if (jsonldDescripcion) return jsonldDescripcion.length > 200 ? jsonldDescripcion.substring(0, 197) + '...' : jsonldDescripcion;
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

    var raiz = ns.detectarRaizContenido(documento);

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
    var nodosProcesados = new Set();

    var bloquesContenedor = ['blockquote', 'pre', 'table', 'figure', 'ul', 'ol'];

    for (var i = 0; i < elementosFiltrados.length; i++) {
      var elemento = elementosFiltrados[i];

      if (nodosProcesados.has(elemento)) continue;

      if (elemento.closest && elemento.closest('[data-bloque-procesado]')) continue;

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

      var textoPlano = elemento.textContent;

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

      nodosProcesados.add(elemento);
      if (bloquesContenedor.indexOf(etiqueta) !== -1) {
        elemento.setAttribute('data-bloque-procesado', 'true');
      }
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
