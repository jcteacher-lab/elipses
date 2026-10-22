# Analizador Interactivo de Elipses

Herramienta didáctica e interactiva para el estudio de la elipse en su forma canónica, implementada con HTML5, CSS3 y JavaScript puro, sin dependencias externas.

$$
\frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1
$$

---

## Índice

1. [Descripción general](#1-descripción-general)
2. [Objetivos](#2-objetivos)
3. [Fundamento matemático](#3-fundamento-matemático)
   - 3.1 [Forma canónica y forma general](#31-forma-canónica-y-forma-general)
   - 3.2 [Interpretación de los parámetros](#32-interpretación-de-los-parámetros)
   - 3.3 [Elementos notables de la elipse](#33-elementos-notables-de-la-elipse)
   - 3.4 [Fórmulas utilizadas](#34-fórmulas-utilizadas)
4. [Características de la aplicación](#4-características-de-la-aplicación)
5. [Guía de uso](#5-guía-de-uso)
   - 5.1 [Sintaxis admitida](#51-sintaxis-admitida)
   - 5.2 [Controles interactivos](#52-controles-interactivos)
   - 5.3 [Ejemplo canónico](#53-ejemplo-canónico)
   - 5.4 [Mensajes de error](#54-mensajes-de-error)
6. [Arquitectura del proyecto](#6-arquitectura-del-proyecto)
7. [Interfaz y salidas visuales](#7-interfaz-y-salidas-visuales)
8. [Instalación y ejecución](#8-instalación-y-ejecución)
9. [Compatibilidad](#9-compatibilidad)
10. [Limitaciones conocidas](#10-limitaciones-conocidas)
11. [Posibles extensiones](#11-posibles-extensiones)
12. [Referencias](#12-referencias)
13. [Licencia](#13-licencia)

---

## 1. Descripción general

**Analizador Interactivo de Elipses** es una aplicación web autocontenida que permite introducir la ecuación de una elipse con ejes paralelos a los ejes coordenados, en su **forma canónica** o en su **forma general**, y obtener de forma inmediata y visual sus elementos geométricos: centro, semiejes, orientación, distancia focal, excentricidad, focos, vértices, covértices, lado recto con sus extremos, directrices y tabla paramétrica.

El motor interno **interpreta expresiones algebraicas en $x$ e $y$ de grado $\le 2$**, completa cuadrados para llevar cualquier ecuación general a la forma canónica y detecta casos especiales: las **circunferencias** ($a = b$) se identifican como tales, y las **hipérbolas** (coeficientes de $x^2$ e $y^2$ con signo opuesto) se rechazan con un mensaje explicativo.

El proyecto está pensado como recurso pedagógico para **geometría analítica** y **secciones cónicas** en educación media superior y universitaria introductoria.

---

## 2. Objetivos

- **Comprender** la relación entre la forma canónica y la geometría de la elipse.
- **Visualizar** el efecto de los parámetros $a$, $b$, $h$, $k$ sobre el centro, la forma y la orientación de la cónica.
- **Identificar** los elementos notables (focos, vértices, covértices, directrices, lado recto) y sus coordenadas.
- **Relacionar** la gráfica con la tabla paramétrica $x = h + a\cos\theta$, $y = k + b\sin\theta$.
- **Servir** como material complementario en clases presenciales o virtuales, tareas dirigidas y autoestudio.

---

## 3. Fundamento matemático

### 3.1 Forma canónica y forma general

Una elipse con ejes paralelos a los ejes coordenados puede escribirse de dos maneras equivalentes.

**Forma canónica (centro desplazado):**

$$
\frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1, \qquad a,b > 0
$$

**Forma general (desarrollada):**

$$
Ax^2 + By^2 + Cx + Dy + F = 0, \qquad A \cdot B > 0
$$

La conversión se logra **completando cuadrados**:

$$
A\left(x + \frac{C}{2A}\right)^2 + B\left(y + \frac{D}{2B}\right)^2 = \frac{C^2}{4A} + \frac{D^2}{4B} - F = R
$$

de donde, si $R > 0$:

$$
h = -\frac{C}{2A}, \quad k = -\frac{D}{2B}, \quad a = \sqrt{\frac{R}{A}}, \quad b = \sqrt{\frac{R}{B}}
$$

La aplicación implementa esta ruta: toda ecuación con $A$ y $B$ del mismo signo y $R > 0$ se transforma a la forma canónica. Si $A$ y $B$ son negativos, se multiplica la ecuación por $-1$ antes de operar.

### 3.2 Interpretación de los parámetros

| Parámetro | Efecto geométrico |
|-----------|-------------------|
| $h$ | **Desplazamiento horizontal** del centro. $(x-3)$ desplaza 3 unidades a la derecha; $(x+2)$ desplaza 2 a la izquierda. |
| $k$ | **Desplazamiento vertical** del centro. $(y-1)$ desplaza 1 unidad hacia arriba; $(y+4)$ desplaza 4 hacia abajo. |
| $a$ | **Semieje horizontal**. |
| $b$ | **Semieje vertical**. |
| $a = b$ | **Circunferencia** de radio $a$. |
| $a > b$ | **Eje mayor horizontal**, focos sobre $y = k$. |
| $a < b$ | **Eje mayor vertical**, focos sobre $x = h$. |

### 3.3 Elementos notables de la elipse

Sea $C(h,k)$ el centro, $m = \max(a,b)$ el semieje mayor y $n = \min(a,b)$ el semieje menor.

| Elemento | Expresión |
|----------|-----------|
| **Distancia focal** | $c = \sqrt{m^2 - n^2}$ |
| **Excentricidad** | $e = \dfrac{c}{m} \in [0,1)$ |
| **Focos** | $F_{1,2} = C \pm (c,0)$ si el eje mayor es horizontal; $C \pm (0,c)$ si es vertical |
| **Vértices** | $V_{1,2} = C \pm (m,0)$ o $C \pm (0,m)$ |
| **Covértices** | $B_{1,2} = C \pm (0,n)$ o $C \pm (n,0)$ |
| **Lado recto (en cada foco)** | longitud $\dfrac{2n^2}{m}$; sus extremos están a $\dfrac{n^2}{m}$ del foco, sobre la perpendicular al eje mayor |
| **Directrices** | $x = h \pm \dfrac{m^2}{c}$ o $y = k \pm \dfrac{m^2}{c}$ (solo si $c > 0$) |

### 3.4 Fórmulas utilizadas

**Relación fundamental:**

$$
c^2 = m^2 - n^2
$$

**Propiedad focal.** Para todo punto $P$ de la elipse:

$$
d(P, F_1) + d(P, F_2) = 2m
$$

**Ecuación paramétrica** (base de la tabla y del trazado):

$$
x(\theta) = h + a\cos\theta, \qquad y(\theta) = k + b\sin\theta
$$

**Complemento teórico (no implementado en la aplicación).** Ecuación polar respecto a un foco, útil en mecánica celeste:

$$
r(\theta) = \frac{m(1 - e^2)}{1 + e\cos\theta}
$$

---

## 4. Características de la aplicación

- ✅ Entrada en **forma canónica** y en **forma general**.
- ✅ **Analizador algebraico**: paréntesis, potencias enteras, fracciones (`1/2`, `x^2/25`), multiplicación implícita (`4x^2`), orden libre de términos, `²`, signos menos tipográficos (`−`, `–`, `—`), `·`/`×`/`*` como producto y coma decimal.
- ✅ **Completado de cuadrados** automático.
- ✅ Detección de **circunferencias** ($a=b$) y rechazo explicado de **hipérbolas** y de ecuaciones sin elipse real ($R \le 0$).
- ✅ **Gráfica** en `<canvas>` con zoom (rueda del ratón), desplazamiento (ratón o dedo, mediante Pointer Events) y rejilla adaptativa.
- ✅ **Auto-encuadre 1:1**: una circunferencia se dibuja como circunferencia.
- ✅ Centro, focos, vértices, covértices, ejes mayor y menor, lado recto en cada foco y directrices, con colores diferenciados.
- ✅ **Deslizadores** para $h$, $k$, $a$, $b$ con actualización en tiempo real.
- ✅ **Panel pedagógico** de la traslación horizontal y vertical.
- ✅ **Tabla paramétrica** con 12 valores de $\theta$ ($0^\circ$ a $330^\circ$, cada $30^\circ$).
- ✅ **Errores en pantalla** (`role="alert"`), sin `alert()` bloqueante.
- ✅ **Accesibilidad básica**: `<label for>` en controles, `aria-label` en el canvas y `:focus-visible`.
- ✅ **Redibujado eficiente** con `requestAnimationFrame` durante zoom y desplazamiento.
- ✅ **Sin dependencias**: HTML + CSS + JavaScript puro, sin servidor.

---

## 5. Guía de uso

### 5.1 Sintaxis admitida

| Entrada | Interpretación |
|---------|----------------|
| `(x-2)^2/16+(y-1)^2/9=1` | $\dfrac{(x-2)^2}{16}+\dfrac{(y-1)^2}{9}=1$ |
| `x^2/25+y^2/9=1` | $\dfrac{x^2}{25}+\dfrac{y^2}{9}=1$ |
| `(x+1)^2+(y-2)^2=4` | Circunferencia de centro $(-1,2)$ y radio $2$ |
| `x^2+y^2=1` | Circunferencia unitaria |
| `9x^2+16y^2-18x+64y-71=0` | Forma general, equivale a $h=1,\ k=-2,\ a=4,\ b=3$ |
| `4x^2+9y^2=36` | Coeficientes delante de $x^2$ y $y^2$ |
| `x^2/4+y^2/9=2` | Lado derecho distinto de 1 (se normaliza) |
| `(y-1)²/16+x²/4=1` | Eje mayor vertical, con `²` |

El analizador también acepta el término en $y$ antes que el de $x$, y un lado derecho con términos (se pasa todo al lado izquierdo).

### 5.2 Controles interactivos

| Acción | Efecto |
|--------|--------|
| **Escribir la ecuación + Enter** | Interpreta, valida y redibuja. |
| **Botón «Analizar elipse»** | Igual que Enter. |
| **Deslizadores $h, k, a, b$** | Modifican la elipse en tiempo real y reescriben la ecuación en forma canónica. |
| **Botón «Reajustar vista»** | Reencuadra la elipse manteniendo la proporción 1:1. |
| **Rueda del ratón sobre la gráfica** | Zoom centrado en el cursor. |
| **Arrastrar sobre la gráfica** | Desplazamiento libre (ratón o dedo). |
| **Campos «X mínimo / X máximo»** | Fijan el rango horizontal; el vertical se ajusta para mantener la proporción. Se actualizan al hacer zoom o desplazar. |

### 5.3 Ejemplo canónico

Al introducir

$$
\frac{(x-2)^2}{16} + \frac{(y-1)^2}{9} = 1
$$

la aplicación identifica $h = 2$, $k = 1$, $a = 4$, $b = 3$ y deduce:

- **Centro:** $C(2, 1)$
- **Orientación:** eje mayor horizontal
- **Semieje mayor:** $m = 4$; **semieje menor:** $n = 3$
- **Distancia focal:** $c = \sqrt{16 - 9} = \sqrt{7} \approx 2.646$
- **Excentricidad:** $e = \sqrt{7}/4 \approx 0.661$
- **Focos:** $F_1(2 - \sqrt{7},\, 1)$, $F_2(2 + \sqrt{7},\, 1)$
- **Vértices:** $V_1(-2, 1)$, $V_2(6, 1)$
- **Covértices:** $B_1(2, -2)$, $B_2(2, 4)$
- **Lado recto:** $2n^2/m = 18/4 = 4.5$ u (en cada foco)
- **Directrices:** $x = 2 \pm 16/\sqrt{7}$

### 5.4 Mensajes de error

| Situación | Mensaje (resumen) |
|-----------|-------------------|
| Campo vacío | Pide escribir una ecuación y muestra un ejemplo. |
| Sin `=` o con más de uno | La ecuación debe tener exactamente un signo «=». |
| Falta $x^2$ o $y^2$ | Deben aparecer un término en x² y otro en y². |
| Coeficientes de $x^2$ y $y^2$ con signo opuesto | Indica que es una hipérbola, no una elipse. |
| $R \le 0$ | No existe una elipse real con esos datos. |
| Aparece $xy$ o grado mayor que 2 | Solo se admiten x², y², x, y y constantes. |
| Paréntesis sin cerrar, carácter desconocido, exponente no entero o mayor que 4, división entre una expresión con variables | Mensaje específico en cada caso. |

---

## 6. Arquitectura del proyecto

El código está dividido en tres archivos independientes, que deben estar en la misma carpeta:

```text
elipse/
├── index.html    # Estructura y contenido semántico
├── styles.css    # Estilos, variables CSS y diseño responsivo
├── app.js        # Lógica: análisis algebraico, geometría, dibujo y eventos
└── README.md
```

### 6.1 `index.html`

Contiene la estructura de la página: panel de entrada, deslizadores, lienzo, paneles de resultados y tabla. Enlaza `styles.css` y carga `app.js` con `defer`, de modo que el DOM ya existe cuando el script se ejecuta. No contiene estilos ni scripts en línea.

### 6.2 `styles.css`

Define la paleta como variables CSS (`:root`), los componentes (paneles, tarjetas, deslizadores, tabla) y un punto de corte en `900px` que pasa el diseño a una columna.

### 6.3 `app.js`

Se organiza en secciones numeradas:

| Sección | Contenido |
|---------|-----------|
| 1. Utilidades | `fmt`, `sgn`, `niceStep`, `decimalsFor` (formato de números y rejilla). |
| 2. Analizador algebraico | `parsePolynomial` (descenso recursivo sobre polinomios en $x,y$) y `parseEllipse` (completado de cuadrados y validaciones). `eqText` genera el texto de la ecuación canónica. |
| 3. Estado y DOM | Estado `E = {h, k, a, b}`, estado de la vista `view`, constantes `COLORS` y `MARGIN`, y `plotArea()`. |
| 4. Geometría | `geom()` calcula focos, vértices, covértices, lado recto y directrices. |
| 5. Vista | `autoFitView()` y relación de aspecto. |
| 6. Dibujo | `draw()` y `scheduleDraw()`, que agrupa redibujados con `requestAnimationFrame`. |
| 7. Paneles | `renderPanels()` construye fórmula, interpretación, tarjetas, geometría y tabla. |
| 8. Acciones | `analyze()`, `updateFromSliders()` y `applyXRange()`. |
| 9. Eventos | Botones, teclado, deslizadores, rueda, Pointer Events y `resize`. |
| 10. Arranque | Sincroniza controles y ejecuta el primer análisis. |

### 6.4 Flujo de datos

```text
Texto de la ecuación ──► parseEllipse ──► E = {h, k, a, b} ──► geom()
          ▲                                      ▲                │
          │                                      │                ├──► renderPanels() (HTML)
   Deslizadores ──────────────────────────────────┘                └──► draw() (canvas)
```

Los deslizadores modifican directamente `E` y reescriben el campo de texto; el campo de texto pasa siempre por el analizador. Zoom y desplazamiento solo modifican `view`.

---

## 7. Interfaz y salidas visuales

La página se compone de: encabezado, panel de entrada (ecuación y rango X), panel de deslizadores, gráfica con paneles de resultados al lado, tabla paramétrica e interpretación geométrica.

**Código de colores de la gráfica:**

| Elemento | Representación |
|----------|----------------|
| Elipse | Línea azul continua |
| Centro | Punto azul marino |
| Vértices | Puntos rojos |
| Covértices | Puntos violeta |
| Ejes mayor y menor | Líneas violeta discontinuas |
| Focos | Puntos naranja oscuro |
| Lado recto | Segmentos ámbar, con puntos en sus extremos |
| Directrices | Líneas grises discontinuas |

Los paneles de resultados muestran la forma canónica, la interpretación de la traslación, tarjetas con los elementos principales y una explicación de la excentricidad, el lado recto y las directrices con los valores calculados.

---

## 8. Instalación y ejecución

No requiere instalación ni servidor.

1. Descarga o clona el repositorio y deja `index.html`, `styles.css` y `app.js` en la misma carpeta.
2. Abre `index.html` en el navegador (doble clic).

Si prefieres un servidor local:

```bash
python3 -m http.server 8000
# Abre http://localhost:8000
```

Para publicarlo, basta con activar **GitHub Pages** sobre la rama que contiene los tres archivos.

---

## 9. Compatibilidad

La aplicación usa Canvas 2D, Pointer Events y sintaxis moderna de JavaScript (operador `??`, propagación de objetos, `Array.prototype.flat`). Funciona en versiones actuales de Chrome, Edge, Firefox y Safari, de escritorio y móvil. Los navegadores anteriores a 2020 aproximadamente pueden no ejecutarlo.

---

## 10. Limitaciones conocidas

- Solo elipses con **ejes paralelos a los coordenados**: un término $xy$ (elipse girada) se rechaza.
- El **zoom** es con la rueda del ratón; en pantallas táctiles solo está disponible el desplazamiento (no hay pellizco). Se puede usar el rango X mínimo/máximo.
- La división es ordenada de izquierda a derecha: `x^2/4y^2` se interpreta como $(x^2/4)\cdot y^2$. Para denominadores compuestos conviene usar paréntesis o la forma general.
- Los exponentes deben ser enteros positivos de un solo bloque (`x^2`); no se admiten `x^(2)` ni exponentes negativos.
- Los resultados se muestran redondeados a 3 decimales.
- La tabla paramétrica usa pasos fijos de $30^\circ$.
- Al mover un deslizador, el campo de ecuación se reescribe en forma canónica.
- Las etiquetas de la gráfica no se leen en lectores de pantalla; la información equivalente está en los paneles de texto.

---

## 11. Posibles extensiones

- Elipses giradas (término $xy$) mediante diagonalización de la forma cuadrática.
- Zoom por pellizco en pantallas táctiles.
- Animación del punto paramétrico y de la suma de distancias a los focos.
- Exportación de la gráfica a PNG o SVG y de los resultados a PDF.
- Otras cónicas (parábola, hipérbola) con el mismo analizador.
- Ecuación polar respecto a un foco (ver sección 3.4).
- Modo de ejercicios con retroalimentación automática.

---

## 12. Referencias

- Lehmann, C. H. *Geometría analítica*. Limusa.
- Stewart, J., Redlin, L. y Watson, S. *Precálculo: matemáticas para el cálculo*. Cengage Learning.
- MDN Web Docs. [Canvas API](https://developer.mozilla.org/es/docs/Web/API/Canvas_API).
- MDN Web Docs. [Pointer events](https://developer.mozilla.org/es/docs/Web/API/Pointer_events).

---

## 13. Licencia

Pendiente de definir por el autor. Añade un archivo `LICENSE` con la licencia que elijas (por ejemplo MIT para uso educativo abierto) y actualiza esta sección.
