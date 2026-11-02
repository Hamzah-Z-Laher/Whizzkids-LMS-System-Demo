/* Teacher & HOD portal — one codebase, two logins. HOD powers come from the office's HOD appointments. */

const ROLE = window.PORTAL_ROLE === 'hod' ? 'hod' : 'teacher';
if(!signedIn(ROLE)) location.replace('../index.html');

const ME = staffById(STAFF_LOGINS[ROLE]);
const MY_HOD_PHASE = hodPhaseOf(ME.id);
const IS_HOD = !!MY_HOD_PHASE;
const DEPT = IS_HOD ? phaseById(MY_HOD_PHASE) : null;
const $ = sel => document.querySelector(sel);
const TODAY_ISO = isoOf(TODAY);
const DESKTOP = window.matchMedia('(min-width: 960px)');
const S = { regClass: ME.classId, regDate: TODAY_ISO, draft: null, modTab: 'review', version: null };

const classById = id => CLASSES.find(c => c.id === id);
const learnersIn = id => LEARNERS.filter(l => l.classId === id);
const MY_CLASSES = [classById(ME.classId)];
const STATUS = { present: 'P', late: 'L', absent: 'A' };
const timeOf = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const head = (eyebrow, title, sub = '') => `<header class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
const registerFor = (classId, date = TODAY_ISO) => LIVE.register(classId, date);
const nameOf = id => id === ME.id ? 'You' : (staffById(id) || {}).short || 'A colleague';
const myRoleLine = () => IS_HOD ? `HOD ${DEPT.name} · ${classById(ME.classId).name}` : `Class teacher · ${classById(ME.classId).name}`;
const deptTeachers = () => IS_HOD ? teachersInPhase(MY_HOD_PHASE).filter(t => t.id !== ME.id) : [];
const inMyDept = teacherId => deptTeachers().some(t => t.id === teacherId);
function moderatorOf(teacherId){
  const t = staffById(teacherId), h = t && hodOfPhase(t.phase);
  return h && h.id !== teacherId ? h : null;
}
const moderatorFor = teacherId => { const h = moderatorOf(teacherId); return h ? `${h.short} (HOD)` : 'the Deputy Principal'; };

/* ---------------- Register ---------------- */
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
        <select aria-label="Class" onchange="S.regClass=this.value; S.draft=null; render();">${MY_CLASSES.map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
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

/* ---------------- Merits & Student of the Week ---------------- */
S.mTab = 'award'; S.mClass = ME.classId; S.mSel = []; S.mType = 'merit'; S.mCat = null;
const weekLabel = iso => `Week of ${parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;

function screenMerits(){
  const tabs = [['award', 'Award'], ['class', 'Class totals'], ['sotw', 'Student of the Week']];
  const body = S.mTab === 'class' ? meritsClassView() : S.mTab === 'sotw' ? meritsSotwView() : meritsAwardView();
  return `${head('Recognition', 'Merits', 'Recognise learners in a couple of taps. Families see it on their phone straight away.')}
    <div class="stack">
      <div class="seg day-seg" style="max-width:520px">${tabs.map(([id, label]) => `<button class="${S.mTab === id ? 'on' : ''}" onclick="S.mTab='${id}'; render();">${label}</button>`).join('')}</div>
      ${body}
    </div>`;
}

function meritsAwardView(){
  const list = learnersIn(S.mClass);
  const cats = S.mType === 'merit' ? MERIT_CATEGORIES : DEMERIT_CATEGORIES;
  const cat = cats.find(c => c.id === S.mCat);
  const n = S.mSel.length;
  const today = LIVE.merits().filter(r => r.date === TODAY_ISO);
  const names = S.mSel.map(id => LEARNERS.find(l => l.id === id).name.split(' ')[0]);
  const label = !n ? 'Choose learners' : !cat ? 'Choose a category' : `${S.mType === 'merit' ? 'Award +' : 'Give −'}${cat.points} to ${n === 1 ? names[0] : n + ' learners'}`;
  return `<div class="two-col stack">
    <section class="card card-pad award">
            <div class="eyebrow award-step">1 · Learners · ${esc(classById(S.mClass).name)} <span class="row-meta">${n ? n + ' selected' : 'tap to select'}</span></div>
      <div class="pick-grid">${list.map(l => `<button class="pick ${S.mSel.includes(l.id) ? 'on' : ''}" aria-pressed="${S.mSel.includes(l.id)}" onclick="togglePick('${l.id}')">${avatar(l.name, 'sm')}<span>${esc(l.name.split(' ')[0])}</span></button>`).join('')}</div>
      <div class="eyebrow award-step">2 · What for</div>
      <div class="seg" style="margin-bottom:12px"><button class="${S.mType === 'merit' ? 'on' : ''}" onclick="S.mType='merit'; S.mCat=null; render();">Merit</button><button class="${S.mType === 'demerit' ? 'on' : ''}" onclick="S.mType='demerit'; S.mCat=null; render();">Demerit</button></div>
      <div class="cat-grid">${cats.map(c => `<button class="cat-chip ${S.mType} ${S.mCat === c.id ? 'on' : ''}" onclick="S.mCat='${c.id}'; render();">
        ${S.mType === 'merit' ? `<span class="food" style="--c:${c.tone}">${ICONS[c.icon]}</span>` : `<span class="food" style="--c:var(--blazer)">${ICONS.alert}</span>`}
        <span class="grow">${esc(c.label)}</span><b>${S.mType === 'merit' ? '+' : '−'}${c.points}</b></button>`).join('')}</div>
      <label class="field" style="margin-top:14px"><span>Note for the family (optional)</span><input id="m-note" placeholder="${S.mType === 'merit' ? 'e.g. Led his group in the maths challenge' : 'e.g. Second time this week'}"></label>
      <button class="btn ${S.mType === 'merit' ? 'btn-navy' : 'btn-red'} btn-block" ${n && cat ? '' : 'disabled'} onclick="awardMerits()">${S.mType === 'merit' ? ICONS.star : ICONS.alert} ${label}</button>
    </section>
    <section class="card">
      <div class="card-head"><h2>Awarded today</h2><span class="live-dot">Live</span></div>
      <div class="rows">${today.map(r => {
        const l = LEARNERS.find(x => x.id === r.learnerId), c = catOf(r.type, r.cat);
        return `<div class="row">${avatar(l.name, 'sm')}<div class="grow"><div class="row-title">${esc(l.name)}</div><div class="row-sub">${esc(c.label)}${r.note ? ' · ' + esc(r.note) : ''}</div></div><span class="pts ${r.type === 'merit' ? 'plus' : 'minus'}">${r.type === 'merit' ? '+' : '−'}${r.points}</span></div>`;
      }).join('') || `<div class="empty">${ICONS.star}<p>Nothing awarded yet today.</p></div>`}</div>
    </section>
  </div>`;
}
function togglePick(id){
  S.mSel = S.mSel.includes(id) ? S.mSel.filter(x => x !== id) : [...S.mSel, id];
  const note = $('#m-note')?.value;
  render();
  if(note) $('#m-note').value = note;
}
function awardMerits(){
  const cat = catOf(S.mType, S.mCat);
  if(!S.mSel.length || !cat) return;
  const note = $('#m-note').value.trim(), at = new Date().toISOString();
  const recs = S.mSel.map((learnerId, i) => ({ id: `m-${Date.now()}-${i}`, learnerId, type: S.mType, cat: cat.id, points: cat.points, note, by: teacherOfClass(S.mClass), date: TODAY_ISO, at }));
  LIVE.addMerits(recs);
  const fam = recs.filter(r => CHILDREN.some(c => c.learnerId === r.learnerId)).length;
  const n = recs.length;
  S.mSel = []; S.mCat = null;
  render();
  toast(`${S.mType === 'merit' ? 'Merit' : 'Demerit'} sent to ${n} famil${n === 1 ? 'y' : 'ies'}${fam ? ' — on their phone now' : ''}`, 'ok');
}

function meritsClassView(){
  const list = learnersIn(S.mClass).map(l => ({ l, t: meritTotals(l.id), last: meritsFor(l.id)[0] }));
  const flagged = list.filter(x => x.t.demerits >= DEMERIT_MEETING_AT).length;
  return `
    ${flagged ? `<div class="status-line absent" style="margin:0">${ICONS.alert} ${flagged} learner${flagged > 1 ? 's have' : ' has'} ${DEMERIT_MEETING_AT}+ demerits this term — consider a parent meeting</div>` : ''}
    <section class="card">
      <div class="card-head"><h2>${esc(classById(S.mClass).name)}</h2><span class="row-meta">Staff only · A–Z</span></div>
      <table class="data">
        <thead><tr><th>Learner</th><th>Last</th><th style="text-align:right">Merits</th><th style="text-align:right">Demerits</th></tr></thead>
        <tbody>${list.map(x => `<tr onclick="meritLearnerSheet('${x.l.id}')">
          <td><span class="who">${avatar(x.l.name, 'sm')}${esc(x.l.name)}</span></td>
          <td class="m-sub">${x.last ? `${esc(catOf(x.last.type, x.last.cat).label)} · ${relAgo(x.last.date)}` : '—'}</td>
          <td class="num m-right"><span class="pts plus">${x.t.merits}</span>${x.t.demerits ? ` <span class="pts minus m-only">−${x.t.demerits}</span>` : ''}</td>
          <td class="num m-hide">${x.t.demerits >= DEMERIT_MEETING_AT ? `<span class="pill pill-bad">${x.t.demerits} · meeting</span>` : x.t.demerits ? `<span class="pts minus">${x.t.demerits}</span>` : '<span class="row-meta">0</span>'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </section>`;
}
function meritLearnerSheet(id){
  const l = LEARNERS.find(x => x.id === id), t = meritTotals(id);
  openSheet(`<div style="display:flex;align-items:center;gap:14px;margin:6px 44px 16px 0">${avatar(l.name, 'lg')}<div><h2 style="margin:0">${esc(l.name)}</h2><p class="muted">${esc(classById(l.classId).name)} · ${t.merits} merits · ${t.demerits} demerits</p></div></div>
    <div class="card rows">${meritsFor(id).slice(0, 12).map(r => {
      const c = catOf(r.type, r.cat);
      return `<div class="row"><div class="grow"><div class="row-title">${esc(c.label)}</div><div class="row-sub">${r.note ? esc(r.note) + ' · ' : ''}${esc(r.by)} · ${relAgo(r.date)}</div></div>
        <div class="order-side"><span class="pts ${r.type === 'merit' ? 'plus' : 'minus'}">${r.type === 'merit' ? '+' : '−'}${r.points}</span>${r.type === 'demerit' ? (isAcked(r) ? '<span class="pill pill-ok">Parent saw it</span>' : '<span class="pill pill-warn">Not seen yet</span>') : ''}</div></div>`;
    }).join('')}</div>`);
}

function meritsSotwView(){
  const past = allSotw().filter(s => s.week !== THIS_WEEK && MY_CLASSES.some(c => c.id === s.classId)).sort((a, b) => b.week.localeCompare(a.week)).slice(0, 8);
  return `<section class="card">
      <div class="card-head"><h2>${weekLabel(THIS_WEEK)}</h2><span class="row-meta">${MY_CLASSES.filter(c => sotwFor(c.id)).length} of ${MY_CLASSES.length} chosen</span></div>
      <div class="rows">${MY_CLASSES.map(c => {
        const s = sotwFor(c.id), l = s && LEARNERS.find(x => x.id === s.learnerId);
        return `<div class="row">
          ${s ? avatar(l.name, 'md', 'var(--gold)') : `<span class="food" style="--c:var(--ink-3)">${ICONS.star}</span>`}
          <div class="grow"><div class="row-title">${esc(c.name)}</div><div class="row-sub">${s ? `<b>${esc(l.name)}</b> · ${esc(s.reason)}` : `${esc(c.teacher)} hasn't chosen yet`}</div></div>
          ${s ? `<span class="pill pill-ok">${ICONS.check} Published</span>` : `<button class="btn btn-sm btn-navy" onclick="sotwSheet('${c.id}')">${ICONS.star} Choose</button>`}
        </div>`;
      }).join('')}</div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Previous weeks</h2></div>
      <div class="rows">${past.map(s => { const l = LEARNERS.find(x => x.id === s.learnerId); return `<div class="row">${avatar(l.name, 'sm')}<div class="grow"><div class="row-title">${esc(l.name)} <span class="row-meta">· ${esc(classById(s.classId).name)}</span></div><div class="row-sub">${esc(s.reason)}</div></div><span class="row-meta nowrap">${parseISO(s.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div>`; }).join('')}</div>
    </section>`;
}
function sotwSheet(classId){
  const c = classById(classId);
  openSheet(`<div class="eyebrow">${esc(c.name)} · ${weekLabel(THIS_WEEK)}</div>
    <h2>Student of the Week</h2>
    <div class="choices">${learnersIn(classId).map((l, i) => `<label class="choice"><input type="radio" name="sotw" value="${l.id}" ${i === 0 ? 'checked' : ''}>${avatar(l.name, 'sm')}<span class="grow"><b>${esc(l.name)}</b><small>${meritTotals(l.id).merits} merits this term</small></span><span class="radio"></span></label>`).join('')}</div>
    <div class="eyebrow" style="margin:4px 0 8px;color:var(--ink-3)">Why</div>
    <div class="filters" style="flex-wrap:wrap;margin-bottom:10px">${SOTW_REASONS.map(r => `<button class="chip" onclick="$('#sotw-reason').value='${r}'">${r}</button>`).join('')}</div>
    <label class="field"><span>Reason families will see</span><textarea id="sotw-reason" placeholder="e.g. Always the first to help a classmate"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="publishSotw('${classId}')">${ICONS.trophy} Publish to families</button>`);
}
function publishSotw(classId){
  const learnerId = document.querySelector('input[name="sotw"]:checked').value;
  const reason = $('#sotw-reason').value.trim();
  if(reason.length < 4){ toast('Add a short reason for the family', 'bad'); return; }
  LIVE.addSotw({ id: `sotw-${THIS_WEEK}-${classId}-${Date.now()}`, week: THIS_WEEK, classId, learnerId, reason, by: teacherOfClass(classId), at: new Date().toISOString() });
  closeSheet(); render();
  confetti();
  toast(`${LEARNERS.find(l => l.id === learnerId).name} is Student of the Week — family notified`, 'ok');
}


/* ---------------- Papers: storage & helpers ---------------- */
const getMods = () => store('wk_mods', null) || JSON.parse(JSON.stringify(MOD_SEED));
function saveMods(list){
  try{ localStorage.setItem('wk_mods', JSON.stringify(list)); }
  catch(e){
    list.forEach(m => m.versions.forEach(v => v.files.forEach(f => { delete f.dataUrl; })));
    save('wk_mods', list);
    toast('That file is too big to keep in the demo — kept its name only');
  }
}
function updateMod(id, fn){ const list = getMods(); const m = list.find(x => x.id === id); fn(m); saveMods(list); return m; }
const MOD_STATUS = {
  submitted: ['Sent', 'pill-sky'], review: ['Being checked', 'pill-navy'], changes: ['Needs changes', 'pill-bad'],
  resubmitted: ['Sent again', 'pill-sky'], approved: ['Approved', 'pill-ok'],
};
const modPill = m => `<span class="pill ${MOD_STATUS[m.status][1]}">${MOD_STATUS[m.status][0]}</span>`;
const latestV = m => m.versions[m.versions.length - 1];
const latestReview = m => m.reviews[m.reviews.length - 1];
const myMods = () => getMods().filter(m => m.teacherId === ME.id);
const deptMods = () => getMods().filter(m => inMyDept(m.teacherId));
const toReview = () => deptMods().filter(m => ['submitted', 'resubmitted', 'review'].includes(m.status));
const needsFix = () => myMods().filter(m => m.status === 'changes');

const readFile = file => new Promise(res => {
  if(!file) return res(null);
  const meta = { name: file.name, size: file.size, type: file.type };
  if(file.size > 700000) return res(meta);
  const r = new FileReader();
  r.onload = () => res({ ...meta, dataUrl: r.result });
  r.onerror = () => res(meta);
  r.readAsDataURL(file);
});
async function collectFiles(paperSel, memoSel){
  const [p, m] = await Promise.all([readFile($(paperSel).files[0]), readFile($(memoSel).files[0])]);
  return [p ? { kind: 'paper', ...p } : { kind: 'paper', name: 'Question paper', sample: true }, m ? { kind: 'memo', ...m } : { kind: 'memo', name: 'Memo', sample: true }];
}
const kb = n => n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;
const slug = s => s.replace(/[·–—]/g, ' ').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
const fileName = (m, v, kind) => `${slug(m.title)}_v${v}_${kind === 'memo' ? 'memo' : 'paper'}.pdf`;

/* A dummy, printable PDF for demo papers */
function scaledQuestions(m){
  const qs = SAMPLE_PAPERS[m.subject] || SAMPLE_PAPERS.Mathematics;
  const total = qs.reduce((s, [, n]) => s + n, 0);
  const out = qs.map(([t, n]) => [t, Math.max(1, Math.round(n * m.marks / total))]);
  out[out.length - 1][1] += m.marks - out.reduce((s, [, n]) => s + n, 0);
  return out;
}
function paperPdf(m, kind, v){
  const ops = [], memo = kind === 'memo';
  const text = (t, x, y, size = 11, bold = false) => ops.push({ t, x, y, size, bold });
  text('WHIZZKIDZ ACADEMY', 50, 790, 17, true);
  text(`${m.grade} · Term ${termOf()} · ${new Date().getFullYear()}`, 50, 772, 10);
  text(`Total: ${m.marks} marks`, 430, 790, 11, true);
  text(`Time: ${m.minutes} minutes`, 430, 774, 10);
  ops.push({ line: [50, 760, 545, 760], w: 1.5 });
  text(`${m.subject} · ${m.title.split('·').slice(1).join('·').trim() || m.type}`, 50, 732, 15, true);
  let y = 710;
  if(memo){ text('MEMORANDUM', 50, y, 12, true); y -= 20; }
  if(v > 1){ text(`Updated version ${v}`, 50, y, 10); y -= 18; }
  if(!memo){
    ['Answer all the questions.', 'Show all your working.', 'Number your answers like the questions.'].forEach((t, i) => { text(`${i + 1}.  ${t}`, 60, y, 10); y -= 15; });
    y -= 8;
  }
  ops.push({ line: [50, y + 6, 545, y + 6], w: .5 });
  scaledQuestions(m).forEach(([topic, n], i) => {
    y -= 22;
    text(memo ? `${i + 1}.  ${topic} — answers and marking` : `Question ${i + 1}:  ${topic}`, 50, y, 11, !memo);
    text(`(${n})`, 515, y, 11, true);
    if(memo){ y -= 15; text(`${i + 1}.1 – ${i + 1}.${Math.max(2, Math.ceil(n / 4))}: one mark per correct step; accept other correct methods.`, 70, y, 9); }
  });
  y -= 30;
  ops.push({ line: [380, y + 18, 545, y + 18], w: .5 });
  text(`TOTAL: ${m.marks}`, 470, y, 12, true);
  text('Demo document · Whizzkidz Connect prototype', 50, 40, 8);
  return makePdf(ops);
}
function downloadPaper(id, v, kind){
  const m = getMods().find(x => x.id === id), ver = m.versions.find(x => x.v === v), f = ver.files.find(x => x.kind === kind);
  if(f && f.dataUrl){
    const [h, b] = f.dataUrl.split(','), bin = atob(b), arr = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    downloadBlob(new Blob([arr], { type: h.match(/:(.*?);/)[1] }), f.name);
  } else downloadBlob(paperPdf(m, kind, v), fileName(m, v, kind));
  toast(`Downloading the ${kind === 'memo' ? 'memo' : 'question paper'}`, 'ok');
}
function filesPanel(m){
  const v = (S.version && m.versions.find(x => x.v === S.version)) || latestV(m);
  const card = kind => {
    const f = v.files.find(x => x.kind === kind) || { sample: true };
    const name = f.sample ? fileName(m, v.v, kind) : f.name;
    const meta = f.sample ? 'PDF' : `${kb(f.size)}${f.dataUrl ? '' : ' · too big to keep in the demo'}`;
    return `<div class="file-card"><span class="file-ic">${ICONS.book}</span><div class="grow"><b>${kind === 'memo' ? 'Memo' : 'Question paper'}</b><small>${esc(name)} · ${meta}</small></div>
      ${f.sample || f.dataUrl ? `<button class="btn btn-sm btn-navy" onclick="downloadPaper('${m.id}', ${v.v}, '${kind}')">${ICONS.download}<span class="m-hide-sm">Download</span></button>` : ''}</div>`;
  };
  return `<section class="card">
    <div class="card-head"><h2>Files</h2>${m.versions.length > 1 ? `<div class="seg">${m.versions.map(x => `<button class="${x.v === v.v ? 'on' : ''}" onclick="S.version=${x.v}; renderView();">v${x.v}</button>`).join('')}</div>` : `<span class="row-meta">Sent ${fmtDM(v.at)}</span>`}</div>
    <div class="files">${card('paper')}${card('memo')}</div>
    ${v.note ? `<div class="paper-note"><b>${m.teacherId === ME.id ? 'Your note' : 'Note from ' + esc(nameOf(m.teacherId))}:</b> ${esc(v.note)}</div>` : ''}
  </section>`;
}
function levelBars(levels){
  return `<div class="cog"><div class="eyebrow" style="color:var(--ink-3)">Question difficulty · % of marks</div>${DIFFICULTY.map(l => {
    const a = +levels[l.id] || 0, off = Math.abs(a - l.target) > 5;
    return `<div class="cog-row"><span>${l.label}</span><div class="cog-bar"><i class="${off ? 'off' : ''}" style="width:${Math.min(100, a)}%"></i><em style="left:${l.target}%"></em></div><b class="${off ? 'off' : ''}">${a}%</b></div>`;
  }).join('')}<small class="muted">The line shows the aim</small></div>`;
}
function feedbackHTML(r, title = 'Feedback'){
  if(!r) return '';
  return `<section class="card">
    <div class="card-head"><h2>${title}</h2><span class="row-meta">v${r.v} · ${esc(r.by)} · ${fmtDM(r.at)}</span></div>
    <div class="decision ${r.decision}">${r.decision === 'approved' ? ICONS.checkCircle + ' Approved' : ICONS.alert + ' Needs changes'}</div>
    ${r.comments ? `<p class="fb-comment">“${esc(r.comments)}”</p>` : ''}
    <div class="rows check-list">${MOD_CHECKLIST.map(c => {
      const x = r.checklist[c.id] || { ok: true };
      return `<div class="row ${x.ok ? '' : 'bad'}"><span class="yn ${x.ok ? 'yes' : 'no'}">${x.ok ? ICONS.check : ICONS.x}</span><div class="grow"><div class="row-title">${c.label}</div>${x.comment ? `<div class="row-sub">${esc(x.comment)}</div>` : ''}</div></div>`;
    }).join('')}</div>
    ${r.levels ? levelBars(r.levels) : ''}
  </section>`;
}
function modSteps(m){
  const idx = m.status === 'approved' ? 3 : m.status === 'changes' ? 2 : m.status === 'review' ? 1 : 0;
  const labels = [m.status === 'resubmitted' ? 'Sent again' : 'Sent', 'Being checked', m.status === 'changes' ? 'Needs changes' : 'Approved'];
  return labels.map((l, i) => `<div class="step ${i < idx ? 'done' : i === idx ? 'now' : ''} ${m.status === 'changes' && i === 2 ? 'bad' : ''}"><span></span>${l}</div>`).join('');
}
function historyHTML(m){
  const ev = [];
  m.versions.forEach(v => ev.push({ seq: v.v * 10, at: v.at, t: v.v === 1 ? `Sent by ${nameOf(m.teacherId)}` : `Updated version ${v.v} sent`, s: v.note }));
  m.reviews.forEach(r => ev.push({ seq: r.v * 10 + 5, at: r.at, t: r.decision === 'approved' ? `Approved by ${r.by}` : `${r.by} asked for changes`, s: '' }));
  ev.sort((a, b) => b.seq - a.seq);
  return `<section class="card"><div class="card-head"><h2>History</h2></div><div class="rows">${ev.map(e => `<div class="row"><div class="grow"><div class="row-title">${esc(e.t)}</div>${e.s ? `<div class="row-sub">${esc(e.s)}</div>` : ''}</div><span class="row-meta nowrap">${fmtDM(e.at)}</span></div>`).join('')}</div></section>`;
}
const modRow = (m, href) => {
  const v = latestV(m);
  return `<a class="row" href="${href}"><span class="food" style="--c:${SUBJECT_COLORS[m.subject] || 'var(--navy)'}">${ICONS.book}</span>
    <div class="grow"><div class="row-title">${esc(m.title)}</div><div class="row-sub">${esc(nameOf(m.teacherId))} · ${esc(m.grade)} · ${m.marks} marks${v.v > 1 ? ' · v' + v.v : ''} · ${relAgo(v.at)}</div></div>${modPill(m)}</a>`;
};

/* ---------------- Papers: teacher ---------------- */
function screenAssessments(){
  const list = myMods();
  return `${head('Papers', 'My papers', `Send tests and exams to ${moderatorFor(ME.id)} to check before learners write them.`)}
    <div class="stack">
      <button class="btn btn-navy start-btn" onclick="submitSheet()">${ICONS.plus} Send a paper</button>
      <section class="card rows">${list.map(m => modRow(m, '#/assessment/' + m.id)).join('') || `<div class="empty">${ICONS.book}<p>No papers sent yet.</p></div>`}</section>
    </div>`;
}
function screenAssessment(id){
  const m = getMods().find(x => x.id === id);
  if(!m) return `<div class="empty">That paper could not be found.</div>`;
  const mine = m.teacherId === ME.id;
  return `${head(`${esc(m.grade)} · ${esc(m.type)} · ${m.marks} marks`, esc(m.title))}
    <div class="stack">
      <section class="card mod-meta"><div class="mod-status">${modPill(m)}<span class="row-meta">Checked by ${esc(moderatorFor(m.teacherId))}</span></div><div class="steps">${modSteps(m)}</div></section>
      ${mine && m.status === 'changes' ? reviseCard(m) : ''}
      <div class="two-col stack">
        <div class="stack">${feedbackHTML(latestReview(m)) || `<section class="card card-pad"><h2 style="font-size:17px">Waiting to be checked</h2><p class="muted" style="margin-top:6px">You'll get a pop-up as soon as ${esc(moderatorFor(m.teacherId))} has checked it.</p></section>`}</div>
        <div class="stack">${filesPanel(m)}${historyHTML(m)}</div>
      </div>
    </div>`;
}
function reviseCard(m){
  return `<section class="card card-pad revise">
    <h2 style="font-size:17px">Send an updated version</h2>
    <p class="muted" style="margin:4px 0 14px">Fix the things in the feedback, then send it again.</p>
    <div class="two-field">
      <label class="field"><span>Updated question paper</span><input type="file" id="rv-paper" accept=".pdf,.doc,.docx"></label>
      <label class="field"><span>Updated memo</span><input type="file" id="rv-memo" accept=".pdf,.doc,.docx"></label>
    </div>
    <p class="muted" style="font-size:13px;margin:-6px 0 12px">No files to hand? The demo adds sample ones.</p>
    <label class="field"><span>What did you change?</span><textarea id="rv-note" placeholder="e.g. Added two harder questions and fixed the marks for question 4"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="resubmit('${m.id}')">${ICONS.send} Send again</button>
  </section>`;
}
async function resubmit(id){
  const note = $('#rv-note').value.trim();
  if(note.length < 4){ toast('Say briefly what you changed', 'bad'); $('#rv-note').focus(); return; }
  const files = await collectFiles('#rv-paper', '#rv-memo');
  const m = updateMod(id, x => { x.versions.push({ v: x.versions.length + 1, files, note, at: TODAY_ISO }); x.status = 'resubmitted'; });
  S.version = null; render();
  toast(`Sent again to ${moderatorFor(m.teacherId)}`, 'ok');
}
function submitSheet(){
  openSheet(`<div class="eyebrow">Papers</div><h2>Send a paper</h2>
    <p class="lede">${esc(moderatorFor(ME.id))} will check it. You'll get a pop-up when it's done.</p>
    <div class="two-field">
      <label class="field"><span>Subject</span><select id="sb-subject">${ME.subjects.map(s => `<option>${s}</option>`).join('')}</select></label>
      <label class="field"><span>Type</span><select id="sb-type"><option>Exam</option><option>Test</option><option>Assignment</option></select></label>
    </div>
    <label class="field"><span>Name</span><input id="sb-title" value="Term ${termOf()} Exam · Paper 1"></label>
    <div class="two-field">
      <label class="field"><span>Total marks</span><input id="sb-marks" type="number" inputmode="numeric" value="60"></label>
      <label class="field"><span>Time (minutes)</span><input id="sb-min" type="number" inputmode="numeric" value="90"></label>
    </div>
    <div class="two-field">
      <label class="field"><span>Question paper</span><input type="file" id="sb-paper" accept=".pdf,.doc,.docx"></label>
      <label class="field"><span>Memo</span><input type="file" id="sb-memo" accept=".pdf,.doc,.docx"></label>
    </div>
    <p class="muted" style="font-size:13px;margin:-6px 0 14px">No files to hand? Leave these empty and the demo adds sample ones.</p>
    <label class="field"><span>Note (optional)</span><textarea id="sb-note" placeholder="e.g. Covers all Term 4 work"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="submitPaper()">${ICONS.send} Send</button>`);
}
async function submitPaper(){
  const subject = $('#sb-subject').value, type = $('#sb-type').value;
  const title = $('#sb-title').value.trim() || `Term ${termOf()} ${type}`;
  const files = await collectFiles('#sb-paper', '#sb-memo');
  const m = { id: 'mod-' + Date.now(), teacherId: ME.id, title: `${subject} · ${title}`, subject, grade: gradeOfClass(ME.classId), type,
    marks: +$('#sb-marks').value || 60, minutes: +$('#sb-min').value || 90, status: 'submitted',
    versions: [{ v: 1, files, note: $('#sb-note').value.trim(), at: TODAY_ISO }], reviews: [], at: TODAY_ISO };
  saveMods([m, ...getMods()]);
  closeSheet();
  location.hash = '#/assessment/' + m.id;
  toast(`Sent to ${moderatorFor(ME.id)}`, 'ok');
}

/* ---------------- Papers: HOD ---------------- */
function screenModeration(){
  const queue = toReview(), all = deptMods();
  const list = S.modTab === 'review' ? queue : all;
  const n = s => all.filter(m => m.status === s).length;
  return `${head(`${DEPT.name} · ${DEPT.grades}`, 'Moderation', 'Check papers before learners write them.')}
    <div class="stack">
      <div class="kpis">
        <div class="kpi ${queue.length ? 'alert' : ''}"><div class="eyebrow">To check</div><b data-count="${queue.length}">${queue.length}</b><div class="sub">waiting for you</div></div>
        <div class="kpi"><div class="eyebrow">Being fixed</div><b data-count="${n('changes')}">${n('changes')}</b><div class="sub">sent back to teachers</div></div>
        <div class="kpi"><div class="eyebrow">Approved</div><b data-count="${n('approved')}">${n('approved')}</b><div class="sub">this term</div></div>
        <div class="kpi"><div class="eyebrow">Papers due</div><b>${fmtDM(PAPERS_DUE)}</b><div class="sub">${deptTeachers().length} teachers</div></div>
      </div>
      <div class="seg day-seg" style="max-width:420px"><button class="${S.modTab === 'review' ? 'on' : ''}" onclick="S.modTab='review'; render();">To check (${queue.length})</button><button class="${S.modTab === 'all' ? 'on' : ''}" onclick="S.modTab='all'; render();">All papers</button></div>
      <section class="card rows">${list.map(m => modRow(m, '#/review/' + m.id)).join('') || `<div class="empty">${ICONS.checkCircle}<p>Nothing waiting — you're up to date.</p></div>`}</section>
    </div>`;
}
function screenReview(id){
  let m = getMods().find(x => x.id === id);
  if(!m) return `<div class="empty">That paper could not be found.</div>`;
  if(['submitted', 'resubmitted'].includes(m.status)) m = updateMod(id, x => { x.status = 'review'; });
  const decided = m.status === 'approved' || m.status === 'changes';
  const prev = latestReview(m), v = latestV(m);
  return `${head(`${esc(nameOf(m.teacherId))} · ${esc(m.grade)} · ${m.marks} marks`, esc(m.title))}
    <div class="stack">
      <section class="card mod-meta"><div class="mod-status">${modPill(m)}<span class="row-meta">${v.v > 1 ? 'Version ' + v.v + ' · ' : ''}sent ${relAgo(v.at).toLowerCase()}</span></div><div class="steps">${modSteps(m)}</div></section>
      <div class="two-col stack">
        <div class="stack">${decided ? feedbackHTML(prev, 'Your feedback') : reviewForm(m, prev)}</div>
        <div class="stack">${filesPanel(m)}${!decided && prev ? feedbackHTML(prev, `Your feedback on v${prev.v}`) : ''}${historyHTML(m)}</div>
      </div>
    </div>`;
}
function reviewForm(m, prev){
  return `<section class="card card-pad review-form">
    <h2 style="font-size:17px;margin-bottom:6px">Checklist</h2>
    <p class="muted" style="font-size:13.5px;margin-bottom:6px">Download the paper and memo, then go through each point.</p>
    ${MOD_CHECKLIST.map(c => `<div class="check-item" data-id="${c.id}">
      <div class="check-top"><span>${c.label}</span><div class="seg yn-seg"><button class="on" data-v="yes" onclick="yn(this)">Yes</button><button data-v="no" onclick="yn(this)">No</button></div></div>
      <input class="check-comment" placeholder="What needs fixing?">
    </div>`).join('')}
    <div class="eyebrow" style="color:var(--ink-3);margin:18px 0 8px">Question difficulty · % of marks</div>
    <div class="cog-inputs three">${DIFFICULTY.map(l => `<label><span>${l.label}</span><input type="number" inputmode="numeric" data-level="${l.id}" value="${prev && prev.levels ? prev.levels[l.id] : l.target}" oninput="levelTotal()"><small>aim ${l.target}%</small></label>`).join('')}</div>
    <div class="cog-total" id="level-total">Total 100%</div>
    <label class="field" style="margin-top:14px"><span>Comments for ${esc(nameOf(m.teacherId))}</span><textarea id="rv-comments" placeholder="What's good, and what needs to change"></textarea></label>
    <div class="decide">
      <button class="btn btn-line" style="color:var(--blazer)" onclick="decide('${m.id}', 'changes')">${ICONS.alert} Ask for changes</button>
      <button class="btn btn-navy" onclick="decide('${m.id}', 'approved')">${ICONS.check} Approve</button>
    </div>
  </section>`;
}
function yn(btn){
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
  btn.closest('.check-item').classList.toggle('no', btn.dataset.v === 'no');
  if(btn.dataset.v === 'no') btn.closest('.check-item').querySelector('input').focus();
}
function levelTotal(){
  const t = [...document.querySelectorAll('[data-level]')].reduce((s, i) => s + (+i.value || 0), 0);
  const el = $('#level-total'); el.textContent = `Total ${t}%`; el.classList.toggle('off', t !== 100);
}
function decide(id, decision){
  const checklist = {}; let missing = false;
  document.querySelectorAll('.check-item').forEach(el => {
    const ok = !el.classList.contains('no'), comment = el.querySelector('.check-comment').value.trim();
    if(!ok && !comment) missing = true;
    checklist[el.dataset.id] = { ok, comment };
  });
  const levels = Object.fromEntries([...document.querySelectorAll('[data-level]')].map(i => [i.dataset.level, +i.value || 0]));
  const comments = $('#rv-comments').value.trim();
  if(missing){ toast('Say what needs fixing for each No', 'bad'); return; }
  if(decision === 'changes' && !comments){ toast('Add a comment for the teacher', 'bad'); $('#rv-comments').focus(); return; }
  if(decision === 'approved' && Object.values(checklist).some(x => !x.ok)){ toast('Some points are marked No — ask for changes instead', 'bad'); return; }
  const m = updateMod(id, x => { x.reviews.push({ v: latestV(x).v, by: ME.short, at: TODAY_ISO, decision, checklist, levels, comments: comments || 'Approved — well done.' }); x.status = decision; });
  window.scrollTo(0, 0); render();
  toast(decision === 'approved' ? `Approved — ${nameOf(m.teacherId)} gets a pop-up` : `Sent back to ${nameOf(m.teacherId)}`, 'ok');
}

/* ---------------- Observations ---------------- */
const getObs = () => store('wk_obs', null) || JSON.parse(JSON.stringify(OBS_SEED));
function updateObs(id, fn){ const l = getObs(); const o = l.find(x => x.id === id); fn(o); save('wk_obs', l); return o; }
const myObs = () => getObs().filter(o => o.teacherId === ME.id);
const deptObs = () => getObs().filter(o => inMyDept(o.teacherId));
function obsLabel(o, hodView){
  const map = {
    requested: hodView ? ['Waiting for reply', 'pill-warn'] : ['New request', 'pill-warn'],
    reschedule: ['New time suggested', 'pill-sky'], accepted: ['Booked', 'pill-navy'],
    completed: hodView ? ['Feedback sent', 'pill-ok'] : ['Feedback ready', 'pill-ok'], acknowledged: ['Done', 'pill-ok'],
  };
  return `<span class="pill ${map[o.status][1]}">${map[o.status][0]}</span>`;
}
const obsCount = () => IS_HOD ? deptObs().filter(o => o.status === 'reschedule').length : myObs().filter(o => ['requested', 'completed'].includes(o.status)).length;

function feedbackBlock(o){
  const f = o.feedback; if(!f) return '';
  return `<div class="obs-fb">
    <div class="obs-ratings">${OBS_CRITERIA.map(c => `<div><span>${c.label}</span><span class="rating r${f.ratings[c.id]}">${RATINGS[f.ratings[c.id] - 1]}</span></div>`).join('')}</div>
    <p class="fb-comment"><b>What went well:</b> ${esc(f.strengths)}</p>
    <p class="fb-comment"><b>Next steps:</b> ${esc(f.growth)}</p>
  </div>`;
}
function obsCard(o, hodView){
  const t = staffById(o.teacherId) || { short: 'A teacher' };
  let actions = '';
  if(!hodView){
    if(o.status === 'requested') actions = `<div class="obs-actions"><button class="btn btn-navy btn-sm" onclick="acceptObs('${o.id}')">${ICONS.check} Accept</button><button class="btn btn-line btn-sm" onclick="proposeSheet('${o.id}')">Suggest another time</button></div>`;
    if(o.status === 'reschedule') actions = `<div class="status-line late obs-line">${ICONS.clock} You suggested ${fmtShort(o.proposal.date)} · ${o.proposal.time} — waiting for ${esc(o.by)}</div>`;
    if(o.status === 'accepted') actions = `<div class="status-line present obs-line">${ICONS.checkCircle} Booked — ${esc(o.by)} will sit in on your ${esc(o.subject)} lesson</div>`;
    if(o.status === 'completed') actions = `${feedbackBlock(o)}<label class="field" style="margin-top:12px"><span>Your thoughts (optional)</span><textarea id="refl-${o.id}" placeholder="What will you try next time?"></textarea></label><button class="btn btn-navy btn-block" onclick="ackObs('${o.id}')">${ICONS.check} Done — I've read it</button>`;
    if(o.status === 'acknowledged') actions = `${feedbackBlock(o)}${o.reflection ? `<p class="fb-comment"><b>Your thoughts:</b> ${esc(o.reflection)}</p>` : ''}`;
  } else {
    if(o.status === 'requested') actions = `<div class="status-line late obs-line">${ICONS.clock} Waiting for ${esc(t.short)} to accept</div>`;
    if(o.status === 'reschedule') actions = `<div class="status-line late obs-line">${ICONS.clock} ${esc(t.short)} suggested ${fmtLong(o.proposal.date)} · ${o.proposal.time}${o.proposal.reason ? ` — “${esc(o.proposal.reason)}”` : ''}</div><div class="obs-actions"><button class="btn btn-navy btn-sm" onclick="acceptProposal('${o.id}')">${ICONS.check} Accept new time</button></div>`;
    if(o.status === 'accepted') actions = `<div class="obs-actions"><span class="pill pill-ok">${ICONS.check} ${esc(t.short)} accepted</span><button class="btn btn-navy btn-sm" onclick="obsFeedbackSheet('${o.id}')">${ICONS.pen} Add feedback</button></div>`;
    if(o.status === 'completed') actions = `${feedbackBlock(o)}<div class="status-line late obs-line">${ICONS.clock} Waiting for ${esc(t.short)} to read it</div>`;
    if(o.status === 'acknowledged') actions = `${feedbackBlock(o)}${o.reflection ? `<p class="fb-comment"><b>${esc(t.short)}'s thoughts:</b> ${esc(o.reflection)}</p>` : ''}`;
  }
  return `<section class="card card-pad obs-card ${o.status}">
    <div class="obs-top">
      <div class="datechip"><div class="m">${monthShort(o.date)}</div><div class="d">${dayNum(o.date)}</div></div>
      <div class="grow"><div class="row-title">${hodView ? esc(t.short) + ' · ' : ''}${esc(o.subject)} · ${esc(o.cls)}</div>
        <div class="row-sub">${fmtLong(o.date)} · ${o.time}</div>
        <div class="row-sub">Focus: ${esc(o.focus)}${hodView ? '' : ` · ${esc(o.by)}`}</div></div>
      ${obsLabel(o, hodView)}
    </div>
    ${actions}
  </section>`;
}
function screenObservations(){
  const list = IS_HOD ? deptObs() : myObs();
  const open = list.filter(o => o.status !== 'acknowledged').sort((a, b) => a.date.localeCompare(b.date));
  const done = list.filter(o => o.status === 'acknowledged');
  return `${head(IS_HOD ? `${DEPT.name} · ${DEPT.grades}` : 'Growing as a teacher', 'Observations', IS_HOD ? 'Book a time to sit in on a lesson, then give feedback.' : 'Your HOD sits in on a lesson and gives you feedback.')}
    <div class="stack">
      ${IS_HOD ? `<button class="btn btn-navy start-btn" onclick="scheduleSheet()">${ICONS.plus} Book an observation</button>` : ''}
      ${open.map(o => obsCard(o, IS_HOD)).join('') || `<section class="card"><div class="empty">${ICONS.calendar}<p>Nothing booked.</p></div></section>`}
      ${done.length ? `<div class="eyebrow section-label">Done</div>${done.map(o => obsCard(o, IS_HOD)).join('')}` : ''}
    </div>`;
}
function acceptObs(id){ const o = updateObs(id, x => { x.status = 'accepted'; }); render(); toast(`Accepted — ${o.by} has been told`, 'ok'); }
function proposeSheet(id){
  const o = getObs().find(x => x.id === id);
  openSheet(`<div class="eyebrow">Observation · ${esc(o.subject)} · ${esc(o.cls)}</div><h2>Suggest another time</h2>
    <p class="lede">${esc(o.by)} asked for ${fmtLong(o.date)} at ${o.time}.</p>
    <div class="two-field"><label class="field"><span>Date</span><input type="date" id="pp-date" value="${schoolDay(5)}"></label><label class="field"><span>Time</span><input type="time" id="pp-time" value="${o.time}"></label></div>
    <label class="field"><span>Why?</span><textarea id="pp-reason" placeholder="e.g. Grade 6 are writing a test that period"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="propose('${id}')">${ICONS.send} Send to ${esc(o.by)}</button>`);
}
function propose(id){
  const reason = $('#pp-reason').value.trim();
  if(reason.length < 4){ toast('Give a short reason', 'bad'); $('#pp-reason').focus(); return; }
  const o = updateObs(id, x => { x.status = 'reschedule'; x.proposal = { date: $('#pp-date').value, time: $('#pp-time').value, reason, at: TODAY_ISO }; });
  closeSheet(); render(); toast(`New time sent to ${o.by}`, 'ok');
}
function acceptProposal(id){ const o = updateObs(id, x => { x.date = x.proposal.date; x.time = x.proposal.time; x.status = 'accepted'; x.moved = TODAY_ISO; }); render(); toast(`Booked for ${fmtShort(o.date)} · ${o.time}`, 'ok'); }
function scheduleSheet(){
  const teachers = deptTeachers();
  openSheet(`<div class="eyebrow">${DEPT.name}</div><h2>Book an observation</h2>
    <p class="lede">The teacher gets the request straight away and can accept or suggest another time.</p>
    <label class="field"><span>Teacher</span><select id="sc-teacher">${teachers.map(t => `<option value="${t.id}" ${t.id === STAFF_LOGINS.teacher ? 'selected' : ''}>${esc(t.short)} · ${esc(t.classId ? classById(t.classId).name : t.subjects[0])}</option>`).join('')}</select></label>
    <div class="two-field"><label class="field"><span>Date</span><input type="date" id="sc-date" value="${schoolDay(4)}"></label><label class="field"><span>Time</span><input type="time" id="sc-time" value="10:20"></label></div>
    <div class="two-field">
      <label class="field"><span>Subject</span><select id="sc-subject">${['Mathematics', 'English', 'Natural Sciences', 'Social Sciences', 'Technology'].map(s => `<option>${s}</option>`).join('')}</select></label>
      <label class="field"><span>Focus</span><select id="sc-focus">${OBS_FOCUS.map(f => `<option>${f}</option>`).join('')}</select></label>
    </div>
    <button class="btn btn-navy btn-block" onclick="scheduleObs()">${ICONS.send} Send request</button>`);
}
function scheduleObs(){
  const tid = $('#sc-teacher').value, t = staffById(tid);
  const o = { id: 'obs-' + Date.now(), teacherId: tid, by: ME.short, date: $('#sc-date').value, time: $('#sc-time').value,
    cls: t.classId ? classById(t.classId).name : 'Subject class', subject: $('#sc-subject').value, focus: $('#sc-focus').value, status: 'requested', at: TODAY_ISO };
  save('wk_obs', [o, ...getObs()]);
  closeSheet(); render();
  toast(`Request sent to ${t.short}`, 'ok');
}
function obsFeedbackSheet(id){
  const o = getObs().find(x => x.id === id), t = staffById(o.teacherId);
  openSheet(`<div class="eyebrow">${esc(t.short)} · ${esc(o.subject)} · ${esc(o.cls)}</div><h2>Observation feedback</h2>
    ${OBS_CRITERIA.map(c => `<div class="rate-row" data-id="${c.id}"><span>${c.label}</span><div class="seg">${RATINGS.map((r, i) => `<button class="${i === 1 ? 'on' : ''}" data-n="${i + 1}" onclick="rate(this)">${r}</button>`).join('')}</div></div>`).join('')}
    <label class="field" style="margin-top:12px"><span>What went well</span><textarea id="ob-strengths"></textarea></label>
    <label class="field"><span>Next steps</span><textarea id="ob-growth" placeholder="One or two things to work on"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="recordFeedback('${id}')">${ICONS.send} Send to ${esc(t.short)}</button>`);
}
function rate(btn){ btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn)); }
function recordFeedback(id){
  const strengths = $('#ob-strengths').value.trim(), growth = $('#ob-growth').value.trim();
  if(!strengths || !growth){ toast('Fill in what went well and next steps', 'bad'); return; }
  const ratings = Object.fromEntries([...document.querySelectorAll('.rate-row')].map(r => [r.dataset.id, +r.querySelector('button.on').dataset.n]));
  const o = updateObs(id, x => { x.status = 'completed'; x.feedback = { ratings, strengths, growth, at: TODAY_ISO }; });
  closeSheet(); render();
  toast(`Feedback sent — ${staffById(o.teacherId).short} gets a pop-up`, 'ok');
}
function ackObs(id){
  const reflection = $(`#refl-${id}`).value.trim();
  const o = updateObs(id, x => { x.status = 'acknowledged'; x.reflection = reflection; x.ackAt = TODAY_ISO; });
  render(); toast(`Done — ${o.by} has been told`, 'ok');
}

/* ---------------- Department calendar (HOD) ---------------- */
function deptEvents(){
  const ev = [
    { date: PAPERS_DUE, kind: 'due', title: 'Papers due for checking', sub: DEPT.name },
    { date: EXAMS_START, kind: 'exam', title: 'Term exams start', sub: 'Whole school' },
  ];
  deptObs().filter(o => o.status !== 'acknowledged').forEach(o => ev.push({ date: o.date, kind: 'obs', title: `Observation · ${staffById(o.teacherId).short}`, sub: `${o.subject} · ${o.time} · ${obsLabel(o, true).replace(/<[^>]+>/g, '')}` }));
  return ev.sort((a, b) => a.date.localeCompare(b.date));
}
function screenDeptCalendar(){
  const ev = deptEvents();
  const t = new Date(), y = t.getFullYear(), mo = t.getMonth();
  const first = new Date(y, mo, 1), days = new Date(y, mo + 1, 0).getDate(), lead = (first.getDay() + 6) % 7;
  const cells = [];
  for(let i = 0; i < lead; i++) cells.push('<span></span>');
  for(let d = 1; d <= days; d++){
    const iso = isoOf(new Date(y, mo, d)), mine = ev.filter(e => e.date === iso);
    cells.push(`<span class="cal-day ${iso === TODAY_ISO ? 'today' : ''} ${isWeekend(new Date(y, mo, d)) ? 'weekend' : ''}">${d}${mine.length ? `<i>${mine.map(e => `<b class="k-${e.kind}"></b>`).join('')}</i>` : ''}</span>`);
  }
  const tracker = deptTeachers().map(tc => {
    const ms = getMods().filter(m => m.teacherId === tc.id);
    const ok = ms.filter(m => m.status === 'approved').length, open = ms.length - ok;
    return `<div class="row">${avatar(tc.name, 'md')}<div class="grow"><div class="row-title">${esc(tc.short)} <span class="row-meta">· ${esc(tc.classId ? classById(tc.classId).name : 'Subject teacher')}</span></div><div class="row-sub">${ms.length ? `${ok} approved · ${open} still being checked` : 'Nothing sent yet'}</div></div>${ms.length ? (open ? '<span class="pill pill-warn">In progress</span>' : `<span class="pill pill-ok">${ICONS.check} Ready</span>`) : '<span class="pill pill-bad">Not sent</span>'}</div>`;
  }).join('');
  return `${head(`${DEPT.name} · ${DEPT.grades}`, 'Calendar', 'Papers, exams and observations for your department.')}
    <div class="two-col stack">
      <div class="stack">
        <section class="card">
          <div class="card-head"><h2>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2></div>
          <div class="month"><div class="month-head">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span>${d}</span>`).join('')}</div><div class="month-grid">${cells.join('')}</div></div>
          <div class="legend cal-legend"><span><i class="k-due"></i>Papers due</span><span><i class="k-obs"></i>Observation</span><span><i class="k-exam"></i>Exams</span></div>
        </section>
        <section class="card"><div class="card-head"><h2>Papers before ${fmtDM(PAPERS_DUE)}</h2></div><div class="rows">${tracker || '<div class="empty">No other teachers in your department yet.</div>'}</div></section>
      </div>
      <section class="card"><div class="card-head"><h2>Coming up</h2></div><div class="rows">${ev.filter(e => daysFromToday(e.date) >= 0).map(e => `
        <div class="row"><div class="datechip"><div class="m">${monthShort(e.date)}</div><div class="d">${dayNum(e.date)}</div></div><div class="grow"><div class="row-title"><span class="kdot k-${e.kind}"></span>${esc(e.title)}</div><div class="row-sub">${esc(e.sub)}</div></div></div>`).join('')}</div></section>
    </div>`;
}

/* ---------------- Updates: bell + result pop-ups ---------------- */
function noteItems(){
  const items = [];
  myMods().forEach(m => {
    const r = latestReview(m);
    if(r && r.v === latestV(m).v && ['approved', 'changes'].includes(m.status)){
      items.push({ id: `res-${m.id}-v${r.v}`, result: 'paper', tone: r.decision === 'approved' ? 'ok' : 'bad', at: r.at,
        title: r.decision === 'approved' ? `Approved: ${m.title}` : `Needs changes: ${m.title}`, body: `${r.by} · ${r.comments}`, href: '#/assessment/' + m.id, m, r });
    }
  });
  myObs().forEach(o => {
    if(['requested'].includes(o.status)) items.push({ id: `req-${o.id}-${o.date}`, tone: 'bad', at: o.at, title: `Observation request from ${o.by}`, body: `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, href: '#/observations' });
    if(o.status === 'accepted' && o.moved) items.push({ id: `moved-${o.id}-${o.date}`, tone: 'ok', at: o.moved, title: 'New time booked', body: `${o.by} accepted ${fmtShort(o.date)} · ${o.time}`, href: '#/observations' });
    if(o.feedback) items.push({ id: `res-${o.id}-fb`, result: 'obs', tone: 'ok', at: o.feedback.at, title: 'Observation feedback is ready', body: `${o.subject} · from ${o.by}`, href: '#/observations', o });
  });
  if(IS_HOD){
    deptMods().forEach(m => {
      const v = latestV(m);
      if(['submitted', 'resubmitted', 'review'].includes(m.status) || v.v > 1) items.push({ id: `sub-${m.id}-v${v.v}`, tone: 'ok', at: v.at, title: v.v > 1 ? `${nameOf(m.teacherId)} sent an updated paper` : `New paper from ${nameOf(m.teacherId)}`, body: m.title, href: '#/review/' + m.id });
    });
    deptObs().forEach(o => {
      const t = staffById(o.teacherId).short;
      if(o.status === 'reschedule') items.push({ id: `prop-${o.id}-${o.proposal.date}`, tone: 'bad', at: o.proposal.at || o.at, title: `${t} suggested a new time`, body: `${fmtShort(o.proposal.date)} · ${o.proposal.time} — ${o.proposal.reason}`, href: '#/observations' });
      if(['accepted', 'completed', 'acknowledged'].includes(o.status) && o.by === ME.short) items.push({ id: `acc-${o.id}`, tone: 'ok', at: o.at, title: `${t} accepted your observation`, body: `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, href: '#/observations' });
      if(o.status === 'acknowledged' && o.ackAt) items.push({ id: `ack-${o.id}`, tone: 'ok', at: o.ackAt, title: `${t} read your feedback`, body: o.reflection || o.subject, href: '#/observations' });
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
const SEEN_KEY = `wk_notes_seen_${ROLE}`, POP_KEY = `wk_notes_popped_${ROLE}`;
(function initNotes(){
  if(store(SEEN_KEY, null) !== null) return;
  const old = noteItems().filter(i => i.at < dayOffset(-1)).map(i => i.id);
  save(SEEN_KEY, old); save(POP_KEY, old);
})();
const unseenNotes = () => { const s = store(SEEN_KEY, []); return noteItems().filter(i => !s.includes(i.id)); };
const markSeen = ids => save(SEEN_KEY, [...new Set([...store(SEEN_KEY, []), ...ids])]);
const markPopped = ids => save(POP_KEY, [...new Set([...store(POP_KEY, []), ...ids])]);

function bellSheet(){
  const items = noteItems().slice(0, 15), seen = store(SEEN_KEY, []);
  openSheet(`<h2>Updates</h2>
    <div class="card rows notes">${items.map(i => `<a class="row" href="${i.href}" onclick="closeSheet()">
      <span class="note-ic ${i.tone}">${i.result ? (i.tone === 'ok' ? ICONS.checkCircle : ICONS.alert) : ICONS.bell}</span>
      <div class="grow"><div class="row-title">${!seen.includes(i.id) ? '<span class="new-dot"></span>' : ''}${esc(i.title)}</div><div class="row-sub">${esc(i.body)}</div></div>
      <span class="row-meta nowrap">${relAgo(i.at)}</span></a>`).join('') || '<div class="empty">No updates yet.</div>'}</div>`);
  markSeen(items.map(i => i.id));
  renderChrome();
}

let popQueue = [];
function queueResults(list){
  const popped = store(POP_KEY, []);
  list.filter(i => i.result && !popped.includes(i.id) && !popQueue.some(q => q.id === i.id)).forEach(i => popQueue.push(i));
  if(!document.querySelector('.result-pop.open')) showNextResult();
}
function showNextResult(){
  const i = popQueue.shift();
  if(!i) return;
  markPopped([i.id]);
  let icon, kicker, body;
  if(i.result === 'paper'){
    const ok = i.r.decision === 'approved';
    const fixes = MOD_CHECKLIST.filter(c => i.r.checklist[c.id] && !i.r.checklist[c.id].ok);
    icon = ok ? ICONS.checkCircle : ICONS.alert;
    kicker = ok ? 'Paper approved' : 'Paper needs changes';
    body = `<h2>${esc(i.m.title)}</h2>
      <p class="pop-by">${ok ? 'Approved' : 'Checked'} by ${esc(i.r.by)}</p>
      ${fixes.length ? `<div class="pop-fixes"><b>${fixes.length} thing${fixes.length > 1 ? 's' : ''} to fix</b>${fixes.map(c => `<div>${ICONS.x}<span><b>${c.label}</b>${i.r.checklist[c.id].comment ? `<small>${esc(i.r.checklist[c.id].comment)}</small>` : ''}</span></div>`).join('')}</div>` : ''}
      <p class="pop-quote">“${esc(i.r.comments)}”</p>`;
  } else {
    const f = i.o.feedback;
    icon = ICONS.star; kicker = 'Observation feedback';
    body = `<h2>${esc(i.o.subject)} · ${esc(i.o.cls)}</h2><p class="pop-by">From ${esc(i.o.by)} · ${fmtShort(i.o.date)}</p>
      <div class="obs-ratings">${OBS_CRITERIA.map(c => `<div><span>${c.label}</span><span class="rating r${f.ratings[c.id]}">${RATINGS[f.ratings[c.id] - 1]}</span></div>`).join('')}</div>
      <p class="pop-quote"><b>What went well:</b> ${esc(f.strengths)}</p>`;
  }
  let el = document.getElementById('result-pop');
  if(!el){ el = document.createElement('div'); el.id = 'result-pop'; el.className = 'result-pop'; document.body.appendChild(el); }
  el.innerHTML = `<div class="pop-card ${i.tone}" role="dialog" aria-modal="true">
    <span class="pop-icon">${icon}</span>
    <div class="eyebrow">${kicker}</div>
    ${body}
    <div class="pop-actions"><button class="btn btn-line" onclick="closeResult()">Later</button><button class="btn btn-navy" onclick="closeResult('${i.id}', '${i.href}')">View</button></div>
  </div>`;
  el.onclick = e => { if(e.target === el) closeResult(); };
  requestAnimationFrame(() => el.classList.add('open'));
}
function closeResult(id, href){
  const el = document.getElementById('result-pop');
  el.classList.remove('open');
  if(id){ markSeen([id]); location.hash = href; } else renderChrome();
  setTimeout(showNextResult, 350);
}

/* ---------------- Home & notices ---------------- */
function attention(){
  const items = [];
  if(!isWeekend(TODAY) && !registerFor(ME.classId)) items.push({ icon: 'register', title: `Take the ${classById(ME.classId).name} register`, sub: `${learnersIn(ME.classId).length} learners`, action: 'Open', href: '#/register' });
  myObs().filter(o => o.status === 'requested').forEach(o => items.push({ urgent: true, icon: 'calendar', title: `${o.by} wants to observe a lesson`, sub: `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, action: 'Reply', href: '#/observations' }));
  myObs().filter(o => o.status === 'completed').forEach(o => items.push({ icon: 'checkCircle', title: 'Observation feedback is ready', sub: `${o.subject} · ${o.by}`, action: 'Read', href: '#/observations' }));
  needsFix().forEach(m => items.push({ urgent: true, icon: 'pen', title: `Fix and resend: ${m.title}`, sub: `${latestReview(m).by} · ${relAgo(latestReview(m).at)}`, action: 'Fix', href: '#/assessment/' + m.id }));
  toReview().forEach(m => items.push({ urgent: true, icon: 'book', title: `Check: ${m.title}`, sub: `${nameOf(m.teacherId)} · ${m.status === 'resubmitted' ? 'updated' : 'sent'} ${relAgo(latestV(m).at).toLowerCase()}`, action: 'Check', href: '#/review/' + m.id }));
  if(IS_HOD) deptObs().filter(o => o.status === 'reschedule').forEach(o => items.push({ icon: 'clock', title: `${staffById(o.teacherId).short} suggested a new time`, sub: `${o.subject} · ${fmtShort(o.proposal.date)} · ${o.proposal.time}`, action: 'Reply', href: '#/observations' }));
  return items.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
}
const staffNoticeRow = n => `<div class="row notice-row"><div class="grow"><div class="row-title">${esc(n.title)}</div><div class="snippet">${esc(n.body)}</div><div class="meta"><span class="tag" style="--c:var(--sky)">${esc(n.from)}</span><span class="row-meta">${relAgo(n.date)}</span></div></div></div>`;
function deptCard(){
  return `<section class="card"><div class="card-head"><h2>${DEPT.name}</h2><a class="link" href="#/deptcal">Calendar</a></div><div class="rows">${deptTeachers().map(t => {
    const ms = getMods().filter(m => m.teacherId === t.id);
    const next = getObs().filter(o => o.teacherId === t.id && ['requested', 'reschedule', 'accepted'].includes(o.status)).sort((a, b) => a.date.localeCompare(b.date))[0];
    return `<div class="row">${avatar(t.name, 'md')}<div class="grow"><div class="row-title">${esc(t.short)} <span class="row-meta">· ${esc(t.classId ? classById(t.classId).name : 'Subject teacher')}</span>${t.added ? ' <span class="ribbon">New</span>' : ''}</div><div class="row-sub">${ms.filter(m => m.status === 'approved').length} approved · ${ms.filter(m => m.status !== 'approved').length} being checked${next ? ` · observation ${fmtShort(next.date)}` : ''}</div></div></div>`;
  }).join('') || '<div class="empty">No other teachers yet.</div>'}</div></section>`;
}
function screenHome(){
  const items = attention();
  const cls = classById(ME.classId), reg = registerFor(cls.id);
  const absent = reg ? learnersIn(cls.id).filter(l => reg[l.id] === 'absent').length : 0;
  const meritsToday = LIVE.merits().filter(r => r.date === TODAY_ISO && learnersIn(cls.id).some(l => l.id === r.learnerId)).length;
  return `<div class="stack">
    <section class="hero mesh"><div><div class="eyebrow on-dark">${fmtLong(TODAY_ISO)} · ${esc(myRoleLine())}</div><h1>${greeting()}, ${esc(ME.short)}</h1>
      <p>${items.length ? `${items.length} ${items.length === 1 ? 'thing needs' : 'things need'} your attention.` : 'You\'re all caught up.'}</p></div>
      <img class="hero-photo" src="../assets/photos/${IS_HOD ? 'school-front.jpg' : 'readers.jpg'}" alt=""></section>
    <div class="home-grid">
      <div class="stack">
        ${items.length ? `<section class="card"><div class="card-head"><h2>Needs your attention</h2></div><div class="rows">${items.map(a => `
          <div class="row attn ${a.urgent ? 'urgent' : ''}"><span class="ic">${ICONS[a.icon]}</span><div class="grow"><div class="row-title">${esc(a.title)}</div><div class="row-sub">${esc(a.sub)}</div></div><a class="btn btn-sm ${a.urgent ? 'btn-red' : 'btn-line'}" href="${a.href}">${a.action}</a></div>`).join('')}</div></section>` : ''}
        <section class="card"><div class="card-head"><h2>Staff notices</h2><a class="link" href="#/staffnotices">All</a></div><div class="rows">${STAFF_NOTICES.slice(0, 3).map(staffNoticeRow).join('')}</div></section>
      </div>
      <div class="stack">
        <section class="card"><div class="card-head"><h2>${esc(cls.name)} today</h2><span class="row-meta">${learnersIn(cls.id).length} learners</span></div><div class="rows">
          <a class="row" href="#/register"><span class="inbox-ic" style="background:var(--navy-soft);color:var(--navy)">${ICONS.register}</span><div class="grow"><div class="row-title">Register</div><div class="row-sub">${reg ? `Taken ${reg._at ? 'at ' + timeOf(reg._at) : ''}${absent ? ` · ${absent} absent` : ' · everyone present'}` : 'Not taken yet'}</div></div>${reg ? `<span class="pill pill-ok">${ICONS.check} Done</span>` : '<span class="pill pill-warn">To do</span>'}</a>
          <a class="row" href="#/merits"><span class="inbox-ic" style="background:var(--gold-soft);color:#A9760A">${ICONS.trophy}</span><div class="grow"><div class="row-title">Merits</div><div class="row-sub">${meritsToday} given today · Student of the Week ${sotwFor(cls.id) ? 'chosen' : 'not chosen yet'}</div></div><span class="chev">${ICONS.right}</span></a>
        </div></section>
        ${IS_HOD ? deptCard() : ''}
        <section class="card"><div class="card-head"><h2>My papers</h2><a class="link" href="#/assessments">All</a></div><div class="rows">${myMods().slice(0, 3).map(m => modRow(m, '#/assessment/' + m.id)).join('') || '<div class="empty">No papers sent yet.</div>'}</div></section>
      </div>
    </div>
  </div>`;
}
const screenStaffNotices = () => `${head(SCHOOL.name, 'Staff notices')}<section class="card rows">${STAFF_NOTICES.map(staffNoticeRow).join('')}</section>`;

/* ---------------- Routes & chrome ---------------- */
const ROUTES = {
  home: screenHome, register: screenRegister, merits: screenMerits, assessments: screenAssessments, assessment: screenAssessment,
  observations: screenObservations, staffnotices: screenStaffNotices,
  ...(IS_HOD ? { moderation: screenModeration, review: screenReview, deptcal: screenDeptCalendar } : {}),
};
const TITLES = { register: 'Register', merits: 'Merits', assessments: 'My papers', assessment: 'Paper', observations: 'Observations', staffnotices: 'Staff notices', moderation: 'Moderation', review: 'Check paper', deptcal: 'Calendar' };
const TOP_LEVEL = ['home', 'register', 'merits', IS_HOD ? 'moderation' : 'assessments'];
const PARENT_ROUTE = { assessment: 'assessments', review: 'moderation' };

function parseRoute(){
  const [name, param] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'home', param: param || null };
}
function goBack(){ const r = parseRoute(); location.hash = `#/${PARENT_ROUTE[r.name] || 'home'}`; }
function renderBar(r){
  const unseen = unseenNotes().length;
  const left = TOP_LEVEL.includes(r.name)
    ? `<a class="brand m-only" href="#/home" aria-label="Home"><img class="emblem" src="../assets/brand/emblem.png" alt="">${wordmark()}</a><span class="spacer m-only"></span>`
    : `<button class="icon-btn m-only" onclick="goBack()" aria-label="Back">${ICONS.left}</button><div class="title m-only">${TITLES[r.name] || ''}</div>`;
  return `${left}
    <div class="today-label d-only">${r.name === 'home' ? '' : `<span class="eyebrow" style="color:var(--ink-3)">${fmtLong(TODAY_ISO)} · Term ${termOf()}</span>`}</div>
    <span class="pill pill-navy d-only" style="margin-right:6px">${IS_HOD ? 'HOD' : 'Teacher'}</span>
    <button class="icon-btn" onclick="bellSheet()" aria-label="Updates${unseen ? ', ' + unseen + ' new' : ''}">${ICONS.bell}${unseen ? `<span class="count bell-count">${unseen}</span>` : ''}</button>
    <button class="icon-btn" onclick="moreSheet()" aria-label="Account"><span class="avatar avatar-sm me" style="--tone:${IS_HOD ? 'var(--gold)' : 'var(--sky)'}">${initials(ME.name)}</span></button>`;
}
function renderSide(r){
  const active = PARENT_ROUTE[r.name] || r.name;
  const link = ([id, label, icon, count]) => `<a class="side-link ${active === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}${label}${count ? `<span class="count">${count}</span>` : ''}</a>`;
  const groups = [
    ['My class', [['home', 'Home', 'home'], ['register', 'Register', 'register'], ['merits', 'Merits', 'trophy']]],
    ['Papers', [['assessments', 'My papers', 'book', needsFix().length], ...(IS_HOD ? [['moderation', 'Moderation', 'shield', toReview().length]] : [])]],
    [IS_HOD ? 'Department' : 'Growing', [['observations', 'Observations', 'calendar', obsCount()], ...(IS_HOD ? [['deptcal', 'Calendar', 'grid']] : [])]],
    ['School', [['staffnotices', 'Staff notices', 'megaphone']]],
  ];
  return `<img class="emblem" src="../assets/brand/emblem.png" alt="Whizzkidz Academy crest">
    ${wordmark('light')}
    <nav>${groups.map(([g, items]) => `<div class="side-group"><div class="eyebrow on-dark">${g}</div>${items.map(link).join('')}</div>`).join('')}</nav>
    <div class="side-foot">
      <span class="avatar avatar-sm" style="--tone:${IS_HOD ? 'var(--gold)' : 'var(--sky)'}">${initials(ME.name)}</span>
      <div><b>${esc(ME.short)}</b><small>${esc(IS_HOD ? 'HOD · ' + DEPT.name : 'Teacher · ' + classById(ME.classId).name)}</small></div>
      <button class="icon-btn" onclick="signOut()" aria-label="Sign out">${ICONS.logout}</button>
    </div>`;
}
function renderTabs(r){
  const active = PARENT_ROUTE[r.name] || r.name;
  const tabs = [['home', 'Home', 'home'], ['register', 'Register', 'register'], ['merits', 'Merits', 'trophy'], IS_HOD ? ['moderation', 'Moderate', 'shield'] : ['assessments', 'Papers', 'book']];
  const counts = { moderation: toReview().length, assessments: needsFix().length };
  const more = obsCount() + (IS_HOD ? needsFix().length : 0);
  return tabs.map(([id, label, icon]) => `<a class="tab ${active === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}<span>${label}</span>${counts[id] ? `<span class="count">${counts[id]}</span>` : ''}</a>`).join('')
    + `<button class="tab ${['observations', 'staffnotices', 'deptcal', ...(IS_HOD ? ['assessments'] : [])].includes(active) ? 'on' : ''}" onclick="moreSheet()">${ICONS.more}<span>More</span>${more ? `<span class="count">${more}</span>` : ''}</button>`;
}
function moreSheet(){
  const item = (href, label, icon, count) => `<a class="row" href="${href}" onclick="closeSheet()"><span class="ic">${ICONS[icon]}</span><div class="grow"><div class="row-title">${label}</div></div>${count ? `<span class="count">${count}</span>` : ''}<span class="chev">${ICONS.right}</span></a>`;
  openSheet(`<h2>${esc(ME.title)} ${esc(ME.name)}</h2><p class="lede">${esc(myRoleLine())} · ${SCHOOL.name}</p>
    <div class="card rows menu-list">
      ${item('#/observations', 'Observations', 'calendar', obsCount())}
      ${IS_HOD ? item('#/deptcal', 'Department calendar', 'grid') : ''}
      ${IS_HOD ? item('#/assessments', 'My papers', 'book', needsFix().length) : ''}
      ${item('#/staffnotices', 'Staff notices', 'megaphone')}
      <button class="row" onclick="resetDemoSheet()"><span class="ic">${ICONS.refresh}</span><div class="grow"><div class="row-title">Reset demo data</div><div class="row-sub">Restore the original sample data</div></div></button>
      <button class="row" onclick="signOut()"><span class="ic">${ICONS.logout}</span><div class="grow"><div class="row-title">Sign out</div></div></button>
    </div>
    ${switchViewHTML(ROLE)}`);
}
let knownNotes = new Set(noteItems().map(i => i.id));
function renderChrome(){
  const r = parseRoute();
  $('#bar').innerHTML = renderBar(r);
  $('#side').innerHTML = renderSide(r);
  $('#tabbar').innerHTML = renderTabs(r);
  placeTabGlow($('#tabbar'));
}
function renderView(){ const r = parseRoute(); $('#view').innerHTML = ROUTES[r.name](r.param); }
function render(opts = {}){
  knownNotes = new Set(noteItems().map(i => i.id));
  renderChrome();
  renderView();
  if(opts.animate) animateIn($('#view'));
}
function signOut(){ setSignedIn(ROLE, false); location.href = '../index.html'; }

/* ---------------- Live updates from other tabs ---------------- */
function announceWork(){
  const fresh = noteItems().filter(i => !knownNotes.has(i.id));
  fresh.filter(i => !i.result).forEach(i => pushNote(i.title, i.body, i.tone, i.href));
  queueResults(fresh);
  knownNotes = new Set(noteItems().map(i => i.id));
}

/* ---------------- Boot ---------------- */
window.addEventListener('hashchange', () => { closeSheet(); S.version = null; window.scrollTo(0, 0); render({ animate: true }); });
window.addEventListener('storage', e => {
  if(e.key === 'wk_hods' && hodPhaseOf(ME.id) !== MY_HOD_PHASE){ location.reload(); return; }
  announceWork();
  const typing = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if(typing || document.querySelector('.review-form')) renderChrome(); else render();
});
render({ animate: true });
setTimeout(() => queueResults(noteItems()), 900);
