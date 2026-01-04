/**
 * MolleVentas - Sistema de Ventas
 * Módulo principal de la aplicación
 * v1.0.0
 */

// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
const API_BASE = 'tables/ventas_diarias';
let ventasCache = [];
let filtroActual = 'todos';

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

async function inicializarApp() {
    // Mostrar fecha actual
    mostrarFechaActual();
    
    // Establecer fecha de hoy en el formulario
    document.getElementById('fecha').valueAsDate = new Date();
    
    // Cargar ventas existentes
    await cargarVentas();
    
    // Configurar eventos
    configurarEventos();
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
    const date = new Date(fecha);
    const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', opciones);
}

function obtenerDiaSemana(fecha) {
    const date = new Date(fecha);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[date.getDay()];
}

function esMismoDia(fecha1, fecha2) {
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return d1.toDateString() === d2.toDateString();
}

function esEstaSemana(fecha) {
    const hoy = new Date();
    const fechaVenta = new Date(fecha);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    return fechaVenta >= inicioSemana;
}

function esEsteMes(fecha) {
    const hoy = new Date();
    const fechaVenta = new Date(fecha);
    return fechaVenta.getMonth() === hoy.getMonth() && 
           fechaVenta.getFullYear() === hoy.getFullYear();
}

// ==========================================
// API - OPERACIONES CRUD
// ==========================================
async function cargarVentas() {
    try {
        const response = await fetch(`${API_BASE}?limit=1000&sort=-fecha`);
        const data = await response.json();
        ventasCache = data.data || [];
        
        actualizarEstadisticas();
        renderizarVentas();
    } catch (error) {
        console.error('Error cargando ventas:', error);
        mostrarToast('Error al cargar las ventas', 'error');
    }
}

async function guardarVenta(ventaData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaData)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        const nuevaVenta = await response.json();
        ventasCache.unshift(nuevaVenta);
        
        actualizarEstadisticas();
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
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar');
        
        const ventaActualizada = await response.json();
        
        // Actualizar cache
        const index = ventasCache.findIndex(v => v.id === id);
        if (index !== -1) {
            ventasCache[index] = ventaActualizada;
        }
        
        actualizarEstadisticas();
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
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        // Eliminar del cache
        ventasCache = ventasCache.filter(v => v.id !== id);
        
        actualizarEstadisticas();
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
                        <p class="text-gray-500 text-xs mt-1">
                            <i class="fas fa-clock text-orange-400 mr-1"></i>
                            ${venta.hora_inicio || '--:--'} - ${venta.hora_fin || '--:--'}
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
    document.getElementById('editar-hora-inicio').value = venta.hora_inicio || '';
    document.getElementById('editar-hora-fin').value = venta.hora_fin || '';
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
function configurarEventos() {
    // Formulario de nueva venta
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ventaData = {
            fecha: document.getElementById('fecha').value,
            monto: parseFloat(document.getElementById('monto').value),
            vendedor: document.getElementById('vendedor').value.trim(),
            hora_inicio: document.getElementById('hora-inicio').value,
            hora_fin: document.getElementById('hora-fin').value,
            notas: document.getElementById('notas').value.trim()
        };
        
        try {
            await guardarVenta(ventaData);
            e.target.reset();
            document.getElementById('fecha').valueAsDate = new Date();
        } catch (error) {
            // Error ya manejado en guardarVenta
        }
    });
    
    // Formulario de edición
    document.getElementById('form-editar').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editar-id').value;
        const ventaData = {
            fecha: document.getElementById('editar-fecha').value,
            monto: parseFloat(document.getElementById('editar-monto').value),
            vendedor: document.getElementById('editar-vendedor').value.trim(),
            hora_inicio: document.getElementById('editar-hora-inicio').value,
            hora_fin: document.getElementById('editar-hora-fin').value,
            notas: document.getElementById('editar-notas').value.trim()
        };
        
        try {
            await actualizarVenta(id, ventaData);
            cerrarModal();
        } catch (error) {
            // Error ya manejado en actualizarVenta
        }
    });
    
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
}

// Exponer funciones al scope global para los onclick en HTML
window.filtrarVentas = filtrarVentas;
window.abrirModalEditar = abrirModalEditar;
window.cerrarModal = cerrarModal;
window.confirmarEliminar = confirmarEliminar;
