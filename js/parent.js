/* Parent app — routing, screens and interactions */

if(store('wk_role', null) !== 'parent') location.replace('../index.html');

const $ = sel => document.querySelector(sel);
const P = { child: store('wk_child', CHILDREN[0].id), day: null, lightbox: null };
const TODAY_ISO = isoOf(TODAY);
const DESKTOP = window.matchMedia('(min-width: 960px)');

const childById = id => CHILDREN.find(c => c.id === id);
const child = () => childById(P.child) || CHILDREN[0];
function setChild(id){ if(id === P.child) return; P.child = id; save('wk_child', id); render({ swap: true }); }

/* ---------------- Derived state ---------------- */
const hwDoneMap = () => store('wk_hw_done', {});
const findHw = id => Object.values(HOMEWORK).flat().find(h => h.id === id);
const hwChild = id => CHILDREN.find(c => HOMEWORK[c.id].some(h => h.id === id));
function isDone(h){ const m = hwDoneMap(); return h.id in m ? m[h.id] : !!h.done; }

function allNotices(){ return [...LIVE.notices().map(n => ({ ...n, live: true })), ...NOTICES]; }
const readNotices = () => store('wk_read_notices', NOTICES.filter(n => daysFromToday(n.date) < -2).map(n => n.id));
const isNoticeUnread = n => !readNotices().includes(n.id);
function markNoticeRead(id){ const r = readNotices(); if(!r.includes(id)){ r.push(id); save('wk_read_notices', r); } }
const unreadNotices = () => allNotices().filter(isNoticeUnread).length;

const threadMsgs = t => [...t.messages, ...(store('wk_msgs', {})[t.id] || [])];
function isThreadUnread(t){
  const msgs = threadMsgs(t);
  return msgs[msgs.length - 1].from === 'them' && (store('wk_read_threads', {})[t.id] || 0) < msgs.length;
}
function markThreadRead(t){ const r = store('wk_read_threads', {}); r[t.id] = threadMsgs(t).length; save('wk_read_threads', r); }
const unreadThreads = () => THREADS.filter(isThreadUnread).length;

const payments = () => store('wk_payments', []);
function statementLines(){
  return [...STATEMENT, ...payments().map(p => ({ date: p.date, desc: `Payment received — ${p.method}`, amount: -p.amount }))]
    .sort((a, b) => a.date.localeCompare(b.date));
}
const balance = () => statementLines().reduce((s, t) => s + t.amount, 0);
const feesOverdue = () => balance() > 0 && daysFromToday(FAMILY_ACCOUNT.dueDate) < 0;

function todayRegister(c){
  if(isWeekend(TODAY)) return null;
  const reg = LIVE.register(c.classId, TODAY_ISO);
  return reg && reg[c.learnerId] ? reg[c.learnerId] : null;
}
function attendanceMap(c){
  const map = {};
  for(let i = TERM_SCHOOL_DAYS; i >= 1; i--) map[schoolDay(-i)] = { status: 'present' };
  (ATTENDANCE_EXCEPTIONS[c.id] || []).forEach(e => { map[schoolDay(e.day)] = { status: e.status, note: e.note }; });
  const today = todayRegister(c);
  if(today) map[TODAY_ISO] = { status: today, note: `Marked by ${c.teacher} this morning`, live: true };
  return map;
}
function attendanceStats(map){
  const v = Object.values(map);
  const count = s => v.filter(x => x.status === s).length;
  const present = count('present'), late = count('late'), absent = count('absent');
  return { present, late, absent, total: v.length, pct: Math.round((present + late) / v.length * 100) };
}

function attentionItems(){
  const items = [];
  CHILDREN.forEach(c => {
    const reported = LIVE.absences().some(a => a.childId === c.id && a.date === TODAY_ISO);
    if(todayRegister(c) === 'absent' && !reported){
      items.push({ urgent: true, icon: 'alert', title: `${c.first} was marked absent today`, sub: `${c.teacher} · Grade ${c.className}`, action: 'Explain', run: `absenceSheet('${c.id}')` });
    }
    if(c.grade === 'Grade 3' && !LIVE.slips()[c.id]){
      items.push({ urgent: daysFromToday(SLIP_DUE) <= 1, icon: 'pen', title: 'Consent form: Sci-Bono outing', sub: `${c.first} · sign by ${fmtShort(SLIP_DUE)}`, action: 'Sign', run: `slipSheet('${c.id}')` });
    }
    HOMEWORK[c.id].filter(h => !isDone(h) && daysFromToday(h.due) < 0).forEach(h => {
      items.push({ icon: 'book', title: h.title, sub: `${c.first} · ${h.subject} · ${relDue(h.due)}`, action: 'View', run: `hwSheet('${h.id}')` });
    });
  });
  if(feesOverdue()){
    items.push({ urgent: true, icon: 'wallet', title: `${fmtMoney(balance())} in fees is overdue`, sub: `Was due ${fmtShort(FAMILY_ACCOUNT.dueDate)} · account ${FAMILY_ACCOUNT.number}`, action: 'Pay', run: 'paySheet()' });
  }
  return items.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
}

const allEvents = () => [...EVENTS, ...LIVE.events().map(e => ({ ...e, live: true }))];
const upcomingEvents = () => allEvents().filter(e => daysFromToday(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const timetableDay = () => isWeekend(new Date()) ? 'Mon' : weekdayKey(new Date());

/* ---------------- Shared fragments ---------------- */
const head = (eyebrow, title, sub = '') =>
  `<header class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;

function learnersHTML(){
  return `<div class="learners" role="group" aria-label="Choose a child">${CHILDREN.map(c => `
    <button class="learner ${c.id === P.child ? 'on' : ''}" onclick="setChild('${c.id}')" aria-pressed="${c.id === P.child}">
      ${avatar(c.name, 'md', c.id === P.child ? 'var(--blazer)' : '#B9B4CC')}<span><b>${esc(c.first)}</b><small>Grade ${esc(c.className)}<span class="d-only" style="display:inline"> · ${esc(c.teacher)}</span></small></span>
    </button>`).join('')}</div>`;
}

function noticeRow(n){
  return `<button class="row notice-row" onclick="noticeSheet('${n.id}')">
    ${isNoticeUnread(n) ? '<span class="unread" aria-label="Unread"></span>' : '<span style="width:8px;flex-shrink:0"></span>'}
    <div class="grow">
      <div class="row-title">${esc(n.title)} ${n.live ? '<span class="ribbon">New</span>' : ''}</div>
      <div class="snippet">${esc(n.body)}</div>
      <div class="meta"><span class="tag" style="--c:${n.priority === 'high' ? 'var(--blazer)' : 'var(--sky)'}">${esc(n.audience)}</span><span class="row-meta">${relAgo(n.date)}</span></div>
    </div>
  </button>`;
}

function eventRow(e, withActions = true){
  const going = store('wk_rsvp', {})[e.id];
  return `<div class="row event-row">
    <div class="datechip"><div class="m">${monthShort(e.date)}</div><div class="d">${dayNum(e.date)}</div></div>
    <div class="grow">
      <div class="row-title">${esc(e.title)} ${e.live ? '<span class="ribbon">New</span>' : ''}</div>
      <div class="row-sub">${fmtShort(e.date)} · ${esc(e.start)}–${esc(e.end)} · ${esc(e.location)}</div>
      ${withActions ? `<div class="event-actions">
        ${e.rsvp ? `<button class="btn btn-sm ${going ? 'btn-navy' : 'btn-line'}" onclick="toggleRsvp('${e.id}')">${going ? ICONS.check + " You're going" : "I'll be there"}</button>` : ''}
        <button class="btn btn-sm btn-line" onclick="addToCalendar('${e.id}')">${ICONS.calendar} Add to calendar</button>
      </div>` : ''}
    </div>
  </div>`;
}

function lessonsHTML(c, key, withFlags){
  const lessons = TIMETABLE[c.id][key] || [];
  const now = new Date(); const hm = now.getHours() * 60 + now.getMinutes();
  let nextMarked = false;
  return lessons.map(([start, end, subject, room]) => {
    if(subject === 'Break') return `<div class="lesson break"><span class="time">${start}</span><div class="grow">Break</div></div>`;
    let flag = '';
    if(withFlags){
      if(hm >= toMin(start) && hm < toMin(end)) flag = '<span class="flag">Now</span>';
      else if(!nextMarked && hm < toMin(start)){ flag = '<span class="flag next">Next</span>'; nextMarked = true; }
    }
    return `<div class="lesson ${flag.includes('>Now<') ? 'now' : ''}" style="--c:${SUBJECT_COLORS[subject] || 'var(--ink-3)'}">
      <span class="time">${start}</span><span class="bar-c"></span>
      <div class="grow"><b>${esc(subject)}</b><small>${room ? esc(room) : ''}${room ? ' · ' : ''}until ${end}</small></div>${flag}
    </div>`;
  }).join('');
}

/* ---------------- Screens ---------------- */
function screenHome(){
  const c = child();
  const attn = attentionItems();
  const next = upcomingEvents()[0];
  const isToday = !isWeekend(new Date());
  const reg = todayRegister(c);
  const album = ALBUMS[0];
  const notices = allNotices().slice(0, 4);
  const summary = attn.length
    ? `${attn.length} ${attn.length === 1 ? 'thing needs' : 'things need'} your attention.`
    : 'You\'re all caught up.';

  return `<div class="stack">
    <div>
      <section class="hero mesh">
        <div>
          <div class="eyebrow on-dark">${fmtLong(TODAY_ISO)} · Term ${termOf()}</div>
          <h1>${greeting()}, ${PARENT.title} ${PARENT.last}</h1>
          <p>${summary}${next ? ` Next up: ${esc(next.title)}, ${fmtShort(next.date)}.` : ''}</p>
        </div>
        <img class="hero-photo" src="../assets/photos/assembly.jpg" alt="Learners at morning assembly">
      </section>
    </div>

    ${learnersHTML()}

    <div class="home-grid">
      <div class="stack">
        ${attn.length ? `<section class="card">
          <div class="card-head"><h2>Needs your attention</h2></div>
          <div class="rows">${attn.map(a => `
            <div class="row attn ${a.urgent ? 'urgent' : ''}">
              <span class="ic">${ICONS[a.icon]}</span>
              <div class="grow"><div class="row-title">${esc(a.title)}</div><div class="row-sub">${esc(a.sub)}</div></div>
              <button class="btn btn-sm ${a.urgent ? 'btn-red' : 'btn-line'}" onclick="${a.run}">${a.action}</button>
            </div>`).join('')}
          </div>
        </section>` : ''}

        <section class="card">
          <div class="card-head"><h2>Notices</h2><a class="link" href="#/notices">All notices</a></div>
          <div class="rows">${notices.map(noticeRow).join('')}</div>
        </section>
      </div>

      <div class="stack">
        <section class="card">
          <div class="card-head"><h2>${esc(c.first)}'s ${isToday ? 'day' : 'Monday'}</h2><a class="link" href="#/timetable">Timetable</a></div>
          ${reg ? `<div class="status-line ${reg}">${reg === 'absent' ? ICONS.alert : ICONS.checkCircle} Marked ${reg} by ${esc(c.teacher)} this morning</div>` : ''}
          <div style="padding-bottom:10px">${lessonsHTML(c, timetableDay(), isToday)}</div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Coming up</h2><a class="link" href="#/calendar">Calendar</a></div>
          <div class="rows">${upcomingEvents().slice(0, 3).map(e => eventRow(e, false)).join('')}</div>
        </section>

        <section class="card">
          <div class="card-head"><h2>From the gallery</h2><a class="link" href="#/gallery">Gallery</a></div>
          <a class="teaser" href="#/album/${album.id}">
            <img src="../assets/photos/${album.photos[0]}" alt="" loading="lazy">
            <div class="cap"><b>${esc(album.title)}</b><small>${relAgo(album.date)} · ${album.photos.length} photo${album.photos.length > 1 ? 's' : ''}</small></div>
          </a>
        </section>
      </div>
    </div>
  </div>`;
}

function screenTimetable(){
  const c = child();
  const today = timetableDay();
  const day = P.day || today;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return `${head(`Grade ${esc(c.className)} · ${esc(c.teacher)}`, 'Timetable')}
    <div class="stack">
      ${learnersHTML()}
      <div class="m-only stack">
        <div class="seg day-seg" role="tablist">${days.map(d => `<button role="tab" class="${d === day ? 'on' : ''}" onclick="P.day='${d}'; render();">${d}</button>`).join('')}</div>
        <section class="card" style="padding:8px 0">${lessonsHTML(c, day, day === today && !isWeekend(new Date()))}</section>
      </div>
      <div class="d-only">
        <div class="week">${days.map(d => `
          <div class="week-col ${d === today && !isWeekend(new Date()) ? 'today' : ''}">
            <h3>${d}${d === today && !isWeekend(new Date()) ? '<small>Today</small>' : ''}</h3>
            ${TIMETABLE[c.id][d].map(([s, e, subj, room]) => subj === 'Break'
              ? `<div class="slot break"><b>Break · ${s}</b></div>`
              : `<div class="slot" style="--c:${SUBJECT_COLORS[subj]}"><b>${esc(subj)}</b><small>${s}–${e}${room ? ' · ' + esc(room) : ''}</small></div>`).join('')}
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function hwRow(h){
  const done = isDone(h);
  const late = !done && daysFromToday(h.due) < 0;
  return `<button class="row hw ${done ? 'done' : ''}" onclick="hwSheet('${h.id}')">
    <span class="tick">${done ? ICONS.check : ''}</span>
    <div class="grow">
      <span class="tag" style="--c:${SUBJECT_COLORS[h.subject]}">${esc(h.subject)}</span>
      <div class="row-title" style="margin-top:4px">${esc(h.title)}</div>
    </div>
    <span class="due ${late ? 'late' : ''}">${done ? 'Done' : relDue(h.due)}</span>
  </button>`;
}

function screenDiary(){
  const c = child();
  const items = HOMEWORK[c.id];
  const overdue = items.filter(h => !isDone(h) && daysFromToday(h.due) < 0);
  const upcoming = items.filter(h => !isDone(h) && daysFromToday(h.due) >= 0).sort((a, b) => a.due.localeCompare(b.due));
  const done = items.filter(isDone);
  const group = (label, list) => list.length ? `<div class="eyebrow section-label">${label}</div><section class="card rows">${list.map(hwRow).join('')}</section>` : '';
  return `${head(`Grade ${esc(c.className)}`, 'Homework diary', 'What\'s been set in class, and when it\'s due.')}
    ${learnersHTML()}
    ${group('Overdue', overdue)}${group('Coming up', upcoming)}${group('Done', done)}`;
}

function screenFees(){
  const bal = balance();
  const lines = statementLines();
  let running = 0;
  const withBal = lines.map(l => ({ ...l, bal: (running += l.amount) })).reverse();
  const overdue = feesOverdue();
  const statement = `<section class="card">
    <div class="statement-top">
      <div class="acct"><span>Account ${FAMILY_ACCOUNT.number}</span><span>${esc(FAMILY_ACCOUNT.name)}</span></div>
      <div class="amount" data-count="${Math.max(bal, 0)}" data-fmt="money">${fmtMoney(Math.max(bal, 0))}</div>
      <div class="due">${bal > 0
        ? (overdue ? `<span class="ribbon">Overdue</span> Was due ${fmtLong(FAMILY_ACCOUNT.dueDate)}` : `Due ${fmtLong(FAMILY_ACCOUNT.dueDate)}`)
        : '<span class="pill pill-ok">Paid up</span> Thank you'}</div>
      <div class="statement-actions no-print">
        ${bal > 0 ? '<button class="btn btn-red" onclick="paySheet()">Pay now</button>' : ''}
        <button class="btn btn-line" onclick="window.print()">${ICONS.download} Statement</button>
      </div>
    </div>
    <div class="rows">${withBal.map(l => `
      <div class="txn"><div><div style="font-weight:700">${esc(l.desc)}</div><div class="d">${fmtFull(l.date)}</div></div>
        <div class="a ${l.amount < 0 ? 'credit' : ''}">${fmtMoney(l.amount)}</div><div class="bal">Balance ${fmtMoney(l.bal)}</div></div>`).join('')}
    </div>
  </section>`;
  const side = `<div class="stack">
    <section class="card">
      <div class="card-head"><h2>Fee schedule</h2></div>
      <div class="rows">
        <div class="row"><div class="grow"><div class="row-title">Primary School</div><div class="row-sub">Grades 1–7 · monthly</div></div><b>${fmtMoney(1850)}</b></div>
        <div class="row"><div class="grow"><div class="row-title">Aqua School</div><div class="row-sub">Swimming lessons · per term</div></div><b>${fmtMoney(450)}</b></div>
      </div>
    </section>
    <section class="card card-pad">
      <h2 style="font-size:19px;margin-bottom:6px">Questions about your account?</h2>
      <p class="muted" style="margin-bottom:14px">The office can set up a payment plan or debit order.</p>
      <a class="btn btn-line btn-block" href="#/messages/t3">${ICONS.chat} Message the office</a>
    </section>
  </div>`;
  return `${head('Khumalo family', 'Fees & statement')}<div class="two-col stack">${statement}${side}</div>`;
}

function monthGrid(year, month, map){
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells = [];
  for(let i = 0; i < lead; i++) cells.push('<span></span>');
  for(let d = 1; d <= days; d++){
    const dt = new Date(year, month, d);
    const iso = isoOf(dt);
    const rec = map[iso];
    const cls = [isWeekend(dt) ? 'weekend' : '', rec ? rec.status : '', iso === TODAY_ISO ? 'today' : ''].join(' ');
    cells.push(`<span class="mday ${cls}" style="--i:${d}" title="${rec ? rec.status : ''}">${d}</span>`);
  }
  const label = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return `<section class="card">
    <div class="card-head"><h2>${label}</h2></div>
    <div class="month">
      <div class="month-head">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="month-grid">${cells.join('')}</div>
    </div>
  </section>`;
}

function screenAttendance(){
  const c = child();
  const map = attendanceMap(c);
  const s = attendanceStats(map);
  const t = new Date();
  const prev = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const notes = Object.entries(map).filter(([, r]) => r.status !== 'present').sort((a, b) => b[0].localeCompare(a[0]));
  const reports = LIVE.absences().filter(a => a.childId === c.id);
  return `${head(`Grade ${esc(c.className)} · Term ${termOf()}`, 'Attendance')}
    <div class="stack">
      ${learnersHTML()}
      <section class="card att-summary">
        <div class="big"><b data-count="${s.pct}" data-suffix="%">${s.pct}%</b><small>Attended</small></div>
        <div><b data-count="${s.present}">${s.present}</b><small>Present</small></div>
        <div><b data-count="${s.late}">${s.late}</b><small>Late</small></div>
        <div><b data-count="${s.absent}">${s.absent}</b><small>Absent</small></div>
      </section>
      <button class="btn btn-navy btn-block" onclick="absenceSheet('${c.id}')">${ICONS.pen} Report an absence</button>
      <div class="two-col stack">
        <div class="stack">
          ${monthGrid(t.getFullYear(), t.getMonth(), map)}
          <div class="legend">
            <span><i style="background:var(--ok-soft);box-shadow:inset 0 0 0 1px var(--ok)"></i>Present</span>
            <span><i style="background:var(--warn-soft);box-shadow:inset 0 0 0 1px var(--warn)"></i>Late</span>
            <span><i style="background:var(--blazer-soft);box-shadow:inset 0 0 0 1px var(--blazer)"></i>Absent</span>
          </div>
          ${monthGrid(prev.getFullYear(), prev.getMonth(), map)}
        </div>
        <section class="card">
          <div class="card-head"><h2>Absences &amp; late arrivals</h2></div>
          <div class="rows">
            ${reports.map(r => `<div class="row"><span class="pill pill-sky">Reported</span><div class="grow"><div class="row-title">${fmtShort(r.date)} · ${esc(r.reason)}</div><div class="row-sub">Sent to ${esc(c.teacher)}${r.note ? ' — ' + esc(r.note) : ''}</div></div></div>`).join('')}
            ${notes.map(([iso, r]) => `<div class="row"><span class="pill ${r.status === 'late' ? 'pill-warn' : 'pill-bad'}">${r.status === 'late' ? 'Late' : 'Absent'}</span><div class="grow"><div class="row-title">${fmtLong(iso)}</div><div class="row-sub">${esc(r.note || '')}</div></div></div>`).join('') || '<div class="empty">Full attendance this term.</div>'}
          </div>
        </section>
      </div>
    </div>`;
}

function screenNotices(){
  return `${head(SCHOOL.name, 'Notices', 'Everything the school has sent home.')}
    <section class="card rows">${allNotices().map(noticeRow).join('')}</section>`;
}

function screenCalendar(){
  const groups = {};
  upcomingEvents().forEach(e => {
    const k = parseISO(e.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    (groups[k] = groups[k] || []).push(e);
  });
  return `${head(`Term ${termOf()}`, 'Calendar', 'Add events straight to your phone\'s calendar.')}
    ${Object.entries(groups).map(([m, list]) => `<div class="eyebrow section-label">${m}</div><section class="card rows">${list.map(e => eventRow(e)).join('')}</section>`).join('')}`;
}

function screenGallery(){
  return `${head(`${ALBUMS.length} albums`, 'Gallery')}
    <div class="albums">${ALBUMS.map(a => `
      <a class="album" href="#/album/${a.id}">
        <img src="../assets/photos/${a.photos[0]}" alt="" loading="lazy">
        <b>${esc(a.title)}</b><small>${fmtFull(a.date)} · ${a.photos.length} photo${a.photos.length > 1 ? 's' : ''}</small>
      </a>`).join('')}
    </div>`;
}

function screenAlbum(id){
  const a = ALBUMS.find(x => x.id === id) || ALBUMS[0];
  return `${head(fmtFull(a.date), esc(a.title))}
    <div class="photos">${a.photos.map((p, i) => `<button onclick="openLightbox('${a.id}', ${i})" aria-label="Open photo ${i + 1}"><img src="../assets/photos/${p}" alt="" loading="lazy"></button>`).join('')}</div>`;
}

function screenMessages(param){
  const active = THREADS.find(t => t.id === param) || (DESKTOP.matches ? THREADS[0] : null);
  const list = `<section class="card rows thread-list">${THREADS.map(t => {
    const msgs = threadMsgs(t); const last = msgs[msgs.length - 1];
    const kid = t.childId ? childById(t.childId).first : 'Family';
    return `<a class="row ${isThreadUnread(t) ? 'unread' : ''} ${active && active.id === t.id ? 'on' : ''}" href="#/messages/${t.id}">
      ${avatar(t.with, 'md')}
      <div class="grow"><div class="row-title">${esc(t.with)}</div><div class="row-meta">${esc(t.role)} · ${esc(kid)}</div><div class="preview">${last.from === 'me' ? 'You: ' : ''}${esc(last.text)}</div></div>
    </a>`;
  }).join('')}</section>`;
  const thread = active ? `<section class="thread">
    <div class="thread-head">${avatar(active.with, 'md')}<div><b>${esc(active.with)}</b><small>${esc(active.role)}</small></div></div>
    <div class="bubbles" id="bubbles">
      <div class="day-sep">This week</div>
      ${threadMsgs(active).map((m, i, all) => `<div class="bubble ${m.from} ${P.fresh === active.id && i === all.length - 1 ? 'new' : ''}">${esc(m.text)}<small>${esc(m.when)}</small></div>`).join('')}
      ${P.typing === active.id ? '<div class="bubble them typing new" aria-label="Typing"><i></i><i></i><i></i></div>' : ''}
    </div>
    <form class="composer" onsubmit="sendMessage(event, '${active.id}')">
      <textarea id="composer" rows="1" placeholder="Write a message…" aria-label="Message" onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); this.form.requestSubmit(); }"></textarea>
      <button class="send" aria-label="Send">${ICONS.send}</button>
    </form>
  </section>` : '';
  const showHead = !param || DESKTOP.matches;
  return `${showHead ? head('Teachers & office', 'Messages') : ''}<div class="msg-layout ${param ? 'has-thread' : ''}">${list}${thread}</div>`;
}

function installRow(){
  if(isStandalone()) return `<div class="row"><span class="pill pill-ok">${ICONS.check}</span><div class="grow"><div class="row-title">Installed on this device</div></div></div>`;
  if(deferredInstall) return `<button class="row" onclick="installApp()"><span data-icon="install">${ICONS.install}</span><div class="grow"><div class="row-title">Install the app</div><div class="row-sub">Opens full screen, like any other app</div></div>${ICONS.right}</button>`;
  if(isIOS()) return `<div class="row">${ICONS.install}<div class="grow"><div class="row-title">Add to your Home Screen</div><div class="row-sub">In Safari, tap Share, then “Add to Home Screen”</div></div></div>`;
  return `<div class="row">${ICONS.install}<div class="grow"><div class="row-title">Add to your home screen</div><div class="row-sub">On your phone, open the browser menu and choose “Install app” or “Add to Home Screen”</div></div></div>`;
}

function screenProfile(){
  const prefs = store('wk_prefs', { notices: true, homework: true, fees: true, messages: true });
  const pref = (k, label, sub) => `<div class="row"><div class="grow"><div class="row-title">${label}</div><div class="row-sub">${sub}</div></div><button class="switch ${prefs[k] ? 'on' : ''}" role="switch" aria-checked="${!!prefs[k]}" aria-label="${label}" onclick="togglePref('${k}')"></button></div>`;
  return `<div class="stack">
    <section class="profile-card mesh">
      ${avatar(PARENT.name, 'lg')}
      <div><h2>${PARENT.title} ${esc(PARENT.name)}</h2><p>${esc(PARENT.email)}<br>${esc(PARENT.phone)}</p></div>
    </section>
    <div class="two-col stack">
      <div class="stack">
        <section class="card"><div class="card-head"><h2>Your children</h2></div><div class="rows">
          ${CHILDREN.map(c => `<button class="row" onclick="setChild('${c.id}'); location.hash='#/home'">${avatar(c.name, 'md', 'var(--blazer)')}<div class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub">Grade ${esc(c.className)} · ${esc(c.teacher)}${c.aqua ? ' · Aqua School' : ''}</div></div><span class="chev">${ICONS.right}</span></button>`).join('')}
        </div></section>
        <section class="card"><div class="card-head"><h2>Notifications</h2></div><div class="rows">
          ${pref('notices', 'School notices', 'New notices from the school and your children\'s grades')}
          ${pref('homework', 'Homework reminders', 'The evening before something is due')}
          ${pref('fees', 'Fee reminders', 'When a statement is issued or a payment is due')}
          ${pref('messages', 'Messages', 'When a teacher or the office replies')}
        </div></section>
      </div>
      <div class="stack">
        <section class="card"><div class="card-head"><h2>Contact the school</h2></div><div class="rows">
          ${SCHOOL.phones.map(p => `<a class="row" href="tel:${p.number.replace(/\s/g, '')}"><span class="chev">${ICONS.phone}</span><div class="grow"><div class="row-title">${p.number}</div><div class="row-sub">${p.label}</div></div></a>`).join('')}
          <a class="row" href="mailto:${SCHOOL.email}"><span class="chev">${ICONS.mail}</span><div class="grow"><div class="row-title">${SCHOOL.email}</div><div class="row-sub">Email</div></div></a>
          <a class="row" href="https://maps.google.com/?q=${encodeURIComponent(SCHOOL.address)}" target="_blank" rel="noopener"><span class="chev">${ICONS.pin}</span><div class="grow"><div class="row-title">${SCHOOL.address}</div><div class="row-sub">Directions</div></div></a>
        </div></section>
        <section class="card"><div class="card-head"><h2>This app</h2></div><div class="rows">${installRow()}</div></section>
        <button class="btn btn-line btn-block" onclick="signOut()" style="color:var(--blazer)">${ICONS.logout} Sign out</button>
      </div>
    </div>
  </div>`;
}

const ROUTES = {
  home: screenHome, timetable: screenTimetable, diary: screenDiary, fees: screenFees,
  attendance: screenAttendance, notices: screenNotices, calendar: screenCalendar,
  gallery: screenGallery, album: screenAlbum, messages: screenMessages, profile: screenProfile,
};
const TITLES = { attendance: 'Attendance', notices: 'Notices', calendar: 'Calendar', gallery: 'Gallery', album: 'Gallery', messages: 'Messages', profile: 'Profile' };
const PARENT_ROUTE = { album: 'gallery', messages: 'messages' };
const TOP_LEVEL = ['home', 'diary', 'timetable', 'fees'];
const MORE_ROUTES = ['attendance', 'notices', 'calendar', 'gallery', 'album', 'messages', 'profile'];

/* ---------------- Chrome ---------------- */
function parseRoute(){
  const [name, param] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'home', param: param ? decodeURIComponent(param) : null };
}
function goBack(){
  const r = parseRoute();
  location.hash = r.param && PARENT_ROUTE[r.name] ? `#/${PARENT_ROUTE[r.name]}` : '#/home';
}

function renderBar(r){
  const unread = unreadNotices();
  const thread = r.name === 'messages' && r.param ? THREADS.find(t => t.id === r.param) : null;
  const left = TOP_LEVEL.includes(r.name)
    ? `<a class="brand m-only" href="#/home" aria-label="Home"><img class="emblem" src="../assets/brand/emblem.png" alt="">${wordmark()}</a><span class="spacer m-only"></span>`
    : `<button class="icon-btn m-only" onclick="goBack()" aria-label="Back">${ICONS.left}</button>
       <div class="title m-only">${esc(thread ? thread.with : TITLES[r.name] || '')}</div>`;
  return `${left}
    <div class="today-label d-only">${r.name === 'home' ? '' : `<span class="eyebrow" style="color:var(--ink-3)">${fmtLong(TODAY_ISO)} · Term ${termOf()}</span>`}</div>
    <a class="icon-btn" href="#/notices" aria-label="Notices${unread ? ', ' + unread + ' unread' : ''}">${ICONS.bell}${unread ? '<span class="dot"></span>' : ''}</a>
    <a class="icon-btn" href="#/profile" aria-label="Profile"><span class="avatar avatar-sm me" style="--tone:var(--blazer)">${initials(PARENT.name)}</span></a>`;
}

function renderSide(r){
  const active = PARENT_ROUTE[r.name] || r.name;
  const counts = { notices: unreadNotices(), messages: unreadThreads(), fees: feesOverdue() ? '!' : 0 };
  const link = ([id, label, icon]) => `<a class="side-link ${active === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}${label}${counts[id] ? `<span class="count">${counts[id]}</span>` : ''}</a>`;
  const groups = [
    ['Your children', [['home', 'Home', 'home'], ['timetable', 'Timetable', 'clock'], ['diary', 'Homework diary', 'book'], ['attendance', 'Attendance', 'register']]],
    ['School', [['notices', 'Notices', 'megaphone'], ['calendar', 'Calendar', 'calendar'], ['gallery', 'Gallery', 'image'], ['messages', 'Messages', 'chat']]],
    ['Account', [['fees', 'Fees', 'wallet'], ['profile', 'Profile', 'user']]],
  ];
  return `<img class="emblem" src="../assets/brand/emblem.png" alt="Whizzkidz Academy crest">
    ${wordmark('light')}
    <nav>${groups.map(([g, items]) => `<div class="side-group"><div class="eyebrow on-dark">${g}</div>${items.map(link).join('')}</div>`).join('')}</nav>
    <div class="side-foot">
      <span class="avatar avatar-sm">${initials(PARENT.name)}</span>
      <div><b>${PARENT.title} ${esc(PARENT.last)}</b><small>Parent · ${CHILDREN.length} children</small></div>
      <button class="icon-btn" onclick="signOut()" aria-label="Sign out">${ICONS.logout}</button>
    </div>`;
}

function renderTabs(r){
  const more = unreadNotices() + unreadThreads();
  const tabs = [['home', 'Home', 'home'], ['diary', 'Diary', 'book'], ['timetable', 'Timetable', 'clock'], ['fees', 'Fees', 'wallet']];
  return tabs.map(([id, label, icon]) => `<a class="tab ${r.name === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}<span>${label}</span>${id === 'fees' && feesOverdue() ? '<span class="count">!</span>' : ''}</a>`).join('')
    + `<button class="tab ${MORE_ROUTES.includes(r.name) ? 'on' : ''}" onclick="moreSheet()">${ICONS.more}<span>More</span>${more ? `<span class="count">${more}</span>` : ''}</button>`;
}

function renderChrome(){
  const r = parseRoute();
  $('#bar').innerHTML = renderBar(r);
  $('#side').innerHTML = renderSide(r);
  $('#tabbar').innerHTML = renderTabs(r);
  placeTabGlow($('#tabbar'));
}

function render(opts = {}){
  const r = parseRoute();
  if(r.name === 'messages'){
    const t = THREADS.find(x => x.id === r.param) || (DESKTOP.matches ? THREADS[0] : null);
    if(t) markThreadRead(t);
  }
  document.body.classList.toggle('in-thread', r.name === 'messages' && !!r.param && !DESKTOP.matches);
  renderChrome();
  const view = $('#view');
  view.innerHTML = ROUTES[r.name](r.param);
  P.fresh = null;
  if(opts.animate) animateIn(view);
  if(opts.swap && !REDUCED_MOTION){ view.classList.remove('swap'); void view.offsetWidth; view.classList.add('swap'); }
  const bubbles = $('#bubbles');
  if(bubbles){ bubbles.scrollTop = bubbles.scrollHeight; if(!DESKTOP.matches) window.scrollTo(0, document.body.scrollHeight); }
}

/* ---------------- Sheets & actions ---------------- */
function moreSheet(){
  const item = (id, label, icon, count) => `<a class="row" href="#/${id}" onclick="closeSheet()"><span class="ic">${ICONS[icon]}</span><div class="grow"><div class="row-title">${label}</div></div>${count ? `<span class="count">${count}</span>` : ''}<span class="chev">${ICONS.right}</span></a>`;
  openSheet(`<h2>More</h2>
    <div class="card rows menu-list">
      ${item('attendance', 'Attendance', 'register')}
      ${item('notices', 'Notices', 'megaphone', unreadNotices())}
      ${item('messages', 'Messages', 'chat', unreadThreads())}
      ${item('calendar', 'Calendar', 'calendar')}
      ${item('gallery', 'Gallery', 'image')}
      ${item('profile', 'Profile & settings', 'user')}
    </div>`);
}

function noticeSheet(id){
  const n = allNotices().find(x => x.id === id);
  markNoticeRead(id);
  renderChrome();
  const slipKid = n.action === 'slip' ? CHILDREN.find(c => c.grade === 'Grade 3' && !LIVE.slips()[c.id]) : null;
  openSheet(`<span class="tag" style="--c:${n.priority === 'high' ? 'var(--blazer)' : 'var(--sky)'}">${esc(n.audience)}</span>
    <h2>${esc(n.title)}</h2>
    <p class="muted" style="margin-bottom:14px">${fmtLong(n.date)} · from the school office</p>
    <p style="font-size:16px;line-height:1.6">${esc(n.body)}</p>
    ${slipKid ? `<button class="btn btn-red btn-block" style="margin-top:20px" onclick="slipSheet('${slipKid.id}')">${ICONS.pen} Sign the consent form</button>` : ''}`);
  const row = document.querySelector(`[onclick="noticeSheet('${id}')"] .unread`);
  if(row) row.remove();
}

function hwSheet(id){
  const h = findHw(id), c = hwChild(id), done = isDone(h);
  openSheet(`<span class="tag" style="--c:${SUBJECT_COLORS[h.subject]}">${esc(h.subject)} · Grade ${esc(c.className)}</span>
    <h2>${esc(h.title)}</h2>
    <p class="lede">${esc(h.note)}</p>
    <div class="bankbox">
      <div><span>Due</span><b>${fmtLong(h.due)}</b></div>
      <div><span>Set by</span><b>${esc(c.teacher)}</b></div>
      <div><span>Status</span><b>${done ? 'Done' : relDue(h.due)}</b></div>
    </div>
    <button class="btn ${done ? 'btn-line' : 'btn-navy'} btn-block" onclick="toggleHw('${id}')">${done ? 'Mark as not done' : ICONS.check + ' Mark as done'}</button>`);
}
function toggleHw(id){
  const m = hwDoneMap(); const h = findHw(id);
  m[id] = !isDone(h); save('wk_hw_done', m);
  closeSheet(); render();
  if(m[id]){
    document.querySelector(`[onclick="hwSheet('${id}')"]`)?.classList.add('just-done');
    toast('Marked as done', 'ok');
  }
}

function slipSheet(childId){
  const c = childById(childId);
  openSheet(`<div class="eyebrow">Consent form · Grade ${esc(c.className)}</div>
    <h2>Sci-Bono Discovery Centre outing</h2>
    <div class="bankbox">
      <div><span>Date</span><b>${fmtLong(OUTING_DATE)}</b></div>
      <div><span>Times</span><b>08:30 – 13:00</b></div>
      <div><span>Transport</span><b>School bus</b></div>
      <div><span>Contribution</span><b>${fmtMoney(80)}</b></div>
    </div>
    <p style="margin-bottom:16px">I give permission for <b>${esc(c.name)}</b> to attend the Grade 3 outing to the Sci-Bono Discovery Centre and to travel by school bus.</p>
    <label class="field"><span>Allergies or medical notes (optional)</span><textarea id="slip-notes" placeholder="Anything the teachers should know"></textarea></label>
    <label class="field"><span>Type your full name to sign</span><input id="slip-name" placeholder="${esc(PARENT.name)}" autocomplete="name"></label>
    <button class="btn btn-red btn-block" onclick="signSlip('${c.id}')">${ICONS.pen} Sign and send</button>`);
}
function signSlip(childId){
  const name = $('#slip-name').value.trim();
  if(name.length < 3){ toast('Please type your full name to sign', 'bad'); $('#slip-name').focus(); return; }
  LIVE.signSlip(childId, name);
  closeSheet(); render();
  toast(`Consent sent to ${childById(childId).teacher}`, 'ok');
}

function absenceSheet(childId){
  const c = childById(childId);
  openSheet(`<div class="eyebrow">${esc(c.first)} · Grade ${esc(c.className)}</div>
    <h2>Report an absence</h2>
    <p class="lede">This goes straight to ${esc(c.teacher)} and the school office.</p>
    <label class="field"><span>Date</span><input id="abs-date" type="date" value="${TODAY_ISO}"></label>
    <label class="field"><span>Reason</span><select id="abs-reason"><option>Illness</option><option>Medical appointment</option><option>Family matter</option><option>Religious observance</option><option>Other</option></select></label>
    <label class="field"><span>Note for the teacher (optional)</span><textarea id="abs-note" placeholder="e.g. Fever since last night, should be back tomorrow"></textarea></label>
    <label class="field"><span>Doctor's note (optional)</span><input id="abs-file" type="file" accept="image/*,application/pdf"></label>
    <button class="btn btn-navy btn-block" onclick="sendAbsence('${c.id}')">${ICONS.send} Send to school</button>`);
}
function sendAbsence(childId){
  const c = childById(childId);
  const file = $('#abs-file').files[0];
  LIVE.addAbsence({ childId, learnerId: c.learnerId, name: c.name, className: c.className, date: $('#abs-date').value || TODAY_ISO,
    reason: $('#abs-reason').value, note: $('#abs-note').value.trim(), attachment: file ? file.name : null, at: new Date().toISOString() });
  closeSheet(); render();
  toast(`Sent to ${c.teacher}`, 'ok');
}

function paySheet(){
  const bal = balance();
  const b = FAMILY_ACCOUNT.bank;
  openSheet(`<div class="eyebrow">Account ${FAMILY_ACCOUNT.number}</div>
    <h2>Pay ${fmtMoney(bal)}</h2>
    <p class="lede">Choose how you'd like to pay. Card payments go through the school's payment provider.</p>
    <button class="btn btn-red btn-block" onclick="demoPay()">${ICONS.card} Pay by card or Instant EFT</button>
    <div class="eyebrow section-label">Or pay by EFT</div>
    <div class="bankbox">
      <div><span>Bank</span><b>${b.name}</b></div>
      <div><span>Account</span><b>${b.account}</b></div>
      <div><span>Branch code</span><b>${b.branch}</b></div>
      <div><span>Reference</span><b>${b.reference}</b></div>
    </div>
    <button class="btn btn-line btn-block" onclick="copyRef()">Copy reference</button>
    <p class="muted" style="font-size:13px;margin-top:12px">Demo banking details — not a real account.</p>`);
}
function demoPay(){
  const bal = balance();
  const list = payments(); list.push({ amount: bal, date: TODAY_ISO, method: 'card (demo)' }); save('wk_payments', list);
  closeSheet(); render();
  toast(`Payment of ${fmtMoney(bal)} received — thank you`, 'ok');
}
function copyRef(){
  navigator.clipboard?.writeText(FAMILY_ACCOUNT.bank.reference).then(() => toast('Reference copied', 'ok'), () => toast(`Reference: ${FAMILY_ACCOUNT.bank.reference}`));
}

function toggleRsvp(id){
  const r = store('wk_rsvp', {}); r[id] = !r[id]; save('wk_rsvp', r);
  render();
  if(r[id]) toast('We\'ve let the school know you\'re coming', 'ok');
}
function addToCalendar(id){ downloadICS(allEvents().find(e => e.id === id)); }

function sendMessage(e, threadId){
  e.preventDefault();
  const box = $('#composer');
  const text = box.value.trim();
  if(!text) return;
  const all = store('wk_msgs', {});
  (all[threadId] = all[threadId] || []).push({ from: 'me', text, when: 'Just now' });
  save('wk_msgs', all);
  P.fresh = threadId;
  render();
  setTimeout(() => { P.typing = threadId; render(); }, 500);
  setTimeout(() => {
    const again = store('wk_msgs', {});
    again[threadId].push({ from: 'them', text: 'Thank you for your message. I\'ll reply during school hours.', when: 'Just now · auto-reply' });
    save('wk_msgs', again);
    P.typing = null; P.fresh = threadId;
    render();
    const c = $('#composer'); if(c && DESKTOP.matches) c.focus();
  }, 2300);
  const c = $('#composer'); if(c) c.focus();
}

function togglePref(k){
  const p = store('wk_prefs', { notices: true, homework: true, fees: true, messages: true });
  p[k] = !p[k]; save('wk_prefs', p); render();
}
async function installApp(){
  if(!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null; render();
}
function signOut(){ localStorage.removeItem('wk_role'); location.href = '../index.html'; }

/* ---------------- Lightbox ---------------- */
function openLightbox(albumId, i){
  P.lightbox = { album: ALBUMS.find(a => a.id === albumId), i };
  $('#lightbox').hidden = false;
  document.documentElement.classList.add('locked');
  drawLightbox();
}
function drawLightbox(){
  const { album, i } = P.lightbox;
  const img = $('#lb-img');
  img.src = `../assets/photos/${album.photos[i]}`;
  img.classList.remove('show'); void img.offsetWidth; img.classList.add('show');
  $('#lb-count').textContent = `${album.title} · ${i + 1} of ${album.photos.length}`;
  $('#lb-prev').hidden = $('#lb-next').hidden = album.photos.length < 2;
}
function stepLightbox(d){
  if(!P.lightbox) return;
  const n = P.lightbox.album.photos.length;
  P.lightbox.i = (P.lightbox.i + d + n) % n; drawLightbox();
}
function closeLightbox(){ $('#lightbox').hidden = true; P.lightbox = null; document.documentElement.classList.remove('locked'); }
document.addEventListener('keydown', e => {
  if(!P.lightbox) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowRight') stepLightbox(1);
  if(e.key === 'ArrowLeft') stepLightbox(-1);
});
let touchX = null;
document.addEventListener('touchstart', e => { if(P.lightbox) touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if(!P.lightbox || touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX; touchX = null;
  if(Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
});

/* ---------------- Boot ---------------- */
window.addEventListener('hashchange', () => { closeSheet(); P.day = null; window.scrollTo(0, 0); render({ animate: true }); });
window.addEventListener('storage', () => render());
DESKTOP.addEventListener('change', () => render());
hydrateIcons();
render({ animate: true });
