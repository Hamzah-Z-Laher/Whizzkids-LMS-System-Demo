/* Shared helpers for the parent app, staff portal and sign-in page. */

const svg = (paths) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-6h4v6"/>'),
  book: svg('<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2Z"/><path d="M12 6.5v14"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  wallet: svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16 14.5h2"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  more: svg('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  bell: svg('<path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  checkCircle: svg('<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  left: svg('<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>'),
  right: svg('<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'),
  down: svg('<path d="m6 9.5 6 6 6-6"/>'),
  image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.5-4.5-8.5 8"/>'),
  chat: svg('<path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20.5l1.4-4.6A7.5 7.5 0 1 1 20 12.5Z"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>'),
  users: svg('<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.7-3.1 3-4.8 6-4.8s5.3 1.7 6 4.8"/><path d="M15.5 5.5a3.2 3.2 0 0 1 0 6.2M17.5 14.9c1.8.6 3 2.1 3.5 4.6"/>'),
  megaphone: svg('<path d="M4 10v4h3l7 4.5v-13L7 10H4Z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>'),
  register: svg('<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="m8.5 13 2.2 2.2 4.8-4.7"/>'),
  coins: svg('<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7"/><path d="M9.5 16.4c.5 1.2 2.8 2.1 5.5 2.1 3 0 5.5-1.1 5.5-2.5v-4c0-1.4-2.5-2.5-5.5-2.5"/>'),
  pin: svg('<path d="M12 20.5s6.5-6.2 6.5-11a6.5 6.5 0 1 0-13 0c0 4.8 6.5 11 6.5 11Z"/><circle cx="12" cy="9.5" r="2.2"/>'),
  phone: svg('<path d="M6.6 3.8 9 3.5l1.6 4-2 1.3a10.5 10.5 0 0 0 6.6 6.6l1.3-2 4 1.6-.3 2.4a2 2 0 0 1-2 1.6A15.6 15.6 0 0 1 5 5.8a2 2 0 0 1 1.6-2Z"/>'),
  mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  send: svg('<path d="M20.5 3.5 10 14"/><path d="m20.5 3.5-6.5 17-4-6.5-6.5-4 17-6.5Z"/>'),
  download: svg('<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>'),
  pen: svg('<path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5v-4L15.5 4.5Z"/><path d="M13 7l4 4"/>'),
  alert: svg('<path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4.2M12 17h.01"/>'),
  card: svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>'),
  bank: svg('<path d="M3.5 9 12 4l8.5 5"/><path d="M5 9.5v8M9.5 9.5v8M14.5 9.5v8M19 9.5v8M3.5 20h17"/>'),
  logout: svg('<path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12h10"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  grid: svg('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  install: svg('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7.5v7M9 11.5l3 3 3-3"/>'),
  leaf: svg('<path d="M5 19c0-8 5-13.5 14-14 .5 9-5 14-13 14"/><path d="M5 19c3-4 6-6.5 9.5-8.5"/>'),
  car: svg('<path d="M5 16.5V12l2-5h10l2 5v4.5"/><path d="M3.5 12h17"/><rect x="3.5" y="12" width="17" height="4.5" rx="1.5"/><path d="M6.5 16.5v2M17.5 16.5v2"/><circle cx="7.5" cy="14.2" r=".6"/><circle cx="16.5" cy="14.2" r=".6"/>'),
  pizza: svg('<path d="M12 21 3.5 6.5C8.5 3.2 15.5 3.2 20.5 6.5L12 21Z"/><path d="M5.2 9.2c4.2-2.4 9.4-2.4 13.6 0"/><circle cx="10" cy="11.5" r="1"/><circle cx="14" cy="12.5" r="1"/><circle cx="12" cy="16" r="1"/>'),
  cup: svg('<path d="M6.5 7.5h11l-1.3 12.2a1.5 1.5 0 0 1-1.5 1.3H9.3a1.5 1.5 0 0 1-1.5-1.3L6.5 7.5Z"/><path d="M5.5 7.5h13"/><path d="m12.5 7.5 2-4.5 2.5.5"/>'),
  muffin: svg('<path d="M6 12.5h12l-1.6 7.2a1.5 1.5 0 0 1-1.5 1.1H9.1a1.5 1.5 0 0 1-1.5-1.1L6 12.5Z"/><path d="M5 12.5a7 7 0 0 1 14 0"/><path d="M10 16.5v2M14 16.5v2"/>'),
  apple: svg('<path d="M12 7.5c-1.5-1-5.5-1.2-6.5 2.8-.9 3.7 1.6 9.2 4.2 9.7 1 .2 1.6-.4 2.3-.4s1.3.6 2.3.4c2.6-.5 5.1-6 4.2-9.7-1-4-5-3.8-6.5-2.8Z"/><path d="M12 7.5c0-2 .8-3.5 2.5-4"/>'),
  hotdog: svg('<path d="M4.5 13.5a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3"/><path d="M3.5 12a2 2 0 0 1 2-2h13a2 2 0 0 1 0 4h-13a2 2 0 0 1-2-2Z"/><path d="M7 12c1-.8 2-.8 3 0s2 .8 3 0 2-.8 3 0"/>'),
  sandwich: svg('<path d="M3.5 13 12 5.5l8.5 7.5"/><path d="M4 13.5h16l-1 3.5H5l-1-3.5Z"/><path d="M5.5 17h13v1.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V17Z"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  heart: svg('<path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
  flag: svg('<path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>'),
  star: svg('<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z"/>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>'),
  trophy: svg('<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4Z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4"/><path d="M12 13.5v3.5M8.5 20.5h7M9.5 17h5v3.5h-5z"/>'),
  medal: svg('<circle cx="12" cy="14.5" r="5.5"/><path d="M9 3.5 10.5 9M15 3.5 13.5 9M8 3.5h8"/><path d="m12 12.2.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3.9-1.8Z"/>'),
  refresh: svg('<path d="M20 11.5A8 8 0 1 0 17.7 17"/><path d="M20 5v6.5h-6.5"/>'),
  shield: svg('<path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6l-7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  swim: svg('<path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/><path d="M3 20.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/><circle cx="16" cy="7" r="2"/><path d="m6 14 4.5-5 3 2.5L16 10"/>'),
};

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

/* ---------------- Dates ---------------- */
function parseISO(iso){ const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function startOfToday(){ const t = new Date(); t.setHours(0, 0, 0, 0); return t; }
function daysFromToday(iso){ return Math.round((parseISO(iso) - startOfToday()) / 86400000); }
function fmtShort(iso){ return parseISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
function fmtLong(iso){ return parseISO(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); }
function fmtDM(iso){ return parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
function fmtFull(iso){ return parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
function monthShort(iso){ return parseISO(iso).toLocaleDateString('en-GB', { month: 'short' }).replace('.', ''); }
function dayNum(iso){ return parseISO(iso).getDate(); }
function weekdayKey(dt){ return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]; }

function relDue(iso){
  const n = daysFromToday(iso);
  if(n === 0) return 'Due today';
  if(n === 1) return 'Due tomorrow';
  if(n > 1 && n < 7) return `Due ${parseISO(iso).toLocaleDateString('en-GB', { weekday: 'long' })}`;
  if(n >= 7) return `Due ${fmtDM(iso)}`;
  if(n === -1) return '1 day overdue';
  return `${-n} days overdue`;
}
function relAgo(iso){
  const n = -daysFromToday(iso);
  if(n <= 0) return 'Today';
  if(n === 1) return 'Yesterday';
  if(n < 7) return `${n} days ago`;
  return fmtDM(iso);
}
function termOf(dt = new Date()){ return Math.floor(dt.getMonth() / 3) + 1; }
function greeting(){
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function fmtMoney(n){
  const sign = n < 0 ? '−' : '';
  return `${sign}R ${Math.abs(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ---------------- People ---------------- */
const NAME_TITLES = new Set(['mr', 'mrs', 'ms', 'mx', 'dr', 'mr.', 'mrs.', 'ms.', 'dr.']);
function initials(name){
  const parts = name.split(' ').filter(p => p && !NAME_TITLES.has(p.toLowerCase()));
  return (parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}
const AVATAR_TONES = ['#1E1270', '#C21F32', '#0369AA', '#2E8540', '#B7791F', '#5A6ACF', '#0F8A8A'];
function toneFor(name){
  let h = 0; for(const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}
function avatar(name, size = 'md', tone){
  return `<span class="avatar avatar-${size}" style="--tone:${tone || toneFor(name)}">${esc(initials(name).toUpperCase())}</span>`;
}

/* ---------------- Storage ---------------- */
const signedIn = role => !!store('wk_session', {})[role];
function setSignedIn(role, on){ const s = store('wk_session', {}); if(on) s[role] = true; else delete s[role]; save('wk_session', s); }
function store(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch(e){ return fallback; }
}
function save(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){} }

/* Live channels shared between the staff portal and the parent app (same browser). */
const LIVE = {
  notices: () => store('wk_live_notices', []),
  addNotice: n => { const l = LIVE.notices(); l.unshift(n); save('wk_live_notices', l); },
  sent: () => store('wk_sent_notices', null),
  setSent: l => save('wk_sent_notices', l),
  register: (classId, date) => store(`wk_register_${classId}_${date}`, null),
  setRegister: (classId, date, marks) => save(`wk_register_${classId}_${date}`, marks),
  slips: () => store('wk_slips', {}),
  signSlip: (childId, signedBy) => { const s = LIVE.slips(); s[childId] = { signedBy, at: new Date().toISOString() }; save('wk_slips', s); },
  absences: () => store('wk_absences', []),
  addAbsence: a => { const l = LIVE.absences(); l.unshift(a); save('wk_absences', l); },
  events: () => store('wk_live_events', []),
  addEvent: e => { const l = LIVE.events(); l.push(e); save('wk_live_events', l); },
  payments: () => store('wk_payments', []),
  merits: () => store('wk_merits', []),
  addMerits: list => save('wk_merits', [...list, ...LIVE.merits()]),
  acks: () => store('wk_acks', {}),
  ack: id => { const m = LIVE.acks(); m[id] = new Date().toISOString(); save('wk_acks', m); },
  sotw: () => store('wk_sotw', []),
  classNotices: () => store('wk_class_notices', []),
  addClassNotice: n => save('wk_class_notices', [n, ...LIVE.classNotices()]),
  cnAcks: () => store('wk_cn_acks', {}),
  ackClassNotice: id => { const m = LIVE.cnAcks(); m[id] = new Date().toISOString(); save('wk_cn_acks', m); },
  addSotw: s => save('wk_sotw', [s, ...LIVE.sotw().filter(x => !(x.week === s.week && x.classId === s.classId))]),
  tuckOrders: () => store('wk_tuck_orders', []),
  setTuckOrders: l => save('wk_tuck_orders', l),
  tuckStatus: () => store('wk_tuck_status', {}),
  setTuckStatus: (id, status) => { const m = LIVE.tuckStatus(); m[id] = status; save('wk_tuck_status', m); },
  wallet: () => store('wk_tuck_wallet', TUCK_WALLET_SEED),
  setWallet: v => save('wk_tuck_wallet', v),
  pickups: date => store(`wk_pickup_${date}`, {}),
  setPickup: (date, childId, plan) => { const m = LIVE.pickups(date); m[childId] = plan; save(`wk_pickup_${date}`, m); },
  gate: date => store(`wk_gate_${date}`, {}),
  setGate: (date, learnerId, rec) => { const m = LIVE.gate(date); if(rec) m[learnerId] = rec; else delete m[learnerId]; save(`wk_gate_${date}`, m); },
};
const nowHM = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const isFriday = iso => parseISO(iso).getDay() === 5;

/* ---------------- Toast ---------------- */
function toast(message, tone = ''){
  let stack = document.getElementById('toasts');
  if(!stack){ stack = document.createElement('div'); stack.id = 'toasts'; stack.setAttribute('role', 'status'); document.body.appendChild(stack); }
  const el = document.createElement('div');
  el.className = `toast ${tone}`;
  el.innerHTML = `${tone === 'ok' ? ICONS.checkCircle : tone === 'bad' ? ICONS.alert : ICONS.bell}<span>${esc(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 3200);
}

/* ---------------- Sheet (bottom sheet on phones, dialog on desktop) ---------------- */
function ensureSheet(){
  let wrap = document.getElementById('sheet');
  if(wrap) return wrap;
  wrap = document.createElement('div');
  wrap.id = 'sheet';
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grip"></div><button class="sheet-close" aria-label="Close" onclick="closeSheet()">${ICONS.x}</button><div class="sheet-body" id="sheet-body"></div></div>`;
  wrap.addEventListener('click', e => { if(e.target === wrap) closeSheet(); });
  document.body.appendChild(wrap);
  return wrap;
}
function openSheet(html){
  const wrap = ensureSheet();
  const body = document.getElementById('sheet-body');
  body.innerHTML = html;
  stagger(body);
  wrap.classList.add('open');
  document.documentElement.classList.add('locked');
}
function closeSheet(){
  const wrap = document.getElementById('sheet');
  if(!wrap) return;
  wrap.classList.remove('open');
  document.documentElement.classList.remove('locked');
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeSheet(); });

/* ---------------- Motion ---------------- */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const REVEAL_SEL = '.page-head, .hero, .promo, .sotw-card, .learners, .kpi, .card, .section-label, .album, .photos > *, .week-col, .profile-card, .filters, .search, .reg-tools, .day-seg, .legend, .preview, .view .btn-block';

function stagger(root){
  [...root.children].forEach((el, i) => el.style.setProperty('--i', i));
}

function countUp(root){
  root.querySelectorAll('[data-count]').forEach(el => {
    if(el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = Number(el.dataset.count), fmt = el.dataset.fmt, suffix = el.dataset.suffix || '';
    const show = (v, done) => {
      el.textContent = fmt === 'money' ? fmtMoney(done ? v : Math.round(v))
        : fmt === 'rand' ? fmtMoney(Math.round(v)).replace(/,00$/, '')
        : Math.round(v) + suffix;
    };
    if(REDUCED_MOTION){ show(target, true); return; }
    const start = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      show(target * (1 - Math.pow(1 - p, 4)), p === 1);
      if(p < 1) requestAnimationFrame(tick);
    };
    show(0); requestAnimationFrame(tick);
  });
}

/* Reveal blocks as they scroll into view, staggered per batch. Used on route changes only. */
function animateIn(root){
  if(REDUCED_MOTION || !('IntersectionObserver' in window)) return;
  if(!window.matchMedia('(min-width: 960px)').matches){
    /* phones: one quick, cheap page transition instead of a per-card cascade */
    root.classList.remove('enter-quick'); void root.offsetWidth; root.classList.add('enter-quick');
    setTimeout(() => root.classList.remove('enter-quick'), 1200);
    countUp(root);
    return;
  }
  const blocks = [...root.querySelectorAll(REVEAL_SEL)].filter(el => !el.parentElement.closest('.card, .reveal'));
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {
      const el = e.target;
      io.unobserve(el);
      el.style.animationDelay = `${Math.min(i, 9) * 60}ms`;
      el.classList.add('in');
      countUp(el);
      setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.animationDelay = ''; }, 2000 + Math.min(i, 9) * 60);
    });
  }, { rootMargin: '0px 0px -4% 0px' });
  blocks.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

/* Sliding highlight behind the active tab in the floating tab bar. */
let lastTabPos = null;
function placeTabGlow(bar){
  const on = bar.querySelector('.tab.on');
  const glow = document.createElement('span');
  glow.className = 'tab-glow';
  bar.prepend(glow);
  if(!on || !on.offsetWidth){ glow.style.opacity = 0; if(!on) lastTabPos = null; return; }
  const to = { x: on.offsetLeft, w: on.offsetWidth };
  const moved = lastTabPos && lastTabPos.x !== to.x;
  if(moved && !REDUCED_MOTION){
    glow.style.transition = 'none';
    glow.style.transform = `translateX(${lastTabPos.x}px)`;
    glow.style.width = `${lastTabPos.w}px`;
    glow.getBoundingClientRect();
    glow.style.transition = '';
    on.classList.add('bump');
  }
  glow.style.transform = `translateX(${to.x}px)`;
  glow.style.width = `${to.w}px`;
  lastTabPos = to;
}

/* ---------------- Tiny one-page PDF writer (demo documents) ---------------- */
function makePdf(ops){
  const WIN = { '–': 150, '—': 151, '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '·': 183, '×': 215 };
  const enc = s => [...String(s)].map(ch => { const c = ch.codePointAt(0); return c < 128 ? ch : String.fromCharCode(WIN[ch] || (c < 256 ? c : 63)); }).join('');
  const lit = s => enc(s).replace(/[\\()]/g, ch => '\\' + ch);
  const content = ops.map(o => o.line
    ? `${o.w || 1} w ${o.line[0]} ${o.line[1]} m ${o.line[2]} ${o.line[3]} l S`
    : `BT /${o.bold ? 'F2' : 'F1'} ${o.size || 11} Tf ${o.x} ${o.y} Td (${lit(o.t)}) Tj ET`).join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const at = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for(let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return new Blob([bytes], { type: 'application/pdf' });
}
function downloadBlob(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------------- Class notices: shared ---------------- */
const allClassNotices = () => [...LIVE.classNotices(), ...CLASS_NOTICE_SEED].sort((a, b) => (b.at || b.date).localeCompare(a.at || a.date));
function examDates(count, start = EXAMS_START){
  const out = [], d = parseISO(start);
  while(out.length < count){ if(!isWeekend(d)) out.push(isoOf(d)); d.setDate(d.getDate() + 1); }
  return out;
}
function examTimetablePdf(className, start = EXAMS_START){
  const ops = [], text = (t, x, y, size = 11, bold = false) => ops.push({ t, x, y, size, bold });
  text('WHIZZKIDZ ACADEMY', 50, 790, 17, true);
  text(`${className} · Term ${termOf()} exam timetable · ${new Date().getFullYear()}`, 50, 770, 11);
  ops.push({ line: [50, 758, 545, 758], w: 1.5 });
  text('Date', 50, 734, 11, true); text('Subject', 210, 734, 11, true); text('Time', 445, 734, 11, true);
  let y = 734;
  const dates = examDates(EXAM_SUBJECTS.length, start);
  EXAM_SUBJECTS.forEach((s, i) => {
    y -= 30;
    ops.push({ line: [50, y + 20, 545, y + 20], w: .4 });
    text(fmtLong(dates[i]), 50, y, 10);
    text(s, 210, y, 11);
    text(i % 2 ? '10:30 – 12:00' : '08:00 – 10:00', 445, y, 10);
  });
  y -= 46;
  text('Learners must arrive by 07:30 with two pens, a pencil, an eraser and a calculator.', 50, y, 10);
  text('Normal classes continue on days without an exam.', 50, y - 16, 10);
  text('Demo document · Whizzkidz Connect prototype', 50, 40, 8);
  return makePdf(ops);
}
const downloadNoticeFile = id => downloadAttachment(allClassNotices().find(n => n.id === id));
function downloadAttachment(n){
  const a = n.attachment;
  if(!a) return;
  if(a.kind === 'timetable'){ downloadBlob(examTimetablePdf(a.className, a.start), a.name); return; }
  if(a.dataUrl){
    const [h, b] = a.dataUrl.split(','), bin = atob(b), arr = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    downloadBlob(new Blob([arr], { type: h.match(/:(.*?);/)[1] }), a.name);
  } else toast('That file was too big to keep in the demo');
}

/* ---------------- Push-style notification (portals) ---------------- */
let pushNoteTimer = null;
function pushNote(title, body, tone = 'ok', href = null){
  document.querySelector('.push')?.remove();
  const el = document.createElement('button');
  el.className = `push ${tone === 'bad' ? 'demerit' : ''}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<img src="../assets/brand/emblem.png" alt=""><span class="grow"><span class="push-top"><b>Whizzkidz</b><span>now</span></span><span class="push-title">${esc(title)}</span><span class="push-body">${esc(body)}</span></span>`;
  const hide = () => { if(!el.isConnected) return; el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 400); };
  el.onclick = () => { hide(); if(href) location.hash = href; };
  let y0 = null;
  el.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchmove', e => { if(y0 !== null && e.touches[0].clientY - y0 < -24){ y0 = null; hide(); } }, { passive: true });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  clearTimeout(pushNoteTimer);
  pushNoteTimer = setTimeout(hide, 7000);
}

/* ---------------- Demo role switcher ---------------- */
const DEMO_ROLES = [
  { id: 'parent', label: 'Parent', who: 'Jos Verstappen · Max & Kimi', path: 'parent/index.html', icon: 'users' },
  { id: 'office', label: 'Office', who: 'Claire Williams · Administrator', path: 'office/index.html', icon: 'wallet' },
  { id: 'teacher', label: 'Teacher', who: 'Mr Rosberg · Grade 6A', path: 'teacher/index.html', icon: 'book' },
  { id: 'hod', label: 'HOD', who: 'Mr Häkkinen · Intermediate Phase', path: 'hod/index.html', icon: 'shield' },
];
function switchRole(id, base = '../'){ setSignedIn(id, true); location.href = base + DEMO_ROLES.find(r => r.id === id).path; }
function switchViewHTML(current){
  return `<div class="eyebrow section-label">Switch view · demo</div>
    <div class="card rows menu-list">${DEMO_ROLES.filter(r => r.id !== current).map(r => `<button class="row" onclick="switchRole('${r.id}')"><span class="ic">${ICONS[r.icon]}</span><div class="grow"><div class="row-title">${r.label}</div><div class="row-sub">${esc(r.who)}</div></div><span class="chev">${ICONS.right}</span></button>`).join('')}</div>`;
}

/* ---------------- Demo reset ---------------- */
function resetDemoSheet(){
  openSheet(`<div class="eyebrow">Demo</div>
    <h2>Reset demo data?</h2>
    <p class="lede">This clears everything changed in this browser — notices, register marks, orders, payments, pick-ups, messages and consent forms — and restores the original sample data. You'll stay signed in.</p>
    <button class="btn btn-red btn-block" onclick="resetDemo()">${ICONS.refresh} Reset demo</button>
    <button class="btn btn-line btn-block" style="margin-top:10px" onclick="closeSheet()">Cancel</button>`);
}
function resetDemo(){
  try{
    Object.keys(localStorage).filter(k => k.startsWith('wk_') && k !== 'wk_session' && k !== 'wk_version').forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('wk_was_reset', '1');
  }catch(e){}
  location.reload();
}
document.addEventListener('DOMContentLoaded', () => {
  try{
    if(sessionStorage.getItem('wk_was_reset')){ sessionStorage.removeItem('wk_was_reset'); toast('Demo reset — original sample data restored', 'ok'); }
  }catch(e){}
});

/* ---------------- Calendar file ---------------- */
function downloadICS(ev){
  const day = ev.date.replace(/-/g, '');
  const t = s => s.replace(':', '') + '00';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Whizzkidz Academy//Demo//EN', 'BEGIN:VEVENT',
    `UID:${ev.id}-${day}@whizzkidz-demo`, `DTSTAMP:${day}T000000`,
    `DTSTART:${day}T${t(ev.start)}`, `DTEND:${day}T${t(ev.end)}`,
    `SUMMARY:${ev.title} — Whizzkidz Academy`, `LOCATION:${ev.location}`, `DESCRIPTION:${ev.desc}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${ev.id}-whizzkidz.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------- Brand bits ---------------- */
function wordmark(extra = ''){
  return `<span class="wordmark ${extra}"><span class="wm-top">Whizzkidz</span><span class="wm-bottom">Academy</span></span>`;
}

function hydrateIcons(root = document){
  root.querySelectorAll('[data-icon]').forEach(el => { if(ICONS[el.dataset.icon]) el.innerHTML = ICONS[el.dataset.icon]; });
}

/* Install-to-home-screen support */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
