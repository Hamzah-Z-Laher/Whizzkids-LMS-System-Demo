/* Teacher & HOD portal — one codebase, two logins. The HOD sees everything a teacher does, plus Department. */

const ROLE = window.PORTAL_ROLE === 'hod' ? 'hod' : 'teacher';
if(!signedIn(ROLE)) location.replace('../index.html');

const ME = STAFF_ACCOUNTS[ROLE];
const IS_HOD = !!ME.hod;
const HOD = STAFF_ACCOUNTS.hod;
const $ = sel => document.querySelector(sel);
const TODAY_ISO = isoOf(TODAY);
const DESKTOP = window.matchMedia('(min-width: 960px)');
const S = { regClass: ME.classId, regDate: TODAY_ISO, draft: null, modTab: 'review', paperTab: 'paper', version: null, obsTab: 'open' };

const classById = id => CLASSES.find(c => c.id === id);
const learnersIn = id => LEARNERS.filter(l => l.classId === id);
const MY_CLASSES = [classById(ME.classId)];
const STATUS = { present: 'P', late: 'L', absent: 'A' };
const timeOf = iso => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const head = (eyebrow, title, sub = '') => `<header class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
const registerFor = (classId, date = TODAY_ISO) => LIVE.register(classId, date);
const nameOf = teacherId => teacherId === ME.id ? 'You' : (deptTeacher(teacherId) || {}).name || 'A colleague';

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


/* ---------------- Moderation: storage & helpers ---------------- */
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
function addMod(m){ saveMods([m, ...getMods()]); }
const MOD_STATUS = {
  submitted: ['Submitted', 'pill-sky'], review: ['In review', 'pill-navy'], changes: ['Changes requested', 'pill-bad'],
  resubmitted: ['Resubmitted', 'pill-sky'], approved: ['Approved', 'pill-ok'],
};
const modPill = m => `<span class="pill ${MOD_STATUS[m.status][1]}">${MOD_STATUS[m.status][0]}</span>`;
const latestV = m => m.versions[m.versions.length - 1];
const latestReview = m => m.reviews[m.reviews.length - 1];
const myMods = () => getMods().filter(m => m.teacherId === ME.id);
const deptMods = () => getMods().filter(m => m.teacherId !== ME.id);
const toReview = () => (IS_HOD ? deptMods() : []).filter(m => ['submitted', 'resubmitted', 'review'].includes(m.status));
const moderatorFor = m => (m.teacherId === HOD.id ? 'the Deputy Principal' : `${HOD.short}, HOD`);

const blobUrls = {};
function blobFrom(dataUrl){
  if(blobUrls[dataUrl]) return blobUrls[dataUrl];
  const [h, b] = dataUrl.split(',');
  const bin = atob(b), arr = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return (blobUrls[dataUrl] = URL.createObjectURL(new Blob([arr], { type: h.match(/:(.*?);/)[1] })));
}
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
  return [p ? { kind: 'paper', ...p } : { kind: 'paper', name: 'Question paper', sample: true }, m ? { kind: 'memo', ...m } : { kind: 'memo', name: 'Memorandum', sample: true }];
}
const kb = n => n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;

function scaledQuestions(m){
  const qs = SAMPLE_PAPERS[m.subject] || SAMPLE_PAPERS.Mathematics;
  const total = qs.reduce((s, [, n]) => s + n, 0);
  const out = qs.map(([t, n]) => [t, Math.max(1, Math.round(n * m.marks / total))]);
  out[out.length - 1][1] += m.marks - out.reduce((s, [, n]) => s + n, 0);
  return out;
}
function samplePaperHTML(m, kind, v){
  const qs = scaledQuestions(m);
  const name = m.title.includes('·') ? m.title.split('·').slice(1).join('·').trim() : m.type;
  return `<div class="paper">
    <div class="paper-head"><img src="../assets/brand/emblem.png" alt=""><div><b>WHIZZKIDZ ACADEMY</b><small>${esc(m.grade)} · Term ${termOf()} · ${new Date().getFullYear()}</small></div><div class="paper-meta">${m.marks} marks<br>${m.minutes} minutes</div></div>
    <h3>${esc(m.subject)} · ${esc(name)}${kind === 'memo' ? ' <span class="memo-tag">Memorandum</span>' : ''}</h3>
    ${v > 1 ? `<div class="paper-rev">Revised · version ${v}</div>` : ''}
    ${kind === 'paper' ? '<ol class="paper-instr"><li>Answer all the questions.</li><li>Show all your working.</li><li>Number your answers exactly as the questions are numbered.</li></ol>' : ''}
    <ol class="paper-q">${qs.map(([t, n], i) => `<li><span>${kind === 'memo' ? `${i + 1}.1 – ${i + 1}.${Math.max(2, Math.ceil(n / 3))} · ${esc(t)} — answers and mark allocation` : `Question ${i + 1} · ${esc(t)}`}</span><b>(${n})</b></li>`).join('')}</ol>
    <div class="paper-total">Total: ${m.marks} marks</div>
  </div>`;
}
function fileView(m, ver, kind){
  const f = ver.files.find(x => x.kind === kind);
  if(!f) return '<div class="empty">No file attached.</div>';
  if(f.sample) return samplePaperHTML(m, kind, ver.v);
  if(f.dataUrl && f.type === 'application/pdf'){
    const url = blobFrom(f.dataUrl);
    return `<div class="file-frame"><iframe src="${url}" title="${esc(f.name)}"></iframe></div>
      <div class="file-card">${ICONS.book}<div class="grow"><b>${esc(f.name)}</b><small>${kb(f.size)} · PDF</small></div><a class="btn btn-sm btn-line" href="${url}" target="_blank" rel="noopener">Open</a></div>`;
  }
  return `<div class="file-card">${ICONS.book}<div class="grow"><b>${esc(f.name)}</b><small>${kb(f.size)}${f.dataUrl ? '' : ' · too large to preview in the demo'}</small></div>${f.dataUrl ? `<a class="btn btn-sm btn-line" href="${blobFrom(f.dataUrl)}" download="${esc(f.name)}">${ICONS.download} Download</a>` : ''}</div>`;
}
function paperPanel(m){
  const v = (S.version && m.versions.find(x => x.v === S.version)) || latestV(m);
  return `<section class="card paper-card">
    <div class="card-head paper-tabs">
      <div class="seg">${['paper', 'memo'].map(k => `<button class="${S.paperTab === k ? 'on' : ''}" onclick="S.paperTab='${k}'; renderView();">${k === 'paper' ? 'Question paper' : 'Memo'}</button>`).join('')}</div>
      ${m.versions.length > 1 ? `<div class="seg">${m.versions.map(x => `<button class="${x.v === v.v ? 'on' : ''}" onclick="S.version=${x.v}; renderView();">v${x.v}</button>`).join('')}</div>` : `<span class="row-meta">v${v.v} · ${fmtDM(v.at)}</span>`}
    </div>
    <div class="paper-wrap">${fileView(m, v, S.paperTab)}</div>
    ${v.note ? `<div class="paper-note"><b>${m.teacherId === ME.id ? 'Your note' : 'Note from ' + esc(nameOf(m.teacherId))}:</b> ${esc(v.note)}</div>` : ''}
  </section>`;
}
function cogBars(cog){
  return `<div class="cog"><div class="eyebrow" style="color:var(--ink-3)">Cognitive levels · actual vs target</div>${COG_LEVELS.map(l => {
    const a = +cog[l.id] || 0, off = Math.abs(a - l.target) > 5;
    return `<div class="cog-row"><span>${l.label}</span><div class="cog-bar"><i class="${off ? 'off' : ''}" style="width:${Math.min(100, a)}%"></i><em style="left:${l.target}%"></em></div><b class="${off ? 'off' : ''}">${a}%</b></div>`;
  }).join('')}<small class="muted">Marker shows the target</small></div>`;
}
function feedbackHTML(r, title = 'Moderator feedback'){
  if(!r) return '';
  return `<section class="card">
    <div class="card-head"><h2>${title}</h2><span class="row-meta">v${r.v} · ${esc(r.by)} · ${fmtDM(r.at)}</span></div>
    <div class="decision ${r.decision}">${r.decision === 'approved' ? ICONS.checkCircle + ' Approved' : ICONS.alert + ' Changes requested'}</div>
    ${r.comments ? `<p class="fb-comment">“${esc(r.comments)}”</p>` : ''}
    <div class="rows check-list">${MOD_CHECKLIST.map(c => {
      const x = r.checklist[c.id] || { ok: true };
      return `<div class="row ${x.ok ? '' : 'bad'}"><span class="yn ${x.ok ? 'yes' : 'no'}">${x.ok ? ICONS.check : ICONS.x}</span><div class="grow"><div class="row-title">${c.label}</div>${x.comment ? `<div class="row-sub">${esc(x.comment)}</div>` : ''}</div></div>`;
    }).join('')}</div>
    ${r.cog ? cogBars(r.cog) : ''}
  </section>`;
}
function modSteps(m){
  const idx = m.status === 'approved' ? 3 : m.status === 'changes' ? 2 : m.status === 'review' ? 1 : 0;
  const labels = [m.status === 'resubmitted' ? 'Resubmitted' : 'Submitted', 'In review', m.status === 'changes' ? 'Changes requested' : 'Approved'];
  return labels.map((l, i) => `<div class="step ${i < idx ? 'done' : i === idx ? 'now' : ''} ${m.status === 'changes' && i === 2 ? 'bad' : ''}"><span></span>${l}</div>`).join('');
}
function historyHTML(m){
  const ev = [];
  m.versions.forEach(v => ev.push({ seq: v.v * 10, at: v.at, t: v.v === 1 ? `Submitted by ${nameOf(m.teacherId)}` : `Revised and resubmitted as v${v.v}`, s: v.note }));
  m.reviews.forEach(r => ev.push({ seq: r.v * 10 + 5, at: r.at, t: r.decision === 'approved' ? `Approved by ${r.by}` : `Changes requested by ${r.by}`, s: '' }));
  ev.sort((a, b) => b.seq - a.seq);
  return `<section class="card"><div class="card-head"><h2>History</h2></div><div class="rows">${ev.map(e => `<div class="row"><div class="grow"><div class="row-title">${esc(e.t)}</div>${e.s ? `<div class="row-sub">${esc(e.s)}</div>` : ''}</div><span class="row-meta nowrap">${fmtDM(e.at)}</span></div>`).join('')}</div></section>`;
}
const modRow = (m, href) => {
  const v = latestV(m);
  return `<a class="row" href="${href}"><span class="food" style="--c:${SUBJECT_COLORS[m.subject] || 'var(--navy)'}">${ICONS.book}</span>
    <div class="grow"><div class="row-title">${esc(m.title)}</div><div class="row-sub">${esc(nameOf(m.teacherId))} · ${esc(m.grade)} · ${m.marks} marks · v${v.v} · ${relAgo(v.at)}</div></div>${modPill(m)}</a>`;
};

/* ---------------- Moderation: teacher ---------------- */
function screenAssessments(){
  const list = myMods();
  return `${head('Moderation', 'My assessments', `Papers and memos go to ${moderatorFor({ teacherId: ME.id })} for moderation before they're written.`)}
    <div class="stack">
      <button class="btn btn-navy start-btn" onclick="submitSheet()">${ICONS.plus} Submit for moderation</button>
      <section class="card rows">${list.map(m => modRow(m, '#/assessment/' + m.id)).join('') || `<div class="empty">${ICONS.book}<p>Nothing submitted yet.</p></div>`}</section>
    </div>`;
}
function screenAssessment(id){
  const m = getMods().find(x => x.id === id);
  if(!m) return `<div class="empty">That paper could not be found.</div>`;
  const mine = m.teacherId === ME.id;
  return `${head(`${esc(m.grade)} · ${esc(m.type)} · ${m.marks} marks`, esc(m.title))}
    <div class="stack">
      <section class="card mod-meta"><div class="mod-status">${modPill(m)}<span class="row-meta">Moderator: ${esc(moderatorFor(m))}</span></div><div class="steps">${modSteps(m)}</div></section>
      ${mine && m.status === 'changes' ? reviseCard(m) : ''}
      <div class="two-col stack">
        ${paperPanel(m)}
        <div class="stack">${feedbackHTML(latestReview(m)) || `<section class="card card-pad"><h2 style="font-size:17px">Waiting for moderation</h2><p class="muted" style="margin-top:6px">${esc(moderatorFor(m))} will review it — you'll be notified as soon as there's feedback.</p></section>`}${historyHTML(m)}</div>
      </div>
    </div>`;
}
function reviseCard(m){
  return `<section class="card card-pad revise">
    <h2 style="font-size:17px">Upload a revised version</h2>
    <p class="muted" style="margin:4px 0 14px">Address the feedback below, then resubmit as v${m.versions.length + 1}.</p>
    <div class="two-field">
      <label class="field"><span>Revised question paper</span><input type="file" id="rv-paper" accept=".pdf,.doc,.docx"></label>
      <label class="field"><span>Revised memorandum</span><input type="file" id="rv-memo" accept=".pdf,.doc,.docx"></label>
    </div>
    <p class="muted" style="font-size:13px;margin:-6px 0 12px">No files to hand? The demo attaches a revised sample paper and memo.</p>
    <label class="field"><span>What you changed</span><textarea id="rv-note" placeholder="e.g. Added two problem-solving questions and fixed question 4's marks"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="resubmit('${m.id}')">${ICONS.send} Resubmit for moderation</button>
  </section>`;
}
async function resubmit(id){
  const note = $('#rv-note').value.trim();
  if(note.length < 4){ toast('Tell the moderator what you changed', 'bad'); $('#rv-note').focus(); return; }
  const files = await collectFiles('#rv-paper', '#rv-memo');
  updateMod(id, m => { m.versions.push({ v: m.versions.length + 1, files, note, at: TODAY_ISO }); m.status = 'resubmitted'; });
  S.version = null; render();
  toast(`Resubmitted — ${HOD.short} has been notified`, 'ok');
}
function submitSheet(){
  openSheet(`<div class="eyebrow">Moderation</div><h2>Submit for moderation</h2>
    <p class="lede">Goes to ${esc(moderatorFor({ teacherId: ME.id }))}. You'll be notified when it's reviewed.</p>
    <div class="two-field">
      <label class="field"><span>Subject</span><select id="sb-subject">${ME.subjects.map(s => `<option>${s}</option>`).join('')}</select></label>
      <label class="field"><span>Type</span><select id="sb-type"><option>Exam</option><option>Test</option><option>Assignment</option><option>Practical task</option></select></label>
    </div>
    <label class="field"><span>Title</span><input id="sb-title" value="Term ${termOf()} Exam · Paper 1"></label>
    <div class="two-field">
      <label class="field"><span>Total marks</span><input id="sb-marks" type="number" inputmode="numeric" value="60"></label>
      <label class="field"><span>Time (minutes)</span><input id="sb-min" type="number" inputmode="numeric" value="90"></label>
    </div>
    <div class="two-field">
      <label class="field"><span>Question paper</span><input type="file" id="sb-paper" accept=".pdf,.doc,.docx"></label>
      <label class="field"><span>Memorandum</span><input type="file" id="sb-memo" accept=".pdf,.doc,.docx"></label>
    </div>
    <p class="muted" style="font-size:13px;margin:-6px 0 14px">No files to hand? Leave these empty and the demo attaches a sample paper and memo.</p>
    <label class="field"><span>Note for the moderator (optional)</span><textarea id="sb-note" placeholder="e.g. Covers all Term 4 content"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="submitPaper()">${ICONS.send} Submit</button>`);
}
async function submitPaper(){
  const subject = $('#sb-subject').value, type = $('#sb-type').value;
  const title = $('#sb-title').value.trim() || `Term ${termOf()} ${type}`;
  const files = await collectFiles('#sb-paper', '#sb-memo');
  const m = { id: 'mod-' + Date.now(), teacherId: ME.id, title: `${subject} · ${title}`, subject, grade: ME.grade, type,
    marks: +$('#sb-marks').value || 60, minutes: +$('#sb-min').value || 90, status: 'submitted',
    versions: [{ v: 1, files, note: $('#sb-note').value.trim(), at: TODAY_ISO }], reviews: [], at: TODAY_ISO };
  addMod(m);
  closeSheet();
  location.hash = '#/assessment/' + m.id;
  toast(`Sent to ${moderatorFor(m)}`, 'ok');
}

/* ---------------- Moderation: HOD ---------------- */
function screenModeration(){
  const queue = toReview(), all = deptMods();
  const list = S.modTab === 'review' ? queue : all;
  const n = s => all.filter(m => m.status === s).length;
  return `${head(`${DEPARTMENT.name} · ${DEPARTMENT.grades}`, 'Moderation', 'Review papers before they are written. Teachers are notified the moment you send feedback.')}
    <div class="stack">
      <div class="kpis">
        <div class="kpi ${queue.length ? 'alert' : ''}"><div class="eyebrow">To review</div><b data-count="${queue.length}">${queue.length}</b><div class="sub">waiting for you</div></div>
        <div class="kpi"><div class="eyebrow">With teachers</div><b data-count="${n('changes')}">${n('changes')}</b><div class="sub">changes requested</div></div>
        <div class="kpi"><div class="eyebrow">Approved</div><b data-count="${n('approved')}">${n('approved')}</b><div class="sub">this term</div></div>
        <div class="kpi"><div class="eyebrow">Teachers</div><b data-count="${DEPARTMENT.teachers.length - 1}">${DEPARTMENT.teachers.length - 1}</b><div class="sub">in ${DEPARTMENT.name}</div></div>
      </div>
      <div class="seg day-seg" style="max-width:420px"><button class="${S.modTab === 'review' ? 'on' : ''}" onclick="S.modTab='review'; render();">To review (${queue.length})</button><button class="${S.modTab === 'all' ? 'on' : ''}" onclick="S.modTab='all'; render();">All papers</button></div>
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
      <section class="card mod-meta"><div class="mod-status">${modPill(m)}<span class="row-meta">Version ${v.v} · submitted ${relAgo(v.at).toLowerCase()}</span></div><div class="steps">${modSteps(m)}</div></section>
      <div class="two-col stack">
        ${paperPanel(m)}
        <div class="stack">
          ${decided ? feedbackHTML(prev, 'Your feedback') : reviewForm(m, prev)}
          ${!decided && prev ? feedbackHTML(prev, `Your feedback on v${prev.v}`) : ''}
          ${historyHTML(m)}
        </div>
      </div>
    </div>`;
}
function reviewForm(m, prev){
  return `<section class="card card-pad review-form">
    <h2 style="font-size:17px;margin-bottom:12px">Moderation checklist</h2>
    ${MOD_CHECKLIST.map(c => `<div class="check-item" data-id="${c.id}">
      <div class="check-top"><span>${c.label}</span><div class="seg yn-seg"><button class="on" data-v="yes" onclick="yn(this)">Yes</button><button data-v="no" onclick="yn(this)">No</button></div></div>
      <input class="check-comment" placeholder="Comment (needed if No)">
    </div>`).join('')}
    <div class="eyebrow" style="color:var(--ink-3);margin:18px 0 8px">Cognitive levels · % of marks</div>
    <div class="cog-inputs">${COG_LEVELS.map(l => `<label><span>${l.label}</span><input type="number" inputmode="numeric" data-cog="${l.id}" value="${prev && prev.cog ? prev.cog[l.id] : l.target}" oninput="cogTotal()"><small>target ${l.target}%</small></label>`).join('')}</div>
    <div class="cog-total" id="cog-total">Total 100%</div>
    <label class="field" style="margin-top:14px"><span>Overall feedback for ${esc(nameOf(m.teacherId))}</span><textarea id="rv-comments" placeholder="What works well, and what needs to change"></textarea></label>
    <div class="decide">
      <button class="btn btn-line" style="color:var(--blazer)" onclick="decide('${m.id}', 'changes')">${ICONS.alert} Request changes</button>
      <button class="btn btn-navy" onclick="decide('${m.id}', 'approved')">${ICONS.check} Approve</button>
    </div>
  </section>`;
}
function yn(btn){
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
  btn.closest('.check-item').classList.toggle('no', btn.dataset.v === 'no');
  if(btn.dataset.v === 'no') btn.closest('.check-item').querySelector('input').focus();
}
function cogTotal(){
  const t = [...document.querySelectorAll('[data-cog]')].reduce((s, i) => s + (+i.value || 0), 0);
  const el = $('#cog-total'); el.textContent = `Total ${t}%`; el.classList.toggle('off', t !== 100);
}
function decide(id, decision){
  const checklist = {}; let missing = false;
  document.querySelectorAll('.check-item').forEach(el => {
    const ok = !el.classList.contains('no'), comment = el.querySelector('.check-comment').value.trim();
    if(!ok && !comment) missing = true;
    checklist[el.dataset.id] = { ok, comment };
  });
  const cog = Object.fromEntries([...document.querySelectorAll('[data-cog]')].map(i => [i.dataset.cog, +i.value || 0]));
  const comments = $('#rv-comments').value.trim();
  if(missing){ toast('Add a comment for each item marked No', 'bad'); return; }
  if(decision === 'changes' && !comments){ toast('Tell the teacher what needs to change', 'bad'); $('#rv-comments').focus(); return; }
  if(decision === 'approved' && Object.values(checklist).some(x => !x.ok)){ toast('Some items are marked No — request changes instead', 'bad'); return; }
  const m = updateMod(id, x => { x.reviews.push({ v: latestV(x).v, by: ME.short, at: TODAY_ISO, decision, checklist, cog, comments: comments || 'Approved.' }); x.status = decision; });
  window.scrollTo(0, 0); render();
  toast(decision === 'approved' ? `Approved — ${nameOf(m.teacherId)} has been notified` : `Feedback sent to ${nameOf(m.teacherId)}`, 'ok');
}

/* ---------------- Observations ---------------- */
const getObs = () => store('wk_obs', null) || JSON.parse(JSON.stringify(OBS_SEED));
function updateObs(id, fn){ const l = getObs(); const o = l.find(x => x.id === id); fn(o); save('wk_obs', l); return o; }
const myObs = () => getObs().filter(o => o.teacherId === ME.id);
const deptObs = () => getObs().filter(o => o.teacherId !== ME.id);
const OBS_STATUS = {
  requested: ['Awaiting reply', 'pill-warn'], reschedule: ['New time proposed', 'pill-sky'], accepted: ['Confirmed', 'pill-navy'],
  completed: ['Feedback ready', 'pill-ok'], acknowledged: ['Completed', 'pill-ok'],
};
const obsCount = () => IS_HOD ? deptObs().filter(o => o.status === 'reschedule').length : myObs().filter(o => ['requested', 'completed'].includes(o.status)).length;

function feedbackBlock(o){
  const f = o.feedback; if(!f) return '';
  return `<div class="obs-fb">
    <div class="obs-ratings">${OBS_CRITERIA.map(c => `<div><span>${c.label}</span><span class="dots" aria-label="${f.ratings[c.id]} out of 4">${[1, 2, 3, 4].map(n => `<i class="${n <= f.ratings[c.id] ? 'on' : ''}"></i>`).join('')}</span></div>`).join('')}</div>
    <p class="fb-comment"><b>Strengths:</b> ${esc(f.strengths)}</p>
    <p class="fb-comment"><b>Next steps:</b> ${esc(f.growth)}</p>
  </div>`;
}
function obsCard(o, hodView){
  const t = deptTeacher(o.teacherId);
  let actions = '';
  if(!hodView){
    if(o.status === 'requested') actions = `<div class="obs-actions"><button class="btn btn-navy btn-sm" onclick="acceptObs('${o.id}')">${ICONS.check} Accept</button><button class="btn btn-line btn-sm" onclick="proposeSheet('${o.id}')">Propose another time</button></div>`;
    if(o.status === 'reschedule') actions = `<div class="status-line late obs-line">${ICONS.clock} You proposed ${fmtShort(o.proposal.date)} · ${o.proposal.time} — waiting for ${esc(o.by)}</div>`;
    if(o.status === 'accepted') actions = `<div class="status-line present obs-line">${ICONS.checkCircle} Confirmed — ${esc(o.by)} will join your ${esc(o.subject)} lesson</div>`;
    if(o.status === 'completed') actions = `${feedbackBlock(o)}<label class="field" style="margin-top:12px"><span>Your reflection</span><textarea id="refl-${o.id}" placeholder="What will you try next time?"></textarea></label><button class="btn btn-navy btn-block" onclick="ackObs('${o.id}')">${ICONS.check} Acknowledge feedback</button>`;
    if(o.status === 'acknowledged') actions = `${feedbackBlock(o)}${o.reflection ? `<p class="fb-comment"><b>Your reflection:</b> ${esc(o.reflection)}</p>` : ''}`;
  } else {
    if(o.status === 'requested') actions = `<div class="status-line late obs-line">${ICONS.clock} Waiting for ${esc(t.name)} to accept</div>`;
    if(o.status === 'reschedule') actions = `<div class="status-line late obs-line">${ICONS.clock} ${esc(t.name)} proposed ${fmtLong(o.proposal.date)} · ${o.proposal.time}${o.proposal.reason ? ` — “${esc(o.proposal.reason)}”` : ''}</div><div class="obs-actions"><button class="btn btn-navy btn-sm" onclick="acceptProposal('${o.id}')">${ICONS.check} Accept new time</button></div>`;
    if(o.status === 'accepted') actions = `<div class="obs-actions"><span class="pill pill-ok">${ICONS.check} Accepted by ${esc(t.name)}</span><button class="btn btn-navy btn-sm" onclick="obsFeedbackSheet('${o.id}')">${ICONS.pen} Record feedback</button></div>`;
    if(o.status === 'completed') actions = `${feedbackBlock(o)}<div class="status-line late obs-line">${ICONS.clock} Waiting for ${esc(t.name)} to acknowledge</div>`;
    if(o.status === 'acknowledged') actions = `${feedbackBlock(o)}${o.reflection ? `<p class="fb-comment"><b>${esc(t.name)}'s reflection:</b> ${esc(o.reflection)}</p>` : ''}`;
  }
  return `<section class="card card-pad obs-card ${o.status}">
    <div class="obs-top">
      <div class="datechip"><div class="m">${monthShort(o.date)}</div><div class="d">${dayNum(o.date)}</div></div>
      <div class="grow"><div class="row-title">${hodView ? esc(t.name) + ' · ' : ''}${esc(o.subject)} · ${esc(o.cls)}</div>
        <div class="row-sub">${fmtLong(o.date)} · ${o.time}</div>
        <div class="row-sub">${esc(o.type)} · Focus: ${esc(o.focus)}${hodView ? '' : ` · from ${esc(o.by)}`}</div></div>
      <span class="pill ${OBS_STATUS[o.status][1]}">${OBS_STATUS[o.status][0]}</span>
    </div>
    ${actions}
  </section>`;
}
function screenObservations(){
  const list = IS_HOD ? deptObs() : myObs();
  const open = list.filter(o => o.status !== 'acknowledged').sort((a, b) => a.date.localeCompare(b.date));
  const done = list.filter(o => o.status === 'acknowledged');
  return `${head(IS_HOD ? `${DEPARTMENT.name} · ${DEPARTMENT.grades}` : 'Professional growth', 'Class observations', IS_HOD ? 'Schedule observations, then record feedback after the lesson.' : 'Accept observation requests and reflect on your feedback.')}
    <div class="stack">
      ${IS_HOD ? `<button class="btn btn-navy start-btn" onclick="scheduleSheet()">${ICONS.plus} Schedule an observation</button>` : ''}
      ${open.map(o => obsCard(o, IS_HOD)).join('') || `<section class="card"><div class="empty">${ICONS.calendar}<p>No observations scheduled.</p></div></section>`}
      ${done.length ? `<div class="eyebrow section-label">Completed</div>${done.map(o => obsCard(o, IS_HOD)).join('')}` : ''}
    </div>`;
}
function acceptObs(id){ const o = updateObs(id, x => { x.status = 'accepted'; }); render(); toast(`Accepted — ${o.by} has been notified`, 'ok'); }
function proposeSheet(id){
  const o = getObs().find(x => x.id === id);
  openSheet(`<div class="eyebrow">Observation · ${esc(o.subject)} · ${esc(o.cls)}</div><h2>Propose another time</h2>
    <p class="lede">${esc(o.by)} asked for ${fmtLong(o.date)} at ${o.time}.</p>
    <div class="two-field"><label class="field"><span>Date</span><input type="date" id="pp-date" value="${schoolDay(5)}"></label><label class="field"><span>Time</span><input type="time" id="pp-time" value="${o.time}"></label></div>
    <label class="field"><span>Reason</span><textarea id="pp-reason" placeholder="e.g. Grade 6 are writing a test that period"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="propose('${id}')">${ICONS.send} Send to ${esc(o.by)}</button>`);
}
function propose(id){
  const reason = $('#pp-reason').value.trim();
  if(reason.length < 4){ toast('Give a short reason', 'bad'); $('#pp-reason').focus(); return; }
  const o = updateObs(id, x => { x.status = 'reschedule'; x.proposal = { date: $('#pp-date').value, time: $('#pp-time').value, reason }; });
  closeSheet(); render(); toast(`New time sent to ${o.by}`, 'ok');
}
function acceptProposal(id){ const o = updateObs(id, x => { x.date = x.proposal.date; x.time = x.proposal.time; x.status = 'accepted'; }); render(); toast(`Confirmed for ${fmtShort(o.date)} · ${o.time}`, 'ok'); }
function scheduleSheet(){
  const teachers = DEPARTMENT.teachers.filter(t => t.id !== ME.id);
  openSheet(`<div class="eyebrow">${DEPARTMENT.name}</div><h2>Schedule an observation</h2>
    <p class="lede">The teacher gets the request straight away and can accept or propose another time.</p>
    <label class="field"><span>Teacher</span><select id="sc-teacher">${teachers.map(t => `<option value="${t.id}" ${t.id === STAFF_ACCOUNTS.teacher.id ? 'selected' : ''}>${esc(t.name)} · ${esc(t.cls)}</option>`).join('')}</select></label>
    <div class="two-field"><label class="field"><span>Date</span><input type="date" id="sc-date" value="${schoolDay(4)}"></label><label class="field"><span>Time</span><input type="time" id="sc-time" value="10:20"></label></div>
    <div class="two-field">
      <label class="field"><span>Subject</span><select id="sc-subject">${['Mathematics', 'English', 'Natural Sciences', 'Social Sciences', 'Technology'].map(s => `<option>${s}</option>`).join('')}</select></label>
      <label class="field"><span>Focus</span><select id="sc-focus">${OBS_FOCUS.map(f => `<option>${f}</option>`).join('')}</select></label>
    </div>
    <button class="btn btn-navy btn-block" onclick="scheduleObs()">${ICONS.send} Send request</button>`);
}
function scheduleObs(){
  const tid = $('#sc-teacher').value, t = deptTeacher(tid);
  const o = { id: 'obs-' + Date.now(), teacherId: tid, by: ME.short, date: $('#sc-date').value, time: $('#sc-time').value, cls: t.cls,
    subject: $('#sc-subject').value, focus: $('#sc-focus').value, type: 'QMS lesson observation', status: 'requested', at: TODAY_ISO };
  save('wk_obs', [o, ...getObs()]);
  closeSheet(); render();
  toast(`Observation request sent to ${t.name}`, 'ok');
}
function obsFeedbackSheet(id){
  const o = getObs().find(x => x.id === id), t = deptTeacher(o.teacherId);
  openSheet(`<div class="eyebrow">${esc(t.name)} · ${esc(o.subject)} · ${esc(o.cls)}</div><h2>Observation feedback</h2>
    <p class="lede">Rate each area from 1 (needs support) to 4 (excellent).</p>
    ${OBS_CRITERIA.map(c => `<div class="rate-row" data-id="${c.id}"><span>${c.label}</span><div class="seg">${[1, 2, 3, 4].map(n => `<button class="${n === 3 ? 'on' : ''}" onclick="rate(this)">${n}</button>`).join('')}</div></div>`).join('')}
    <label class="field" style="margin-top:12px"><span>Strengths</span><textarea id="ob-strengths" placeholder="What went well"></textarea></label>
    <label class="field"><span>Next steps</span><textarea id="ob-growth" placeholder="One or two things to work on"></textarea></label>
    <button class="btn btn-navy btn-block" onclick="recordFeedback('${id}')">${ICONS.send} Send to ${esc(t.name)}</button>`);
}
function rate(btn){ btn.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn)); }
function recordFeedback(id){
  const strengths = $('#ob-strengths').value.trim(), growth = $('#ob-growth').value.trim();
  if(!strengths || !growth){ toast('Add strengths and next steps', 'bad'); return; }
  const ratings = Object.fromEntries([...document.querySelectorAll('.rate-row')].map(r => [r.dataset.id, +r.querySelector('button.on').textContent]));
  const o = updateObs(id, x => { x.status = 'completed'; x.feedback = { ratings, strengths, growth, at: TODAY_ISO }; });
  closeSheet(); render();
  toast(`Feedback sent to ${deptTeacher(o.teacherId).name}`, 'ok');
}
function ackObs(id){
  const reflection = $(`#refl-${id}`).value.trim();
  updateObs(id, x => { x.status = 'acknowledged'; x.reflection = reflection; });
  render(); toast(`Acknowledged — ${HOD.short} has been notified`, 'ok');
}

/* ---------------- Home & notices ---------------- */
function attention(){
  const items = [];
  if(!isWeekend(TODAY) && !registerFor(ME.classId)) items.push({ icon: 'register', title: `Take the ${classById(ME.classId).name} register`, sub: `${learnersIn(ME.classId).length} learners`, action: 'Open', href: '#/register' });
  myObs().filter(o => o.status === 'requested').forEach(o => items.push({ urgent: true, icon: 'calendar', title: `Observation request from ${o.by}`, sub: `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, action: 'Reply', href: '#/observations' }));
  myObs().filter(o => o.status === 'completed').forEach(o => items.push({ icon: 'checkCircle', title: 'Observation feedback is ready', sub: `${o.subject} · ${o.by}`, action: 'Read', href: '#/observations' }));
  myMods().filter(m => m.status === 'changes').forEach(m => items.push({ urgent: true, icon: 'pen', title: `Changes requested: ${m.title}`, sub: `${latestReview(m).by} · ${relAgo(latestReview(m).at)}`, action: 'Revise', href: '#/assessment/' + m.id }));
  toReview().forEach(m => items.push({ urgent: true, icon: 'book', title: `Moderate: ${m.title}`, sub: `${nameOf(m.teacherId)} · ${m.status === 'resubmitted' ? 'resubmitted' : 'submitted'} ${relAgo(latestV(m).at).toLowerCase()}`, action: 'Review', href: '#/review/' + m.id }));
  if(IS_HOD) deptObs().filter(o => o.status === 'reschedule').forEach(o => items.push({ icon: 'clock', title: `${deptTeacher(o.teacherId).name} proposed a new time`, sub: `${o.subject} · ${fmtShort(o.proposal.date)} · ${o.proposal.time}`, action: 'Respond', href: '#/observations' }));
  return items.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
}
const staffNoticeRow = n => `<div class="row notice-row"><div class="grow"><div class="row-title">${esc(n.title)}</div><div class="snippet">${esc(n.body)}</div><div class="meta"><span class="tag" style="--c:var(--sky)">${esc(n.from)}</span><span class="row-meta">${relAgo(n.date)}</span></div></div></div>`;
function deptCard(){
  return `<section class="card"><div class="card-head"><h2>${DEPARTMENT.name}</h2><span class="row-meta">${DEPARTMENT.grades}</span></div><div class="rows">${DEPARTMENT.teachers.filter(t => t.id !== ME.id).map(t => {
    const ms = getMods().filter(m => m.teacherId === t.id);
    const next = getObs().filter(o => o.teacherId === t.id && ['requested', 'reschedule', 'accepted'].includes(o.status)).sort((a, b) => a.date.localeCompare(b.date))[0];
    return `<div class="row">${avatar(t.full, 'md')}<div class="grow"><div class="row-title">${esc(t.name)} <span class="row-meta">· ${esc(t.cls)}</span></div><div class="row-sub">${ms.filter(m => m.status === 'approved').length} approved · ${ms.filter(m => m.status !== 'approved').length} in moderation${next ? ` · observation ${fmtShort(next.date)}` : ''}</div></div></div>`;
  }).join('')}</div></section>`;
}
function screenHome(){
  const items = attention();
  const cls = classById(ME.classId), reg = registerFor(cls.id);
  const absent = reg ? learnersIn(cls.id).filter(l => reg[l.id] === 'absent').length : 0;
  const meritsToday = LIVE.merits().filter(r => r.date === TODAY_ISO && learnersIn(cls.id).some(l => l.id === r.learnerId)).length;
  return `<div class="stack">
    <section class="hero mesh"><div><div class="eyebrow on-dark">${fmtLong(TODAY_ISO)} · ${esc(ME.role)}</div><h1>${greeting()}, ${esc(ME.short)}</h1>
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
          <a class="row" href="#/merits"><span class="inbox-ic" style="background:var(--gold-soft);color:#A9760A">${ICONS.trophy}</span><div class="grow"><div class="row-title">Merits</div><div class="row-sub">${meritsToday} awarded today · Student of the Week ${sotwFor(cls.id) ? 'chosen' : 'not chosen yet'}</div></div><span class="chev">${ICONS.right}</span></a>
        </div></section>
        ${IS_HOD ? deptCard() : ''}
        <section class="card"><div class="card-head"><h2>My assessments</h2><a class="link" href="#/assessments">All</a></div><div class="rows">${myMods().slice(0, 3).map(m => modRow(m, '#/assessment/' + m.id)).join('') || '<div class="empty">Nothing submitted yet.</div>'}</div></section>
      </div>
    </div>
  </div>`;
}
const screenStaffNotices = () => `${head(SCHOOL.name, 'Staff notices')}<section class="card rows">${STAFF_NOTICES.map(staffNoticeRow).join('')}</section>`;

/* ---------------- Routes & chrome ---------------- */
const ROUTES = {
  home: screenHome, register: screenRegister, merits: screenMerits, assessments: screenAssessments, assessment: screenAssessment,
  observations: screenObservations, staffnotices: screenStaffNotices, ...(IS_HOD ? { moderation: screenModeration, review: screenReview } : {}),
};
const TITLES = { register: 'Register', merits: 'Merits', assessments: 'My assessments', assessment: 'Assessment', observations: 'Observations', staffnotices: 'Staff notices', moderation: 'Moderation', review: 'Moderate paper' };
const TOP_LEVEL = ['home', 'register', 'merits', IS_HOD ? 'moderation' : 'assessments'];
const PARENT_ROUTE = { assessment: 'assessments', review: 'moderation' };

function parseRoute(){
  const [name, param] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'home', param: param || null };
}
function goBack(){ const r = parseRoute(); location.hash = `#/${PARENT_ROUTE[r.name] || 'home'}`; }
function renderBar(r){
  const left = TOP_LEVEL.includes(r.name)
    ? `<a class="brand m-only" href="#/home" aria-label="Home"><img class="emblem" src="../assets/brand/emblem.png" alt="">${wordmark()}</a><span class="spacer m-only"></span>`
    : `<button class="icon-btn m-only" onclick="goBack()" aria-label="Back">${ICONS.left}</button><div class="title m-only">${TITLES[r.name] || ''}</div>`;
  return `${left}
    <div class="today-label d-only">${r.name === 'home' ? '' : `<span class="eyebrow" style="color:var(--ink-3)">${fmtLong(TODAY_ISO)} · Term ${termOf()}</span>`}</div>
    <span class="pill pill-navy d-only" style="margin-right:6px">${IS_HOD ? 'HOD' : 'Teacher'}</span>
    <button class="icon-btn" onclick="moreSheet()" aria-label="Account"><span class="avatar avatar-sm me" style="--tone:${IS_HOD ? 'var(--gold)' : 'var(--sky)'}">${initials(ME.name)}</span></button>`;
}
function renderSide(r){
  const active = PARENT_ROUTE[r.name] || r.name;
  const link = ([id, label, icon, count]) => `<a class="side-link ${active === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}${label}${count ? `<span class="count">${count}</span>` : ''}</a>`;
  const groups = [
    ['My class', [['home', 'Home', 'home'], ['register', 'Register', 'register'], ['merits', 'Merits', 'trophy']]],
    ['Assessment', [['assessments', 'My assessments', 'book', myMods().filter(m => m.status === 'changes').length], ...(IS_HOD ? [['moderation', 'Moderation', 'shield', toReview().length]] : [])]],
    ['Development', [['observations', 'Observations', 'calendar', obsCount()]]],
    ['School', [['staffnotices', 'Staff notices', 'megaphone']]],
  ];
  return `<img class="emblem" src="../assets/brand/emblem.png" alt="Whizzkidz Academy crest">
    ${wordmark('light')}
    <nav>${groups.map(([g, items]) => `<div class="side-group"><div class="eyebrow on-dark">${g}</div>${items.map(link).join('')}</div>`).join('')}</nav>
    <div class="side-foot">
      <span class="avatar avatar-sm" style="--tone:${IS_HOD ? 'var(--gold)' : 'var(--sky)'}">${initials(ME.name)}</span>
      <div><b>${esc(ME.short)}</b><small>${esc(IS_HOD ? 'HOD · ' + DEPARTMENT.name : 'Teacher · ' + classById(ME.classId).name)}</small></div>
      <button class="icon-btn" onclick="signOut()" aria-label="Sign out">${ICONS.logout}</button>
    </div>`;
}
function renderTabs(r){
  const active = PARENT_ROUTE[r.name] || r.name;
  const tabs = [['home', 'Home', 'home'], ['register', 'Register', 'register'], ['merits', 'Merits', 'trophy'], IS_HOD ? ['moderation', 'Moderate', 'shield'] : ['assessments', 'Papers', 'book']];
  const counts = { moderation: toReview().length, assessments: myMods().filter(m => m.status === 'changes').length };
  const more = obsCount() + (IS_HOD ? myMods().filter(m => m.status === 'changes').length : 0);
  return tabs.map(([id, label, icon]) => `<a class="tab ${active === id ? 'on' : ''}" href="#/${id}">${ICONS[icon]}<span>${label}</span>${counts[id] ? `<span class="count">${counts[id]}</span>` : ''}</a>`).join('')
    + `<button class="tab ${['observations', 'staffnotices', ...(IS_HOD ? ['assessments'] : [])].includes(active) ? 'on' : ''}" onclick="moreSheet()">${ICONS.more}<span>More</span>${more ? `<span class="count">${more}</span>` : ''}</button>`;
}
function moreSheet(){
  const item = (href, label, icon, count) => `<a class="row" href="${href}" onclick="closeSheet()"><span class="ic">${ICONS[icon]}</span><div class="grow"><div class="row-title">${label}</div></div>${count ? `<span class="count">${count}</span>` : ''}<span class="chev">${ICONS.right}</span></a>`;
  openSheet(`<h2>${esc(ME.title)} ${esc(ME.name)}</h2><p class="lede">${esc(ME.role)} · ${SCHOOL.name}</p>
    <div class="card rows menu-list">
      ${item('#/observations', 'Observations', 'calendar', obsCount())}
      ${IS_HOD ? item('#/assessments', 'My assessments', 'book') : ''}
      ${item('#/staffnotices', 'Staff notices', 'megaphone')}
      <button class="row" onclick="resetDemoSheet()"><span class="ic">${ICONS.refresh}</span><div class="grow"><div class="row-title">Reset demo data</div><div class="row-sub">Restore the original sample data</div></div></button>
      <button class="row" onclick="signOut()"><span class="ic">${ICONS.logout}</span><div class="grow"><div class="row-title">Sign out</div></div></button>
    </div>
    ${switchViewHTML(ROLE)}`);
}
function renderChrome(){
  const r = parseRoute();
  $('#bar').innerHTML = renderBar(r);
  $('#side').innerHTML = renderSide(r);
  $('#tabbar').innerHTML = renderTabs(r);
  placeTabGlow($('#tabbar'));
}
function renderView(){ const r = parseRoute(); $('#view').innerHTML = ROUTES[r.name](r.param); }
function render(opts = {}){
  if(typeof snap !== 'undefined') snap = snapshotWork();
  renderChrome();
  renderView();
  if(opts.animate) animateIn($('#view'));
}
function signOut(){ setSignedIn(ROLE, false); location.href = '../index.html'; }

/* ---------------- Live notifications ---------------- */
const snapshotWork = () => ({
  mods: Object.fromEntries(getMods().map(m => [m.id, `${m.status}:${m.versions.length}`])),
  obs: Object.fromEntries(getObs().map(o => [o.id, o.status])),
});
let snap = snapshotWork();
function announceWork(){
  const now = snapshotWork();
  getMods().forEach(m => {
    if(snap.mods[m.id] === now.mods[m.id]) return;
    const r = latestReview(m);
    if(m.teacherId === ME.id){
      if(m.status === 'approved') pushNote(`Approved: ${m.title}`, `${r.by}: ${r.comments}`, 'ok', '#/assessment/' + m.id);
      else if(m.status === 'changes') pushNote('Changes requested', `${m.title} — ${r.by}`, 'bad', '#/assessment/' + m.id);
      else if(m.status === 'review') pushNote('Your paper is being moderated', `${HOD.short} opened ${m.title}`, 'ok', '#/assessment/' + m.id);
    } else if(IS_HOD && ['submitted', 'resubmitted'].includes(m.status)){
      pushNote(m.status === 'resubmitted' ? `${nameOf(m.teacherId)} resubmitted a paper` : `New paper from ${nameOf(m.teacherId)}`, m.title, 'ok', '#/review/' + m.id);
    }
  });
  getObs().forEach(o => {
    const was = snap.obs[o.id];
    if(was === now.obs[o.id]) return;
    if(o.teacherId === ME.id){
      if(o.status === 'requested') pushNote(`Observation request from ${o.by}`, `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, 'bad', '#/observations');
      if(o.status === 'accepted' && was === 'reschedule') pushNote('New time confirmed', `${o.by} accepted ${fmtShort(o.date)} · ${o.time}`, 'ok', '#/observations');
      if(o.status === 'completed') pushNote('Observation feedback is ready', `${o.subject} · from ${o.by}`, 'ok', '#/observations');
    } else if(IS_HOD){
      const t = deptTeacher(o.teacherId);
      if(o.status === 'accepted' && was === 'requested') pushNote(`${t.name} accepted your observation`, `${o.subject} · ${fmtShort(o.date)} · ${o.time}`, 'ok', '#/observations');
      if(o.status === 'reschedule') pushNote(`${t.name} proposed a new time`, `${fmtShort(o.proposal.date)} · ${o.proposal.time} — ${o.proposal.reason}`, 'bad', '#/observations');
      if(o.status === 'acknowledged') pushNote(`${t.name} acknowledged your feedback`, o.reflection || o.subject, 'ok', '#/observations');
    }
  });
  snap = now;
}

/* ---------------- Boot ---------------- */
window.addEventListener('hashchange', () => { closeSheet(); S.version = null; S.paperTab = 'paper'; window.scrollTo(0, 0); render({ animate: true }); });
window.addEventListener('storage', () => {
  announceWork();
  const typing = document.querySelector('.review-form, .revise, .reg-row') && document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if(typing || document.querySelector('.review-form')) renderChrome(); else render();
});
render({ animate: true });
