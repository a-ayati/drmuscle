// يولّد src/dark.css: ألوان الوضع الليلي لكل صنف لون مستعمل في الواجهة.
// شغّله بعد إضافة ألوان جديدة: node scripts/gen-dark-css.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname;

const rgba = (rgb, a) => `rgb(${rgb} / ${+a.toFixed(3)})`;
const EM = '16 185 129';
const AM = '245 158 11';
const SK = '14 165 233';
const RO = '244 63 94';

// [خلفية/نص/حد][اللون] → [قيمة ليلية rgb، الشفافية الأساسية]
const MAP = {
  bg: {
    white: ['20 27 26', 1],
    'slate-50': ['24 33 31', 1],
    'slate-100': ['31 41 39', 1],
    'slate-200': ['42 53 51', 1],
    'slate-300': ['54 66 63', 1],
    '[#fbfbf9]': ['11 17 16', 1],
    'emerald-50': [EM, 0.1],
    'emerald-100': [EM, 0.18],
    'emerald-200': [EM, 0.26],
    'amber-50': [AM, 0.1],
    'amber-100': [AM, 0.18],
    'sky-50': [SK, 0.1],
    'rose-50': [RO, 0.12],
  },
  text: {
    'slate-900': ['241 245 244', 1],
    'slate-800': ['227 233 231', 1],
    'slate-700': ['205 214 211', 1],
    'slate-600': ['170 182 178', 1],
    'slate-500': ['140 154 150', 1],
    'emerald-600': ['52 211 153', 1],
    'emerald-700': ['52 211 153', 1],
    'emerald-800': ['110 231 183', 1],
    'emerald-900': ['167 243 208', 1],
    'emerald-950': ['209 250 229', 1],
    'amber-600': ['251 191 36', 1],
    'amber-800': ['252 211 77', 1],
    'amber-900': ['253 230 138', 1],
    'amber-950': ['254 243 199', 1],
    'sky-600': ['56 189 248', 1],
    'rose-700': ['251 113 133', 1],
  },
  border: {
    white: ['42 53 51', 1],
    'slate-100': ['31 42 40', 1],
    'slate-200': ['43 55 53', 1],
    'slate-300': ['58 71 68', 1],
    'emerald-100': [EM, 0.2],
    'emerald-200': [EM, 0.3],
    'emerald-300': [EM, 0.45],
    'amber-100': [AM, 0.2],
    'amber-200': [AM, 0.3],
    'amber-300': [AM, 0.45],
    'sky-100': [SK, 0.25],
    'rose-300': [RO, 0.45],
  },
  divide: { 'slate-100': ['31 42 40', 1], 'slate-200': ['43 55 53', 1] },
  fill: { 'emerald-50': [EM, 0.15] },
};

const PROP = {
  bg: 'background-color',
  text: 'color',
  border: 'border-color',
  divide: 'border-color',
  fill: 'fill',
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const esc = (cls) => cls.replace(/([:/\[\]#.%!])/g, '\\$1');
const BREAK = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' };

const tokens = new Set();
const re = /(?:^|[\s"'`{])((?:[a-z-]+:)*!?(bg|text|border|divide|fill)-((?:white|slate-\d+|emerald-\d+|amber-\d+|sky-\d+|rose-\d+|\[#fbfbf9\]))(?:\/(\d+))?)(?=[\s"'`}]|$)/g;
for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(re)) tokens.add(m[1]);
}

const rules = [];
for (const token of [...tokens].sort()) {
  const parts = token.split(':');
  const util = parts.pop().replace(/^!/, '');
  const m = util.match(/^(bg|text|border|divide|fill)-(.+?)(?:\/(\d+))?$/);
  if (!m) continue;
  const [, kind, color, op] = m;
  const entry = MAP[kind]?.[color];
  if (!entry) continue;
  const alpha = entry[1] * (op ? Number(op) / 100 : 1);
  const value = rgba(entry[0], alpha);

  let selector = `.${esc(token)}`;
  let media = null;
  let groupPrefix = '';
  let skip = false;
  for (const v of parts) {
    if (v === 'hover') selector += ':hover';
    else if (v === 'focus') selector += ':focus';
    else if (v === 'focus-visible') selector += ':focus-visible';
    else if (v === 'active') selector += ':active';
    else if (v === 'disabled') selector += ':disabled';
    else if (v === 'group-hover') groupPrefix = '.group:hover ';
    else if (v === 'placeholder') selector += '::placeholder';
    else if (BREAK[v]) media = BREAK[v];
    else skip = true; // selection: وغيرها
  }
  if (skip) continue;
  const target = kind === 'divide' ? `${selector} > :not(:last-child)` : selector;
  const rule = `html.dark ${groupPrefix}${target} { ${PROP[kind]}: ${value}; }`;
  rules.push(media ? `@media (min-width: ${media}) { ${rule} }` : rule);
}

const header = `/* مولَّد تلقائياً بواسطة scripts/gen-dark-css.mjs — لا تعدّله يدوياً. */\n`;
writeFileSync(join(SRC, 'dark.css'), header + rules.join('\n') + '\n');
console.log(`dark.css: ${rules.length} rules from ${tokens.size} color classes`);
