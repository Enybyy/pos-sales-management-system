# Verificación local

Fecha: 1 de octubre de 2026. Navegador: Chromium con Playwright 1.62.1; zona horaria America/Lima. Capturas del prototipo local, con datos ficticios.

## Resultados

- **9 pruebas de reglas:** fechas cerca de medianoche en Perú, año bisiesto y rollover inválido, semana que cruza de año, montos/céntimos, horarios nocturnos y pares incompletos, backup vacío y registros inválidos/duplicados, escape de HTML, muestra de seis turnos y tasa de ingreso ponderada por duración.
- **29 comprobaciones de navegador:** primera carga, totales, guardado, edición, eliminación, filtros, persistencia tras recargar, exportación JSON, restauración, archivo inválido, lista vacía que sigue vacía, corrupción que conserva el original, recuperación, cuota de almacenamiento que no cambia memoria ni borra el formulario, bloqueo de inyección y adaptación a 360 px.
- **Sin excepciones JavaScript ni solicitudes fallidas**, y **cero solicitudes externas** en el recorrido de la demo.
- Cinco capturas reales, con revisión visual de escritorio, análisis, móvil y formato 4:3. Se corrigió el campo de fecha que se recortaba en móvil y se retiró la animación de gráficos para que las capturas reflejen sus valores finales.

## Reproducir

```bash
python -m http.server 5084 --bind 127.0.0.1
# Otra terminal, misma carpeta:
node --test tests/core.test.cjs
npm install
npx playwright install chromium
npm run test:browser
```

`DEMO_URL` permite usar otro origen local. `PLAYWRIGHT_MODULE` permite apuntar a una instalación existente de Playwright. Las pruebas generan sus propios registros dentro de un perfil de navegador temporal.

## Límites de esta revisión

No se verificaron ventas reales, inventario, pagos, emisión fiscal ni sincronización porque el proyecto no implementa esas funciones. Esta evidencia comprueba el prototipo local y sus reglas; la publicación de esta versión en GitHub Pages requiere que el repositorio reciba estos cambios y se complete su despliegue.
