/* Demo data + icons registry */
const DEMO = {
  name: "Sultan AlFaifi",
  highlights: "KAUST AI Program · McKinsey Forward Fellow · SCE Member",
  email: "sultan@example.com",
  phone: "0599999999",
  social: "linkedin.com/in/alfaifi-sultan",
  location: "Makkah, KSA",
  summary: "Software engineer with 5+ years building scalable web apps. I care about thoughtful UX, clean architecture, and shipping things people actually use.",
  skills: [
    { category: "Languages", items: "Python, JavaScript, TypeScript, Java" },
    { category: "Tools & Frameworks", items: "React, Node.js, Git, Figma, Docker" },
    { category: "Soft Skills", items: "Leadership, Mentoring, Technical Writing" },
  ],
  projects: [
    { title: "Hajj & Umrah Guide App", role: "Lead Developer", start: "Mar 2021", end: "Nov 2021", bullets: [
      "Built a cross-platform mobile application to assist pilgrims during Hajj season.",
      "Integrated live maps and offline features for accessibility in low-signal areas.",
    ]},
    { title: "Masari — CV Builder", role: "Creator", start: "Jan 2024", end: "Present", bullets: [
      "Designed and shipped an Arabic-first resume builder used by 10k+ users.",
      "Implemented client-side PDF generation with custom font embedding.",
    ]},
  ],
  experience: [
    { company: "Tech Solutions Co.", role: "Software Engineer", location: "Makkah, KSA", start: "Jan 2022", end: "Present", bullets: [
      "Developed scalable web applications serving thousands of users.",
      "Optimized database queries, reducing average load times by 40%.",
      "Mentored 3 junior engineers through structured code reviews.",
    ]},
  ],
  education: [
    { school: "Umm Al-Qura University", degree: "B.S. in Computer Science", location: "Makkah, KSA", start: "Aug 2017", end: "May 2021", bullets: [
      "GPA: 4.0 / 5.0 · First Class Honors",
      "Coursework: Data Structures, Web Engineering, AI Foundations",
    ]},
  ],
  certifications: [
    { title: "AWS Certified Developer — Associate", issuer: "Amazon Web Services", date: "Mar 2022" },
  ],
  awards: [
    { title: "First Place — Hackathon Makkah", issuer: "", date: "Sept 2020", detail: "Led a team of 4 to build an innovative crowd-management AI solution." },
  ],
  volunteering: [
    { org: "Grand Mosque Visitors Care", role: "Mentor & Tech Support", date: "Ramadan 2019", bullets: [
      "Assisted elderly pilgrims with digital apps and wayfinding.",
    ]},
  ],
};

const SECTIONS = [
  { id: "personal",      label: "البيانات الشخصية", short: "الرئيسية", icon: "user", pinned: true },
  { id: "summary",       label: "النبذة",           short: "نبذة",     icon: "file-text" },
  { id: "skills",        label: "المهارات",          short: "مهارات",   icon: "terminal" },
  { id: "projects",      label: "المشاريع",          short: "مشاريع",   icon: "layout" },
  { id: "experience",    label: "الخبرات المهنية",   short: "خبرات",    icon: "briefcase" },
  { id: "education",     label: "المؤهلات التعليمية",short: "تعليم",    icon: "graduation" },
  { id: "certifications",label: "الشهادات المهنية",  short: "شهادات",   icon: "award" },
  { id: "awards",        label: "الجوائز والإنجازات",short: "جوائز",    icon: "star" },
  { id: "volunteering",  label: "الأعمال التطوعية",  short: "تطوع",    icon: "heart" },
];

Object.assign(window, { DEMO, SECTIONS });
