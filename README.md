MolleVentas es un registro web de ventas por turno en soles, con historial, copias JSON y análisis descriptivo para un puesto de comida.

![MolleVentas en uso: formulario e historial](assets/screenshots/upwork-molleventas-4x3.png)

[Probar demo](https://enybyy.github.io/pos-sales-management-system/) · [Ver análisis](assets/screenshots/screenshot-pos-analytics.png) · [Ver versión móvil](assets/screenshots/screenshot-pos-mobile.png)

## Abrir la aplicación

No necesita backend ni instalación de paquetes para funcionar. Desde la carpeta del proyecto:

```bash
python -m http.server 5084 --bind 127.0.0.1
```

Abre `http://127.0.0.1:5084`. También se puede publicar la carpeta en GitHub Pages. Estilos, gráficos, iconos y fuentes están incluidos; la aplicación no hace solicitudes a servicios externos.

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

## Verificar el código

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

## Archivos

| Ruta | Contenido |
|---|---|
| `index.html`, `css/style.css` | Interfaz y estilos propios |
| `js/core.js` | Validación, fechas, céntimos y datos de ejemplo |
| `js/app.js` | Formularios, almacenamiento, historial y copias |
| `js/analytics.js` | Métricas y gráficos |
| `tests/` | Reglas y recorrido de navegador |
| `assets/screenshots/` | Capturas auténticas para GitHub y Upwork |
| `assets/vendor/`, `assets/webfonts/` | Recursos locales y licencias de terceros |

## Imágenes para portafolio

- `assets/screenshots/upwork-molleventas-4x3.png`: vista de 1440 × 1080, proporción 4:3, lista para usar en Upwork.
- `assets/screenshots/screenshot-pos-main.png`: formulario e historial en escritorio.
- `assets/screenshots/screenshot-pos-analytics.png`: análisis con gráficos reales del prototipo.
- `assets/screenshots/screenshot-pos-mobile.png`: recorrido completo en 360 px.
- `assets/screenshots/screenshot-pos-mobile-analytics.png`: primera pantalla del análisis móvil.

Todas fueron capturadas de la aplicación funcionando con registros ficticios. No son imágenes generadas ni pruebas de ventas reales.

## Recursos visuales

Tailwind CSS 3.4.17 (CSS de utilidades generado), Chart.js 4.4.9, Font Awesome Free 6.4.0 y Poppins se incluyen localmente. Sus licencias se conservan en `assets/vendor/`. [Criterio de presentación](docs/design.md).

Desarrollado por [Eliud Rojas Mendoza](https://github.com/Enybyy).
