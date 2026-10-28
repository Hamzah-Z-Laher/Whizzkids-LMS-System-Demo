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
};

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
const REVEAL_SEL = '.page-head, .hero, .learners, .kpi, .card, .section-label, .album, .photos > *, .week-col, .profile-card, .filters, .search, .reg-tools, .day-seg, .legend, .preview, .view .btn-block';

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
