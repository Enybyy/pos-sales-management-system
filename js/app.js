/** MolleVentas: local shift-sales register. */
const DB_KEY = 'molleventas_db_v1';
let ventasCache = [];
let filtroActual = 'todos';
let storageReady = true;
let toastTimer;
let editFocus;
const $ = id => document.getElementById(id);
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

document.addEventListener('DOMContentLoaded', inicializarApp);
function inicializarApp() {
    mostrarFechaActual();
    establecerFechaLocalInput('fecha');
    cargarVentas();
    configurarEventos();
    document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
    document.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
        if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', input.id.replaceAll('-', ' '));
    });
}
function establecerFechaLocalInput(id) { $(id).value = MolleCore.today(); }
function mostrarFechaActual() {
    const label = new Date(MolleCore.today() + 'T12:00:00Z').toLocaleDateString('es-PE', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    $('fecha-actual').textContent = label.charAt(0).toUpperCase() + label.slice(1);
}
function formatearFecha(value) {
    return new Date(value + 'T12:00:00Z').toLocaleDateString('es-PE', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function formatearHoraAmPm(value) {
    if (!value) return '';
    const [hour, minute] = value.split(':');
    return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`;
}
function obtenerDiaSemana(value) { return dias[MolleCore.weekday(value)]; }
function esEstaSemana(value) { return MolleCore.inWeek(value); }
function esEsteMes(value) { return MolleCore.inMonth(value); }
function actualizarVista() {
    actualizarEstadisticas(); actualizarListaVendedores(); renderizarVentas();
    if (!$('modal-dashboard').classList.contains('hidden')) actualizarDashboard(ventasCache);
}
function cargarVentas() {
    try {
        const raw = localStorage.getItem(DB_KEY);
        const next = raw === null ? MolleCore.demo() : MolleCore.records(JSON.parse(raw));
        if (raw === null) localStorage.setItem(DB_KEY, JSON.stringify(next));
        ventasCache = next;
    } catch (error) {
        storageReady = false;
        $('storage-alert').hidden = false;
        $('storage-alert').textContent = 'No se pudo abrir el almacenamiento. Tus datos originales se conservan. Descarga el archivo original o restaura una copia válida antes de registrar ventas.';
        mostrarToast('Almacenamiento no disponible o datos inválidos.', 'error');
    }
    actualizarVista();
}
function persistir(next) {
    if (!storageReady) throw new Error('Restaura una copia válida antes de registrar ventas.');
    next = MolleCore.records(next);
    // Commit memory only after durable storage succeeds.
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    ventasCache = next;
    actualizarVista();
}
async function guardarVenta(data) {
    try {
        const next = { id: crypto.randomUUID(), ...MolleCore.sale(data), createdAt: new Date().toISOString() };
        persistir([next, ...ventasCache]);
        mostrarToast('Venta registrada correctamente.');
        return next;
    } catch (error) { mostrarToast(error.message || 'No se pudo guardar la venta.', 'error'); throw error; }
}
async function actualizarVenta(id, data) {
    try {
        if (!ventasCache.some(sale => sale.id === id)) throw new Error('Venta no encontrada.');
        const next = ventasCache.map(sale => sale.id === id ? { ...sale, ...MolleCore.sale(data), updatedAt: new Date().toISOString() } : sale);
        persistir(next);
        mostrarToast('Venta actualizada correctamente.');
    } catch (error) { mostrarToast(error.message || 'No se pudo actualizar la venta.', 'error'); throw error; }
}
async function eliminarVenta(id) {
    try { persistir(ventasCache.filter(sale => sale.id !== id)); mostrarToast('Venta eliminada.'); }
    catch (error) { mostrarToast(error.message || 'No se pudo eliminar la venta.', 'error'); }
}
function actualizarEstadisticas() {
    $('ventas-hoy').textContent = `S/ ${MolleCore.sum(ventasCache.filter(sale => sale.fecha === MolleCore.today())).toFixed(2)}`;
    $('ventas-mes').textContent = `S/ ${MolleCore.sum(ventasCache.filter(sale => esEsteMes(sale.fecha))).toFixed(2)}`;
    $('total-registros').textContent = ventasCache.length;
}
function actualizarListaVendedores() {
    $('lista-vendedores').replaceChildren();
    [...new Set(ventasCache.map(sale => sale.vendedor).filter(Boolean))].sort().forEach(value => {
        const option = document.createElement('option'); option.value = value; $('lista-vendedores').append(option);
    });
}
function renderizarVentas() {
    const filtered = ventasCache.filter(sale => filtroActual === 'todos' || (filtroActual === 'semana' ? esEstaSemana(sale.fecha) : esEsteMes(sale.fecha))).sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    $('lista-ventas').innerHTML = filtered.length ? filtered.map(sale => `
        <article class="venta-card rounded-xl p-4 relative">
            <div class="flex items-start justify-between gap-3"><div class="flex-1 min-w-0">
                <div class="flex items-center flex-wrap gap-2 mb-2"><span class="dia-badge">${obtenerDiaSemana(sale.fecha)}</span><span class="text-gray-500 text-sm">${formatearFecha(sale.fecha)}</span></div>
                <p class="text-2xl font-bold venta-monto">S/ ${sale.monto.toFixed(2)}</p>
                ${sale.vendedor ? `<p class="text-gray-600 text-sm mt-1"><i class="fas fa-user text-blue-400 mr-1" aria-hidden="true"></i> ${MolleCore.escape(sale.vendedor)}</p>` : ''}
                ${sale.hora_inicio ? `<p class="text-gray-500 text-xs mt-1 bg-gray-50 inline-block px-2 py-1 rounded-lg border border-gray-100"><i class="fas fa-clock text-orange-400 mr-1" aria-hidden="true"></i> ${formatearHoraAmPm(sale.hora_inicio)} – ${formatearHoraAmPm(sale.hora_fin)}${sale.hora_fin < sale.hora_inicio ? ' (+1 día)' : ''}</p>` : ''}
                ${sale.notas ? `<p class="text-gray-500 text-xs mt-2 italic">${MolleCore.escape(sale.notas)}</p>` : ''}
            </div><div class="flex flex-col gap-2">
                <button data-action="edit" data-id="${sale.id}" class="accion-btn editar text-gray-500 p-2" aria-label="Editar venta de ${sale.monto.toFixed(2)} soles"><i class="fas fa-edit" aria-hidden="true"></i></button>
                <button data-action="delete" data-id="${sale.id}" class="accion-btn eliminar text-gray-500 p-2" aria-label="Eliminar venta de ${sale.monto.toFixed(2)} soles"><i class="fas fa-trash" aria-hidden="true"></i></button>
            </div></div>
        </article>`).join('') : '<div class="text-center py-12 text-gray-500"><i class="fas fa-receipt text-5xl mb-4" aria-hidden="true"></i><p>No hay ventas en este período.</p><p class="text-sm">Registra un turno o cambia el filtro.</p></div>';
}
function filtrarVentas(filter, button) {
    if (!['todos', 'semana', 'mes'].includes(filter)) return;
    filtroActual = filter;
    document.querySelectorAll('.filtro-btn').forEach(item => {
        const selected = item === button || item.dataset.filter === filter;
        item.classList.toggle('active', selected); item.classList.toggle('bg-amber-500', selected); item.classList.toggle('text-white', selected);
        item.classList.toggle('bg-gray-100', !selected); item.classList.toggle('text-gray-600', !selected); item.setAttribute('aria-pressed', String(selected));
    });
    renderizarVentas();
}
function abrirModalEditar(id) {
    const sale = ventasCache.find(sale => sale.id === id); if (!sale) return;
    editFocus = document.activeElement;
    for (const field of ['id', 'fecha', 'monto', 'vendedor', 'notas']) $(`editar-${field}`).value = sale[field] || '';
    descomponerHoraParaSelects(sale.hora_inicio, 'editar-hora-inicio');
    descomponerHoraParaSelects(sale.hora_fin, 'editar-hora-fin');
    $('modal-editar').classList.remove('hidden'); $('modal-editar').classList.add('show');
    document.body.style.overflow = 'hidden'; $('editar-fecha').focus();
}
function cerrarModal() {
    if (!$('modal-editar').classList.contains('show')) return;
    $('modal-editar').classList.remove('show'); $('modal-editar').classList.add('hidden'); document.body.style.overflow = '';
    if (editFocus && editFocus.isConnected) editFocus.focus();
    else $('monto').focus();
}
function confirmarEliminar(id) {
    const sale = ventasCache.find(sale => sale.id === id);
    if (sale && confirm(`¿Eliminar la venta de S/ ${sale.monto.toFixed(2)} del ${formatearFecha(sale.fecha)}?`)) eliminarVenta(id);
}
function mostrarToast(message, type = 'success') {
    clearTimeout(toastTimer); $('toast-mensaje').textContent = message; $('toast').classList.remove('success', 'error'); $('toast').classList.add(type, 'show');
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4500);
}
function construirHoraDesdeSelects(prefix) {
    const h = $(`${prefix}-h`).value, m = $(`${prefix}-m`).value, period = $(`${prefix}-ampm`).value;
    if (!h) return '';
    return `${String(Number(h) % 12 + (period === 'PM' ? 12 : 0)).padStart(2, '0')}:${m}`;
}
function descomponerHoraParaSelects(time, prefix) {
    const [h, m] = (time || '00:00').split(':');
    $(`${prefix}-h`).value = time ? Number(h) % 12 || 12 : '';
    $(`${prefix}-m`).value = m; $(`${prefix}-ampm`).value = Number(h) >= 12 ? 'PM' : 'AM';
}
function formData(prefix = '') {
    return { fecha: $(prefix + 'fecha').value, monto: $(prefix + 'monto').value, vendedor: $(prefix + 'vendedor').value, hora_inicio: construirHoraDesdeSelects(prefix + 'hora-inicio'), hora_fin: construirHoraDesdeSelects(prefix + 'hora-fin'), notas: $(prefix + 'notas').value };
}
function descargarJSON(content, name) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportarDatos() {
    if (!storageReady) { descargarOriginal(); return; }
    descargarJSON(JSON.stringify(ventasCache, null, 2), `backup_molleventas_${MolleCore.today()}.json`); mostrarToast('Copia JSON descargada.');
}
function descargarOriginal() {
    try { descargarJSON(localStorage.getItem(DB_KEY) || '[]', 'molleventas_original.json'); }
    catch { mostrarToast('El navegador bloquea el almacenamiento. Permite su uso y recarga.', 'error'); }
}
async function importarDatos(event) {
    const file = event.target.files[0]; if (!file) return;
    try {
        if (file.size > 10 * 1024 * 1024) throw new Error('La copia no puede superar 10 MB.');
        const next = MolleCore.records(JSON.parse(await file.text()));
        if (!confirm(`¿Restaurar ${next.length} ventas? Reemplazará los datos locales. Descarga primero una copia si quieres conservarlos.`)) return;
        localStorage.setItem(DB_KEY, JSON.stringify(next)); ventasCache = next; storageReady = true; $('storage-alert').hidden = true; actualizarVista();
        mostrarToast('Copia restaurada correctamente.');
    } catch (error) { mostrarToast(error instanceof SyntaxError ? 'El archivo no contiene JSON válido.' : error.message, 'error'); }
    finally { event.target.value = ''; }
}
function restaurarDemo() {
    if (!confirm('¿Reemplazar las ventas locales por seis registros ficticios de ejemplo? Descarga antes una copia para conservar tus cambios.')) return;
    try { localStorage.setItem(DB_KEY, JSON.stringify(MolleCore.demo())); storageReady = true; $('storage-alert').hidden = true; cargarVentas(); mostrarToast('Datos de ejemplo restaurados.'); }
    catch { mostrarToast('El navegador no permite guardar datos.', 'error'); }
}
function configurarEventos() {
    $('form-venta').addEventListener('submit', async event => {
        event.preventDefault();
        try { await guardarVenta(formData()); event.target.reset(); establecerFechaLocalInput('fecha'); } catch {}
    });
    $('form-editar').addEventListener('submit', async event => {
        event.preventDefault(); try { await actualizarVenta($('editar-id').value, formData('editar-')); cerrarModal(); } catch {}
    });
    $('lista-ventas').addEventListener('click', event => {
        const button = event.target.closest('[data-action]'); if (!button) return;
        button.dataset.action === 'edit' ? abrirModalEditar(button.dataset.id) : confirmarEliminar(button.dataset.id);
    });
    $('import-file').addEventListener('change', importarDatos);
    $('modal-editar').addEventListener('click', event => { if (event.target.id === 'modal-editar') cerrarModal(); });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') cerrarModal();
        if (event.key !== 'Tab') return;
        const modal = document.querySelector('#modal-editar.show') || (!$('modal-dashboard').classList.contains('hidden') ? $('modal-dashboard') : null);
        if (!modal) return;
        const focusable = [...modal.querySelectorAll('button, input:not([type="hidden"]), select, textarea, a[href]')];
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener('storage', event => { if (event.key === DB_KEY) { storageReady = true; cargarVentas(); } });
}
window.obtenerVentasGlobal = () => ventasCache;
