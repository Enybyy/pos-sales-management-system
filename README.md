<div align="center">

# MolleVentas

Registro de ventas por turno en soles, con historial, análisis descriptivo y copias de los datos en JSON.

<a href="https://enybyy.github.io/pos-sales-management-system/"><img src="docs/media/demo.svg" width="360" alt="Abrir demo"></a>

<p><a href="https://github.com/Enybyy"><img src="docs/media/github.svg" width="112" alt="GitHub de Eliud Rojas Mendoza"></a>
<a href="https://www.linkedin.com/in/eliud-rojas-mendoza-414652212/"><img src="docs/media/linkedin.svg" width="112" alt="LinkedIn de Eliud Rojas Mendoza"></a>
<a href="https://www.upwork.com/freelancers/~01471ca462b236e8e5"><img src="docs/media/upwork.svg" width="112" alt="Upwork de Eliud Rojas Mendoza"></a></p>

[![MolleVentas en uso](assets/screenshots/upwork-molleventas-4x3.png)](https://enybyy.github.io/pos-sales-management-system/)

*Captura real del prototipo con ventas ficticias. Cada registro representa el total de un turno.*

[Acerca del proyecto](#acerca-del-proyecto) · [Capturas](#capturas) · [Recorrido](#en-el-día-a-día) · [Tecnología](#cómo-está-construido) · [Uso local](#uso-local)

</div>

## Acerca del proyecto

En un puesto de comida, el cierre de cada turno deja un monto, un vendedor y, a veces, un horario o una observación. MolleVentas conserva esos datos en un historial editable para que la consulta del día, la semana o el mes parta de los mismos registros.

El análisis permite recorrer los ingresos y la duración de los turnos sin preparar una segunda hoja para cada comparación. Las copias JSON conservan la información del navegador y permiten recuperarla. Cada registro representa el total vendido en un turno; la aplicación se concentra en ese control, sin inventario ni emisión de comprobantes.

## En el día a día

| Dentro del proyecto | Detalle |
| --- | --- |
| Registro por turno | Fecha, monto y vendedor, con horario y notas opcionales. |
| Historial editable | Consulta por período, edición y eliminación de registros. |
| Análisis descriptivo | Comparación de días, duración de turnos e ingresos por hora. |
| Cálculo de importes | Sumas en céntimos y fechas de negocio en America/Lima. |
| Copias de trabajo | Exportación JSON y restauración validada desde el navegador. |

## Capturas

### Análisis de los turnos registrados

![Análisis de los turnos registrados](assets/screenshots/screenshot-pos-analytics.png)

## Explorar la demo

1. El primer acceso carga seis turnos ficticios con fechas cercanas al día actual de Perú.
2. Registra fecha, monto y vendedor. El horario y las notas son opcionales; si añades horario, completa inicio y fin.
3. Usa **Todos**, **Semana** o **Mes** para filtrar el historial; edita o elimina un registro con sus botones.
4. Abre **Análisis** para comparar días, ingresos por hora y duración de los turnos.
5. **Backup** descarga todas las ventas en JSON. **Restaurar copia** valida un archivo y pide confirmar antes de reemplazar los datos.
6. **Recargar ejemplo** reemplaza tus cambios por seis turnos ficticios, previa confirmación. Descarga una copia antes si quieres conservarlos.

Un registro representa el **total vendido en un turno**, no una línea de producto ni un comprobante. Un turno de 23:00 a 01:30 dura 2 h 30 min y se asigna a su fecha de inicio.

## Qué incluye

- Crear, editar y eliminar ventas, con persistencia en `localStorage`.
- Montos positivos con hasta dos decimales y sumas calculadas en céntimos.
- Fecha de negocio en `America/Lima`; semana de lunes a domingo.
- Ingreso por hora = ingresos de turnos con horario / horas totales de esos turnos.
- Promedios por día calculados por registro. Las observaciones describen la muestra, sin atribuir causalidad, rentabilidad ni predicciones.
- Copias JSON, restauración validada y preservación del archivo original si el almacenamiento contiene datos inválidos.
- Diseño original ámbar/Poppins conservado; controles accesibles, navegación por teclado y vista móvil desde 360 px.

## Alcance del prototipo

La demo funciona en un navegador y conserva los cambios en ese mismo origen/dispositivo. No tiene cuentas, servidor, sincronización entre equipos, inventario, emisión de comprobantes, procesamiento de pagos ni conciliación bancaria. Borrar los datos del navegador elimina el registro local; descarga copias periódicas si lo usas para explorar información propia.

Las cifras de la demo son ficticias. Este repositorio no presenta ahorros de tiempo o resultados comerciales medidos. El análisis es JavaScript determinista y Chart.js; no usa IA.

## Cómo está construido

| Área | Tecnología |
| --- | --- |
| Interfaz | HTML, CSS, Tailwind y JavaScript |
| Gráficos | Chart.js |
| Persistencia | localStorage y copias JSON |
| Recursos | Fuentes e iconos incluidos localmente |
| Verificación | Node.js y Playwright |

## Uso local

<details>
<summary><strong>Ejecutar en tu equipo</strong></summary>

No necesita backend ni instalación de paquetes para funcionar. Desde la carpeta del proyecto:

```bash
python -m http.server 5084 --bind 127.0.0.1
```

Abre `http://127.0.0.1:5084`. También se puede publicar la carpeta en GitHub Pages. Estilos, gráficos, iconos y fuentes están incluidos; la aplicación no hace solicitudes a servicios externos.

</details>

<details>
<summary><strong>Verificar el código</strong></summary>

Las reglas de negocio se prueban sin instalar dependencias, con Node.js 18 o posterior:

```bash
node --test tests/core.test.cjs
```

Para repetir las 29 comprobaciones de navegador y generar las capturas reales:

```bash
npm install
npx playwright install chromium
# Mantén el servidor de Python ejecutándose en otra terminal.
npm run test:browser
```

La prueba de navegador usa un perfil temporal aislado y genera datos ficticios; no modifica el almacenamiento de tu navegador habitual. [Resultados y cobertura](docs/verification.md).

</details>

<details>
<summary><strong>Archivos</strong></summary>

| Ruta | Contenido |
|---|---|
| `index.html`, `css/style.css` | Interfaz y estilos propios |
| `js/core.js` | Validación, fechas, céntimos y datos de ejemplo |
| `js/app.js` | Formularios, almacenamiento, historial y copias |
| `js/analytics.js` | Métricas y gráficos |
| `tests/` | Reglas y recorrido de navegador |
| `assets/screenshots/` | Capturas auténticas para GitHub y Upwork |
| `assets/vendor/`, `assets/webfonts/` | Recursos locales y licencias de terceros |

</details>

<details>
<summary><strong>Imágenes para portafolio</strong></summary>

- `assets/screenshots/upwork-molleventas-4x3.png`: vista de 1440 × 1080, proporción 4:3, lista para usar en Upwork.
- `assets/screenshots/screenshot-pos-main.png`: formulario e historial en escritorio.
- `assets/screenshots/screenshot-pos-analytics.png`: análisis con gráficos reales del prototipo.

Todas fueron capturadas de la aplicación funcionando con registros ficticios. No son imágenes generadas ni pruebas de ventas reales.

</details>

<details>
<summary><strong>Recursos visuales</strong></summary>

Tailwind CSS 3.4.17 (CSS de utilidades generado), Chart.js 4.4.9, Font Awesome Free 6.4.0 y Poppins se incluyen localmente. Sus licencias se conservan en `assets/vendor/`. [Criterio de presentación](docs/design.md).

</details>

---

<div align="center">

**Eliud Rojas Mendoza · Enybyy**

<p><a href="https://github.com/Enybyy"><img src="docs/media/github.svg" width="112" alt="GitHub de Eliud Rojas Mendoza"></a>
<a href="https://www.linkedin.com/in/eliud-rojas-mendoza-414652212/"><img src="docs/media/linkedin.svg" width="112" alt="LinkedIn de Eliud Rojas Mendoza"></a>
<a href="https://www.upwork.com/freelancers/~01471ca462b236e8e5"><img src="docs/media/upwork.svg" width="112" alt="Upwork de Eliud Rojas Mendoza"></a></p>

</div>
