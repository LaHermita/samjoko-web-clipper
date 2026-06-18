function convertirElementoAmarkdown(elemento) {
  const etiqueta = elemento.tagName.toLowerCase();

  if (etiqueta.startsWith('h') && etiqueta.length === 2) {
    const nivel = '#'.repeat(parseInt(etiqueta[1]));
    return `${nivel} ${elemento.textContent.trim()}`;
  }

  if (etiqueta === 'p') {
    return elemento.textContent.trim();
  }

  if (etiqueta === 'blockquote') {
    return elemento.textContent.trim().split('\n').map(linea => `> ${linea}`).join('\n');
  }

  if (etiqueta === 'pre' || etiqueta === 'code') {
    return '```\n' + elemento.textContent.trim() + '\n```';
  }

  if (etiqueta === 'ul' || etiqueta === 'ol') {
    const items = Array.from(elemento.children).filter(li => li.tagName === 'LI');
    return items.map((li, idx) => {
      const prefijo = etiqueta === 'ol' ? `${idx + 1}. ` : '- ';
      return `${prefijo}${li.textContent.trim()}`;
    }).join('\n');
  }

  return elemento.textContent.trim();
}

function extraerEnlaces(documento) {
  const enlaces = Array.from(documento.querySelectorAll('a[href]'));
  const enlacesUtiles = enlaces.filter(a => {
    const href = a.getAttribute('href');
    return href && !href.startsWith('javascript:') && !href.startsWith('#');
  });
  return enlacesUtiles.map(a => `- [${a.textContent.trim()}](${a.href})`).join('\n');
}

function etiquetaEsSeparador(etiqueta) {
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'table', 'ul', 'ol', 'blockquote', 'pre'].includes(etiqueta);
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
  let grupoAnterior = '';

  for (const elemento of elementosFiltrados) {
    const etiqueta = elemento.tagName.toLowerCase();
    const grupoActual = obtenerGrupo(etiqueta);

    if (grupoAnterior && grupoActual !== grupoAnterior) {
      resultado += '\n';
    }

    const md = convertirElementoAmarkdown(elemento);
    if (!md) continue;

    resultado += md + '\n\n';
    grupoAnterior = grupoActual;

    const bloque = { tipo: grupoActual, texto: md };
    const textoPlano = elemento.textContent.trim();

    if (etiqueta.startsWith('h') && etiqueta.length === 2) {
      bloque.contenido = textoPlano;
      bloque.nivel = parseInt(etiqueta[1]);
    } else if (etiqueta === 'ul' || etiqueta === 'ol') {
      const items = Array.from(elemento.children).filter(li => li.tagName === 'LI');
      bloque.contenido = items.map(li => li.textContent.trim());
      bloque.ordenada = etiqueta === 'ol';
    } else {
      bloque.contenido = textoPlano;
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
    markdown: encabezado + resultado.trim() + seccionEnlaces + fuente
  };
}

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  if (mensaje.accion === 'extraerMarkdown') {
    const resultado = extraerMarkdown(document);
    responder({
      markdown: resultado.markdown,
      bloques: resultado.bloques,
      metadata: resultado.metadata
    });
  }
});
