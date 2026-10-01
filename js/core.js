/** Pure rules shared by the browser and Node tests. No personal data leaves the browser. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.MolleCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
    const MAX_RECORDS = 10000;
    function today(now = new Date()) {
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    }
    function dateValid(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const parsed = new Date(value + 'T12:00:00Z');
        return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= '1900-01-01';
    }
    function shiftDate(value, days) {
        const date = new Date(value + 'T12:00:00Z');
        date.setUTCDate(date.getUTCDate() + days);
        return date.toISOString().slice(0, 10);
    }
    function weekday(value) { return new Date(value + 'T12:00:00Z').getUTCDay(); }
    function inWeek(value, reference = today()) {
        const monday = shiftDate(reference, 1 - (weekday(reference) || 7));
        return value >= monday && value <= shiftDate(monday, 6);
    }
    function inMonth(value, reference = today()) { return value.slice(0, 7) === reference.slice(0, 7); }
    function cents(value) {
        const number = Number(value);
        if (!Number.isFinite(number) || number <= 0 || number > 999999999 || Math.abs(number * 100 - Math.round(number * 100)) > 0.00001) {
            throw new Error('Ingresa un monto mayor que cero con hasta dos decimales.');
        }
        return Math.round(number * 100);
    }
    function hourValid(value) { return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
    function hours(value) { const [h, m] = value.split(':').map(Number); return h + m / 60; }
    function duration(start, end) {
        if (!hourValid(start) || !hourValid(end)) return 0;
        const delta = hours(end) - hours(start);
        return delta < 0 ? delta + 24 : delta;
    }
    function text(value, limit, field) {
        if (value == null) return '';
        if (typeof value !== 'string' || value.length > limit) throw new Error(`${field}: máximo ${limit} caracteres.`);
        return value.trim();
    }
    function sale(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El registro de venta no es válido.');
        if (!dateValid(value.fecha)) throw new Error('Selecciona una fecha válida.');
        const start = value.hora_inicio || '', end = value.hora_fin || '';
        if ((start && !hourValid(start)) || (end && !hourValid(end))) throw new Error('El horario no es válido.');
        if (Boolean(start) !== Boolean(end)) throw new Error('Completa ambas horas del turno o deja ambas vacías.');
        if (start && duration(start, end) === 0) throw new Error('Inicio y fin no pueden ser iguales. Para un turno nocturno usa su hora de fin real.');
        return { fecha: value.fecha, monto: cents(value.monto) / 100, vendedor: text(value.vendedor, 100, 'Vendedor'), hora_inicio: start, hora_fin: end, notas: text(value.notas, 1000, 'Notas') };
    }
    function records(input) {
        if (!Array.isArray(input) || input.length > MAX_RECORDS) throw new Error(`El archivo debe ser una lista de hasta ${MAX_RECORDS} ventas.`);
        const ids = new Set();
        return input.map(value => {
            if (!value || typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value.id) || ids.has(value.id)) throw new Error('Hay identificadores inválidos o repetidos en el archivo.');
            ids.add(value.id);
            const result = { id: value.id, ...sale(value) };
            for (const field of ['createdAt', 'updatedAt']) {
                if (typeof value[field] === 'string' && Number.isFinite(Date.parse(value[field]))) result[field] = value[field];
            }
            return result;
        });
    }
    function sum(records) { return records.reduce((total, record) => total + cents(record.monto), 0) / 100; }
    function escape(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
    function demo(reference = today()) {
        return [
            [0, 145.50, 'Marta R.', '18:00', '22:30', 'Pedidos de mollejitas con yuca'],
            [0, 98, 'Carlos M.', '18:30', '21:30', 'Turno tarde'],
            [-1, 230, 'Marta R.', '17:30', '23:00', 'Combos familiares y gaseosas'],
            [-1, 180.50, 'Eliud RM', '18:00', '22:45', 'Buena afluencia en el puesto'],
            [-2, 165, 'Carlos M.', '18:00', '22:00', 'Ventas del turno'],
            [-3, 195, 'Marta R.', '17:45', '22:30', 'Mollejitas y cremas de la casa']
        ].map(([offset, monto, vendedor, hora_inicio, hora_fin, notas], index) => ({ id: `demo-${index + 1}`, fecha: shiftDate(reference, offset), monto, vendedor, hora_inicio, hora_fin, notas }));
    }
    return { today, dateValid, shiftDate, weekday, inWeek, inMonth, cents, hours, duration, sale, records, sum, escape, demo };
});
