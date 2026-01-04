/**
 * Sistema de Analíticas para MolleVentas
 * Maneja cálculos estadísticos, preparación de datos y visualización con Chart.js
 */

// Variables globales de gráficos para poder destruirlos y recrearlos
let chartDias = null;
let chartHoraImpacto = null;
let chartDuracion = null;

// ==========================================
// GESTIÓN DEL MODAL
// ==========================================
function abrirDashboard() {
    const modal = document.getElementById('modal-dashboard');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evitar scroll del body

    // Calcular y renderizar al abrir
    const ventas = window.obtenerVentasGlobal ? window.obtenerVentasGlobal() : [];
    actualizarDashboard(ventas);
}

function cerrarDashboard() {
    const modal = document.getElementById('modal-dashboard');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
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
    generarGraficos(metricas, ventas);
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
            const date = new Date(v.fecha + 'T12:00:00');
            const diaNombre = diasSemana[date.getDay()];
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
        velocidadPromedio: contadorVelocidad > 0 ? sumaVelocidad / contadorVelocidad : 0,
        duracionPromedio: contadorDuracion > 0 ? sumaDuracion / contadorDuracion : 0
    };
}

function parsearHoraDecimal(horaStr) {
    if (!horaStr) return 0;
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas + (minutos / 60);
}

function formatearHoraDecimal(decimal) {
    const horas = Math.floor(decimal);
    const minutos = Math.round((decimal - horas) * 60);
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
    }

    // Velocidad Promedio
    document.getElementById('kpi-velocidad').textContent = `S/ ${metricas.velocidadPromedio.toFixed(2)} / h`;

    // Duración Promedio
    const durHoras = Math.floor(metricas.duracionPromedio);
    const durMins = Math.round((metricas.duracionPromedio - durHoras) * 60);
    document.getElementById('kpi-duracion').textContent = `${durHoras}h ${durMins}m`;

    // Hora Ideal (Calcular basado en el top 25% de ventas)
    // Filtramos las ventas que están por encima del promedio
    if (metricas.datosHorarios.length > 0) {
        const ventasOrdenadas = [...metricas.datosHorarios].sort((a, b) => b.y - a.y);
        const topVentas = ventasOrdenadas.slice(0, Math.ceil(ventasOrdenadas.length * 0.3)); // Top 30%

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
                    label: 'Venta Promedio',
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
                label: 'Ventas Individuales',
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
                            return `Salida: ${hora}h - Venta: S/ ${ctx.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Hora de Salida (24h)' },
                    min: 6, max: 22, // Asumo rango operativo de 6am a 10pm
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

        if (promTemprano > promTarde * 1.1) {
            insights.push({
                icon: 'fa-sun text-yellow-400',
                text: 'Trend detectado: Salir <strong>antes de las 2:00 PM</strong> genera un 10%+ más de ventas en promedio.'
            });
        } else if (promTarde > promTemprano * 1.1) {
            insights.push({
                icon: 'fa-moon text-blue-400',
                text: 'Interesante: Las salidas por la <strong>tarde (después de las 2 PM)</strong> parecen ser más rentables.'
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
    // Si no hay datos, mostrar algo visualmente agradable en el dashboard
    document.getElementById('kpi-mejor-dia').textContent = '--';
    // Limpiar gráficos o mostrar placeholder
}
