// Fixtures HTML → Markdown del harness de regresión (fases 5.9, 5.10 y 5.13).
//
// Campos:
//   nombre    — identificador corto del caso.
//   titulo    — <title> del documento (acaba siendo el H1 del Markdown).
//   urlOrigen — URL del pie «*Fuente: ...*». Evita URLs relativas: limpiarUrl()
//               las resolvería contra el origen de la página de pruebas.
//   cuerpo    — marcado dentro de <body>, sin <html> ni <head>.
//   esperado  — Markdown exacto que debe producir SamjokoExtraccion.extraer().
//               Se genera con ejecutor-fixtures.html?modo=generar y se revisa
//               a mano antes de darlo por bueno.
//
// El ejecutor extrae CADA fixture dos veces: además de comparar con «esperado»
// verifica que la segunda captura sea idéntica (regresión B2) y que no quede
// ningún atributo data-bloque-procesado en el DOM del documento.
window.FIXTURES = [
  {
    nombre: 'formato-inline-basico',
    titulo: 'Formato inline basico',
    urlOrigen: 'https://ejemplo.com/formato',
    cuerpo: `
<article>
  <h1>Formato inline basico</h1>
  <p>Texto con <strong>negrita</strong>, <em>cursiva</em>, <code>funcion()</code> y un <a href="https://ejemplo.com/doc">enlace</a>.</p>
  <p>Indices: H<sub>2</sub>O y potencias: 2<sup>10</sup>.</p>
  <p><b>Negrita con b</b> e <i>cursiva con i</i>.</p>
</article>`,
    esperado: [
      "# Formato inline basico",
      "",
      "# Formato inline basico",
      "",
      "Texto con **negrita**, *cursiva*, `funcion()` y un [enlace](https://ejemplo.com/doc).",
      "",
      "Indices: H~2~O y potencias: 2^10^.",
      "",
      "**Negrita con b** e *cursiva con i*.",
      "",
      "## Enlaces",
      "",
      "- [enlace](https://ejemplo.com/doc)",
      "",
      "---",
      "*Fuente: https://ejemplo.com/formato*"
      ].join("\n")
  },
  {
    nombre: 'formato-anidado',
    titulo: 'Formato anidado',
    urlOrigen: 'https://ejemplo.com/anidado',
    cuerpo: `
<article>
  <h2>Formato anidado</h2>
  <p>Un <a href="https://ejemplo.com/x"><strong>enlace en negrita</strong></a> y <strong>negrita con <em>cursiva dentro</em></strong>.</p>
  <p>Codigo dentro de <a href="https://ejemplo.com/api"><code>miModulo.ver()</code></a> y <em>cursiva con codigo entre comillas simples</em>.</p>
</article>`,
    esperado: [
      "# Formato anidado",
      "",
      "# Formato anidado",
      "",
      "Un [**enlace en negrita**](https://ejemplo.com/x) y **negrita con *cursiva dentro***.",
      "",
      "Codigo dentro de [`miModulo.ver()`](https://ejemplo.com/api) y *cursiva con codigo entre comillas simples*.",
      "",
      "## Enlaces",
      "",
      "- [enlace en negrita](https://ejemplo.com/x)",
      "- [miModulo.ver()](https://ejemplo.com/api)",
      "",
      "---",
      "*Fuente: https://ejemplo.com/anidado*"
      ].join("\n")
  },
  {
    nombre: 'codigo-inline-vs-bloque',
    titulo: 'Codigo inline y bloque',
    urlOrigen: 'https://ejemplo.com/codigo',
    cuerpo: `
<article>
  <h2>Codigo inline y bloque</h2>
  <p>La funcion <code>calcularTotal()</code> devuelve el total.</p>
  <pre class="language-js"><code>const total = calcularTotal();</code></pre>
  <p>Otro parrafo con <code>otraFuncion()</code> dentro.</p>
</article>`,
    esperado: [
      "# Codigo inline y bloque",
      "",
      "# Codigo inline y bloque",
      "",
      "La funcion `calcularTotal()` devuelve el total.",
      "",
      "```js",
      "const total = calcularTotal();",
      "```",
      "",
      "Otro parrafo con `otraFuncion()` dentro.",
      "",
      "---",
      "*Fuente: https://ejemplo.com/codigo*"
      ].join("\n")
  },
  {
    nombre: 'enlaces-y-limpieza',
    titulo: 'Enlaces y limpieza',
    urlOrigen: 'https://ejemplo.com/enlaces?utm_source=harness&utm_medium=test',
    cuerpo: `
<article>
  <h2>Enlaces</h2>
  <p>Este parrafo tiene texto suficiente como para que el filtro de densidad lo deje pasar, y aun asi enlaza la <a href="https://ejemplo.com/guia?utm_source=mail&amp;utm_medium=email">guia completa</a> del sitio junto a otros recursos interesantes.</p>
  <p>Tambien aparece un <a href="https://ejemplo.com/docs#seccion">enlace con ancla</a>, otro interno <a href="https://ejemplo.com/otro">otro recurso</a> y una referencia tal cual <a href="#top">inicio</a>.</p>
</article>`,
    esperado: [
      "# Enlaces y limpieza",
      "",
      "# Enlaces",
      "",
      "Este parrafo tiene texto suficiente como para que el filtro de densidad lo deje pasar, y aun asi enlaza la [guia completa](https://ejemplo.com/guia) del sitio junto a otros recursos interesantes.",
      "",
      "Tambien aparece un [enlace con ancla](https://ejemplo.com/docs#seccion), otro interno [otro recurso](https://ejemplo.com/otro) y una referencia tal cual inicio.",
      "",
      "## Enlaces",
      "",
      "- [guia completa](https://ejemplo.com/guia)",
      "- [enlace con ancla](https://ejemplo.com/docs#seccion)",
      "- [otro recurso](https://ejemplo.com/otro)",
      "",
      "---",
      "*Fuente: https://ejemplo.com/enlaces*"
      ].join("\n")
  },
  {
    nombre: 'citas-anidadas',
    titulo: 'Citas anidadas',
    urlOrigen: 'https://ejemplo.com/citas',
    cuerpo: `
<article>
  <h2>Citas anidadas</h2>
  <blockquote>
    <p>Idea principal con <em>enfasis</em>.</p>
    <blockquote>
      <p>Respuesta anidada.</p>
    </blockquote>
    <p>Cierre de la cita.</p>
  </blockquote>
  <p>Parrafo posterior a la cita.</p>
</article>`,
    esperado: [
      "# Citas anidadas",
      "",
      "# Citas anidadas",
      "",
      "> Idea principal con *enfasis*.",
      "> > Respuesta anidada.",
      "> Cierre de la cita.",
      "",
      "Parrafo posterior a la cita.",
      "",
      "---",
      "*Fuente: https://ejemplo.com/citas*"
      ].join("\n")
  },
  {
    nombre: 'lista-en-cita',
    titulo: 'Listas y citas',
    urlOrigen: 'https://ejemplo.com/listas',
    cuerpo: `
<article>
  <blockquote>
    <p>Checklist:</p>
    <ul><li>Primer punto</li><li>Segundo punto</li></ul>
  </blockquote>
  <ul>
    <li>Item uno</li>
    <li>Item dos con <code>codigo</code></li>
  </ul>
  <ol><li>Paso A</li><li>Paso B</li></ol>
</article>`,
    esperado: [
      "# Listas y citas",
      "",
      "> Checklist:",
      "> - Primer punto",
      "> - Segundo punto",
      "",
      "- Item uno",
      "- Item dos con `codigo`",
      "",
      "1. Paso A",
      "2. Paso B",
      "",
      "---",
      "*Fuente: https://ejemplo.com/listas*"
      ].join("\n")
  },
  {
    nombre: 'figura-con-caption',
    titulo: 'Figuras e imagenes',
    urlOrigen: 'https://ejemplo.com/figuras',
    cuerpo: `
<article>
  <figure>
    <img src="https://ejemplo.com/imagen.png" alt="Diagrama">
    <figcaption>Pie del diagrama</figcaption>
  </figure>
  <p>Texto con imagen dentro: <img src="https://ejemplo.com/icono.png" alt="Icono"> al final.</p>
</article>`,
    esperado: [
      "# Figuras e imagenes",
      "",
      "![Diagrama](https://ejemplo.com/imagen.png)",
      "",
      "*Pie del diagrama*",
      "",
      "Texto con imagen dentro: ![Icono](https://ejemplo.com/icono.png) al final.",
      "",
      "---",
      "*Fuente: https://ejemplo.com/figuras*"
      ].join("\n")
  },
  {
    nombre: 'parrafo-alta-densidad',
    titulo: 'Filtro de densidad de enlaces',
    urlOrigen: 'https://ejemplo.com/densidad',
    cuerpo: `
<article>
  <h2>Filtro de densidad de enlaces</h2>
  <p>Mira la <a href="https://ejemplo.com/a">guia</a> y la <a href="https://ejemplo.com/b">documentacion</a>.</p>
  <p>Este parrafo normal si debe aparecer en la captura.</p>
</article>`,
    esperado: [
      "# Filtro de densidad de enlaces",
      "",
      "# Filtro de densidad de enlaces",
      "",
      "Este parrafo normal si debe aparecer en la captura.",
      "",
      "---",
      "*Fuente: https://ejemplo.com/densidad*"
      ].join("\n")
  },
  {
    nombre: 'estructura-mixta',
    titulo: 'Articulo completo',
    urlOrigen: 'https://ejemplo.com/mixto',
    cuerpo: `
<article>
  <h2>Articulo completo</h2>
  <p>Introduccion con <strong>destacado</strong>.</p>
  <table>
    <thead><tr><th>Columna A</th><th>Columna B</th></tr></thead>
    <tbody>
      <tr><td rowspan="2">Celda fusionada</td><td>1</td></tr>
      <tr><td>2</td></tr>
    </tbody>
  </table>
  <ul><li>Punto de la lista</li></ul>
  <blockquote><p>Cita breve.</p></blockquote>
  <pre class="language-js"><code>console.log('hola');</code></pre>
  <figure><img src="https://ejemplo.com/esquema.png" alt="Esquema"><figcaption>Pie del esquema</figcaption></figure>
  <p>Conclusion.</p>
</article>`,
    esperado: [
      "# Articulo completo",
      "",
      "# Articulo completo",
      "",
      "Introduccion con **destacado**.",
      "",
      "| Columna A | Columna B |",
      "| --- | --- |",
      "| Celda fusionada | 1 |",
      "|  | 2 |",
      "",
      "- Punto de la lista",
      "",
      "> Cita breve.",
      "",
      "```js",
      "console.log('hola');",
      "```",
      "",
      "![Esquema](https://ejemplo.com/esquema.png)",
      "",
      "*Pie del esquema*",
      "",
      "Conclusion.",
      "",
      "---",
      "*Fuente: https://ejemplo.com/mixto*"
      ].join("\n")
  },
  {
    nombre: 'formulas-matematicas',
    titulo: 'Formulas matematicas',
    urlOrigen: 'https://ejemplo.com/formulas',
    cuerpo: `
<article>
  <h1>Formulas matematicas</h1>
  <p>La funcion gaussiana se define como <span class="mwe-math-element mwe-math-element-inline" data-mw='{"name":"math","attrs":{},"body":{"extsrc":"e^{-x^2}"}}'><span class="mwe-math-mathml-inline mwe-math-mathml-a11y" style="display: none;"><math xmlns="http://www.w3.org/1998/Math/MathML" alttext="{\\displaystyle e^{-x^{2}}}">
  <semantics>
    <mrow><mi>e</mi></mrow>
    <annotation encoding="application/x-tex">{\\displaystyle e^{-x^{2}}}</annotation>
  </semantics>
</math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/abc" class="mwe-math-fallback-image-inline" alt="{\\displaystyle e^{-x^{2}}}"/></span> y verifica <span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi>a</mi></mrow><annotation encoding="application/x-tex">a^{2}+b^{2}=c^{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true">a2+b2=c2</span></span>.</p>
  <p>Propiedad util: <span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline" style="display: none;"><math alttext="{\\displaystyle f(x+y)=f(x)\\,f(y)}"><semantics><annotation encoding="application/x-tex">{\\displaystyle f(x+y)=f(x)\\,f(y)}</annotation></semantics></math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/def" class="mwe-math-fallback-image-inline" alt="{\\displaystyle f(x+y)=f(x)\\,f(y)}"/></span> para toda x.</p>
  <p><span class="mwe-math-element mwe-math-element-inline"><span class="mwe-math-mathml-inline" style="display: none;"><math><semantics><annotation encoding="application/x-tex">{\\displaystyle \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}}</annotation></semantics></math></span><img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/ghi" class="mwe-math-fallback-image-inline" alt="{\\displaystyle \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}}"/></span></p>
  <div><img class="mwe-math-fallback-image-display" src="https://wikimedia.org/api/rest_v1/media/math/render/svg/jkl" alt="{\\displaystyle a+b=c}"></div>
</article>`,
    esperado: [
      "# Formulas matematicas",
      "",
      "# Formulas matematicas",
      "",
      "La funcion gaussiana se define como $e^{-x^2}$ y verifica $a^{2}+b^{2}=c^{2}$.",
      "",
      "Propiedad util: $f(x+y)=f(x)\\,f(y)$ para toda x.",
      "",
      "$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$",
      "",
      "$$a+b=c$$",
      "",
      "---",
      "*Fuente: https://ejemplo.com/formulas*"
      ].join("\n")
  },
  {
    nombre: 'imagenes-lazy-y-embeds',
    titulo: 'Imagenes, lazy y embeds',
    urlOrigen: 'https://ejemplo.com/articulo/imagenes',
    cuerpo: `
<article>
  <h1>Imagenes, lazy y embeds</h1>
  <p>Relativa: <img src="/subida/foto.png" alt="Foto"> y lazy: <img src="data:image/gif;base64,R0lGOD" data-src="https://cdn.ejemplo.com/real.jpg" alt="Diferida">.</p>
  <p>Antes <img src="https://tracker.ejemplo.com/collect/pixel.gif" width="1" height="1" alt=""> desaparece la decorativa.</p>
  <p>Sin alt <img src="https://ejemplo.com/banner.gif" alt=""> y con srcset <img srcset="https://ejemplo.com/grande.png 2x, https://ejemplo.com/normal.png 1x" alt="Srcset">.</p>
  <figure>
    <img data-lazy-src="https://ejemplo.com/figura.png" alt="Figura">
    <figcaption>Pie con <a href="../doc/enlace">enlace</a></figcaption>
  </figure>
  <iframe src="https://www.youtube.com/embed/abc123" title="Video"></iframe>
</article>`,
    esperado: [
      "# Imagenes, lazy y embeds",
      "",
      "# Imagenes, lazy y embeds",
      "",
      "Relativa: ![Foto](https://ejemplo.com/subida/foto.png) y lazy: ![Diferida](https://cdn.ejemplo.com/real.jpg).",
      "",
      "Antes desaparece la decorativa.",
      "",
      "Sin alt y con srcset ![Srcset](https://ejemplo.com/grande.png).",
      "",
      "![Figura](https://ejemplo.com/figura.png)",
      "",
      "*Pie con [enlace](https://ejemplo.com/doc/enlace)*",
      "",
      "> [!embed] https://www.youtube.com/embed/abc123",
      "",
      "## Enlaces",
      "",
      "- [enlace](https://ejemplo.com/doc/enlace)",
      "",
      "---",
      "*Fuente: https://ejemplo.com/articulo/imagenes*"
      ].join("\n")
  }
];
