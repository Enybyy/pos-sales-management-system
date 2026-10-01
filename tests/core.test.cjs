const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const core = require('../js/core.js');
const valid = { id: 'sale-1', fecha: '2026-10-01', monto: 25.5, vendedor: 'Marta', hora_inicio: '23:00', hora_fin: '01:30', notas: '' };

test('Peru date stays on the previous day until 05:00 UTC', () => {
    assert.equal(core.today(new Date('2026-10-01T04:59:59Z')), '2026-09-30');
    assert.equal(core.today(new Date('2026-10-01T05:00:00Z')), '2026-10-01');
});
test('Calendar dates reject rollover and recognize leap years', () => {
    assert.equal(core.dateValid('2025-02-29'), false);
    assert.equal(core.dateValid('2024-02-29'), true);
    assert.equal(core.dateValid('2026-13-01'), false);
    assert.equal(core.shiftDate('2026-01-01', -1), '2025-12-31');
});
test('Week is Monday to Sunday even across a year boundary', () => {
    assert.equal(core.inWeek('2025-12-29', '2026-01-01'), true);
    assert.equal(core.inWeek('2026-01-04', '2026-01-01'), true);
    assert.equal(core.inWeek('2026-01-05', '2026-01-01'), false);
    assert.equal(core.inMonth('2025-10-01', '2026-10-01'), false);
});
test('Amounts have exact cents and reject invalid values', () => {
    assert.equal(core.sum([{ monto: 0.1 }, { monto: 0.2 }]), 0.3);
    for (const monto of [0, -1, NaN, Infinity, 1.001, '']) assert.throws(() => core.sale({ ...valid, monto }));
});
test('Night shifts and optional time pairs are unambiguous', () => {
    assert.equal(core.duration('23:00', '01:30'), 2.5);
    assert.equal(core.sale({ ...valid, hora_inicio: '', hora_fin: '' }).hora_fin, '');
    for (const data of [{ hora_fin: '' }, { hora_fin: '23:00' }, { hora_fin: '24:01' }]) assert.throws(() => core.sale({ ...valid, ...data }));
});
test('Backup validation rejects malformed records and duplicates; an empty backup is valid', () => {
    assert.deepEqual(core.records([]), []);
    assert.throws(() => core.records({ sales: [] }));
    assert.throws(() => core.records([valid, valid]));
    assert.throws(() => core.records([{ ...valid, id: "');alert(1)//" }]));
    assert.throws(() => core.records([{ ...valid, vendedor: 'a'.repeat(101) }]));
    assert.equal(core.records([{ ...valid, hidden: 'discard' }])[0].hidden, undefined);
});
test('Untrusted notes are text, never HTML', () => {
    const escaped = core.escape('<img src=x onerror="alert(1)"> &\'');
    assert.equal(escaped, '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;&#39;');
});
test('Demo uses the requested Peru calendar date and has six valid records', () => {
    const demo = core.records(core.demo('2026-10-01'));
    assert.equal(demo.length, 6);
    assert.equal(core.sum(demo.filter(s => s.fecha === '2026-10-01')), 243.5);
    assert.equal(core.sum(demo), 1014);
});
test('Analytics weigh total revenue by total hours, including midnight crossings', () => {
    const context = { MolleCore: core, document: { addEventListener() {} } };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(require.resolve('../js/analytics.js'), 'utf8'), context);
    const metrics = context.calcularMetricasAvanzadas([
        { ...valid, monto: 100, hora_inicio: '08:00', hora_fin: '09:00' },
        { ...valid, monto: 90, hora_inicio: '23:00', hora_fin: '02:00' }
    ]);
    assert.equal(metrics.velocidadPromedio, 47.5);
    assert.equal(metrics.duracionPromedio, 2);
    assert.equal(context.formatearHoraDecimal(18.999), '19:00');
});
