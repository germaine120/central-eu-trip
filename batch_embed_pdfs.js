// batch_embed_pdfs.js
// 扫描 tickets/<类别>/ 子目录下的 *.pdf，按「子目录名 → 类别」与「文件名 (M.D) 日期前缀」自动归类，
// 转 base64 内嵌写入 trip-data.json 的 tickets 字段。
// 用法：把 PDF 按类别放进子目录（hotel / restaurant / spot / traffic），然后 `node batch_embed_pdfs.js`
const fs = require('fs');
const path = require('path');

const dataPath = 'trip-data.json';
const dir = 'tickets';

const f = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const year = (f.meta && f.meta.start ? f.meta.start : '2026-09-23').slice(0, 4);
const startDay = (f.meta && f.meta.start) ? f.meta.start : year + '-09-23';

// 子目录名 → 类别（与 App 筛选 chips 对应）
const folderMap = {
  hotel: '酒店',
  restaurant: '餐厅',
  spot: '景点',
  traffic: '交通',
};

if (!fs.existsSync(dir)) { console.error('找不到 tickets/ 目录'); process.exit(1); }

const pad = n => String(n).padStart(2, '0');

function parseDates(name) {
  const m = name.match(/\((\d{1,2})\.(\d{1,2})(?:-(\d{1,2})(?:\.(\d{1,2}))?)?\)/);
  if (!m) return null;
  let sm = +m[1], sd = +m[2];
  let em = sm, ed = sd;
  if (m[3]) { em = +m[3]; ed = m[4] ? +m[4] : sd; }
  if (ed < sd) em = sm + 1; // 跨月（如 9.30-10.2）
  return { start: `${year}-${pad(sm)}-${pad(sd)}`, end: `${year}-${pad(em)}-${pad(ed)}` };
}

// 扫描 tickets/ 下所有子目录与根目录
const tickets = [];
const entries = fs.readdirSync(dir, { withFileTypes: true });
for (const e of entries) {
  if (!e.isDirectory()) continue;
  const folder = e.name;
  const category = folderMap[folder] || folder; // 未知子目录直接用目录名作类别
  const sub = path.join(dir, folder);
  const files = fs.readdirSync(sub).filter(x => x.toLowerCase().endsWith('.pdf'));
  for (const fn of files) {
    const buf = fs.readFileSync(path.join(sub, fn));
    const pdf = 'data:application/pdf;base64,' + buf.toString('base64');
    const base = fn.replace(/\.pdf$/i, '');
    const dr = parseDates(base);
    let date = startDay;
    let dateRange = null;
    if (dr) {
      date = dr.start;
      if (dr.start !== dr.end) dateRange = `${dr.start}..${dr.end}`;
    } else {
      console.log(`  ⚠ [${folder}] 未识别 (月.日) 前缀，已归入首日 ${startDay}：${fn}`);
    }
    const title = base.replace(/\([^)]*\)/, '').trim() || base;
    tickets.push({
      id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      date, dateRange, category,
      title_zh: title, title_en: '',
      file: `tickets/${folder}/${fn}`,
      pdf,
      note: dr && dr.start !== dr.end ? `${dr.start} ~ ${dr.end}` : ''
    });
    console.log(`  ✓ [${category}] ${fn}  → ${dateRange || date}`);
  }
}

if (tickets.length === 0) { console.log('tickets/ 下各子目录没有 PDF。'); process.exit(0); }

f.tickets = tickets;
fs.writeFileSync(dataPath, JSON.stringify(f, null, 2));
console.log(`\n完成：内嵌 ${tickets.length} 个 PDF，已按子目录类别重建 trip-data.json 的 tickets。`);
console.log('把 trip-data.json 导入 App 即可：顶部日期栏按天浏览，分类 chips 可按 酒店/餐厅/景点/交通 筛选全部文件。');
