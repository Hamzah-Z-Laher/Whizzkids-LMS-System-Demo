/* Staff portal — routing, screens and interactions */

if(!signedIn('staff')) location.replace('../index.html');

const $ = sel => document.querySelector(sel);
const TODAY_ISO = isoOf(TODAY);
const DESKTOP = window.matchMedia('(min-width: 960px)');
const S = { gateQ: '', gateFilter: 'all', tuckDay: null, regClass: 'c3', regDate: TODAY_ISO, draft: null, q: '', classFilter: 'all', feeFilter: 'all' };

const classById = id => CLASSES.find(c => c.id === id);
const learnersIn = id => LEARNERS.filter(l => l.classId === id);
const STATUS = { present: 'P', late: 'L', absent: 'A' };

/* ---------------- Derived ---------------- */
function learnerFee(l){
  if(l.id !== 'l1') return { balance: l.balance, status: l.feeStatus };
  const paid = LIVE.payments().reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, l.balance - paid);
  return { balance, status: balance === 0 ? 'paid' : l.feeStatus };
}
function registerFor(classId, date = TODAY_ISO){ return LIVE.register(classId, date); }
function todayTotals(){
  let marked = 0, present = 0, total = 0;
  CLASSES.forEach(c => {
    const r = registerFor(c.id);
    if(!r) return;
    marked++;
    learnersIn(c.id).forEach(l => { total++; if(r[l.id] !== 'absent') present++; });
  });
  return { marked, pct: total ? Math.round(present / total * 100) : null };
}
function sentNotices(){ return LIVE.sent() || SENT_SEED; }
function inbox(){
  const absences = LIVE.absences().map(a => ({ kind: 'abs', at: a.at, title: `${a.name} — absence reported`, sub: `${fmtShort(a.date)} · ${a.reason}${a.note ? ' · “' + a.note + '”' : ''}${a.attachment ? ' · note attached' : ''}`, meta: `Grade ${a.className}` }));
  const slips = Object.entries(LIVE.slips()).map(([childId, s]) => {
    const c = CHILDREN.find(x => x.id === childId);
    return { kind: 'slip', at: s.at, title: `${c.name} — consent signed`, sub: `Sci-Bono outing · signed by ${s.signedBy}`, meta: `Grade ${c.className}` };
  });
  return [...absences, ...slips].sort((a, b) => b.at.localeCompare(a.at));
}
const slipsReturned = () => SLIPS_RETURNED_SEED + Object.keys(LIVE.slips()).length;
const allEvents = () => [...EVENTS, ...LIVE.events().map(e => ({ ...e, live: true }))].sort((a, b) => a.date.localeCompare(b.date));
const feePill = s => `<span class="pill ${s === 'paid' ? 'pill-ok' : s === 'partial' ? 'pill-warn' : 'pill-bad'}">${s === 'paid' ? 'Paid' : s === 'partial' ? 'Partial' : 'Overdue'}</span>`;
const timeOf = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const head = (eyebrow, title, sub = '') => `<header class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;

/* ---------------- Screens ---------------- */
function screenOverview(){
  const t = todayTotals();
  const outstanding = LEARNERS.reduce((s, l) => s + learnerFee(l).balance, 0);
  const overdue = LEARNERS.filter(l => learnerFee(l).status === 'overdue').length;
  const items = inbox();
  const returned = slipsReturned();
  const absentReports = LIVE.absences().filter(a => a.date === TODAY_ISO).length;
  return `<div class="stack">
    <div>
      <section class="hero mesh">
        <div>
          <div class="eyebrow on-dark">${fmtLong(TODAY_ISO)} · Term ${termOf()}</div>
          <h1>${greeting()}, ${STAFF_USER.title} ${STAFF_USER.name.split(' ').pop()}</h1>
          <p>${t.marked} of ${CLASSES.length} registers are in${absentReports ? ` and parents have reported ${absentReports} absence${absentReports > 1 ? 's' : ''} today` : ''}.</p>
        </div>
        <img class="hero-photo" src="../assets/photos/readers.jpg" alt="Grade R learners holding their reading books">
      </section>
    </div>

    <div class="kpis">
      <div class="kpi"><div class="eyebrow">Learners</div><b data-count="${LEARNERS.length}">${LEARNERS.length}</b><div class="sub">Sample roster · ${CLASSES.length} classes</div></div>
      <div class="kpi"><div class="eyebrow">Present today</div><b ${t.pct === null ? '' : `data-count="${t.pct}" data-suffix="%"`}>${t.pct === null ? '—' : t.pct + '%'}</b><div class="sub">${t.marked} of ${CLASSES.length} registers in</div></div>
      <div class="kpi ${overdue ? 'alert' : ''}"><div class="eyebrow">Fees outstanding</div><b data-count="${outstanding}" data-fmt="rand">${fmtMoney(outstanding).replace(/,00$/, '')}</b><div class="sub">${overdue} accounts overdue</div></div>
      <div class="kpi"><div class="eyebrow">Notices this term</div><b data-count="${sentNotices().length}">${sentNotices().length}</b><div class="sub">Read by most families</div></div>
    </div>

    <div class="home-grid">
      <div class="stack">
        <section class="card">
          <div class="card-head"><h2>From parents</h2><span class="live-dot">Live</span></div>
          <div class="rows">${items.length ? items.map(i => `
            <div class="row">
              <span class="inbox-ic ${i.kind}">${i.kind === 'abs' ? ICONS.alert : ICONS.pen}</span>
              <div class="grow"><div class="row-title">${esc(i.title)}</div><div class="row-sub">${esc(i.sub)}</div></div>
              <span class="row-meta nowrap">${timeOf(i.at)}</span>
            </div>`).join('') : `<div class="empty">${ICONS.checkCircle}<p>Nothing new from parents yet.<br>Absence reports and signed consent forms appear here the moment they're sent.</p></div>`}
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Registers today</h2><a class="link" href="#/register">Take register</a></div>
          <div class="rows">${CLASSES.map(c => {
            const r = registerFor(c.id);
            const list = learnersIn(c.id);
            const absent = r ? list.filter(l => r[l.id] === 'absent').length : 0;
            return `<a class="row" href="#/register" onclick="S.regClass='${c.id}'; S.draft=null;">
              <span class="tag" style="--c:${PHASES[c.phase].color}"></span>
              <div class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub">${esc(c.teacher)} · ${list.length} learners</div></div>
              ${r ? `<span class="pill pill-ok">${ICONS.check} ${r._at ? timeOf(r._at) : 'Marked'}</span>${absent ? `<span class="pill pill-bad">${absent} absent</span>` : ''}` : '<span class="pill pill-warn">Not yet</span>'}
            </a>`;
          }).join('')}</div>
        </section>
      </div>

      <div class="stack">
        <section class="card">
          <div class="card-head"><h2>Home time &amp; tuck shop</h2></div>
          <div class="rows">
            <a class="row" href="#/collection"><span class="inbox-ic" style="background:var(--navy-soft);color:var(--navy)">${ICONS.car}</span><div class="grow"><div class="row-title">Collection</div><div class="row-sub">${gateList().filter(x => x.status === 'collected').length} of ${LEARNERS.length} collected${gateCount() ? ` · <b style="color:var(--blazer)">${gateCount()} at the gate</b>` : ''}</div></div><span class="chev">${ICONS.right}</span></a>
            <a class="row" href="#/tuckshop"><span class="inbox-ic" style="background:var(--gold-soft);color:var(--warn)">${ICONS.pizza}</span><div class="grow"><div class="row-title">Tuck shop</div><div class="row-sub">${tuckOrdersFor(SCHOOL_TODAY).length} pre-orders for first break</div></div><span class="chev">${ICONS.right}</span></a>
          </div>
        </section>
        <section class="card card-pad">
          <div class="eyebrow">Consent forms</div>
          <h2 style="font-size:19px;margin:6px 0 4px">Grade 3 Sci-Bono outing</h2>
          <p class="muted" style="margin-bottom:14px">${fmtLong(OUTING_DATE)}</p>
          <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:8px"><span>${returned} of ${GRADE3_CLASS_SIZE} signed</span><span class="muted">${GRADE3_CLASS_SIZE - returned} outstanding</span></div>
          <div class="progress" style="--c:var(--ok)"><i style="width:${Math.round(returned / GRADE3_CLASS_SIZE * 100)}%"></i></div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Recent notices</h2><a class="link" href="#/notices">New notice</a></div>
          <div class="rows">${sentNotices().slice(0, 4).map(n => `
            <div class="row" style="display:block">
              <div style="display:flex;justify-content:space-between;gap:10px"><span class="row-title">${esc(n.title)}</span><span class="row-meta nowrap">${relAgo(n.date)}</span></div>
              <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
                <div class="progress" style="flex:1;--c:var(--sky)"><i style="width:${n.reach ? Math.round(n.read / n.reach * 100) : 0}%"></i></div>
                <span class="row-meta nowrap">${n.read ? `${Math.round(n.read / n.reach * 100)}% read` : 'Just sent'}</span>
              </div>
            </div>`).join('')}
          </div>
        </section>
      </div>
    </div>
  </div>`;
}

function screenRegister(){
  const c = classById(S.regClass);
  const list = learnersIn(c.id);
  const saved = LIVE.register(c.id, S.regDate);
  if(!S.draft) S.draft = saved ? { ...saved } : Object.fromEntries(list.map(l => [l.id, 'present']));
  const reports = LIVE.absences().filter(a => a.date === S.regDate);
  const count = s => list.filter(l => S.draft[l.id] === s).length;
  return `${head(esc(c.teacher), 'Register', 'Tap P, L or A. Parents of absent learners are notified when you save.')}
    <div class="stack">
      <div class="reg-tools">
        <select aria-label="Class" onchange="S.regClass=this.value; S.draft=null; render();">${CLASSES.map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        <input type="date" aria-label="Date" value="${S.regDate}" onchange="S.regDate=this.value; S.draft=null; render();">
      </div>
      <section class="card">
        <div class="card-head"><h2>${esc(c.name)}</h2>${saved ? `<span class="pill pill-ok">${ICONS.check} Saved ${saved._at ? timeOf(saved._at) : ''}</span>` : '<span class="pill pill-warn">Not saved</span>'}</div>
        <div class="rows">${list.map(l => {
          const rep = reports.find(a => a.learnerId === l.id);
          return `<div class="reg-row">
            ${avatar(l.name, 'sm')}
            <div class="grow"><div class="row-title">${esc(l.name)}</div>${rep ? `<div class="row-sub" style="color:var(--blazer)">Parent reported: ${esc(rep.reason)}</div>` : ''}</div>
            <div class="marks" role="group" aria-label="${esc(l.name)}">
              ${Object.entries(STATUS).map(([s, k]) => `<button class="${k.toLowerCase()} ${S.draft[l.id] === s ? 'on' : ''}" aria-pressed="${S.draft[l.id] === s}" aria-label="${s}" onclick="mark('${l.id}','${s}')">${k}</button>`).join('')}
            </div>
          </div>`;
        }).join('')}</div>
        <div class="reg-foot">
          <div class="reg-tally"><span style="color:var(--ok)">${count('present')} present</span><span style="color:var(--warn)">${count('late')} late</span><span style="color:var(--blazer)">${count('absent')} absent</span></div>
          <div style="display:flex;gap:8px"><button class="btn btn-line btn-sm" onclick="markAll()">All present</button><button class="btn btn-navy btn-sm" onclick="saveRegister()">${ICONS.check} Save register</button></div>
        </div>
      </section>
    </div>`;
}

function screenNotices(){
  const sent = sentNotices();
  return `${head('Communication', 'Notices', 'Send a notice to families. It lands in the parent app straight away.')}
    <div class="compose-grid stack">
      <section class="card card-pad">
        <label class="field"><span>Title</span><input id="n-title" maxlength="80" placeholder="e.g. Civvies day this Friday" oninput="preview()"></label>
        <label class="field"><span>Send to</span><select id="n-aud" onchange="preview()">
          <option>Whole school</option><option>Montessori</option><option>Grade 1</option><option>Grade 3</option><option>Grade 6</option><option>Whizzkidz High</option><option>Aqua School</option>
        </select></label>
        <label class="field"><span>Message</span><textarea id="n-body" placeholder="What do families need to know?" oninput="preview()"></textarea></label>
        <label class="check-row"><input type="checkbox" id="n-urgent" onchange="preview()"> Mark as important</label>
        <button class="btn btn-navy btn-block" onclick="sendNotice()">${ICONS.send} Send to parents</button>
      </section>
      <div class="stack">
        <div>
          <div class="eyebrow section-label" style="padding-top:0">How parents will see it</div>
          <div class="preview">
            <div class="preview-bar"><img src="../assets/brand/emblem.png" alt=""><span>WHIZZKIDZ</span></div>
            <div id="n-preview"></div>
          </div>
        </div>
        <section class="card">
          <div class="card-head"><h2>Sent this term</h2></div>
          <div class="rows">${sent.map(n => `
            <div class="row"><div class="grow"><div class="row-title">${esc(n.title)}</div><div class="row-sub">${esc(n.audience)} · ${fmtShort(n.date)}</div></div>
            <span class="row-meta nowrap">${n.read ? `${n.read}/${n.reach} read` : 'Just sent'}</span></div>`).join('')}
          </div>
        </section>
      </div>
    </div>`;
}

function screenLearners(){
  const q = S.q.toLowerCase();
  const rows = LEARNERS.filter(l => (S.classFilter === 'all' || l.classId === S.classFilter) && (!q || l.name.toLowerCase().includes(q) || l.parent.toLowerCase().includes(q)));
  return `${head('Records', 'Learners', `${LEARNERS.length} learners in the sample roster`)}
    <div class="stack">
      <label class="search">${ICONS.search}<input id="q" placeholder="Search learner or parent" value="${esc(S.q)}" oninput="S.q=this.value; renderView(); const i=$('#q'); i.focus(); i.setSelectionRange(i.value.length,i.value.length);"></label>
      <div class="filters">${[['all', 'All classes'], ...CLASSES.map(c => [c.id, c.name])].map(([id, label]) => `<button class="chip ${S.classFilter === id ? 'on' : ''}" onclick="S.classFilter='${id}'; render();">${esc(label)}</button>`).join('')}</div>
      <section class="card">
        <table class="data">
          <thead><tr><th>Learner</th><th>Class</th><th>Parent</th><th>Attendance</th><th>Fees</th></tr></thead>
          <tbody>${rows.map(l => {
            const f = learnerFee(l);
            return `<tr onclick="learnerSheet('${l.id}')">
              <td><span class="who">${avatar(l.name, 'sm')}${esc(l.name)}</span></td>
              <td class="m-sub">${esc(classById(l.classId).name)}<span class="m-only"> · ${l.attendance}%</span></td>
              <td class="m-hide">${esc(l.parent)}</td>
              <td class="m-hide"><span class="progress mini" style="--c:${l.attendance >= 93 ? 'var(--ok)' : l.attendance >= 88 ? 'var(--warn)' : 'var(--blazer)'}"><i style="width:${l.attendance}%"></i></span>${l.attendance}%</td>
              <td class="m-right">${feePill(f.status)}</td>
            </tr>`;
          }).join('') || '<tr><td colspan="5"><div class="empty">No learners match.</div></td></tr>'}</tbody>
        </table>
      </section>
    </div>`;
}

function screenFees(){
  const reminded = store('wk_reminded', {});
  const withFee = LEARNERS.map(l => ({ ...l, fee: learnerFee(l) }));
  const rows = withFee.filter(l => S.feeFilter === 'all' || l.fee.status === S.feeFilter).sort((a, b) => b.fee.balance - a.fee.balance);
  const total = withFee.reduce((s, l) => s + l.fee.balance, 0);
  const overdue = withFee.filter(l => l.fee.status === 'overdue');
  return `${head('Records', 'Fees', 'Balances update as soon as a family pays in the app.')}
    <div class="stack">
      <div class="kpis">
        <div class="kpi alert"><div class="eyebrow">Outstanding</div><b data-count="${total}" data-fmt="rand">${fmtMoney(total).replace(/,00$/, '')}</b><div class="sub">Across ${withFee.filter(l => l.fee.balance > 0).length} accounts</div></div>
        <div class="kpi"><div class="eyebrow">Overdue</div><b data-count="${overdue.length}">${overdue.length}</b><div class="sub">accounts past due date</div></div>
        <div class="kpi"><div class="eyebrow">Paid up</div><b data-count="${Math.round(withFee.filter(l => l.fee.status === 'paid').length / withFee.length * 100)}" data-suffix="%">${Math.round(withFee.filter(l => l.fee.status === 'paid').length / withFee.length * 100)}%</b><div class="sub">of accounts</div></div>
        <div class="kpi"><div class="eyebrow">Reminders sent</div><b>${Object.keys(reminded).length}</b><div class="sub">this month</div></div>
      </div>
      <div class="filters">${[['all', 'All'], ['overdue', 'Overdue'], ['partial', 'Partial'], ['paid', 'Paid']].map(([id, label]) => `<button class="chip ${S.feeFilter === id ? 'on' : ''}" onclick="S.feeFilter='${id}'; render();">${label}</button>`).join('')}</div>
      <section class="card">
        <table class="data">
          <thead><tr><th>Learner</th><th>Parent</th><th>Status</th><th style="text-align:right">Balance</th><th></th></tr></thead>
          <tbody>${rows.map(l => `
            <tr onclick="learnerSheet('${l.id}')">
              <td><span class="who">${avatar(l.name, 'sm')}${esc(l.name)}</span></td>
              <td class="m-sub">${esc(l.parent)}</td>
              <td class="m-hide">${feePill(l.fee.status)}</td>
              <td class="num">${fmtMoney(l.fee.balance)}</td>
              <td class="m-hide" style="text-align:right">${l.fee.status !== 'paid' ? (reminded[l.id] ? '<span class="row-meta">Reminded</span>' : `<button class="btn btn-line btn-sm" onclick="event.stopPropagation(); remind('${l.id}')">Remind</button>`) : ''}</td>
            </tr>`).join('')}</tbody>
        </table>
      </section>
    </div>`;
}

function screenCalendar(){
  return `${head('Communication', 'Calendar & gallery')}
    <div class="two-col stack">
      <section class="card">
        <div class="card-head"><h2>Upcoming</h2><button class="btn btn-navy btn-sm" onclick="eventSheet()">${ICONS.plus} Add event</button></div>
        <div class="rows">${allEvents().filter(e => daysFromToday(e.date) >= 0).map(e => `
          <div class="row">
            <div class="datechip"><div class="m">${monthShort(e.date)}</div><div class="d">${dayNum(e.date)}</div></div>
            <div class="grow"><div class="row-title">${esc(e.title)} ${e.live ? '<span class="ribbon">New</span>' : ''}</div><div class="row-sub">${esc(e.start)}–${esc(e.end)} · ${esc(e.location)}</div><span class="tag" style="--c:var(--sky);margin-top:6px">${esc(e.audience)}</span></div>
          </div>`).join('')}
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h2>Albums</h2><button class="btn btn-line btn-sm" onclick="toast('Photo uploads are part of the full build')">${ICONS.plus} New album</button></div>
        <div class="albums" style="padding:0 18px 18px">${ALBUMS.map(a => `
          <div class="album"><img src="../assets/photos/${a.photos[0]}" alt="" loading="lazy"><b>${esc(a.title)}</b><small>${a.photos.length} photo${a.photos.length > 1 ? 's' : ''} · ${relAgo(a.date)}</small></div>`).join('')}
        </div>
      </section>
    </div>`;
}

/* ---------------- Collection (gate view) ---------------- */
const hmMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const minHM = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const gateCount = () => gateList().filter(x => x.status === 'gate').length;

function gateList(){
  const date = SCHOOL_TODAY, gate = LIVE.gate(date), plans = LIVE.pickups(date);
  return LEARNERS.map((l, i) => {
    const kid = CHILDREN.find(c => c.learnerId === l.id);
    let who, slot = 'end', arrivedAt = null, changedAt = null, onceOff = false;
    if(kid){
      const plan = plans[kid.id] || { collector: 'p1', slot: 'end' };
      const p = plan.onceOff ? { ...plan.onceOff, rel: 'Once-off' } : COLLECTORS.find(x => x.id === plan.collector);
      who = p; slot = plan.slot; arrivedAt = plan.arrivedAt || null; changedAt = plan.changedAt || null; onceOff = !!plan.onceOff;
    } else {
      const lift = i % 7 === 3;
      who = lift ? { name: LEARNERS[(i + 5) % LEARNERS.length].parent, rel: 'Lift club', car: CARS[(i + 2) % CARS.length] } : { name: l.parent, rel: 'Parent', car: CARS[i % CARS.length] };
      slot = i % 6 === 2 ? 'aftercare' : 'end';
    }
    const time = slot === 'end' ? CLASS_END[l.classId] : slot === 'sport' ? '14:30' : '17:00';
    let rec = gate[l.id];
    if(!rec && !kid && date === TODAY_ISO && slot === 'end' && nowMin() > hmMin(time) + 10 && i % 4 !== 0){
      rec = { status: 'collected', at: minHM(hmMin(time) + 3 + (i * 7) % 18), by: who.name, seed: true };
    }
    const status = rec && rec.status === 'collected' ? 'collected' : arrivedAt ? 'gate' : 'waiting';
    return { l, kid, who, slot, time, rec, status, arrivedAt, changedAt, onceOff };
  });
}

function screenCollection(){
  const all = gateList();
  const n = s => all.filter(x => x.status === s).length;
  const q = S.gateQ.toLowerCase();
  const order = { gate: 0, waiting: 1, collected: 2 };
  const rows = all
    .filter(x => (S.gateFilter === 'all' || x.status === S.gateFilter) && (!q || x.l.name.toLowerCase().includes(q) || x.who.name.toLowerCase().includes(q)))
    .sort((a, b) => order[a.status] - order[b.status] || (a.status === 'collected' ? b.rec.at.localeCompare(a.rec.at) : a.time.localeCompare(b.time)));
  const chip = (id, label, count) => `<button class="chip ${S.gateFilter === id ? 'on' : ''}" onclick="S.gateFilter='${id}'; render();">${label}${count !== undefined ? ` <span class="chip-n">${count}</span>` : ''}</button>`;
  const onceOffs = all.filter(x => x.onceOff).length;
  return `${head(`Gate · ${fmtLong(SCHOOL_TODAY)}`, 'Collection', 'Who is fetching each learner. Tap Collected as they leave — parents are notified instantly.')}
    <div class="stack">
      <div class="kpis">
        <div class="kpi ${n('gate') ? 'alert' : ''}"><div class="eyebrow">At the gate</div><b data-count="${n('gate')}">${n('gate')}</b><div class="sub">waiting to be brought out</div></div>
        <div class="kpi"><div class="eyebrow">Still to go</div><b data-count="${n('waiting')}">${n('waiting')}</b><div class="sub">scheduled today</div></div>
        <div class="kpi"><div class="eyebrow">Collected</div><b data-count="${n('collected')}">${n('collected')}</b><div class="sub">of ${all.length} learners</div></div>
        <div class="kpi"><div class="eyebrow">Once-off collectors</div><b data-count="${onceOffs}">${onceOffs}</b><div class="sub">check ID at the gate</div></div>
      </div>
      <label class="search">${ICONS.search}<input id="gq" placeholder="Search learner or collector" value="${esc(S.gateQ)}" oninput="S.gateQ=this.value; renderView(); const i=$('#gq'); i.focus(); i.setSelectionRange(i.value.length,i.value.length);"></label>
      <div class="filters">${chip('all', 'Everyone')}${chip('gate', 'At the gate', n('gate'))}${chip('waiting', 'Still to go', n('waiting'))}${chip('collected', 'Collected', n('collected'))}</div>
      <section class="card rows">${rows.map(x => `
        <div class="row gate-row ${x.status}">
          ${avatar(x.l.name, 'md')}
          <div class="grow">
            <div class="row-title">${esc(x.l.name)} <span class="row-meta">· ${esc(classById(x.l.classId).name)} · ${x.time}</span></div>
            <div class="row-sub gate-who">${ICONS.car}<span>${esc(x.who.name)} · ${esc(x.who.rel)}${x.who.car ? ' · ' + esc(x.who.car) : ''}</span></div>
            ${x.onceOff || x.changedAt || x.status === 'gate' ? `<div class="gate-flags">
              ${x.status === 'gate' ? `<span class="live-dot warn">At the gate since ${x.arrivedAt}</span>` : ''}
              ${x.onceOff ? `<span class="pill pill-warn">${ICONS.shield} Once-off · check ID •••• ${esc(x.who.idLast4)}</span>` : ''}
              ${x.changedAt ? `<span class="pill pill-sky">Changed by parent ${x.changedAt}</span>` : ''}
            </div>` : ''}
          </div>
          ${x.status === 'collected'
            ? `<div class="gate-done"><span class="pill pill-ok">${ICONS.check} ${x.rec.at}</span>${x.rec.seed ? '' : `<button class="link" onclick="undoCollected('${x.l.id}')">Undo</button>`}</div>`
            : `<button class="btn btn-sm ${x.status === 'gate' ? 'btn-red' : 'btn-navy'}" onclick="markCollected('${x.l.id}')">${ICONS.check} Collected</button>`}
        </div>`).join('') || '<div class="empty">No learners match.</div>'}
      </section>
    </div>`;
}
function markCollected(learnerId){
  const x = gateList().find(r => r.l.id === learnerId);
  LIVE.setGate(SCHOOL_TODAY, learnerId, { status: 'collected', at: nowHM(), by: `${x.who.name} (${x.who.rel})` });
  render();
  toast(`${x.l.name} collected by ${x.who.name}${x.kid ? ' — parent notified' : ''}`, 'ok');
}
function undoCollected(learnerId){ LIVE.setGate(SCHOOL_TODAY, learnerId, null); render(); }

/* ---------------- Tuck shop (kitchen view) ---------------- */
const menuItem = id => TUCK_MENU.find(m => m.id === id);
const itemsTotal = items => Object.entries(items).reduce((s, [id, q]) => s + menuItem(id).price * q, 0);
const itemsSummary = items => Object.entries(items).map(([id, q]) => `${q}× ${menuItem(id).name}`).join(', ');
function tuckOrdersFor(date){
  const st = LIVE.tuckStatus();
  return [...LIVE.tuckOrders().filter(o => o.date === date), ...(date === SCHOOL_TODAY ? TUCK_SEED : [])]
    .map(o => ({ ...o, learner: LEARNERS.find(l => l.id === o.learnerId), status: st[o.id] || 'ordered', total: o.total ?? itemsTotal(o.items), live: !o.seed }));
}
function tuckDaysStaff(){
  const out = [], t = parseISO(SCHOOL_TODAY);
  while(out.length < 3){ if(!isWeekend(t)) out.push(isoOf(t)); t.setDate(t.getDate() + 1); }
  return out;
}
function screenTuckshop(){
  const day = S.tuckDay || SCHOOL_TODAY;
  const orders = tuckOrdersFor(day);
  const counts = {};
  orders.forEach(o => Object.entries(o.items).forEach(([id, q]) => { counts[id] = (counts[id] || 0) + q; }));
  const itemsN = Object.values(counts).reduce((a, b) => a + b, 0);
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const done = orders.filter(o => o.status === 'collected').length;
  const pct = orders.length ? Math.round(done / orders.length * 100) : 0;
  const byClass = CLASSES.map(c => [c, orders.filter(o => o.learner.classId === c.id).sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0))]).filter(([, l]) => l.length);
  const label = d => d === TODAY_ISO ? 'Today' : parseISO(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
  const action = o => o.status === 'ordered'
    ? `<button class="btn btn-sm btn-navy" onclick="setTuck('${o.id}','ready')">Mark ready</button>`
    : o.status === 'ready'
      ? `<button class="btn btn-sm btn-red" onclick="setTuck('${o.id}','collected')">${ICONS.check} Hand over</button>`
      : `<span class="pill pill-ok">${ICONS.check} Handed over</span>`;
  return `${head(`First break · ${fmtLong(day)}`, 'Tuck shop', 'Pre-orders from the parent app. Prep from the totals, then hand over by class.')}
    <div class="stack">
      <div class="seg day-seg" style="max-width:420px">${tuckDaysStaff().map(d => `<button class="${d === day ? 'on' : ''}" onclick="S.tuckDay='${d}'; render();">${label(d)}</button>`).join('')}</div>
      <div class="kpis">
        <div class="kpi"><div class="eyebrow">Orders</div><b data-count="${orders.length}">${orders.length}</b><div class="sub">${done} handed over</div></div>
        <div class="kpi"><div class="eyebrow">Items to prep</div><b data-count="${itemsN}">${itemsN}</b><div class="sub">for first break</div></div>
        <div class="kpi"><div class="eyebrow">Pre-paid</div><b data-count="${revenue}" data-fmt="rand">${fmtMoney(revenue).replace(/,00$/, '')}</b><div class="sub">from parent wallets</div></div>
        <div class="kpi"><div class="eyebrow">Handed over</div><b data-count="${pct}" data-suffix="%">${pct}%</b><div class="progress" style="--c:var(--ok);margin-top:8px"><i style="width:${pct}%"></i></div></div>
      </div>
      ${orders.length ? `<section class="card">
        <div class="card-head"><h2>Kitchen totals</h2>${orders.some(o => o.status === 'ordered') ? '<button class="btn btn-line btn-sm" onclick="allReady()">Mark all ready</button>' : ''}</div>
        <div class="kitchen">${TUCK_MENU.filter(m => counts[m.id]).map(m => `<div class="kitchen-item"><span class="food" style="--c:${m.tone}">${ICONS[m.icon]}</span><b>${counts[m.id]}×</b><span>${esc(m.name)}</span></div>`).join('')}</div>
      </section>` : ''}
      ${byClass.map(([c, list]) => `<div class="eyebrow section-label">${esc(c.name)} · ${list.length} order${list.length > 1 ? 's' : ''}</div>
        <section class="card rows">${list.map(o => `
          <div class="row tuck-row ${o.status}">
            ${avatar(o.learner.name, 'sm')}
            <div class="grow"><div class="row-title">${esc(o.learner.name)} ${o.live ? '<span class="ribbon">App</span>' : ''}</div><div class="row-sub">${esc(itemsSummary(o.items))}</div></div>
            <span class="row-meta nowrap m-hide-sm">${fmtMoney(o.total)}</span>
            ${action(o)}
          </div>`).join('')}
        </section>`).join('') || `<section class="card"><div class="empty">${ICONS.pizza}<p>No pre-orders for ${label(day).toLowerCase()} yet.</p></div></section>`}
    </div>`;
}
function setTuck(id, status){
  LIVE.setTuckStatus(id, status);
  const o = tuckOrdersFor(S.tuckDay || SCHOOL_TODAY).find(x => x.id === id);
  render();
  toast(status === 'ready' ? `${o.learner.name}'s order is ready${o.live ? ' — parent notified' : ''}` : `Handed over to ${o.learner.name}`, 'ok');
}
function allReady(){
  tuckOrdersFor(S.tuckDay || SCHOOL_TODAY).filter(o => o.status === 'ordered').forEach(o => LIVE.setTuckStatus(o.id, 'ready'));
  render();
  toast('All orders marked ready', 'ok');
}

const ROUTES = { collection: screenCollection, tuckshop: screenTuckshop, overview: screenOverview, register: screenRegister, notices: screenNotices, learners: screenLearners, fees: screenFees, calendar: screenCalendar };
const TITLES = { fees: 'Fees', calendar: 'Calendar & gallery', notices: 'Notices', learners: 'Learners' };
const TOP_LEVEL = ['overview', 'register', 'collection', 'tuckshop'];

/* ---------------- Chrome ---------------- */
function parseRoute(){
  const [name] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'overview' };
}
function renderBar(r){
  const left = TOP_LEVEL.includes(r.name)
    ? `<a class="brand m-only" href="#/overview" aria-label="Overview"><img class="emblem" src="../assets/brand/emblem.png" alt="">${wordmark()}</a><span class="spacer m-only"></span>`
    : `<button class="icon-btn m-only" onclick="location.hash='#/overview'" aria-label="Back">${ICONS.left}</button><div class="title m-only">${TITLES[r.name]}</div>`;
  return `${left}
    <div class="today-label d-only">${r.name === 'overview' ? '' : `<span class="eyebrow" style="color:var(--ink-3)">${fmtLong(TODAY_ISO)} · Term ${termOf()}</span>`}</div>
    <span class="pill pill-navy d-only" style="margin-right:6px">Staff portal</span>
    <button class="icon-btn" onclick="moreSheet()" aria-label="Account"><span class="avatar avatar-sm me" style="--tone:var(--sky)">${initials(STAFF_USER.name)}</span></button>`;
}
function renderSide(r){
  const inboxCount = LIVE.absences().filter(a => a.date === TODAY_ISO).length;
  const link = ([id, label, icon, count]) => `<a class="side-link ${r.name === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}${label}${count ? `<span class="count">${count}</span>` : ''}</a>`;
  const groups = [
    ['Today', [['overview', 'Overview', 'grid', inboxCount], ['register', 'Register', 'register'], ['collection', 'Collection', 'car', gateCount()], ['tuckshop', 'Tuck shop', 'pizza']]],
    ['Communication', [['notices', 'Notices', 'megaphone'], ['calendar', 'Calendar & gallery', 'calendar']]],
    ['Records', [['learners', 'Learners', 'users'], ['fees', 'Fees', 'coins']]],
  ];
  return `<img class="emblem" src="../assets/brand/emblem.png" alt="Whizzkidz Academy crest">
    ${wordmark('light')}
    <nav>${groups.map(([g, items]) => `<div class="side-group"><div class="eyebrow on-dark">${g}</div>${items.map(link).join('')}</div>`).join('')}</nav>
    <div class="side-foot">
      <span class="avatar avatar-sm" style="--tone:var(--sky)">${initials(STAFF_USER.name)}</span>
      <div><b>${STAFF_USER.title} ${esc(STAFF_USER.name.split(' ').pop())}</b><small>${esc(STAFF_USER.role)}</small></div>
      <button class="icon-btn" onclick="signOut()" aria-label="Sign out">${ICONS.logout}</button>
    </div>`;
}
function renderTabs(r){
  const inboxCount = LIVE.absences().filter(a => a.date === TODAY_ISO).length;
  const tabs = [['overview', 'Overview', 'grid'], ['register', 'Register', 'register'], ['collection', 'Pick-up', 'car'], ['tuckshop', 'Tuck shop', 'pizza']];
  return tabs.map(([id, label, icon]) => `<a class="tab ${r.name === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}<span>${label}</span>${id === 'overview' && inboxCount ? `<span class="count">${inboxCount}</span>` : ''}</a>`).join('')
    + `<button class="tab ${['fees', 'calendar', 'notices', 'learners'].includes(r.name) ? 'on' : ''}" onclick="moreSheet()">${ICONS.more}<span>More</span></button>`;
}
function renderView(){ $('#view').innerHTML = ROUTES[parseRoute().name](); if(parseRoute().name === 'notices') preview(); }
function render(opts = {}){
  const r = parseRoute();
  $('#bar').innerHTML = renderBar(r);
  $('#side').innerHTML = renderSide(r);
  $('#tabbar').innerHTML = renderTabs(r);
  placeTabGlow($('#tabbar'));
  renderView();
  if(opts.animate) animateIn($('#view'));
}

/* ---------------- Actions ---------------- */
function moreSheet(){
  const item = (href, label, icon) => `<a class="row" href="${href}" onclick="closeSheet()"><span class="ic">${ICONS[icon]}</span><div class="grow"><div class="row-title">${label}</div></div><span class="chev">${ICONS.right}</span></a>`;
  openSheet(`<h2>${STAFF_USER.title} ${esc(STAFF_USER.name)}</h2><p class="lede">${esc(STAFF_USER.role)} · ${SCHOOL.name}</p>
    <div class="card rows menu-list">
      ${item('#/notices', 'Notices', 'megaphone')}
      ${item('#/learners', 'Learners', 'users')}
      ${item('#/fees', 'Fees', 'coins')}
      ${item('#/calendar', 'Calendar & gallery', 'calendar')}
      <button class="row" onclick="signOut()"><span class="ic">${ICONS.logout}</span><div class="grow"><div class="row-title">Sign out</div></div></button>
    </div>`);
}

function mark(id, status){
  S.draft[id] = status; renderView();
  if(!REDUCED_MOTION) document.querySelector(`[onclick="mark('${id}','${status}')"]`)?.classList.add('pop');
}
function markAll(){ learnersIn(S.regClass).forEach(l => { S.draft[l.id] = 'present'; }); renderView(); }
function saveRegister(){
  const marks = { ...S.draft, _at: new Date().toISOString() };
  LIVE.setRegister(S.regClass, S.regDate, marks);
  const absent = learnersIn(S.regClass).filter(l => marks[l.id] === 'absent').length;
  render();
  toast(absent ? `Register saved · ${absent} ${absent === 1 ? 'family' : 'families'} notified` : 'Register saved · everyone present', 'ok');
}

function preview(){
  const el = $('#n-preview'); if(!el) return;
  const title = $('#n-title').value.trim() || 'Your notice title';
  const body = $('#n-body').value.trim() || 'Your message will appear here, exactly as families see it in the app.';
  const urgent = $('#n-urgent').checked;
  el.innerHTML = `<div class="row notice-row"><span class="unread"></span><div class="grow">
    <div class="row-title">${esc(title)} <span class="ribbon">New</span></div>
    <div class="snippet">${esc(body)}</div>
    <div class="meta"><span class="tag" style="--c:${urgent ? 'var(--blazer)' : 'var(--sky)'}">${esc($('#n-aud').value)}</span><span class="row-meta">Today</span></div>
  </div></div>`;
}
function sendNotice(){
  const title = $('#n-title').value.trim(), body = $('#n-body').value.trim(), audience = $('#n-aud').value;
  if(!title || !body){ toast('Add a title and a message first', 'bad'); return; }
  const id = 'live-' + Date.now();
  const priority = $('#n-urgent').checked ? 'high' : 'normal';
  LIVE.addNotice({ id, title, body, audience, priority, date: TODAY_ISO });
  const reach = audience === 'Whole school' ? 284 : 41;
  LIVE.setSent([{ id, title, audience, date: TODAY_ISO, reach, read: 0 }, ...sentNotices()]);
  render();
  toast(`Sent to ${audience === 'Whole school' ? 'all families' : audience + ' families'}`, 'ok');
}

function learnerSheet(id){
  const l = LEARNERS.find(x => x.id === id), c = classById(l.classId), f = learnerFee(l);
  openSheet(`<div style="display:flex;align-items:center;gap:14px;margin:6px 44px 16px 0">${avatar(l.name, 'lg')}<div><h2 style="margin:0">${esc(l.name)}</h2><p class="muted">${esc(c.name)} · ${esc(c.teacher)}</p></div></div>
    <div class="bankbox">
      <div><span>Phase</span><b>${PHASES[c.phase].name}</b></div>
      <div><span>Parent / guardian</span><b>${esc(l.parent)}</b></div>
      <div><span>Attendance this term</span><b>${l.attendance}%</b></div>
      <div><span>Fee balance</span><b>${fmtMoney(f.balance)} ${feePill(f.status)}</b></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn btn-navy" onclick="closeSheet(); toast('Message sent to ${esc(l.parent)}', 'ok')">${ICONS.chat} Message</button>
      ${f.status === 'paid' ? `<a class="btn btn-line" href="#/register" onclick="S.regClass='${c.id}'; S.draft=null; closeSheet()">${ICONS.register} Register</a>` : `<button class="btn btn-line" onclick="closeSheet(); remind('${l.id}')">${ICONS.coins} Remind</button>`}
    </div>`);
}
function remind(id){
  const r = store('wk_reminded', {}); r[id] = TODAY_ISO; save('wk_reminded', r);
  render();
  toast(`Reminder sent to ${LEARNERS.find(l => l.id === id).parent}`, 'ok');
}
function eventSheet(){
  openSheet(`<div class="eyebrow">Calendar</div><h2>Add an event</h2><p class="lede">It appears in every parent's calendar straight away.</p>
    <label class="field"><span>Event</span><input id="e-title" placeholder="e.g. Grade 6 market day"></label>
    <label class="field"><span>Date</span><input id="e-date" type="date" value="${schoolDay(5)}"></label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <label class="field"><span>Starts</span><input id="e-start" type="time" value="09:00"></label>
      <label class="field"><span>Ends</span><input id="e-end" type="time" value="11:00"></label>
    </div>
    <label class="field"><span>Where</span><input id="e-where" value="Main hall"></label>
    <label class="field"><span>Who it's for</span><select id="e-aud"><option>Whole school</option><option>Montessori</option><option>Grade 3</option><option>Grade 6</option><option>Whizzkidz High</option></select></label>
    <button class="btn btn-navy btn-block" onclick="addEvent()">${ICONS.plus} Add to calendar</button>`);
}
function addEvent(){
  const title = $('#e-title').value.trim();
  if(!title){ toast('Give the event a name', 'bad'); return; }
  LIVE.addEvent({ id: 'ev-' + Date.now(), title, date: $('#e-date').value, start: $('#e-start').value, end: $('#e-end').value,
    location: $('#e-where').value.trim() || 'School', desc: 'Added by the school office.', audience: $('#e-aud').value, rsvp: true });
  closeSheet(); render();
  toast('Event added — families can see it now', 'ok');
}
function signOut(){ setSignedIn('staff', false); location.href = '../index.html'; }

/* ---------------- Boot ---------------- */
window.addEventListener('hashchange', () => { closeSheet(); window.scrollTo(0, 0); render({ animate: true }); });
window.addEventListener('storage', () => { if(parseRoute().name !== 'notices') render(); });
render({ animate: true });
