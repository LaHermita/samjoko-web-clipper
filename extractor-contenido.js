chrome.runtime.onMessage.addListener(function(mensaje, remitente, responder) {
  if (mensaje.accion === 'extraerMarkdown') {
    var resultado = SamjokoExtraccion.extraer(document);
    responder({
      markdown: resultado.markdown,
      bloques: resultado.bloques,
      metadata: resultado.metadata,
      enlaces: resultado.enlaces
    });
  }
});
