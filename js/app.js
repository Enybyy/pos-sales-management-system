/**
 * MolleVentas - Sistema de Ventas
 * Módulo principal de la aplicación
 * v1.0.0
 */

// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
const DB_KEY = 'molleventas_db_v1';
let ventasCache = [];
let filtroActual = 'todos';

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

// Lógica de Temporadas para Ventanilla, Perú
function obtenerTemporada(fechaStr) {
    if (!fechaStr) return 'Desconocida';
    // fechaStr YYYY-MM-DD
    const mes = parseInt(fechaStr.split('-')[1]);

    // Enero(1) - Marzo(3): Verano
    if (mes >= 1 && mes <= 3) return 'Verano ☀️';
    // Abril(4) - Junio(6): Otoño
    if (mes >= 4 && mes <= 6) return 'Otoño 🍂';
    // Julio(7) - Septiembre(9): Invierno
    if (mes >= 7 && mes <= 9) return 'Invierno 🌧️';
    // Octubre(10) - Diciembre(12): Primavera
    return 'Primavera 🌸';
}


// Precarga de datos demo si el storage esta vacio para portfolio showcase
function precargarDatosDemoSiEstaVacio() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw || JSON.parse(raw).length === 0) {
        const hoyStr = new Date().toISOString().split('T')[0];
        const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split('T')[0];
        const anteayer = new Date(); anteayer.setDate(anteayer.getDate() - 2);
        const anteayerStr = anteayer.toISOString().split('T')[0];
        const hace3 = new Date(); hace3.setDate(hace3.getDate() - 3);
        const hace3Str = hace3.toISOString().split('T')[0];

        const demoVentas = [
            { id: 'demo-1', fecha: hoyStr, monto: 145.50, vendedor: 'Marta R.', hora_inicio: '18:00', hora_fin: '22:30', notas: 'Alta afluencia de pedidos con cremas', createdAt: new Date().toISOString() },
            { id: 'demo-2', fecha: hoyStr, monto: 98.00, vendedor: 'Carlos M.', hora_inicio: '18:30', hora_fin: '21:30', notas: 'Turno tarde', createdAt: new Date().toISOString() },
            { id: 'demo-3', fecha: ayerStr, monto: 230.00, vendedor: 'Marta R.', hora_inicio: '17:30', hora_fin: '23:00', notas: 'Venta de combos familiares y gaseosas', createdAt: new Date().toISOString() },
            { id: 'demo-4', fecha: ayerStr, monto: 180.50, vendedor: 'Eliud RM', hora_inicio: '18:00', hora_fin: '22:45', notas: 'Día viernes pico de ventas', createdAt: new Date().toISOString() },
            { id: 'demo-5', fecha: anteayerStr, monto: 165.00, vendedor: 'Carlos M.', hora_inicio: '18:00', hora_fin: '22:00', notas: 'Normal', createdAt: new Date().toISOString() },
            { id: 'demo-6', fecha: hace3Str, monto: 195.00, vendedor: 'Marta R.', hora_inicio: '17:45', hora_fin: '22:30', notas: 'Buena rotación de mollejitas con yuca', createdAt: new Date().toISOString() }
        ];
        localStorage.setItem(DB_KEY, JSON.stringify(demoVentas));
    }
}

async function inicializarApp() {
    precargarDatosDemoSiEstaVacio();
    // Mostrar fecha actual
    mostrarFechaActual();

    // Establecer fecha de hoy en el formulario
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    document.getElementById('fecha').value = `${year}-${month}-${day}`;

    // Cargar ventas existentes
    await cargarVentas();

    // Actualizar lista de vendedores para autocompletado
    actualizarListaVendedores();

    // Configurar eventos
    configurarEventos();
}

function actualizarListaVendedores() {
    if (!ventasCache || ventasCache.length === 0) return;

    // Obtener vendedores únicos, no vacíos, ordenados alfabéticamente
    const vendedores = [...new Set(ventasCache
        .map(v => v.vendedor ? v.vendedor.trim() : '') // Obtener nombres
        .filter(nombre => nombre.length > 0) // Filtrar vacíos
    )].sort();

    const datalist = document.getElementById('lista-vendedores');
    if (datalist) {
        datalist.innerHTML = vendedores.map(v => `<option value="${v}">`).join('');
    }
}

// ==========================================
// UTILIDADES DE FECHA
// ==========================================
function mostrarFechaActual() {
    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones);
    document.getElementById('fecha-actual').textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

function formatearFecha(fecha) {
    // fecha viene como YYYY-MM-DD
    const partes = fecha.split('-');
    const date = new Date(partes[0], partes[1] - 1, partes[2]);
    const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', opciones);
}

function formatearHoraAmPm(hora24) {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    const horasNum = parseInt(horas, 10);
    const ampm = horasNum >= 12 ? 'PM' : 'AM';
    const horas12 = horasNum % 12 || 12;
    return `${horas12}:${minutos} ${ampm}`;
}

function obtenerDiaSemana(fecha) {
    const partes = fecha.split('-');
    const date = new Date(partes[0], partes[1] - 1, partes[2]);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[date.getDay()];
}

function esMismoDia(fecha1, fecha2) {
    // fecha1: string YYYY-MM-DD
    // fecha2: Date object
    if (!fecha1) return false;
    const partes = fecha1.split('-');
    const d1Year = parseInt(partes[0]);
    const d1Month = parseInt(partes[1]) - 1;
    const d1Day = parseInt(partes[2]);

    return d1Year === fecha2.getFullYear() &&
        d1Month === fecha2.getMonth() &&
        d1Day === fecha2.getDate();
}

function esEstaSemana(fecha) {
    const hoy = new Date();
    const fechaVenta = new Date(fecha + 'T00:00:00');

    // Obtener el lunes de esta semana
    const primerDiaSemana = new Date(hoy);
    const diaSemana = hoy.getDay() || 7; // Convertir domingo (0) a 7 para facilitar cálculo
    primerDiaSemana.setDate(hoy.getDate() - diaSemana + 1);
    primerDiaSemana.setHours(0, 0, 0, 0);

    // Obtener el final de la semana
    const ultimoDiaSemana = new Date(primerDiaSemana);
    ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
    ultimoDiaSemana.setHours(23, 59, 59, 999);

    return fechaVenta >= primerDiaSemana && fechaVenta <= ultimoDiaSemana;
}

function esEsteMes(fecha) {
    const hoy = new Date();
    const fechaVenta = new Date(fecha + 'T00:00:00');
    return fechaVenta.getMonth() === hoy.getMonth() &&
        fechaVenta.getFullYear() === hoy.getFullYear();
}

// ==========================================
// ALMACENAMIENTO - LOCALSTORAGE
// ==========================================
async function cargarVentas() {
    try {
        // Simular pequeño delay para UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const rawData = localStorage.getItem(DB_KEY);
        ventasCache = rawData ? JSON.parse(rawData) : [];

        actualizarEstadisticas();
        renderizarVentas();
    } catch (error) {
        console.error('Error cargando ventas:', error);
        mostrarToast('Error al cargar las ventas', 'error');
    }
}

async function guardarVenta(ventaData) {
    try {
        // Crear nueva venta con ID único
        const nuevaVenta = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            ...ventaData,
            createdAt: new Date().toISOString()
        };

        // Agregar al inicio del array
        ventasCache.unshift(nuevaVenta);

        // Guardar persistente
        localStorage.setItem(DB_KEY, JSON.stringify(ventasCache));

        actualizarEstadisticas();
        actualizarListaVendedores();
        renderizarVentas();
        mostrarToast('¡Venta registrada correctamente! 🎉', 'success');

        return nuevaVenta;
    } catch (error) {
        console.error('Error guardando venta:', error);
        mostrarToast('Error al guardar la venta', 'error');
        throw error;
    }
}

async function actualizarVenta(id, ventaData) {
    try {
        const index = ventasCache.findIndex(v => v.id === id);
        if (index === -1) throw new Error('Venta no encontrada');

        // Mantener propiedades originales como fecha creación
        const ventaActualizada = {
            ...ventasCache[index],
            ...ventaData,
            updatedAt: new Date().toISOString()
        };

        ventasCache[index] = ventaActualizada;

        localStorage.setItem(DB_KEY, JSON.stringify(ventasCache));

        actualizarEstadisticas();
        actualizarListaVendedores();
        renderizarVentas();
        mostrarToast('¡Venta actualizada correctamente! ✅', 'success');

        return ventaActualizada;
    } catch (error) {
        console.error('Error actualizando venta:', error);
        mostrarToast('Error al actualizar la venta', 'error');
        throw error;
    }
}

async function eliminarVenta(id) {
    try {
        ventasCache = ventasCache.filter(v => v.id !== id);
        localStorage.setItem(DB_KEY, JSON.stringify(ventasCache));

        actualizarEstadisticas();
        actualizarListaVendedores();
        renderizarVentas();
        mostrarToast('Venta eliminada', 'success');
    } catch (error) {
        console.error('Error eliminando venta:', error);
        mostrarToast('Error al eliminar la venta', 'error');
        throw error;
    }
}

// ==========================================
// ESTADÍSTICAS
// ==========================================
function actualizarEstadisticas() {
    const hoy = new Date();

    // Ventas de hoy
    const ventasHoy = ventasCache
        .filter(v => esMismoDia(v.fecha, hoy))
        .reduce((sum, v) => sum + (parseFloat(v.monto) || 0), 0);

    // Ventas del mes
    const ventasMes = ventasCache
        .filter(v => esEsteMes(v.fecha))
        .reduce((sum, v) => sum + (parseFloat(v.monto) || 0), 0);

    // Total registros
    const totalRegistros = ventasCache.length;

    // Actualizar UI con animación
    animarNumero('ventas-hoy', ventasHoy, 'S/ ');
    animarNumero('ventas-mes', ventasMes, 'S/ ');
    document.getElementById('total-registros').textContent = totalRegistros;
}

function animarNumero(elementId, valor, prefijo = '') {
    const element = document.getElementById(elementId);
    const valorFinal = parseFloat(valor) || 0;
    const duracion = 500;
    const fps = 60;
    const incremento = valorFinal / (duracion / 1000 * fps);
    let valorActual = 0;

    const intervalo = setInterval(() => {
        valorActual += incremento;
        if (valorActual >= valorFinal) {
            valorActual = valorFinal;
            clearInterval(intervalo);
        }
        element.textContent = `${prefijo}${valorActual.toFixed(2)}`;
    }, 1000 / fps);
}

// ==========================================
// RENDERIZADO
// ==========================================
function renderizarVentas() {
    const container = document.getElementById('lista-ventas');

    // Filtrar según selección
    let ventasFiltradas = [...ventasCache];

    if (filtroActual === 'semana') {
        ventasFiltradas = ventasFiltradas.filter(v => esEstaSemana(v.fecha));
    } else if (filtroActual === 'mes') {
        ventasFiltradas = ventasFiltradas.filter(v => esEsteMes(v.fecha));
    }

    // Ordenar por fecha descendente
    ventasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (ventasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fas fa-receipt text-5xl mb-4"></i>
                <p>No hay ventas registradas</p>
                <p class="text-sm">${filtroActual === 'todos' ? '¡Registra tu primera venta!' : 'No hay ventas en este período'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = ventasFiltradas.map((venta, index) => `
        <div class="venta-card rounded-xl p-4 relative" style="animation-delay: ${index * 0.05}s">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="dia-badge">${obtenerDiaSemana(venta.fecha)}</span>
                        <span class="text-gray-500 text-sm">${formatearFecha(venta.fecha)}</span>
                    </div>
                    <p class="text-2xl font-bold venta-monto">S/ ${parseFloat(venta.monto).toFixed(2)}</p>
                    ${venta.vendedor ? `
                        <p class="text-gray-600 text-sm mt-1">
                            <i class="fas fa-user text-blue-400 mr-1"></i> ${venta.vendedor}
                        </p>
                    ` : ''}
                    ${venta.hora_inicio || venta.hora_fin ? `
                        <p class="text-gray-500 text-xs mt-1 bg-gray-50 inline-block px-2 py-1 rounded-lg border border-gray-100">
                            <i class="fas fa-clock text-orange-400 mr-1"></i>
                            ${formatearHoraAmPm(venta.hora_inicio) || '--:--'} - ${formatearHoraAmPm(venta.hora_fin) || '--:--'}
                        </p>
                    ` : ''}
                    ${venta.notas ? `
                        <p class="text-gray-400 text-xs mt-2 italic">
                            <i class="fas fa-sticky-note text-yellow-400 mr-1"></i> ${venta.notas}
                        </p>
                    ` : ''}
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="abrirModalEditar('${venta.id}')" 
                        class="accion-btn editar text-gray-400 hover:text-blue-500 transition-colors p-2"
                        title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmarEliminar('${venta.id}')" 
                        class="accion-btn eliminar text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// FILTROS
// ==========================================
function filtrarVentas(filtro) {
    filtroActual = filtro;

    // Actualizar botones
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-amber-500', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });

    event.target.classList.remove('bg-gray-100', 'text-gray-600');
    event.target.classList.add('active', 'bg-amber-500', 'text-white');

    renderizarVentas();
}

// ==========================================
// MODAL DE EDICIÓN
// ==========================================
function abrirModalEditar(id) {
    const venta = ventasCache.find(v => v.id === id);
    if (!venta) return;

    document.getElementById('editar-id').value = venta.id;
    document.getElementById('editar-fecha').value = venta.fecha ? venta.fecha.split('T')[0] : '';
    document.getElementById('editar-monto').value = venta.monto;
    document.getElementById('editar-vendedor').value = venta.vendedor || '';

    // Asignar hora inicio
    descomponerHoraParaSelects(venta.hora_inicio, 'editar-hora-inicio');
    // Asignar hora fin
    descomponerHoraParaSelects(venta.hora_fin, 'editar-hora-fin');

    document.getElementById('editar-notas').value = venta.notas || '';

    const modal = document.getElementById('modal-editar');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);
}

function cerrarModal() {
    const modal = document.getElementById('modal-editar');
    modal.classList.remove('show');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// ==========================================
// CONFIRMACIÓN DE ELIMINACIÓN
// ==========================================
function confirmarEliminar(id) {
    const venta = ventasCache.find(v => v.id === id);
    if (!venta) return;

    const confirmacion = confirm(`¿Estás seguro de eliminar la venta de S/ ${parseFloat(venta.monto).toFixed(2)} del ${formatearFecha(venta.fecha)}?`);

    if (confirmacion) {
        eliminarVenta(id);
    }
}

// ==========================================
// TOAST / NOTIFICACIONES
// ==========================================
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMensaje = document.getElementById('toast-mensaje');

    toastMensaje.textContent = mensaje;
    toast.classList.remove('success', 'error');
    toast.classList.add(tipo, 'show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// EVENTOS
// ==========================================
// Auxiliar: Construye HH:mm (24h) desde selects (h, m, ampm)
function construirHoraDesdeSelects(prefixId) {
    const h = document.getElementById(`${prefixId}-h`).value;
    const m = document.getElementById(`${prefixId}-m`).value;
    const ampm = document.getElementById(`${prefixId}-ampm`).value;

    if (!h || !m) return '';

    let horas = parseInt(h);
    if (ampm === 'PM' && horas !== 12) horas += 12;
    if (ampm === 'AM' && horas === 12) horas = 0;

    return `${String(horas).padStart(2, '0')}:${m}`;
}

// Auxiliar: Llena los selects desde HH:mm (24h)
function descomponerHoraParaSelects(hora24, prefixId) {
    if (!hora24) {
        document.getElementById(`${prefixId}-h`).value = '';
        document.getElementById(`${prefixId}-m`).value = '00';
        document.getElementById(`${prefixId}-ampm`).value = 'AM';
        return;
    }

    const [h, m] = hora24.split(':');
    let horas = parseInt(h);
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12; // el 0 se vuelve 12

    document.getElementById(`${prefixId}-h`).value = horas;
    document.getElementById(`${prefixId}-m`).value = m;
    document.getElementById(`${prefixId}-ampm`).value = ampm;
}

// ==========================================
// EVENTOS
// ==========================================
function configurarEventos() {
    // Formulario de nueva venta
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
        e.preventDefault();

        const ventaData = {
            fecha: document.getElementById('fecha').value,
            monto: parseFloat(document.getElementById('monto').value),
            vendedor: document.getElementById('vendedor').value.trim(),
            hora_inicio: construirHoraDesdeSelects('hora-inicio'),
            hora_fin: construirHoraDesdeSelects('hora-fin'),
            notas: document.getElementById('notas').value.trim(),
            temporada: obtenerTemporada(document.getElementById('fecha').value)
        };

        try {
            await guardarVenta(ventaData);
            e.target.reset();
            // Restablecer fecha a hoy
            establecerFechaLocalInput('fecha');
        } catch (error) {
            // Error ya manejado en guardarVenta
        }
    });

    // Formulario de edición
    document.getElementById('form-editar').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editar-id').value;
        const fecha = document.getElementById('editar-fecha').value;
        const ventaData = {
            fecha: fecha,
            monto: parseFloat(document.getElementById('editar-monto').value),
            vendedor: document.getElementById('editar-vendedor').value.trim(),
            hora_inicio: construirHoraDesdeSelects('editar-hora-inicio'),
            hora_fin: construirHoraDesdeSelects('editar-hora-fin'),
            notas: document.getElementById('editar-notas').value.trim(),
            temporada: obtenerTemporada(fecha) // Recalcular temporada al editar
        };

        try {
            await actualizarVenta(id, ventaData);
            cerrarModal();
        } catch (error) {
            // Error ya manejado en actualizarVenta
        }
    });
}

// ==========================================
// EXPORTAR Y BACKUP
// ==========================================
function exportarDatos() {
    if (ventasCache.length === 0) {
        mostrarToast('No hay datos para exportar', 'error');
        return;
    }

    const dataStr = JSON.stringify(ventasCache, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `backup_molleventas_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    mostrarToast('Backup descargado correctamente 📦', 'success');
}

window.exportarDatos = exportarDatos; // Exponer globalmente

// Cerrar modal al hacer clic fuera
document.getElementById('modal-editar').addEventListener('click', (e) => {
    if (e.target.id === 'modal-editar') {
        cerrarModal();
    }
});

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModal();
    }
});

// Exponer funciones al scope global para los onclick en HTML
window.filtrarVentas = filtrarVentas;
window.abrirModalEditar = abrirModalEditar;
window.cerrarModal = cerrarModal;
window.confirmarEliminar = confirmarEliminar;

// Acceso a datos para analíticas
window.obtenerVentasGlobal = () => ventasCache;
