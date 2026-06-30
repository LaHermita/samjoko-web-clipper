if (typeof window.traducir !== 'function') { window.traducir = function (c) { return c; }; }

var CLAVE_ONBOARDING = 'onboardingCompletado';

var PASOS = [
  {
    icono: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>',
    tituloClave: 'onboardingPaso1Titulo',
    textoClave: 'onboardingPaso1Texto'
  },
  {
    icono: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>',
    tituloClave: 'onboardingPaso2Titulo',
    textoClave: 'onboardingPaso2Texto'
  },
  {
    icono: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>',
    tituloClave: 'onboardingPaso3Titulo',
    textoClave: 'onboardingPaso3Texto'
  }
];

function crearOnboarding() {
  var contenedor = document.getElementById('contenedor');
  var zonaToast = document.getElementById('zonaToast');
  if (contenedor) contenedor.style.display = 'none';
  if (zonaToast) zonaToast.style.display = 'none';

  var elementoRaiz = document.createElement('div');
  elementoRaiz.id = 'onboardingRaiz';
  elementoRaiz.setAttribute('role', 'dialog');
  elementoRaiz.setAttribute('aria-modal', 'true');
  elementoRaiz.setAttribute('aria-label', traducir('onboardingTitulo'));
  elementoRaiz.setAttribute('aria-describedby', 'onboardingPasoDescripcion');

  var pasoActual = 0;

  var plantilla =
    '<h2 id="onboardingTituloEl"></h2>' +
    '<div id="onboardingPaso">' +
      '<div id="onboardingIcono"></div>' +
      '<h3 id="onboardingPasoSubtitulo"></h3>' +
      '<p id="onboardingPasoDescripcion"></p>' +
    '</div>' +
    '<div id="onboardingPasos"></div>' +
    '<div id="onboardingNavegacion">' +
      '<button id="onboardingAnterior"></button>' +
      '<button id="onboardingSiguiente"></button>' +
    '</div>' +
    '<button id="onboardingOmitir"></button>';

  elementoRaiz.innerHTML = plantilla;
  document.body.appendChild(elementoRaiz);

  var tituloElemento = document.getElementById('onboardingTituloEl');
  var iconoElemento = document.getElementById('onboardingIcono');
  var subtituloElemento = document.getElementById('onboardingPasoSubtitulo');
  var descripcionElemento = document.getElementById('onboardingPasoDescripcion');
  var pasosElemento = document.getElementById('onboardingPasos');
  var anteriorBoton = document.getElementById('onboardingAnterior');
  var siguienteBoton = document.getElementById('onboardingSiguiente');
  var omitirBoton = document.getElementById('onboardingOmitir');


  function renderizar() {
    var paso = PASOS[pasoActual];

    tituloElemento.textContent = traducir('onboardingTitulo');
    iconoElemento.innerHTML = paso.icono;
    subtituloElemento.textContent = traducir(paso.tituloClave);
    descripcionElemento.textContent = traducir(paso.textoClave);

    pasosElemento.innerHTML = '';
    for (var i = 0; i < PASOS.length; i++) {
      var punto = document.createElement('button');
      punto.className = 'punto-paso' + (i === pasoActual ? ' activo' : '');
      punto.setAttribute('aria-label', traducir('onboardingPasoActual', [String(i + 1), String(PASOS.length)]));
      punto.addEventListener('click', function (indice) {
        return function () {
          pasoActual = indice;
          renderizar();
        };
      }(i));
      pasosElemento.appendChild(punto);
    }

    if (pasoActual === 0) {
      anteriorBoton.style.display = 'none';
    } else {
      anteriorBoton.style.display = '';
    }
    anteriorBoton.textContent = traducir('onboardingBotonAnterior');

    if (pasoActual === PASOS.length - 1) {
      siguienteBoton.id = 'onboardingFinalizar';
      siguienteBoton.textContent = traducir('onboardingBotonEmpezar');
    } else {
      siguienteBoton.id = 'onboardingSiguiente';
      siguienteBoton.textContent = traducir('onboardingBotonSiguiente');
    }

    omitirBoton.textContent = traducir('botonCancelar');
  }

  anteriorBoton.addEventListener('click', function () {
    if (pasoActual > 0) {
      pasoActual--;
      renderizar();
    }
  });

  siguienteBoton.addEventListener('click', function () {
    if (pasoActual < PASOS.length - 1) {
      pasoActual++;
      renderizar();
    } else {
      completarOnboarding();
    }
  });

  omitirBoton.addEventListener('click', completarOnboarding);

  renderizar();

  siguienteBoton.focus();
}

function completarOnboarding() {
  chrome.storage.local.set({ [CLAVE_ONBOARDING]: true }, function () {
    location.reload();
  });
}

function necesitaOnboarding() {
  return new Promise(function (resolver) {
    chrome.storage.local.get(CLAVE_ONBOARDING, function (resultado) {
      resolver(!resultado[CLAVE_ONBOARDING]);
    });
  });
}
