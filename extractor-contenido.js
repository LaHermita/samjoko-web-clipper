function colapsarEspacios(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

// ── Pipeline de extracción (Nivel 1) ────────────────────────
// Etapas parametrizables. Añadir nuevas aquí para escalar a niveles 2 y 3.

var CONFIG_EXTRACCION = {
  activo: true,
  filtrarBoilerplate: true,
  patronesBoilerplate: /nav|menu|footer|sidebar|comment|ad-|ads|widget|social|share|breadcrumb|pagination|related|recommended|newsletter|subscribe|cookie|popup|modal|banner|promo|sponsor/i,
  maxDensidadEnlaces: 0.5,
  filtrarCalidad: false,
  longitudMinimaParrafo: 8,
  detectarHeadingsVisuales: true
};

function tieneAltaDensidadEnlaces(elemento) {
  if (elemento.tagName !== 'P') return false;
  var textoTotal = elemento.textContent.trim().length;
  if (textoTotal === 0) return false;
  var enlaces = elemento.querySelectorAll('a');
  var textoEnlaces = 0;
  for (var i = 0; i < enlaces.length; i++) {
    textoEnlaces += enlaces[i].textContent.trim().length;
  }
  return (textoEnlaces / textoTotal) > CONFIG_EXTRACCION.maxDensidadEnlaces;
}

function tienePatronBoilerplate(elemento) {
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
  return CONFIG_EXTRACCION.patronesBoilerplate.test(textoClases.toLowerCase());
}

function esParrafoCorto(etiqueta, grupo, textoPlano) {
  if (grupo !== 'text') return false;
  var normalizado = textoPlano.replace(/\s+/g, ' ').trim();
  return normalizado.length < CONFIG_EXTRACCION.longitudMinimaParrafo;
}

function esHeadingVisual(elemento) {
  var etiqueta = elemento.tagName;
  if (etiqueta === 'STRONG' || etiqueta === 'B') return true;
  var textoClases = ((elemento.className || '') + ' ' + (elemento.id || '')).toLowerCase();
  return /title|heading|subtitle|headline|caption/i.test(textoClases);
}

function esBloqueValido(elemento, etiqueta, grupo, textoPlano) {
  if (!CONFIG_EXTRACCION.activo) return true;
  if (CONFIG_EXTRACCION.filtrarBoilerplate) {
    if (tienePatronBoilerplate(elemento)) return false;
    if (tieneAltaDensidadEnlaces(elemento)) return false;
  }
  if (CONFIG_EXTRACCION.filtrarCalidad) {
    if (esParrafoCorto(etiqueta, grupo, textoPlano)) return false;
  }
  return true;
}

// ── Conversión a Markdown ────────────────────────────────────

function convertirElementoAmarkdown(elemento) {
  const etiqueta = elemento.tagName.toLowerCase();

  if (etiqueta.startsWith('h') && etiqueta.length === 2) {
    const nivel = '#'.repeat(parseInt(etiqueta[1]));
    return nivel + ' ' + colapsarEspacios(elemento.textContent);
  }

  if (etiqueta === 'p') {
    return colapsarEspacios(elemento.textContent);
  }

  if (etiqueta === 'blockquote') {
    return elemento.textContent.trim().split('\n').map(function (linea) {
      return '> ' + colapsarEspacios(linea);
    }).join('\n');
  }

  if (etiqueta === 'pre' || etiqueta === 'code') {
    return '```\n' + elemento.textContent.trim() + '\n```';
  }

  if (etiqueta === 'ul' || etiqueta === 'ol') {
    const items = Array.from(elemento.children).filter(function (li) { return li.tagName === 'LI'; });
    return items.map(function (li, idx) {
      const prefijo = etiqueta === 'ol' ? (idx + 1) + '. ' : '- ';
      return prefijo + colapsarEspacios(li.textContent);
    }).join('\n');
  }

  return colapsarEspacios(elemento.textContent);
}

function esTextoVacio(textoPlano) {
  var normalizado = textoPlano.replace(/\s+/g, ' ').trim();
  if (!normalizado) return true;
  return /^[.,;:!¡¿?()[\]{}'"«»\-–—·•…\s]+$/.test(normalizado);
}

function obtenerGrupo(etiqueta) {
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(etiqueta)) return 'heading';
  if (['p', 'blockquote'].includes(etiqueta)) return 'text';
  if (['ul', 'ol'].includes(etiqueta)) return 'list';
  if (['pre', 'code'].includes(etiqueta)) return 'code';
  if (etiqueta === 'table') return 'table';
  return 'other';
}

function sanitizarTitulo(titulo) {
  return titulo
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extraerBodyText(documento) {
  var articulo = documento.querySelector('article');
  var raiz = articulo || documento.body;
  return raiz ? raiz.textContent : '';
}

function obtenerTipoContenido(ogType, schemaType) {
  var tipo = (ogType || schemaType || '').toLowerCase();
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
}

function extraerMetadata(documento) {
  function obtenerMeta(nombres) {
    for (const nombre of nombres) {
      const elemento = documento.querySelector(`meta[name="${nombre}"], meta[property="${nombre}"]`);
      if (elemento?.content) return elemento.content.trim();
    }
    return null;
  }

  function obtenerMetaMultiple(nombre) {
    const elementos = documento.querySelectorAll(`meta[name="${nombre}"], meta[property="${nombre}"]`);
    return Array.from(elementos)
      .map(el => el.content?.trim())
      .filter(Boolean);
  }

  var tituloCrudo = documento.title || chrome.i18n.getMessage('textoSinTitulo');
  var tituloLimpio = tituloCrudo.replace(/\s*[-–|]\s*.*$/, '').trim();
  var titulo = sanitizarTitulo(tituloLimpio);

  var ogType = obtenerMeta(['og:type']);
  var schemaType = null;
  var jsonLd = documento.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      var datos = JSON.parse(jsonLd.textContent);
      schemaType = datos['@type'] || null;
    } catch (e) {}
  }

  var bodyText = extraerBodyText(documento);
  var palabras = bodyText.split(/\s+/).filter(Boolean).length;

  var idiomaMeta = (documento.documentElement.getAttribute('lang') || '').toLowerCase();
  var idioma = idiomaMeta && /^[a-z]{2}(-[a-z]{2})?$/.test(idiomaMeta) ? idiomaMeta.substring(0, 2) : null;

  var urlOrigen = documento.URL || '';
  var sitioNombre = obtenerMeta(['og:site_name']);
  if (!sitioNombre && urlOrigen) {
    try {
      sitioNombre = new URL(urlOrigen).hostname.replace(/^www\./, '');
    } catch (e) {}
  }

  var imagenDestacada = obtenerMeta(['og:image']);
  if (!imagenDestacada) {
    var linkImg = documento.querySelector('link[rel="image_src"]');
    if (linkImg) imagenDestacada = linkImg.getAttribute('href');
  }
  if (imagenDestacada && imagenDestacada.startsWith('/') && urlOrigen) {
    try {
      var base = new URL(urlOrigen);
      imagenDestacada = base.origin + imagenDestacada;
    } catch (e) {}
  }

  return {
    titulo: titulo,
    url: urlOrigen,
    url_origen: urlOrigen,
    autor: obtenerMeta(['autor', 'article:author', 'twitter:creator']),
    fecha: obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']),
    fecha_publicacion: obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']),
    etiquetas: obtenerMetaMultiple('keywords').flatMap(k =>
      k.split(',').map(t => t.trim()).filter(Boolean)
    ),
    descripcion: function() {
      var desc = obtenerMeta(['description', 'og:description']);
      if (desc) return desc.length > 200 ? desc.substring(0, 197) + '...' : desc;
      var primerParrafo = documento.querySelector('p');
      if (primerParrafo) {
        var texto = primerParrafo.textContent.trim();
        return texto.length > 200 ? texto.substring(0, 197) + '...' : texto;
      }
      return null;
    }(),
    idioma: idioma,
    sitio_nombre: sitioNombre,
    tipo_contenido: obtenerTipoContenido(ogType, schemaType),
    imagen_destacada: imagenDestacada,
    tiempo_lectura: palabras > 0 ? Math.ceil(palabras / 238) : null
  };
}

function extraerMarkdown(documento) {
  var articulo = documento.querySelector('article');
  var raiz = articulo || documento;

  const elementos = Array.from(raiz.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, ul, ol, pre, code, blockquote, table'
  ));

  const elementosFiltrados = elementos.filter(elemento =>
    !elemento.closest('script, style, nav, footer, header, aside')
  );

  const metadata = extraerMetadata(documento);
  const bloques = [];
  var linksAcumulados = [];
  let resultado = '';

  for (const elemento of elementosFiltrados) {
    const etiqueta = elemento.tagName.toLowerCase();
    var grupoActual = obtenerGrupo(etiqueta);

    var md = convertirElementoAmarkdown(elemento);
    if (!md) continue;

    const textoPlano = elemento.textContent;

    if (esTextoVacio(textoPlano)) continue;

    if (!esBloqueValido(elemento, elemento.tagName, grupoActual, textoPlano)) continue;

    var enlacesElemento = elemento.querySelectorAll('a[href]');
    for (var j = 0; j < enlacesElemento.length; j++) {
      var a = enlacesElemento[j];
      var href = a.getAttribute('href');
      if (href && href.indexOf('javascript:') !== 0 && href.indexOf('#') !== 0) {
        linksAcumulados.push({ texto: colapsarEspacios(a.textContent), url: href });
      }
    }

    if (CONFIG_EXTRACCION.activo && CONFIG_EXTRACCION.detectarHeadingsVisuales) {
      if (esHeadingVisual(elemento) && grupoActual === 'text') {
        md = '## ' + colapsarEspacios(textoPlano);
        grupoActual = 'heading';
      }
    }

    resultado += md + '\n\n';

    var bloque = { tipo: grupoActual, texto: md };

    if (grupoActual === 'heading' && !etiqueta.startsWith('h')) {
      bloque.contenido = colapsarEspacios(textoPlano);
      bloque.nivel = 2;
    } else if (etiqueta.startsWith('h') && etiqueta.length === 2) {
      bloque.contenido = colapsarEspacios(textoPlano);
      bloque.nivel = parseInt(etiqueta[1]);
    } else if (etiqueta === 'ul' || etiqueta === 'ol') {
      var items = Array.from(elemento.children).filter(function (li) { return li.tagName === 'LI'; });
      bloque.contenido = items.map(function (li) { return colapsarEspacios(li.textContent); });
      bloque.ordenada = etiqueta === 'ol';
    } else {
      bloque.contenido = colapsarEspacios(textoPlano);
    }

    bloques.push(bloque);
  }

  var urlsVistas = {};
  var enlacesFormateados = '';
  for (var k = 0; k < linksAcumulados.length; k++) {
    var link = linksAcumulados[k];
    if (link.texto && link.url && !urlsVistas[link.url]) {
      urlsVistas[link.url] = true;
      enlacesFormateados += '- [' + link.texto + '](' + link.url + ')\n';
    }
  }
  enlacesFormateados = enlacesFormateados.trim();

  if (enlacesFormateados) {
    bloques.push({
      tipo: 'links',
      texto: '## ' + chrome.i18n.getMessage('seccionEnlaces') + '\n\n' + enlacesFormateados,
      contenido: enlacesFormateados,
      incluido: false
    });
  }

  const encabezado = `# ${metadata.titulo}\n\n`;
  const enlaces = enlacesFormateados;
  const seccionEnlaces = enlaces
    ? `\n\n## ${chrome.i18n.getMessage('seccionEnlaces')}\n\n${enlaces}`
    : '';
  const fuente = `\n\n---\n*${chrome.i18n.getMessage('seccionFuente')}: ${metadata.url}*`;

  return {
    bloques: bloques,
    metadata: metadata,
    enlaces: enlaces,
    markdown: encabezado + resultado.trim() + seccionEnlaces + fuente
  };
}

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  if (mensaje.accion === 'extraerMarkdown') {
    const resultado = extraerMarkdown(document);
    responder({
      markdown: resultado.markdown,
      bloques: resultado.bloques,
      metadata: resultado.metadata,
      enlaces: resultado.enlaces
    });
  }
});
