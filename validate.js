const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/const DEFAULT_DATA = (\{[\s\S]*?\n    \};)/);
let ok = true;
if (!m) { console.log('XX DEFAULT_DATA not found'); ok = false; }
else {
  try {
    const o = new Function('return ' + m[1])();
    console.log('DEFAULT_DATA OK -> itinerary', o.itinerary.length, '| checklist', o.checklist.length, '| bookings', Object.keys(o.bookings).length, '| tickets', o.tickets.length);
  } catch (e) { console.log('XX eval:', e.message); ok = false; }
}
const checks = {
  'tickets tab': html.includes("tab==='tickets'"),
  'ticketsForDay getter': html.includes('get ticketsForDay()'),
  'groupedBookings getter': html.includes('get groupedBookings()'),
  'openTicketForm': html.includes('openTicketForm('),
  'saveTicket': html.includes('saveTicket()'),
  'showTicketForm': html.includes('showTicketForm'),
  'no leg.pdf button': !html.includes('leg.pdf'),
  'schema has tickets': html.includes('tickets:[{id,date'),
  'editingTicket bound': html.includes('x-model="editingTicket.file"'),
  'tabbar has 4 tabs': (html.match(/id: '(checklist|itinerary|accounting|tickets)'/g) || []).length === 4,
};
for (const k in checks) { console.log((checks[k] ? 'OK ' : 'XX ') + k); if (!checks[k]) ok = false; }
console.log(ok ? 'ALL_OK' : 'HAS_ISSUES');
