# Analizador Interactivo de Elipses

> Herramienta didáctica e interactiva para el estudio de la elipse en su forma canónica
> \[
> \frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1
> \]
> implementada con HTML5, CSS3 y JavaScript puro, sin dependencias externas.

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

**Analizador Interactivo de Elipses** es una aplicación web autocontenida que permite al estudiante o docente introducir la ecuación de una elipse —en su **forma canónica** o en su **forma general**— y obtener de forma síncrona y visual todos sus elementos geométricos: centro, semiejes, orientación, distancia focal, excentricidad, focos, vértices, covértices, lado recto con sus extremos, directrices y tabla paramétrica.

El motor interno **parsea expresiones algebraicas en \(x\) e \(y\) de grado ≤ 2**, completa cuadrados para llevar cualquier ecuación general a la forma canónica, y detecta automáticamente casos degenerados como **circunferencias** (cuando \(a = b\)) o **hipérbolas** (cuando los coeficientes de \(x^2\) e \(y^2\) tienen signos opuestos), informando al usuario con un mensaje claro.

El proyecto está pensado como recurso pedagógico para los temas de **geometría analítica** y **secciones cónicas** en educación media superior y universitaria introductoria.

---

## 2. Objetivos

- **Comprender** la relación entre la forma canónica \(\frac{(x-h)^2}{a^2}+\frac{(y-k)^2}{b^2}=1\) y la geometría de la elipse.
- **Visualizar** el efecto de los parámetros \(a\), \(b\), \(h\), \(k\) sobre el centro, la forma y la orientación de la cónica.
- **Identificar** los elementos notables (focos, vértices, covértices, directrices, lado recto) y sus coordenadas exactas.
- **Relacionar** la representación gráfica con la **tabla paramétrica** \(x = h + a\cos\theta\), \(y = k + b\sin\theta\).
- **Servir** como material complementario en clases presenciales o virtuales, tareas dirigidas y autoestudio.

---

## 3. Fundamento matemático

### 3.1 Forma canónica y forma general

La ecuación de una elipse con ejes paralelos a los ejes coordenados puede escribirse en dos formas equivalentes:

**Forma canónica (o de centro desplazado):**
\[
\frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1, \qquad a,b > 0
\]

**Forma general (desarrollada):**
\[
Ax^2 + By^2 + Cx + Dy + F = 0, \qquad A \cdot B > 0
\]

La conversión entre ambas se logra **completando cuadrados**. Partiendo de la forma general:

\[
A\left(x + \frac{C}{2A}\right)^2 + B\left(y + \frac{D}{2B}\right)^2 = \frac{C^2}{4A} + \frac{D^2}{4B} - F = R
\]

de donde:
\[
h = -\frac{C}{2A}, \quad k = -\frac{D}{2B}, \quad a = \sqrt{\frac{R}{A}}, \quad b = \sqrt{\frac{R}{B}}
\]

La aplicación implementa directamente esta ruta: **cualquier** ecuación general con coeficientes \(A, B\) del mismo signo se transforma automáticamente a la forma canónica.

### 3.2 Interpretación de los parámetros

| Parámetro | Efecto geométrico |
|-----------|-------------------|
| \(h\) | **Desplazamiento horizontal** del centro. \((x - 3)\) desplaza 3 unidades a la derecha; \((x+2)\) desplaza 2 a la izquierda. |
| \(k\) | **Desplazamiento vertical** del centro. \((y - 1)\) desplaza 1 unidad hacia arriba; \((y+4)\) desplaza 4 hacia abajo. |
| \(a\) | **Semieje horizontal** (radio horizontal). |
| \(b\) | **Semieje vertical** (radio vertical). |
| \(a = b\) | **Circunferencia** de radio \(a\). |
| \(a > b\) | **Eje mayor horizontal**, focos sobre \(y = k\). |
| \(a < b\) | **Eje mayor vertical**, focos sobre \(x = h\). |

### 3.3 Elementos notables de la elipse

Sea \(C(h,k)\) el centro y \(c\) la distancia focal.

| Elemento | Expresión |
|----------|-----------|
| **Centro** | \(C(h, k)\) |
| **Semieje mayor** | \(m = \max(a,b)\) |
| **Semieje menor** | \(n = \min(a,b)\) |
| **Distancia focal** | \(c = \sqrt{m^2 - n^2} = \sqrt{|a^2 - b^2|}\) |
| **Excentricidad** | \(e = \dfrac{c}{m} \in [0,1)\) |
| **Focos** | \(F_{1,2} = C \pm (c,0)\) si eje mayor horizontal; \(C \pm (0,c)\) si vertical |
| **Vértices** | \(V_{1,2} = C \pm (m,0)\) o \(C \pm (0,m)\) |
| **Covértices** | \(B_{1,2} = C \pm (0,n)\) o \(C \pm (n,0)\) |
| **Lado recto (en cada foco)** | longitud \(\dfrac{2n^2}{m}\); extremos a distancia \(\dfrac{n^2}{m}\) del foco, perpendiculares al eje mayor |
| **Directrices** | \(x = h \pm \dfrac{m^2}{c}\) o \(y = k \pm \dfrac{m^2}{c}\) (solo si \(c > 0\)) |

### 3.4 Fórmulas utilizadas

**Relación fundamental.**
\[
c^2 = a^2 - b^2 \quad\text{(o bien, } c^2 = m^2 - n^2\text{)}
\]

**Propiedad focal.** Para todo punto \(P\) de la elipse:
\[
d(P, F_1) + d(P, F_2) = 2m
\]

**Ecuación paramétrica.**
\[
x(\theta) = h + a\cos\theta, \qquad y(\theta) = k + b\sin\theta
\]

**Ecuación en coordenadas polares respecto a un foco** (útil en mecánica celeste):
\[
r(\theta) = \frac{m(1 - e^2)}{1 + e\cos\theta}
\]

---

## 4. Características de la aplicación

- ✅ Entrada de ecuaciones en **forma canónica** y en **forma general**.
- ✅ **Parser algebraico completo**: paréntesis, potencias, fracciones (`1/2`, `x^2/25`), multiplicación implícita (`4x^2`), orden libre de términos, signos tipográficos (`−`, `–`, `—`) y `²`.
- ✅ **Completado de cuadrados** automático desde la forma general.
- ✅ Detección explícita de **circunferencias** (\(a=b\)) e **hipérbolas** (coeficientes de signo opuesto, con mensaje pedagógico).
- ✅ **Gráfica cartesiana** en `<canvas>` con zoom (rueda), paneo (arrastre con ratón o táctil) y rejilla adaptativa.
- ✅ **Auto-encuadre que preserva la proporción 1:1** de los ejes, de modo que una circunferencia se dibuja como circunferencia.
- ✅ **Centro**, **focos**, **vértices**, **covértices**, **eje mayor y menor**, **lado recto en cada foco** y **directrices** dibujados con colores diferenciados.
- ✅ **Deslizadores** para \(h, k, a, b\) con actualización en tiempo real.
- ✅ **Panel de interpretación pedagógica** de la traslación horizontal y vertical.
- ✅ **Tabla paramétrica** con 12 valores de \(\theta\) (\(0°\) a \(330°\) cada \(30°\)).
- ✅ **Manejo accesible de errores** mediante `role="alert"` (sin `alert()` bloqueantes).
- ✅ **Accesibilidad**: etiquetas ARIA, `aria-label` en el canvas, `focus-visible` en controles.
- ✅ **Optimización de renderizado** mediante `requestAnimationFrame` (evita repintados excesivos en zoom/pan).
- ✅ **Sin dependencias externas**: HTML + CSS + JS puro.

---

## 5. Guía de uso

### 5.1 Sintaxis admitida

| Entrada | Interpretación |
|---------|----------------|
| `(x-2)^2/16+(y-1)^2/9=1` | \(\dfrac{(x-2)^2}{16}+\dfrac{(y-1)^2}{9}=1\) |
| `x^2/25+y^2/9=1` | \(\dfrac{x^2}{25}+\dfrac{y^2}{9}=1\) |
| `(x+1)^2+(y-2)^2=4` | Circunferencia de centro \((-1,2)\), radio \(2\) |
| `x^2+y^2=1` | Circunferencia unitaria |
| `9x^2+16y^2-18x+64y-71=0` | Forma general → canónica |
| `x^2+4y^2=4` | Forma general (sin términos lineales) |
| `4(x-1)^2/9 + (y+3)^2/4 = 1` | Coeficiente delante del paréntesis |

Se aceptan indistintamente `^2` y `²`, así como los signos menos tipográficos `−`, `–`, `—`.

### 5.2 Controles interactivos

| Acción | Efecto |
|--------|--------|
| **Escribir en el campo de ecuación + Enter** | Parsea, valida y redibuja. |
| **Botón «Analizar elipse»** | Igual que Enter. |
| **Deslizadores \(h, k, a, b\)** | Modifican la elipse en tiempo real. |
| **Botón «Reajustar vista»** | Reencuadra preservando la proporción 1:1. |
| **Rueda del ratón sobre la gráfica** | Zoom centrado en el cursor. |
| **Arrastrar sobre la gráfica** | Paneo libre (ratón o dedo). |
| **Campos «X mínimo / X máximo»** | Fijan el rango horizontal; el vertical se ajusta manteniendo la proporción. |

### 5.3 Ejemplo canónico

Introduciendo:

\[
\frac{(x-2)^2}{16} + \frac{(y-1)^2}{9} = 1
\]

la aplicación identifica:

\[
h = 2, \quad k = 1, \quad a = 4, \quad b = 3
\]

y deduce:

- **Centro:** \(C(2, 1)\)
- **Orientación:** eje mayor horizontal
- **Semieje mayor:** \(m = 4\); **semieje menor:** \(n = 3\)
- **Distancia focal:** \(c = \sqrt{16 - 9} = \sqrt{7} \approx 2.646\)
- **Excentricidad:** \(e = \sqrt{7}/4 \approx 0.661\)
- **Focos:** \(F_1(2 - \sqrt{7},\, 1)\), \(F_2(2 + \sqrt{7},\, 1)\)
- **Vértices:** \(V_1(-2, 1)\), \(V_2(6, 1)\)
- **Covértices:** \(B_1(2, -2)\), \(B_2(2, 4)\)
- **Lado recto:** \(2b^2/a = 18/4 = 4.5\) u. (en cada foco)
- **Directrices:** \(x = 2 \pm 16/\sqrt{7}\)

---

## 6. Arquitectura del proyecto

El código está dividido en tres archivos independientes:
