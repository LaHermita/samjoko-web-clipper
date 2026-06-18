function colapsarEspacios(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

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

function extraerEnlaces(documento) {
  const enlaces = Array.from(documento.querySelectorAll('a[href]'));
  const enlacesUtiles = enlaces.filter(a => {
    const href = a.getAttribute('href');
    return href && !href.startsWith('javascript:') && !href.startsWith('#');
  });
  return enlacesUtiles.map(a => `- [${a.textContent.trim()}](${a.href})`).join('\n');
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

  const titulo = documento.title
    ? documento.title.replace(/\s*[-–|]\s*.*$/, '').trim()
    : chrome.i18n.getMessage('textoSinTitulo');

  return {
    titulo: titulo,
    url: documento.URL,
    autor: obtenerMeta(['autor', 'article:author', 'twitter:creator']),
    fecha: obtenerMeta(['date', 'article:published_time', 'dc.date', 'citation_date']),
    etiquetas: obtenerMetaMultiple('keywords').flatMap(k =>
      k.split(',').map(t => t.trim()).filter(Boolean)
    )
  };
}

function extraerMarkdown(documento) {
  const elementos = Array.from(documento.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, ul, ol, pre, code, blockquote, table'
  ));

  const elementosFiltrados = elementos.filter(elemento =>
    !elemento.closest('script, style, nav, footer, header, aside')
  );

  const metadata = extraerMetadata(documento);
  const bloques = [];
  let resultado = '';

  for (const elemento of elementosFiltrados) {
    const etiqueta = elemento.tagName.toLowerCase();
    const grupoActual = obtenerGrupo(etiqueta);

    const md = convertirElementoAmarkdown(elemento);
    if (!md) continue;

    const textoPlano = elemento.textContent;
    if (esTextoVacio(textoPlano)) continue;

    resultado += md + '\n\n';

    const bloque = { tipo: grupoActual, texto: md };

    if (etiqueta.startsWith('h') && etiqueta.length === 2) {
      bloque.contenido = colapsarEspacios(textoPlano);
      bloque.nivel = parseInt(etiqueta[1]);
    } else if (etiqueta === 'ul' || etiqueta === 'ol') {
      const items = Array.from(elemento.children).filter(function (li) { return li.tagName === 'LI'; });
      bloque.contenido = items.map(function (li) { return colapsarEspacios(li.textContent); });
      bloque.ordenada = etiqueta === 'ol';
    } else {
      bloque.contenido = colapsarEspacios(textoPlano);
    }

    bloques.push(bloque);
  }

  const encabezado = `# ${metadata.titulo}\n\n`;
  const enlaces = extraerEnlaces(documento);
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
