/* Demo data for the Whizzkidz Academy prototype.
   All dates are relative to the day the demo is opened so it never looks stale. */

/* Bump when sample data changes so stale demo state from an older version is cleared once. */
const DATA_VERSION = '4-roles';
try{
  if(localStorage.getItem('wk_version') !== DATA_VERSION){
    Object.keys(localStorage).filter(k => k.startsWith('wk_') && k !== 'wk_session').forEach(k => localStorage.removeItem(k));
    localStorage.setItem('wk_version', DATA_VERSION);
  }
}catch(e){}

const TODAY = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })();

function isoOf(dt){
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}
function dayOffset(n){ const t = new Date(TODAY); t.setDate(t.getDate() + n); return isoOf(t); }
function isWeekend(dt){ return dt.getDay() === 0 || dt.getDay() === 6; }
function schoolDay(n){
  const t = new Date(TODAY);
  if(n === 0){ while(isWeekend(t)) t.setDate(t.getDate() + 1); return isoOf(t); }
  const step = n > 0 ? 1 : -1;
  let count = 0;
  while(count < Math.abs(n)){ t.setDate(t.getDate() + step); if(!isWeekend(t)) count++; }
  return isoOf(t);
}
function nextWeekday(dow, minDays){
  const t = new Date(TODAY); t.setDate(t.getDate() + minDays);
  while(t.getDay() !== dow) t.setDate(t.getDate() + 1);
  return isoOf(t);
}

const SCHOOL = {
  name: 'Whizzkidz Academy',
  address: '62 & 65 Roan Street, Mackenzie Park, Benoni',
  phones: [
    { label: 'Academy', number: '076 897 4682' },
    { label: 'Montessori', number: '062 232 6043' },
    { label: 'Office', number: '011 420 0645' },
  ],
  email: 'info@whizzkid.co.za',
};

const PHASES = {
  montessori: { name: 'Montessori', color: 'var(--leaf-green)' },
  primary:    { name: 'Primary School', color: 'var(--blazer)' },
  high:       { name: 'Whizzkidz High', color: 'var(--gold)' },
  aqua:       { name: 'Aqua School', color: 'var(--aqua)' },
};

const SUBJECT_COLORS = {
  'Mathematics': '#3D97D3',
  'English': '#F0766B',
  'Afrikaans': '#F39A3B',
  'Life Skills': '#67B64A',
  'Natural Sciences': '#22A98F',
  'Social Sciences': '#B7791F',
  'Technology': '#5A6ACF',
  'Creative Arts': '#D25C9B',
  'Music': '#9B6BD3',
  'Physical Education': '#2E8540',
  'Swimming': '#0FA3C7',
  'Assembly': '#8C88A0',
  'Break': '#8C88A0',
};

const PARENT = {
  title: 'Mr', first: 'Jos', last: 'Verstappen',
  name: 'Jos Verstappen',
  email: 'jos.verstappen@example.com',
  phone: '082 445 1290',
};

const FAMILY_ACCOUNT = {
  number: 'WKA-20419',
  name: 'Verstappen family',
  dueDate: dayOffset(-4),
  bank: { name: 'Demo Bank', account: '0000 000 000', branch: '000000', reference: 'WKA-20419' },
};

const CHILDREN = [
  { id: 'max', first: 'Max', name: 'Max Verstappen', grade: 'Grade 6', className: '6A', classId: 'c4', learnerId: 'l2',
    phase: 'primary', teacher: 'Mr Rosberg', aqua: false },
  { id: 'kimi', first: 'Kimi', name: 'Kimi Verstappen', grade: 'Grade 3', className: '3B', classId: 'c3', learnerId: 'l1',
    phase: 'primary', teacher: 'Mr Coulthard', aqua: true },
];

/* Attendance: every school day this term is "present" unless listed here (offset in school days). */
const ATTENDANCE_EXCEPTIONS = {
  kimi: [
    { day: -3, status: 'late', note: 'Arrived 08:20' },
    { day: -6, status: 'absent', note: 'Sick note submitted' },
    { day: -14, status: 'late', note: 'Arrived 07:55' },
    { day: -19, status: 'absent', note: 'Doctor\'s appointment' },
  ],
  max: [
    { day: -9, status: 'absent', note: 'Dentist appointment' },
    { day: -22, status: 'late', note: 'Arrived 07:50' },
  ],
};
const TERM_SCHOOL_DAYS = 30;

const TIMETABLE = {
  kimi: {
    Mon: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:45','Afrikaans','B3'],['09:45','10:05','Break',''],['10:05','10:50','Life Skills','B3'],['10:50','11:35','Creative Arts','Art studio'],['11:35','12:20','Natural Sciences','B3']],
    Tue: [['07:30','08:15','English','B3'],['08:15','09:00','Mathematics','B3'],['09:00','09:45','Natural Sciences','B3'],['09:45','10:05','Break',''],['10:05','10:50','Physical Education','Field'],['10:50','11:35','Music','Music room'],['11:35','12:20','Afrikaans','B3']],
    Wed: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:45','Afrikaans','B3'],['09:45','10:05','Break',''],['10:05','10:50','Social Sciences','B3'],['10:50','11:35','Swimming','Aqua School'],['11:35','12:20','Life Skills','B3']],
    Thu: [['07:30','08:15','English','B3'],['08:15','09:00','Mathematics','B3'],['09:00','09:45','Life Skills','B3'],['09:45','10:05','Break',''],['10:05','10:50','Creative Arts','Art studio'],['10:50','11:35','Natural Sciences','B3'],['11:35','12:20','Afrikaans','B3']],
    Fri: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:40','Assembly','Hall'],['09:40','10:00','Break',''],['10:00','10:45','Physical Education','Field'],['10:45','11:30','Music','Music room']],
  },
  max: {
    Mon: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','10:00','Technology','Computer lab'],['10:00','10:20','Break',''],['10:20','11:10','Natural Sciences','A5'],['11:10','12:00','Afrikaans','A5'],['12:00','12:50','Social Sciences','A5']],
    Tue: [['07:30','08:20','English','A5'],['08:20','09:10','Mathematics','A5'],['09:10','10:00','Social Sciences','A5'],['10:00','10:20','Break',''],['10:20','11:10','Physical Education','Field'],['11:10','12:00','Creative Arts','Art studio'],['12:00','12:50','Afrikaans','A5']],
    Wed: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','10:00','Afrikaans','A5'],['10:00','10:20','Break',''],['10:20','11:10','Swimming','Aqua School'],['11:10','12:00','Life Skills','A5'],['12:00','12:50','Natural Sciences','A5']],
    Thu: [['07:30','08:20','Technology','Computer lab'],['08:20','09:10','Mathematics','A5'],['09:10','10:00','English','A5'],['10:00','10:20','Break',''],['10:20','11:10','Natural Sciences','A5'],['11:10','12:00','Music','Music room'],['12:00','12:50','Mathematics','A5']],
    Fri: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','09:50','Assembly','Hall'],['09:50','10:10','Break',''],['10:10','11:00','Physical Education','Field'],['11:00','11:50','Social Sciences','A5']],
  },
};

const HOMEWORK = {
  kimi: [
    { id: 'h1', subject: 'Mathematics', title: 'Times tables 2–5 worksheet', note: 'Complete both sides. Show your working on the back.', due: schoolDay(1) },
    { id: 'h2', subject: 'English', title: 'Reading log — 15 minutes a night', note: 'Parent to sign the log each evening.', due: schoolDay(3) },
    { id: 'h3', subject: 'Life Skills', title: 'Bring one clean recycled item for the class project', note: 'Bottle caps, cardboard tubes or clean tins.', due: schoolDay(-1) },
    { id: 'h4', subject: 'Afrikaans', title: 'Woordeskat: leer 10 nuwe woorde', note: 'Spelling test on the words next week.', due: schoolDay(-4), done: true },
  ],
  max: [
    { id: 'h5', subject: 'Technology', title: 'Scratch project: build a simple maze game', note: 'Save to the class drive before the deadline.', due: schoolDay(4) },
    { id: 'h6', subject: 'Mathematics', title: 'Fractions revision — exercise 4.3', note: 'Questions 1 to 12.', due: schoolDay(1) },
    { id: 'h7', subject: 'Social Sciences', title: 'Poster: South African biomes', note: 'A3 size, groups of two.', due: schoolDay(6) },
    { id: 'h8', subject: 'English', title: 'Book report — chapters 1 to 3', note: 'One page, handwritten.', due: schoolDay(-3), done: true },
  ],
};

const OUTING_DATE = schoolDay(4);
const SLIP_DUE = schoolDay(2);
const SPORTS_DAY = nextWeekday(5, 7);

const NOTICES = [
  { id: 'n1', title: 'Sports Day', priority: 'high', audience: 'Whole school', date: dayOffset(-1),
    body: `Our inter-house athletics day is on ${fmtLong(SPORTS_DAY)}. Learners arrive in full sports kit with a water bottle, hat and sunscreen. Families are welcome on the field from 09:00.` },
  { id: 'n2', title: 'Grade 3 outing to Sci-Bono — consent needed', priority: 'high', audience: 'Grade 3', date: dayOffset(-3), action: 'slip',
    body: `Grade 3 visits the Sci-Bono Discovery Centre on ${fmtLong(OUTING_DATE)}. Please sign the consent form in the app and pay the R80 contribution by ${fmtLong(SLIP_DUE)}.` },
  { id: 'n3', title: 'Fee statements sent', priority: 'normal', audience: 'Whole school', date: dayOffset(-5),
    body: 'This month\'s statements have been emailed and are also available under Fees in the app. Please contact the office with any queries.' },
  { id: 'n4', title: 'Aqua School closed for maintenance', priority: 'normal', audience: 'Whole school', date: dayOffset(-8),
    body: 'The heated pool is closed this Thursday for routine maintenance. Swimming lessons resume on Friday.' },
  { id: 'n5', title: 'Whizzkidz High open morning', priority: 'normal', audience: 'Grade 6 & 7', date: dayOffset(-12),
    body: 'Our new hybrid high school opens its doors for families considering Grade 8. Meet the teachers and see the CAPS-aligned hybrid model in action.' },
];

const EVENTS = [
  { id: 'e1', title: 'Grade 3 Sci-Bono outing', date: OUTING_DATE, start: '08:30', end: '13:00', location: 'Sci-Bono Discovery Centre', desc: 'Consent form and R80 contribution required.', audience: 'Grade 3' },
  { id: 'e2', title: 'Sports Day', date: SPORTS_DAY, start: '08:00', end: '12:00', location: 'Main field', desc: 'Inter-house athletics. Families welcome from 09:00.', audience: 'Whole school', rsvp: true },
  { id: 'e3', title: 'Whizzkidz High open morning', date: nextWeekday(6, 9), start: '09:00', end: '11:00', location: 'Whizzkidz High', desc: 'For families considering Grade 8.', audience: 'Grade 6 & 7', rsvp: true },
  { id: 'e4', title: 'Parent–teacher evening', date: schoolDay(12), start: '16:00', end: '18:30', location: 'Main hall', desc: 'Ten-minute slots with your child\'s class teacher.', audience: 'Whole school', rsvp: true },
  { id: 'e5', title: 'Cultural Day', date: schoolDay(17), start: '09:00', end: '11:00', location: 'Main hall', desc: 'Traditional dress, food stalls and performances.', audience: 'Whole school' },
  { id: 'e6', title: 'Year-end concert', date: schoolDay(26), start: '17:30', end: '19:30', location: 'Main hall', desc: 'Every class performs. Tickets via the office.', audience: 'Whole school', rsvp: true },
];

const ALBUMS = [
  { id: 'assembly', title: 'Monday assembly', date: dayOffset(-3), photos: ['assembly.jpg', 'school-front.jpg'] },
  { id: 'readers', title: 'Grade R readers', date: dayOffset(-10), photos: ['readers.jpg'] },
  { id: 'heart', title: 'Bottle-cap heart project', date: dayOffset(-18), photos: ['heart-project.jpg'] },
  { id: 'play', title: 'Our new play area', date: dayOffset(-26), photos: ['playground-1.jpg', 'playground-2.jpg', 'hopscotch.jpg'] },
  { id: 'aqua', title: 'Aqua School', date: dayOffset(-40), photos: ['pool.jpg', 'aqua-building.jpg'] },
];

const STATEMENT = [
  { date: dayOffset(-58), desc: 'School fees — Kimi', amount: 1850 },
  { date: dayOffset(-58), desc: 'School fees — Max', amount: 1850 },
  { date: dayOffset(-55), desc: 'Payment received — EFT', amount: -3700 },
  { date: dayOffset(-40), desc: 'Aqua School term fee — Kimi', amount: 450 },
  { date: dayOffset(-28), desc: 'School fees — Kimi', amount: 1850 },
  { date: dayOffset(-28), desc: 'School fees — Max', amount: 1850 },
  { date: dayOffset(-24), desc: 'Payment received — EFT', amount: -2900 },
];

const THREADS = [
  { id: 't1', childId: 'kimi', with: 'Mr Coulthard', role: 'Class teacher, 3B', messages: [
    { from: 'them', text: 'Good afternoon Mr Verstappen. Kimi got full marks in today\'s spelling test — he was very proud of himself!', when: 'Yesterday, 14:05' },
    { from: 'me', text: 'That\'s lovely to hear, thank you for letting me know.', when: 'Yesterday, 15:40' },
  ]},
  { id: 't2', childId: 'max', with: 'Mr Rosberg', role: 'Class teacher, 6A', messages: [
    { from: 'them', text: 'A reminder that Max\'s Scratch project is due next week. He\'s welcome to use the computer lab at break if he needs more time.', when: 'Mon, 09:12' },
  ]},
  { id: 't3', childId: null, with: 'School office', role: 'Fees & admin', messages: [
    { from: 'them', text: 'Hello Mr Verstappen, a friendly reminder that the account shows R1 250,00 outstanding. Let us know if you\'d like to arrange a payment plan.', when: 'Tue, 11:30' },
  ]},
];

/* ---------------- Staff side ---------------- */

const STAFF_USER = { name: 'Claire Williams', title: 'Mrs', role: 'School administrator' };

const CLASSES = [
  { id: 'c1', name: 'Grade R Sunbirds', phase: 'montessori', teacher: 'Mrs Wolff' },
  { id: 'c2', name: 'Grade 1A', phase: 'primary', teacher: 'Mr Webber' },
  { id: 'c3', name: 'Grade 3B', phase: 'primary', teacher: 'Mr Coulthard' },
  { id: 'c4', name: 'Grade 6A', phase: 'primary', teacher: 'Mr Rosberg' },
  { id: 'c6', name: 'Grade 5A', phase: 'primary', teacher: 'Mr Häkkinen' },
  { id: 'c5', name: 'Grade 8', phase: 'high', teacher: 'Mr Massa' },
];

const LEARNERS = [
  ['l1','Kimi Verstappen','c3','Jos Verstappen',93,'overdue',1250],
  ['l3','Lando Norris','c3','Zak Brown',88,'overdue',2100],
  ['l4','Oscar Piastri','c3','Andrea Stella',96,'paid',0],
  ['l5','George Russell','c3','Toto Wolff',98,'paid',0],
  ['l6','Yuki Tsunoda','c3','Laurent Mekies',91,'partial',600],
  ['l7','Alex Albon','c3','James Vowles',95,'paid',0],
  ['l8','Oliver Bearman','c3','Ayao Komatsu',99,'paid',0],
  ['l9','Isack Hadjar','c3','Alan Permane',90,'paid',0],
  ['l2','Max Verstappen','c4','Jos Verstappen',97,'paid',0],
  ['l10','Charles Leclerc','c4','Fred Vasseur',99,'paid',0],
  ['l11','Carlos Sainz','c4','Carlos Sainz Sr',85,'overdue',1850],
  ['l12','Pierre Gasly','c4','Flavio Briatore',94,'paid',0],
  ['l13','Esteban Ocon','c4','Otmar Szafnauer',92,'partial',450],
  ['l14','Lance Stroll','c4','Lawrence Stroll',97,'paid',0],
  ['l15','Liam Lawson','c4','Helmut Marko',89,'paid',0],
  ['l16','Gabriel Bortoleto','c2','Mattia Binotto',95,'partial',450],
  ['l17','Franco Colapinto','c2','Ross Brawn',97,'paid',0],
  ['l18','Jack Doohan','c2','Mick Doohan',93,'paid',0],
  ['l19','Logan Sargeant','c2','Jost Capito',96,'paid',0],
  ['l20','Nico Hulkenberg','c2','Jonathan Wheatley',87,'overdue',1850],
  ['l21','Valtteri Bottas','c1','Graeme Lowdon',94,'paid',0],
  ['l22','Sergio Perez','c1','Antonio Perez',91,'paid',0],
  ['l23','Kevin Magnussen','c1','Jan Magnussen',98,'paid',0],
  ['l24','Zhou Guanyu','c1','Alessandro Alunni Bravi',90,'partial',300],
  ['l25','Daniel Ricciardo','c1','Mike Krack',96,'paid',0],
  ['l26','Lewis Hamilton','c5','Anthony Hamilton',96,'paid',0],
  ['l27','Fernando Alonso','c5','Andy Cowell',92,'paid',0],
  ['l28','Sebastian Vettel','c5','Maurizio Arrivabene',95,'paid',0],
  ['l29','Jenson Button','c5','Martin Whitmarsh',88,'overdue',2400],
  ['l30','Kimi Raikkonen','c5','Ron Dennis',93,'paid',0],
  ['l31','Nyck de Vries','c6','Franz Tost',94,'paid',0],
  ['l32','Stoffel Vandoorne','c6','Eric Boullier',91,'paid',0],
  ['l33','Antonio Giovinazzi','c6','Frederic Vasseur',96,'partial',450],
  ['l34','Robert Kubica','c6','Guenther Steiner',89,'paid',0],
  ['l35','Romain Grosjean','c6','Cyril Abiteboul',92,'paid',0],
].map(([id, name, classId, parent, attendance, feeStatus, balance]) => ({ id, name, classId, parent, attendance, feeStatus, balance }));

const GRADE3_CLASS_SIZE = 26;
const SLIPS_RETURNED_SEED = 17;

const SENT_SEED = [
  { id: 'n1', title: 'Sports Day', audience: 'Whole school', date: dayOffset(-1), reach: 284, read: 211 },
  { id: 'n2', title: 'Grade 3 outing to Sci-Bono — consent needed', audience: 'Grade 3', date: dayOffset(-3), reach: 41, read: 37 },
  { id: 'n3', title: 'Fee statements sent', audience: 'Whole school', date: dayOffset(-5), reach: 284, read: 240 },
  { id: 'n4', title: 'Aqua School closed for maintenance', audience: 'Whole school', date: dayOffset(-8), reach: 284, read: 252 },
];

/* ---------------- Tuck shop ---------------- */

const SCHOOL_TODAY = schoolDay(0);

const TUCK_MENU = [
  { id: 'm3', name: 'Pizza Friday combo', desc: 'Any slice with a fruit juice', cat: 'Pizza', price: 35, icon: 'pizza', tone: '#2D1FA3', fridayOnly: true },
  { id: 'm1', name: 'Margherita pizza slice', desc: 'Tomato, mozzarella, fresh basil', cat: 'Pizza', price: 25, icon: 'pizza', tone: '#E0AE3C' },
  { id: 'm2', name: 'Chicken & mayo pizza slice', desc: 'A Whizzkidz favourite', cat: 'Pizza', price: 30, icon: 'pizza', tone: '#D3283E' },
  { id: 'm4', name: 'Toasted cheese & tomato', desc: 'On wholewheat bread', cat: 'Hot food', price: 22, icon: 'sandwich', tone: '#F39A3B' },
  { id: 'm5', name: 'Beef hot dog', desc: 'With tomato sauce', cat: 'Hot food', price: 24, icon: 'hotdog', tone: '#C2410C' },
  { id: 'm6', name: 'Fresh fruit cup', desc: 'Seasonal fruit', cat: 'Snacks', price: 15, icon: 'apple', tone: '#4FA83D' },
  { id: 'm7', name: 'Blueberry muffin', desc: 'Baked this morning', cat: 'Snacks', price: 14, icon: 'muffin', tone: '#7D5AB5' },
  { id: 'm8', name: 'Fruit juice 330ml', desc: 'Apple or orange', cat: 'Drinks', price: 12, icon: 'cup', tone: '#F39A3B' },
  { id: 'm9', name: 'Still water 500ml', desc: '', cat: 'Drinks', price: 10, icon: 'cup', tone: '#0B78C2' },
];
const TUCK_WALLET_SEED = 150;

const TUCK_SEED = [
  ['l3', { m1: 1, m8: 1 }], ['l4', { m2: 1 }], ['l5', { m1: 2 }], ['l6', { m4: 1, m9: 1 }], ['l7', { m5: 1, m8: 1 }],
  ['l8', { m6: 1 }], ['l10', { m2: 1, m8: 1 }], ['l11', { m1: 1 }], ['l12', { m7: 1, m8: 1 }], ['l14', { m5: 1 }],
  ['l16', { m1: 1, m9: 1 }], ['l17', { m6: 1, m7: 1 }], ['l19', { m4: 1 }], ['l22', { m1: 1 }], ['l26', { m2: 2 }], ['l28', { m5: 1, m8: 1 }],
].map(([learnerId, items], i) => ({ id: `seed-${learnerId}`, learnerId, items, date: SCHOOL_TODAY, status: 'ordered', seed: true }));

/* ---------------- Collection ---------------- */

const COLLECTORS = [
  { id: 'p1', name: 'Jos Verstappen', rel: 'Father', phone: '082 445 1290', car: 'Orange Ford Ranger' },
  { id: 'p2', name: 'Sophie Kumpen', rel: 'Mother', phone: '083 210 7745', car: 'Grey Toyota Fortuner' },
  { id: 'p3', name: 'Helmut Marko', rel: 'Family friend', phone: '072 908 3311', car: 'Silver Hyundai i20' },
  { id: 'p4', name: 'Adrian Newey', rel: 'Lift club', phone: '079 554 2018', car: 'Blue Kia Sorento' },
];

const PICKUP_SLOTS = [
  { id: 'end', label: 'End of school day' },
  { id: 'sport', label: 'After sport · 14:30' },
  { id: 'aftercare', label: 'Aftercare · 17:00' },
];

const CLASS_END = { c1: '12:00', c2: '12:30', c3: '12:20', c4: '12:50', c5: '13:30', c6: '12:50' };
const CARS = ['White Toyota Corolla', 'Red Suzuki Swift', 'Black Ford Ranger', 'Silver VW Polo', 'Grey Honda Jazz', 'White Hyundai Tucson', 'Blue Renault Kwid'];

/* ---------------- Merits, demerits & Student of the Week ---------------- */

const MERIT_CATEGORIES = [
  { id: 'kind', label: 'Kindness', points: 1, icon: 'heart', tone: '#E8445A' },
  { id: 'lead', label: 'Leadership', points: 2, icon: 'flag', tone: '#2D1FA3' },
  { id: 'academic', label: 'Academic excellence', points: 2, icon: 'book', tone: '#0B78C2' },
  { id: 'effort', label: 'Great effort', points: 1, icon: 'star', tone: '#C8901E' },
  { id: 'creative', label: 'Creativity', points: 1, icon: 'spark', tone: '#7D5AB5' },
  { id: 'sport', label: 'Sportsmanship', points: 1, icon: 'trophy', tone: '#1F8A4C' },
];
const DEMERIT_CATEGORIES = [
  { id: 'homework', label: 'Homework not handed in', points: 1 },
  { id: 'late', label: 'Late for class', points: 1 },
  { id: 'uniform', label: 'Uniform', points: 1 },
  { id: 'disrupt', label: 'Disruptive in class', points: 2 },
  { id: 'respect', label: 'Disrespectful behaviour', points: 2 },
];
const DEMERIT_MEETING_AT = 3;

const teacherOfClass = classId => CLASSES.find(c => c.id === classId).teacher;
const mRec = (learnerId, type, cat, points, day, note, extra = {}) => ({
  id: `seed-${learnerId}-${type}-${day}-${cat}`, learnerId, type, cat, points, note,
  by: teacherOfClass(LEARNERS.find(l => l.id === learnerId).classId), date: schoolDay(-day), ...extra,
});

const MERIT_SEED = [
  /* Max — 23 merits, so the next Leadership award unlocks Silver */
  mRec('l2', 'merit', 'lead', 2, 3, 'Led his group in the maths challenge'),
  mRec('l2', 'merit', 'academic', 2, 5, 'Top mark in the fractions test'),
  mRec('l2', 'merit', 'kind', 1, 6, 'Helped a new learner find his way around'),
  mRec('l2', 'merit', 'effort', 1, 8, 'Rewrote his essay without being asked'),
  mRec('l2', 'merit', 'lead', 2, 10, 'Organised the class clean-up'),
  mRec('l2', 'merit', 'sport', 1, 12, 'Great sportsmanship at soccer practice'),
  mRec('l2', 'merit', 'academic', 2, 14, 'Excellent science project'),
  mRec('l2', 'merit', 'kind', 1, 15, 'Shared his lunch with a friend'),
  mRec('l2', 'merit', 'creative', 1, 17, 'Imaginative poster for Heritage Day'),
  mRec('l2', 'merit', 'effort', 1, 19, 'Stayed after class to finish his project'),
  mRec('l2', 'merit', 'academic', 2, 21, 'Full marks in the spelling bee'),
  mRec('l2', 'merit', 'lead', 2, 23, 'Captained the class quiz team'),
  mRec('l2', 'merit', 'sport', 1, 24, 'Encouraged teammates at the gala'),
  mRec('l2', 'merit', 'kind', 1, 26, 'Comforted a classmate who was upset'),
  mRec('l2', 'merit', 'effort', 1, 27, 'Neat and complete homework all week'),
  mRec('l2', 'merit', 'creative', 1, 28, 'Original Scratch animation'),
  mRec('l2', 'merit', 'effort', 1, 29, 'Big improvement in handwriting'),
  mRec('l2', 'demerit', 'late', 1, 11, 'Arrived after the bell', { acked: true }),
  /* Kimi — 8 merits and one demerit waiting for acknowledgement */
  mRec('l1', 'merit', 'academic', 2, 1, 'Full marks in the spelling test'),
  mRec('l1', 'merit', 'kind', 1, 2, 'Helped tidy the reading corner'),
  mRec('l1', 'merit', 'effort', 1, 4, 'Worked hard on his times tables'),
  mRec('l1', 'merit', 'kind', 1, 7, 'Included a new friend at break'),
  mRec('l1', 'merit', 'creative', 1, 9, 'Beautiful bottle-cap artwork'),
  mRec('l1', 'merit', 'kind', 1, 13, 'Thanked the tuck shop staff'),
  mRec('l1', 'merit', 'creative', 1, 16, 'Lovely story in creative writing'),
  mRec('l1', 'demerit', 'homework', 1, 1, 'Recycled item for the class project was not brought in'),
  /* Everyone else — a believable spread for the staff class view */
  ...LEARNERS.filter(l => l.id !== 'l1' && l.id !== 'l2').flatMap((l, i) => {
    const merits = Array.from({ length: 4 + (i * 7) % 11 }, (_, k) => {
      const cat = MERIT_CATEGORIES[(i + k) % MERIT_CATEGORIES.length];
      return mRec(l.id, 'merit', cat.id, cat.points, 2 + (k * 3 + i) % 28, '');
    });
    const demerits = l.id === 'l11' ? 3 : l.id === 'l3' ? 2 : i % 5 === 1 ? 1 : 0;
    return [...merits, ...Array.from({ length: demerits }, (_, k) => mRec(l.id, 'demerit', DEMERIT_CATEGORIES[(i + k) % 3].id, 1, 3 + k * 6, '', { acked: k > 0 }))];
  }),
];

function weekStartISO(iso){ const d = parseISO(iso); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return isoOf(d); }
const THIS_WEEK = weekStartISO(SCHOOL_TODAY);
const weeksAgo = n => { const d = parseISO(THIS_WEEK); d.setDate(d.getDate() - 7 * n); return isoOf(d); };
const sotw = (week, classId, learnerId, reason) => ({ id: `sotw-${week}-${classId}`, week, classId, learnerId, reason, by: teacherOfClass(classId) });

const SOTW_SEED = [
  sotw(THIS_WEEK, 'c1', 'l23', 'Always the first to help tidy up after play time'),
  sotw(THIS_WEEK, 'c2', 'l18', 'Read his first chapter book all by himself'),
  sotw(THIS_WEEK, 'c5', 'l27', 'Mentored the Grade 6s during the coding club'),
  sotw(weeksAgo(1), 'c3', 'l4', 'Outstanding effort in the maths olympiad'),
  sotw(weeksAgo(1), 'c4', 'l10', 'Brilliant science fair project'),
  sotw(weeksAgo(1), 'c1', 'l21', 'Kind and patient with the younger children'),
  sotw(weeksAgo(2), 'c3', 'l5', 'Led the class assembly with confidence'),
  sotw(weeksAgo(2), 'c4', 'l14', 'Huge improvement in his reading'),
  sotw(weeksAgo(3), 'c4', 'l2', 'Organised the class market day and raised R1 200 for charity'),
  sotw(weeksAgo(3), 'c3', 'l7', 'Always encouraging his classmates'),
];
const SOTW_REASONS = ['Kindness to others', 'Outstanding effort', 'Leadership in class', 'Academic excellence', 'Always helpful', 'Big improvement'];

/* ---------------- Staff accounts, department, moderation & observations ---------------- */

const STAFF_ACCOUNTS = {
  teacher: { id: 't-rosberg', title: 'Mr', name: 'Nico Rosberg', short: 'Mr Rosberg', role: 'Class teacher · Grade 6A', classId: 'c4', subjects: ['Mathematics', 'English', 'Natural Sciences'], grade: 'Grade 6' },
  hod: { id: 't-hakkinen', title: 'Mr', name: 'Mika Häkkinen', short: 'Mr Häkkinen', role: 'HOD Intermediate Phase · Grade 5A', classId: 'c6', subjects: ['Mathematics', 'Technology'], grade: 'Grade 5', hod: true },
};
const DEPARTMENT = {
  name: 'Intermediate Phase', grades: 'Grades 4–6',
  teachers: [
    { id: 't-chadwick', name: 'Ms Chadwick', full: 'Jamie Chadwick', cls: 'Grade 4A' },
    { id: 't-hakkinen', name: 'Mr Häkkinen', full: 'Mika Häkkinen', cls: 'Grade 5A', hod: true },
    { id: 't-rosberg', name: 'Mr Rosberg', full: 'Nico Rosberg', cls: 'Grade 6A' },
  ],
};
const deptTeacher = id => DEPARTMENT.teachers.find(t => t.id === id);

const STAFF_NOTICES = [
  { id: 'sn1', title: 'Term 4 papers due for moderation', body: `All Intermediate Phase exam papers and memos must be submitted for moderation by ${fmtLong(schoolDay(4))}.`, from: 'Mr Häkkinen · HOD', date: dayOffset(-2) },
  { id: 'sn2', title: 'Exam timetable published', body: 'The Term 4 exam timetable is in the staff room and on the calendar. Invigilation duties follow on Monday.', from: 'Office', date: dayOffset(-4) },
  { id: 'sn3', title: 'Staff meeting Wednesday 14:00', body: 'Agenda: year-end reports, prize-giving and the Grade 7 farewell.', from: 'Principal', date: dayOffset(-6) },
];

const MOD_CHECKLIST = [
  { id: 'caps', label: 'Aligned to CAPS content for the term' },
  { id: 'cog', label: 'Cognitive levels are balanced' },
  { id: 'marks', label: 'Mark allocation is correct and totals add up' },
  { id: 'memo', label: 'Memorandum is complete and accurate' },
  { id: 'lang', label: 'Instructions and language are clear' },
  { id: 'layout', label: 'Layout, numbering and diagrams are correct' },
  { id: 'time', label: 'Time allocation is appropriate' },
];
const COG_LEVELS = [
  { id: 'k', label: 'Knowledge', target: 25 },
  { id: 'r', label: 'Routine procedures', target: 45 },
  { id: 'c', label: 'Complex procedures', target: 20 },
  { id: 'p', label: 'Problem solving', target: 10 },
];

const SAMPLE_PAPERS = {
  'Mathematics': [
    ['Whole numbers: place value, rounding and ordering', 12], ['Common fractions and decimals', 15], ['Calculations with all four operations', 14],
    ['Geometric patterns and number sentences', 10], ['2D shapes, symmetry and transformations', 12], ['Measurement: length, mass and capacity', 12], ['Data handling: bar graph interpretation', 10], ['Word problems', 15],
  ],
  'English': [['Comprehension: unseen text', 20], ['Visual literacy: advertisement', 10], ['Summary writing', 10], ['Language structures and conventions', 20]],
  'Natural Sciences': [['Solids, liquids and gases', 12], ['Mixtures and solutions', 12], ['Electric circuits', 14], ['Energy transfer', 12]],
  'Technology': [['Structures and forces', 15], ['Systems and control', 15], ['Design process', 20]],
};

const mods = (id, teacherId, title, subject, grade, type, marks, minutes, status, versions, reviews, daysAgo) =>
  ({ id, teacherId, title, subject, grade, type, marks, minutes, status, versions, reviews, at: dayOffset(-daysAgo) });
const sampleFiles = () => [{ kind: 'paper', name: 'Question paper', sample: true }, { kind: 'memo', name: 'Memorandum', sample: true }];
const fullCheck = ok => Object.fromEntries(MOD_CHECKLIST.map(c => [c.id, { ok, comment: '' }]));

const MOD_SEED = [
  mods('mod-1', 't-rosberg', 'Natural Sciences · Term 4 Test', 'Natural Sciences', 'Grade 6', 'Test', 50, 60, 'approved',
    [{ v: 1, files: sampleFiles(), note: '', at: dayOffset(-12) }],
    [{ v: 1, by: 'Mr Häkkinen', at: dayOffset(-10), decision: 'approved', checklist: fullCheck(true), cog: { k: 24, r: 46, c: 20, p: 10 }, comments: 'Well balanced paper and a clear memo. Approved.' }], 12),
  mods('mod-2', 't-rosberg', 'English HL · Comprehension Test', 'English', 'Grade 6', 'Test', 40, 45, 'changes',
    [{ v: 1, files: sampleFiles(), note: 'Based on the Term 4 reading text.', at: dayOffset(-5) }],
    [{ v: 1, by: 'Mr Häkkinen', at: dayOffset(-3), decision: 'changes',
       checklist: { ...fullCheck(true), cog: { ok: false, comment: 'Too many knowledge questions — add two higher-order questions in section A.' }, marks: { ok: false, comment: 'Question 4 is out of 6 but the memo allocates 8.' } },
       cog: { k: 40, r: 40, c: 15, p: 5 }, comments: 'Good text choice. Please rebalance the cognitive levels and fix the mark allocation in question 4, then resubmit.' }], 5),
  mods('mod-3', 't-chadwick', 'English HL · Term 4 Exam Paper 1', 'English', 'Grade 4', 'Exam', 60, 90, 'submitted',
    [{ v: 1, files: sampleFiles(), note: 'Paper 1 covers comprehension and language.', at: dayOffset(-1) }], [], 1),
  mods('mod-4', 't-chadwick', 'Mathematics · Term 4 Test', 'Mathematics', 'Grade 4', 'Test', 40, 60, 'approved',
    [{ v: 1, files: sampleFiles(), note: '', at: dayOffset(-15) }],
    [{ v: 1, by: 'Mr Häkkinen', at: dayOffset(-13), decision: 'approved', checklist: fullCheck(true), cog: { k: 25, r: 45, c: 20, p: 10 }, comments: 'Approved — great use of diagrams.' }], 15),
];

const OBS_CRITERIA = [
  { id: 'plan', label: 'Lesson planning and preparation' },
  { id: 'engage', label: 'Learner engagement and questioning' },
  { id: 'assess', label: 'Assessment for learning' },
  { id: 'manage', label: 'Classroom management' },
];
const OBS_FOCUS = ['Learner engagement and questioning', 'Assessment for learning', 'Differentiation', 'Classroom management', 'Use of resources'];
const OBS_SEED = [
  { id: 'obs-1', teacherId: 't-rosberg', by: 'Mr Häkkinen', date: schoolDay(3), time: '09:10', cls: 'Grade 6A', subject: 'Mathematics', focus: 'Learner engagement and questioning', type: 'QMS lesson observation', status: 'requested', at: dayOffset(-1) },
  { id: 'obs-2', teacherId: 't-chadwick', by: 'Mr Häkkinen', date: schoolDay(5), time: '10:20', cls: 'Grade 4A', subject: 'English', focus: 'Differentiation', type: 'QMS lesson observation', status: 'accepted', at: dayOffset(-4) },
  { id: 'obs-3', teacherId: 't-rosberg', by: 'Mr Häkkinen', date: schoolDay(-30), time: '08:20', cls: 'Grade 6A', subject: 'Natural Sciences', focus: 'Assessment for learning', type: 'QMS lesson observation', status: 'acknowledged', at: dayOffset(-46),
    feedback: { ratings: { plan: 4, engage: 3, assess: 4, manage: 4 }, strengths: 'Clear objectives and excellent use of practical demonstrations.', growth: 'Give learners more wait time before taking answers.', at: dayOffset(-40) },
    reflection: 'I will use think-pair-share to build in more wait time.' },
];
