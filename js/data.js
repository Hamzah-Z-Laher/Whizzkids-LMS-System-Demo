/* Demo data for the Whizzkidz Academy prototype.
   All dates are relative to the day the demo is opened so it never looks stale. */

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
  title: 'Mrs', first: 'Naledi', last: 'Khumalo',
  name: 'Naledi Khumalo',
  email: 'naledi.khumalo@example.com',
  phone: '082 445 1290',
};

const FAMILY_ACCOUNT = {
  number: 'WKA-20419',
  name: 'Khumalo family',
  dueDate: dayOffset(-4),
  bank: { name: 'Demo Bank', account: '0000 000 000', branch: '000000', reference: 'WKA-20419' },
};

const CHILDREN = [
  { id: 'amahle', first: 'Amahle', name: 'Amahle Khumalo', grade: 'Grade 3', className: '3B', classId: 'c3', learnerId: 'l1',
    phase: 'primary', teacher: 'Mrs Van Wyk', aqua: true },
  { id: 'tiyani', first: 'Tiyani', name: 'Tiyani Khumalo', grade: 'Grade 6', className: '6A', classId: 'c4', learnerId: 'l2',
    phase: 'primary', teacher: 'Mr Botha', aqua: false },
];

/* Attendance: every school day this term is "present" unless listed here (offset in school days). */
const ATTENDANCE_EXCEPTIONS = {
  amahle: [
    { day: -3, status: 'late', note: 'Arrived 08:20' },
    { day: -6, status: 'absent', note: 'Sick note submitted' },
    { day: -14, status: 'late', note: 'Arrived 07:55' },
    { day: -19, status: 'absent', note: 'Doctor\'s appointment' },
  ],
  tiyani: [
    { day: -9, status: 'absent', note: 'Dentist appointment' },
    { day: -22, status: 'late', note: 'Arrived 07:50' },
  ],
};
const TERM_SCHOOL_DAYS = 30;

const TIMETABLE = {
  amahle: {
    Mon: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:45','Afrikaans','B3'],['09:45','10:05','Break',''],['10:05','10:50','Life Skills','B3'],['10:50','11:35','Creative Arts','Art studio'],['11:35','12:20','Natural Sciences','B3']],
    Tue: [['07:30','08:15','English','B3'],['08:15','09:00','Mathematics','B3'],['09:00','09:45','Natural Sciences','B3'],['09:45','10:05','Break',''],['10:05','10:50','Physical Education','Field'],['10:50','11:35','Music','Music room'],['11:35','12:20','Afrikaans','B3']],
    Wed: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:45','Afrikaans','B3'],['09:45','10:05','Break',''],['10:05','10:50','Social Sciences','B3'],['10:50','11:35','Swimming','Aqua School'],['11:35','12:20','Life Skills','B3']],
    Thu: [['07:30','08:15','English','B3'],['08:15','09:00','Mathematics','B3'],['09:00','09:45','Life Skills','B3'],['09:45','10:05','Break',''],['10:05','10:50','Creative Arts','Art studio'],['10:50','11:35','Natural Sciences','B3'],['11:35','12:20','Afrikaans','B3']],
    Fri: [['07:30','08:15','Mathematics','B3'],['08:15','09:00','English','B3'],['09:00','09:40','Assembly','Hall'],['09:40','10:00','Break',''],['10:00','10:45','Physical Education','Field'],['10:45','11:30','Music','Music room']],
  },
  tiyani: {
    Mon: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','10:00','Technology','Computer lab'],['10:00','10:20','Break',''],['10:20','11:10','Natural Sciences','A5'],['11:10','12:00','Afrikaans','A5'],['12:00','12:50','Social Sciences','A5']],
    Tue: [['07:30','08:20','English','A5'],['08:20','09:10','Mathematics','A5'],['09:10','10:00','Social Sciences','A5'],['10:00','10:20','Break',''],['10:20','11:10','Physical Education','Field'],['11:10','12:00','Creative Arts','Art studio'],['12:00','12:50','Afrikaans','A5']],
    Wed: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','10:00','Afrikaans','A5'],['10:00','10:20','Break',''],['10:20','11:10','Swimming','Aqua School'],['11:10','12:00','Life Skills','A5'],['12:00','12:50','Natural Sciences','A5']],
    Thu: [['07:30','08:20','Technology','Computer lab'],['08:20','09:10','Mathematics','A5'],['09:10','10:00','English','A5'],['10:00','10:20','Break',''],['10:20','11:10','Natural Sciences','A5'],['11:10','12:00','Music','Music room'],['12:00','12:50','Mathematics','A5']],
    Fri: [['07:30','08:20','Mathematics','A5'],['08:20','09:10','English','A5'],['09:10','09:50','Assembly','Hall'],['09:50','10:10','Break',''],['10:10','11:00','Physical Education','Field'],['11:00','11:50','Social Sciences','A5']],
  },
};

const HOMEWORK = {
  amahle: [
    { id: 'h1', subject: 'Mathematics', title: 'Times tables 2–5 worksheet', note: 'Complete both sides. Show your working on the back.', due: schoolDay(1) },
    { id: 'h2', subject: 'English', title: 'Reading log — 15 minutes a night', note: 'Parent to sign the log each evening.', due: schoolDay(3) },
    { id: 'h3', subject: 'Life Skills', title: 'Bring one clean recycled item for the class project', note: 'Bottle caps, cardboard tubes or clean tins.', due: schoolDay(-1) },
    { id: 'h4', subject: 'Afrikaans', title: 'Woordeskat: leer 10 nuwe woorde', note: 'Spelling test on the words next week.', due: schoolDay(-4), done: true },
  ],
  tiyani: [
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
  { date: dayOffset(-58), desc: 'School fees — Amahle', amount: 1850 },
  { date: dayOffset(-58), desc: 'School fees — Tiyani', amount: 1850 },
  { date: dayOffset(-55), desc: 'Payment received — EFT', amount: -3700 },
  { date: dayOffset(-40), desc: 'Aqua School term fee — Amahle', amount: 450 },
  { date: dayOffset(-28), desc: 'School fees — Amahle', amount: 1850 },
  { date: dayOffset(-28), desc: 'School fees — Tiyani', amount: 1850 },
  { date: dayOffset(-24), desc: 'Payment received — EFT', amount: -2900 },
];

const THREADS = [
  { id: 't1', childId: 'amahle', with: 'Mrs Van Wyk', role: 'Class teacher, 3B', messages: [
    { from: 'them', text: 'Good afternoon Mrs Khumalo. Amahle got full marks in today\'s spelling test — she was very proud of herself!', when: 'Yesterday, 14:05' },
    { from: 'me', text: 'That\'s lovely to hear, thank you for letting me know.', when: 'Yesterday, 15:40' },
  ]},
  { id: 't2', childId: 'tiyani', with: 'Mr Botha', role: 'Class teacher, 6A', messages: [
    { from: 'them', text: 'A reminder that Tiyani\'s Scratch project is due next week. He\'s welcome to use the computer lab at break if he needs more time.', when: 'Mon, 09:12' },
  ]},
  { id: 't3', childId: null, with: 'School office', role: 'Fees & admin', messages: [
    { from: 'them', text: 'Hello Mrs Khumalo, a friendly reminder that the account shows R1 250,00 outstanding. Let us know if you\'d like to arrange a payment plan.', when: 'Tue, 11:30' },
  ]},
];

/* ---------------- Staff side ---------------- */

const STAFF_USER = { name: 'Sharon Govender', title: 'Mrs', role: 'School administrator' };

const CLASSES = [
  { id: 'c1', name: 'Grade R Sunbirds', phase: 'montessori', teacher: 'Mrs Patel' },
  { id: 'c2', name: 'Grade 1A', phase: 'primary', teacher: 'Mrs Nkosi' },
  { id: 'c3', name: 'Grade 3B', phase: 'primary', teacher: 'Mrs Van Wyk' },
  { id: 'c4', name: 'Grade 6A', phase: 'primary', teacher: 'Mr Botha' },
  { id: 'c5', name: 'Grade 8', phase: 'high', teacher: 'Mr Adams' },
];

const LEARNERS = [
  ['l1','Amahle Khumalo','c3','Naledi Khumalo',93,'overdue',1250],
  ['l3','Liam Fourie','c3','Johan Fourie',88,'overdue',2100],
  ['l4','Keabetswe Molefe','c3','Thabo Molefe',96,'paid',0],
  ['l5','Ayaan Moosa','c3','Fatima Moosa',98,'paid',0],
  ['l6','Lerato Nkosi','c3','Grace Nkosi',91,'partial',600],
  ['l7','Daniel Pretorius','c3','Elmarie Pretorius',95,'paid',0],
  ['l8','Zara Ismail','c3','Yusuf Ismail',99,'paid',0],
  ['l9','Thabo Mokoena','c3','Lindiwe Mokoena',90,'paid',0],
  ['l2','Tiyani Khumalo','c4','Naledi Khumalo',97,'paid',0],
  ['l10','Zinhle Dlamini','c4','Precious Dlamini',99,'paid',0],
  ['l11','Sipho Mahlangu','c4','Bongani Mahlangu',85,'overdue',1850],
  ['l12','Mia Jacobs','c4','Carmen Jacobs',94,'paid',0],
  ['l13','Yusuf Cassim','c4','Ridwaan Cassim',92,'partial',450],
  ['l14','Palesa Sithole','c4','Mpho Sithole',97,'paid',0],
  ['l15','Ethan Naidoo','c4','Kavitha Naidoo',89,'paid',0],
  ['l16','Ethan Pillay','c2','Reshma Pillay',95,'partial',450],
  ['l17','Aisha Patel','c2','Nadia Patel',97,'paid',0],
  ['l18','Kagiso Radebe','c2','Lesego Radebe',93,'paid',0],
  ['l19','Emma Coetzee','c2','Anri Coetzee',96,'paid',0],
  ['l20','Lwazi Ndlovu','c2','Zanele Ndlovu',87,'overdue',1850],
  ['l21','Nia Mthembu','c1','Ayanda Mthembu',94,'paid',0],
  ['l22','Reuben Govender','c1','Priya Govender',91,'paid',0],
  ['l23','Imaan Khan','c1','Saira Khan',98,'paid',0],
  ['l24','Bokang Tau','c1','Dineo Tau',90,'partial',300],
  ['l25','Lily Smit','c1','Marike Smit',96,'paid',0],
  ['l26','Chloe van der Merwe','c5','Liezl van der Merwe',96,'paid',0],
  ['l27','Musa Zwane','c5','Sifiso Zwane',92,'paid',0],
  ['l28','Hannah Davids','c5','Fiona Davids',95,'paid',0],
  ['l29','Rayyan Essop','c5','Zubair Essop',88,'overdue',2400],
  ['l30','Kamo Molete','c5','Refilwe Molete',93,'paid',0],
].map(([id, name, classId, parent, attendance, feeStatus, balance]) => ({ id, name, classId, parent, attendance, feeStatus, balance }));

const GRADE3_CLASS_SIZE = 26;
const SLIPS_RETURNED_SEED = 17;

const SENT_SEED = [
  { id: 'n1', title: 'Sports Day', audience: 'Whole school', date: dayOffset(-1), reach: 284, read: 211 },
  { id: 'n2', title: 'Grade 3 outing to Sci-Bono — consent needed', audience: 'Grade 3', date: dayOffset(-3), reach: 41, read: 37 },
  { id: 'n3', title: 'Fee statements sent', audience: 'Whole school', date: dayOffset(-5), reach: 284, read: 240 },
  { id: 'n4', title: 'Aqua School closed for maintenance', audience: 'Whole school', date: dayOffset(-8), reach: 284, read: 252 },
];
