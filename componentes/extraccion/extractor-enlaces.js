(function() {
  if (typeof SamjokoExtraccion === 'undefined') return;

  SamjokoExtraccion.registrarRecolectorEnlaces({
    nombre: 'enlaces-globales',
    recolectar: function(documento, bloques, elementosFiltrados) {
      return [];
    }
  });
})();
