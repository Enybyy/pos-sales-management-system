/**
 * Sistema de Analíticas para MolleVentas
 * Maneja cálculos estadísticos, preparación de datos y visualización con Chart.js
 */

// Variables globales de gráficos para poder destruirlos y recrearlos
let chartDias = null;
let chartHoraImpacto = null;
let chartDuracion = null;
let dashboardFocus;

// ==========================================
// GESTIÓN DEL MODAL
// ==========================================
function abrirDashboard() {
    dashboardFocus = document.activeElement;
    const modal = document.getElementById('modal-dashboard');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evitar scroll del body

    // Calcular y renderizar al abrir
    const ventas = window.obtenerVentasGlobal ? window.obtenerVentasGlobal() : [];
    actualizarDashboard(ventas);
    modal.querySelector('button').focus();
}

function cerrarDashboard() {
    const modal = document.getElementById('modal-dashboard');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (dashboardFocus && dashboardFocus.isConnected) dashboardFocus.focus();
}

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('modal-dashboard').classList.contains('hidden')) {
        cerrarDashboard();
    }
});

// ==========================================
// LÓGICA DE ANÁLISIS
// ==========================================
function actualizarDashboard(ventas) {
    if (!ventas || ventas.length === 0) {
        mostrarEstadoVacio();
        return;
    }

    const metricas = calcularMetricasAvanzadas(ventas);
    actualizarKPIs(metricas);
    if (typeof Chart === 'function') generarGraficos(metricas, ventas);
    else document.getElementById('insights-container').textContent = 'Los gráficos no pudieron cargarse. Las métricas siguen disponibles.';
    generarInsights(metricas, ventas);
}

function calcularMetricasAvanzadas(ventas) {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const datosPorDia = {};
    let sumaVelocidad = 0;
    let contadorVelocidad = 0;
    let sumaDuracion = 0;
    let contadorDuracion = 0;
    let mejorDia = { dia: '', promedio: 0 };

    // Inicializar contadores por día
    diasSemana.forEach(d => datosPorDia[d] = { total: 0, count: 0, promedio: 0 });

    const datosHorarios = []; // Para scatter plot

    ventas.forEach(v => {
        // 1. Análisis por Día
        if (v.fecha) {
            const diaNombre = diasSemana[MolleCore.weekday(v.fecha)];
            const monto = parseFloat(v.monto) || 0;

            if (datosPorDia[diaNombre]) {
                datosPorDia[diaNombre].total += monto;
                datosPorDia[diaNombre].count++;
            }
        }

        // 2. Análisis Horario y Duración
        if (v.hora_inicio && v.hora_fin) {
            const inicio = parsearHoraDecimal(v.hora_inicio);
            const fin = parsearHoraDecimal(v.hora_fin);
            let duracion = fin - inicio;

            // Manejo de cruce de medianoche (ej: 23:00 a 01:00)
            if (duracion < 0) duracion += 24;

            if (duracion > 0) {
                const monto = parseFloat(v.monto) || 0;
                const velocidad = monto / duracion; // Soles por hora

                sumaVelocidad += velocidad;
                contadorVelocidad++;

                sumaDuracion += duracion;
                contadorDuracion++;

                datosHorarios.push({
                    x: inicio, // Hora salida
                    y: monto,  // Venta total
                    velocidad: velocidad,
                    duracion: duracion
                });
            }
        }
    });

    // Calcular promedios por día
    Object.keys(datosPorDia).forEach(dia => {
        const d = datosPorDia[dia];
        d.promedio = d.count > 0 ? d.total / d.count : 0;

        if (d.promedio > mejorDia.promedio) {
            mejorDia = { dia: dia, promedio: d.promedio };
        }
    });

    return {
        diasSemana,
        datosPorDia,
        mejorDia,
        datosHorarios,
        // Aggregate revenue per hour: a short shift must not weigh as much as a long one.
        velocidadPromedio: sumaDuracion > 0 ? datosHorarios.reduce((sum, record) => sum + Math.round(record.y * 100), 0) / 100 / sumaDuracion : 0,
        duracionPromedio: contadorDuracion > 0 ? sumaDuracion / contadorDuracion : 0
    };
}

function parsearHoraDecimal(horaStr) {
    if (!horaStr) return 0;
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas + (minutos / 60);
}

function formatearHoraDecimal(decimal) {
    const totalMinutos = Math.round(decimal * 60) % 1440;
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

// ==========================================
// RENDERIZADO VISUAL
// ==========================================
function actualizarKPIs(metricas) {
    // Mejor Día
    const elMejorDia = document.getElementById('kpi-mejor-dia');
    const elMejorDiaDesc = document.getElementById('kpi-mejor-dia-desc');

    if (metricas.mejorDia.promedio > 0) {
        elMejorDia.textContent = metricas.mejorDia.dia;
        elMejorDiaDesc.textContent = `Promedio: S/ ${metricas.mejorDia.promedio.toFixed(2)}`;
    } else {
        elMejorDia.textContent = "--";
        elMejorDiaDesc.textContent = 'Sin registros';
    }

    // Velocidad Promedio
    document.getElementById('kpi-velocidad').textContent = `S/ ${metricas.velocidadPromedio.toFixed(2)} / h`;

    // Duración Promedio
    const durTotal = Math.round(metricas.duracionPromedio * 60);
    const durHoras = Math.floor(durTotal / 60);
    const durMins = durTotal % 60;
    document.getElementById('kpi-duracion').textContent = `${durHoras}h ${durMins}m`;

    document.getElementById('kpi-hora-ideal').textContent = '--:--';
    // Start time of the observed shift with the highest total revenue. Descriptive, not a prediction.
    if (metricas.datosHorarios.length > 0) {
        const ventasOrdenadas = [...metricas.datosHorarios].sort((a, b) => b.y - a.y);
        const topVentas = ventasOrdenadas.slice(0, 1);

        if (topVentas.length > 0) {
            const promHoraInicio = topVentas.reduce((acc, curr) => acc + curr.x, 0) / topVentas.length;
            document.getElementById('kpi-hora-ideal').textContent = formatearHoraDecimal(promHoraInicio);
        } else {
            document.getElementById('kpi-hora-ideal').textContent = "--:--";
        }
    }
}

function generarGraficos(metricas, ventas) {
    // Configuración común
    Chart.defaults.animation = false;
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Poppins', sans-serif";

    // 1. Gráfico de Días (Combinado Barras y Línea)
    const ctxDias = document.getElementById('chart-dias').getContext('2d');
    if (chartDias) chartDias.destroy();

    const dataPromedios = metricas.diasSemana.map(d => metricas.datosPorDia[d].promedio);
    const dataTotales = metricas.diasSemana.map(d => metricas.datosPorDia[d].total);

    chartDias = new Chart(ctxDias, {
        type: 'bar',
        data: {
            labels: metricas.diasSemana.map(d => d.substring(0, 3)), // Lun, Mar...
            datasets: [
                {
                    label: 'Promedio por turno',
                    data: dataPromedios,
                    backgroundColor: 'rgba(251, 191, 36, 0.7)', // Amber
                    borderColor: 'rgba(251, 191, 36, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Venta Total',
                    data: dataTotales,
                    type: 'line',
                    borderColor: 'rgba(59, 130, 246, 0.8)', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Promedio (S/)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Acumulado Total (S/)' }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Gráfico Scatter: Hora Salida vs Venta
    const ctxHora = document.getElementById('chart-hora-impacto').getContext('2d');
    if (chartHoraImpacto) chartHoraImpacto.destroy();

    const scatterData = metricas.datosHorarios.map(d => ({ x: d.x, y: d.y }));

    chartHoraImpacto = new Chart(ctxHora, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Totales por turno',
                data: scatterData,
                backgroundColor: scatterData.map(d => {
                    // Colorear verde si es venta alta (> promedio aprox 150), sino amarillo/rojo
                    return d.y >= 150 ? '#34D399' : '#FBBF24';
                }),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const hora = formatearHoraDecimal(ctx.raw.x);
                            return `Inicio: ${hora}h - Venta: S/ ${ctx.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Hora de inicio (24h)' },
                    min: 0, max: 24,
                    ticks: { callback: val => `${val}h` },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    title: { display: true, text: 'Monto Vendido (S/)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });

    // 3. Gráfico Duración vs Ingreso (Burbujas o Línea)
    // Usaremos un gráfico donde X=Duración, Y=Monto.
    const ctxDuracion = document.getElementById('chart-duracion').getContext('2d');
    if (chartDuracion) chartDuracion.destroy();

    const duracionData = metricas.datosHorarios.map(d => ({ x: d.duracion, y: d.y }));

    chartDuracion = new Chart(ctxDuracion, {
        type: 'line', // Usamos scatter, pero configurado lineal si ordenamos, pero scatter es mejor para correlación
        data: {
            datasets: [{
                type: 'scatter',
                label: 'Eficiencia',
                data: duracionData,
                backgroundColor: '#A78BFA', // Purple
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Horas Trabajadas' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    title: { display: true, text: 'Ingreso Total (S/)' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw.x.toFixed(1)}h trabajadas ➡ S/ ${ctx.raw.y}`
                    }
                }
            }
        }
    });
}

function generarInsights(metricas, ventas) {
    const container = document.getElementById('insights-container');
    container.innerHTML = ''; // Limpiar

    const insights = [];

    // Insight 1: Mejor día
    if (metricas.mejorDia.promedio > 0) {
        insights.push({
            icon: 'fa-trophy text-amber-400',
            text: `Tu mejor día es el <strong>${metricas.mejorDia.dia}</strong>, con un promedio de S/ ${metricas.mejorDia.promedio.toFixed(2)}.`
        });
    }

    // Insight 2: Correlación Horario
    if (metricas.datosHorarios.length > 5) {
        // Simple heurística
        const salidasTempranas = metricas.datosHorarios.filter(d => d.x < 14); // Antes de las 2pm
        const salidasTardias = metricas.datosHorarios.filter(d => d.x >= 14);

        const promTemprano = salidasTempranas.reduce((sum, d) => sum + d.y, 0) / (salidasTempranas.length || 1);
        const promTarde = salidasTardias.reduce((sum, d) => sum + d.y, 0) / (salidasTardias.length || 1);

        if (salidasTempranas.length && salidasTardias.length && promTemprano > promTarde * 1.1) {
            insights.push({
                icon: 'fa-sun text-yellow-400',
                text: 'Los turnos iniciados <strong>antes de las 2:00 PM</strong> tienen un promedio observado mayor. Esta muestra no demuestra causalidad.'
            });
        } else if (salidasTempranas.length && salidasTardias.length && promTarde > promTemprano * 1.1) {
            insights.push({
                icon: 'fa-moon text-blue-400',
                text: 'Los turnos iniciados <strong>desde las 2:00 PM</strong> tienen un promedio observado mayor. Se comparan ingresos, sin descontar costos.'
            });
        }
    }

    // Insight 3: Datos faltantes
    const ventasSinHorario = ventas.filter(v => !v.hora_inicio || !v.hora_fin).length;
    if (ventasSinHorario > 0) {
        insights.push({
            icon: 'fa-exclamation-circle text-gray-400',
            text: `Tienes ${ventasSinHorario} ventas sin horario registrado. Complétalos para mejorar la precisión del análisis.`
        });
    }

    // Renderizar
    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'flex items-start gap-3 text-indigo-100 bg-indigo-800/30 p-3 rounded-lg border border-indigo-700';
        div.innerHTML = `
            <i class="fas ${insight.icon} mt-1"></i>
            <p class="text-sm">${insight.text}</p>
        `;
        container.appendChild(div);
    });

    if (insights.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic">Registra más ventas para ver insights inteligentes.</p>';
    }
}

function mostrarEstadoVacio() {
    [chartDias, chartHoraImpacto, chartDuracion].forEach(chart => { if (chart) chart.destroy(); });
    chartDias = chartHoraImpacto = chartDuracion = null;
    document.getElementById('kpi-mejor-dia').textContent = '--';
    document.getElementById('kpi-mejor-dia-desc').textContent = 'Sin registros';
    document.getElementById('kpi-hora-ideal').textContent = '--:--';
    document.getElementById('kpi-velocidad').textContent = 'S/ 0.00 / h';
    document.getElementById('kpi-duracion').textContent = '0h 0m';
    document.getElementById('insights-container').textContent = 'Registra ventas para ver el análisis.';
}
