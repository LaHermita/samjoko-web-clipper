---
version: 1.1
fecha: 2026-05-20
estado: ACTIVO
descripcion: Guía de estilo y nomenclatura para el código del proyecto
---

# GUIA - CODING GUIDELINES

## Nomenclatura (Castellano descriptivo)

Todas las identificaciones en el código deben estar escritas en Castellano y ser claras y explícitas sobre su propósito.

| Elemento | Convención | Ejemplos |
|----------|------------|----------|
| Variables y parámetros | `camelCase` | `numeroDeIntentos`, `datosUsuario` |
| Funciones / Métodos | `camelCase` (acción/verbo) | `calcularTotal()`, `obtenerDatosCliente()` |
| Clases / Tipos / Interfaces | `PascalCase` | `GestorDeArchivos`, `InterfazPedido` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `MAXIMO_INTENTOS_LOGIN`, `PI_APROXIMADO` |
| Ficheros y carpetas | `kebab-case` | `gestor-datos.js`, `componentes-ui/` |

### Reglas adicionales

- **Evitar abreviaturas:** salvo universalmente reconocidas (ej. HTTP, URL), escribe la palabra completa. En lugar de `datCli`, usa `datosCliente`.
- **Booleanos:** deben comenzar con verbos que impliquen pregunta o estado (ej. `esValido`, `tienePermiso`, `debeActualizar`).
- **Nombres de archivos de documentación:** usar prefijos según `AGENTS.md` (`GUIA - `, `REF - `, `DOC - `).

## Scripts de desarrollo

Los scripts auxiliares viven en `scripts-devel/`. Ver [`REF - Scripts Devel.md`](REF%20-%20Scripts%20Devel.md) para detalle de uso.
