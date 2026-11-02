/* Merits, demerits, badges and Student of the Week — shared by the parent app and staff portal. */

const catOf = (type, id) => (type === 'merit' ? MERIT_CATEGORIES : DEMERIT_CATEGORIES).find(c => c.id === id);
const allMerits = () => [...LIVE.merits(), ...MERIT_SEED];
const recKey = r => `${r.date}${r.at || ''}`;
const meritsFor = learnerId => allMerits().filter(r => r.learnerId === learnerId).sort((a, b) => recKey(b).localeCompare(recKey(a)));
const isAcked = r => !!r.acked || !!LIVE.acks()[r.id];

function meritTotals(learnerId){
  const t = { merits: 0, demerits: 0, byCat: {}, unacked: [] };
  meritsFor(learnerId).forEach(r => {
    if(r.type === 'merit'){ t.merits += r.points; t.byCat[r.cat] = (t.byCat[r.cat] || 0) + r.points; }
    else { t.demerits += r.points; if(!isAcked(r)) t.unacked.push(r); }
  });
  return t;
}

const allSotw = () => [...LIVE.sotw(), ...SOTW_SEED];
const sotwFor = (classId, week = THIS_WEEK) => allSotw().find(s => s.classId === classId && s.week === week);
const sotwWinsOf = learnerId => allSotw().filter(s => s.learnerId === learnerId);

const TIERS = [
  { id: 'bronze', label: 'Bronze', at: 10 },
  { id: 'silver', label: 'Silver', at: 25 },
  { id: 'gold', label: 'Gold', at: 50 },
  { id: 'platinum', label: 'Platinum', at: 100 },
];
const CAT_BADGES = [
  { id: 'b-kind', label: 'Kind Heart', cat: 'kind', need: 5 },
  { id: 'b-lead', label: 'Leader', cat: 'lead', need: 6 },
  { id: 'b-scholar', label: 'Scholar', cat: 'academic', need: 6 },
  { id: 'b-creative', label: 'Creative Spark', cat: 'creative', need: 4 },
  { id: 'b-sport', label: 'Sports Star', cat: 'sport', need: 4 },
];

/* ctx carries facts only the parent app knows (attendance, homework, Aqua School). */
function badgesFor(learnerId, ctx = {}){
  const t = meritTotals(learnerId);
  const list = TIERS.map(x => ({
    id: x.id, kind: 'tier', tier: x.id, icon: 'medal', label: x.label, sub: `${x.at} merits`,
    have: t.merits, need: x.at, earned: t.merits >= x.at,
  }));
  CAT_BADGES.forEach(b => {
    const c = catOf('merit', b.cat), have = t.byCat[b.cat] || 0;
    list.push({ id: b.id, kind: 'cat', icon: c.icon, tone: c.tone, label: b.label, sub: `${b.need} ${c.label.toLowerCase()} points`, have, need: b.need, earned: have >= b.need });
  });
  const wins = sotwWinsOf(learnerId).length;
  list.push({ id: 'b-star', kind: 'special', icon: 'star', tone: '#E0AE3C', label: 'Star of the Week', sub: 'Named Student of the Week', have: wins, need: 1, earned: wins > 0 });
  if('attendanceClean' in ctx) list.push({ id: 'b-attend', kind: 'special', icon: 'register', tone: '#1F8A4C', label: 'Perfect Attendance', sub: 'A full month, no absences', have: ctx.attendanceClean ? 1 : 0, need: 1, earned: ctx.attendanceClean });
  if('homeworkClean' in ctx) list.push({ id: 'b-homework', kind: 'special', icon: 'book', tone: '#0B78C2', label: 'Homework Hero', sub: 'Nothing overdue', have: ctx.homeworkClean ? 1 : 0, need: 1, earned: ctx.homeworkClean });
  if(ctx.aqua) list.push({ id: 'b-aqua', kind: 'special', icon: 'swim', tone: '#0FA3C7', label: 'Aqua Star', sub: 'Aqua School swimmer', have: 1, need: 1, earned: true });
  return list;
}
const nextTier = merits => TIERS.find(x => merits < x.at);

function medalHTML(b, size = ''){
  const style = b.kind === 'tier' ? '' : `style="--c:${b.tone}"`;
  return `<span class="medal ${b.kind === 'tier' ? 'tier-' + b.tier : 'tone'} ${b.earned ? '' : 'locked'} ${size}" ${style}>${ICONS[b.icon]}</span>`;
}

function confetti(){
  if(REDUCED_MOTION) return;
  const colors = ['#E0AE3C', '#D3283E', '#0B78C2', '#2D1FA3', '#1F8A4C', '#F39A3B', '#7D5AB5'];
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for(let i = 0; i < 90; i++){
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--x', `${(Math.random() - .5) * 220}px`);
    p.style.setProperty('--r', `${(Math.random() - .5) * 1080}deg`);
    p.style.animationDelay = `${Math.random() * .35}s`;
    p.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    if(i % 3 === 0){ p.style.width = '7px'; p.style.height = '7px'; p.style.borderRadius = '50%'; }
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3600);
}
