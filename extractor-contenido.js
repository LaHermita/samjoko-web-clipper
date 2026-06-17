function convertirElementoAmarkdown(elemento) {
  const etiqueta = elemento.tagName.toLowerCase();

  if (etiqueta.startsWith('h') && etiqueta.length === 2) {
    const nivel = '#'.repeat(parseInt(etiqueta[1]));
    return `${nivel} ${elemento.textContent.trim()}`;
  }

  if (etiqueta === 'p') {
    return elemento.textContent.trim();
  }

  if (etiqueta === 'li') {
    const padre = elemento.closest('ol');
    if (padre) {
      const index = Array.from(padre.children).indexOf(elemento) + 1;
      return `${index}. ${elemento.textContent.trim()}`;
    }
    return `- ${elemento.textContent.trim()}`;
  }

  if (etiqueta === 'pre' || etiqueta === 'code') {
    const codigo = elemento.textContent.trim();
    return '```\n' + codigo + '\n```';
  }

  if (etiqueta === 'blockquote') {
    return `> ${elemento.textContent.trim()}`;
  }

  if (etiqueta === 'hr') {
    return '---';
  }

  return null;
}

function extraerEnlaces(elemento) {
  const enlaces = elemento.querySelectorAll('a[href]');
  if (enlaces.length === 0) return '';
  const lineas = [];
  enlaces.forEach((enlace, indice) => {
    const texto = enlace.textContent.trim();
    const href = enlace.getAttribute('href');
    if (texto && href && !href.startsWith('javascript:') && !href.startsWith('#')) {
      lineas.push(`${indice + 1}. [${texto}](${href})`);
    }
  });
  if (lineas.length === 0) return '';
  return '\n\n## Enlaces\n' + lineas.join('\n');
}

function extraerMarkdown() {
  const elementos = document.body.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, hr'
  );

  const lineas = [];
  let ultimaEtiqueta = '';

  for (const elemento of elementos) {
    if (elemento.closest('script, style, nav, footer, header, aside')) continue;

    const resultado = convertirElementoAmarkdown(elemento);

    if (resultado === null) continue;

    if (ultimaEtiqueta.startsWith('h') || ultimaEtiqueta === 'hr' || ultimaEtiqueta === 'pre') {
      lineas.push('');
    } else if (etiquetaEsSeparador(ultimaEtiqueta, elemento.tagName.toLowerCase())) {
      lineas.push('');
    }

    lineas.push(resultado);

    if (elemento.tagName.toLowerCase().startsWith('h')) {
      lineas.push('');
    }

    ultimaEtiqueta = elemento.tagName.toLowerCase();
  }

  let markdown = lineas.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  markdown += extraerEnlaces(document.body);

  const titulo = document.title;
  if (titulo) {
    markdown = `# ${titulo}\n\n${markdown}`;
  }

  const url = window.location.href;
  markdown += `\n\n---\n*Fuente: [${url}](${url})*`;

  return markdown;
}

function etiquetaEsSeparador(anterior, actual) {
  if (!anterior) return false;
  const grupoAnterior = obtenerGrupo(anterior);
  const grupoActual = obtenerGrupo(actual);
  return grupoAnterior !== grupoActual;
}

function obtenerGrupo(etiqueta) {
  if (etiqueta.startsWith('h')) return 'heading';
  if (etiqueta === 'p') return 'texto';
  if (etiqueta === 'li') return 'lista';
  if (etiqueta === 'pre' || etiqueta === 'code') return 'codigo';
  if (etiqueta === 'blockquote') return 'cita';
  if (etiqueta === 'hr') return 'separador';
  return 'otro';
}

chrome.runtime.onMessage.addListener((peticion, remitente, responder) => {
  if (peticion.accion === 'extraerMarkdown') {
    const markdown = extraerMarkdown();
    responder({ markdown: markdown });
  }
  return true;
});
