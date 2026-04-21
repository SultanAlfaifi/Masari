/* Main app */

const EMPTY = {
  name: "", highlights: "", email: "", phone: "", social: "", location: "",
  summary: "",
  skills: [], projects: [], experience: [], education: [],
  certifications: [], awards: [], volunteering: [],
};

const SECTION_COMPONENTS = {
  personal: PersonalSection,
  summary: SummarySection,
  skills: SkillsSection,
  projects: ProjectsSection,
  experience: ExperienceSection,
  education: EducationSection,
  certifications: CertificationsSection,
  awards: AwardsSection,
  volunteering: VolunteeringSection,
};

function computeCompletion(data) {
  let filled = 0, total = 0;
  const check = (v) => { total++; if (v && String(v).trim()) filled++; };
  check(data.name); check(data.email); check(data.phone); check(data.location);
  check(data.summary);
  total++; if (data.skills?.length > 0) filled++;
  total++; if (data.experience?.length > 0) filled++;
  total++; if (data.education?.length > 0) filled++;
  total++; if (data.projects?.length > 0) filled++;
  return Math.min(100, (filled / total) * 100);
}

/* Ensure pinned sections (personal) stay at top of order */
function normalizeOrder(order) {
  const byId = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
  const pinned = SECTIONS.filter(s => s.pinned).map(s => s.id);
  const valid = order.filter(id => byId[id]);
  const rest = valid.filter(id => !pinned.includes(id));
  return [...pinned, ...rest];
}

function App() {
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("masari_data_v2")) || DEMO; } catch { return DEMO; }
  });
  const [current, setCurrent] = useState(() => localStorage.getItem("masari_section_v2") || "personal");
  const [template, setTemplate] = useState(() => localStorage.getItem("masari_template_v2") || "modern");
  const [cvSize, setCvSize] = useState(() => localStorage.getItem("masari_cvSize") || "md");
  const [cvSpacing, setCvSpacing] = useState(() => localStorage.getItem("masari_cvSpacing") || "comfy");
  const [sectionOrder, setSectionOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("masari_section_order_v2"));
      if (Array.isArray(saved) && saved.length === SECTIONS.length) return normalizeOrder(saved);
    } catch {}
    return normalizeOrder(SECTIONS.map(s => s.id));
  });
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Track Start Using
  useEffect(() => {
    if (!sessionStorage.getItem("masari_start_time")) {
      sessionStorage.setItem("masari_start_time", Date.now());
      if (window.gtag) {
        window.gtag("event", "start_using", {
          event_category: "Engagement",
          event_label: "بدء الاستخدام"
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("masari_cvSize", cvSize);
    localStorage.setItem("masari_cvSpacing", cvSpacing);
  }, [cvSize, cvSpacing]);

  useEffect(() => { localStorage.setItem("masari_data_v2", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("masari_section_v2", current); }, [current]);
  useEffect(() => { 
    localStorage.setItem("masari_template_v2", template); 
    if (window.gtag) {
      window.gtag("event", "template_selected", {
        event_category: "Customization",
        template_name: template,
        event_label: "احصائية لكل قالب"
      });
    }
  }, [template]);
  useEffect(() => { localStorage.setItem("masari_section_order_v2", JSON.stringify(sectionOrder)); }, [sectionOrder]);

  const orderedSections = useMemo(() => {
    const byId = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
    return sectionOrder.map(id => byId[id]).filter(Boolean);
  }, [sectionOrder]);

  // Move a non-pinned section by +/-1 in the order
  const moveSection = (id, dir) => {
    setSectionOrder(prev => {
      const byId = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
      if (byId[id]?.pinned) return prev;
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      if (byId[prev[j]]?.pinned) return prev; // can't swap with pinned
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return normalizeOrder(next);
    });
  };

  // Drag-drop reorder: place dragged id before/after target id
  const reorderSections = (draggedId, targetId) => {
    setSectionOrder(prev => {
      const byId = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
      if (byId[draggedId]?.pinned || byId[targetId]?.pinned) return prev;
      const next = prev.filter(id => id !== draggedId);
      const tIdx = next.indexOf(targetId);
      if (tIdx < 0) return prev;
      next.splice(tIdx, 0, draggedId);
      return normalizeOrder(next);
    });
  };

  // Reset section order to default
  const resetOrder = () => {
    setConfirmDialog({
      isOpen: true,
      title: "استعادة الترتيب",
      message: "هل تريد إعادة ترتيب الأقسام للوضع الافتراضي؟ قد يؤثر ذلك على ترتيب العناصر الحالية.",
      confirmLabel: "استعادة",
      isDanger: false,
      onConfirm: () => {
        setSectionOrder(normalizeOrder(SECTIONS.map(s => s.id)));
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => setConfirmDialog(c => ({...c, isOpen: false}))
    });
  };

  // Lock conservative theme
  useEffect(() => { document.documentElement.dataset.theme = "conservative"; }, []);

  const counts = useMemo(() => ({
    skills: data.skills?.length || 0,
    projects: data.projects?.length || 0,
    experience: data.experience?.length || 0,
    education: data.education?.length || 0,
    certifications: data.certifications?.length || 0,
    awards: data.awards?.length || 0,
    volunteering: data.volunteering?.length || 0,
  }), [data]);

  const completion = useMemo(() => computeCompletion(data), [data]);

  const Section = SECTION_COMPONENTS[current];
  const currentMeta = SECTIONS.find(s => s.id === current);
  const idx = orderedSections.findIndex(s => s.id === current);
  const prev = () => { if (idx > 0) setCurrent(orderedSections[idx - 1].id); };
  const next = () => { if (idx < orderedSections.length - 1) setCurrent(orderedSections[idx + 1].id); };

  const onDemo = () => {
    setConfirmDialog({
      isOpen: true,
      title: "بيانات تجريبية",
      message: "تعبئة الحقول ببيانات تجريبية؟ سيتم استبدال وحذف البيانات الحالية بشكل كامل.",
      confirmLabel: "تعبئة تجريبية",
      isDanger: false,
      onConfirm: () => {
        setData(DEMO);
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => setConfirmDialog(c => ({...c, isOpen: false}))
    });
  };

  const onClear = () => {
    setConfirmDialog({
      isOpen: true,
      title: "تفريغ السيرة",
      message: "هل أنت متأكد من مسح جميع البيانات بشكل كامل؟ لا يمكن التراجع عن هذه الخطوة.",
      confirmLabel: "تفريغ السيرة",
      isDanger: true,
      onConfirm: () => {
        setData(EMPTY);
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => setConfirmDialog(c => ({...c, isOpen: false}))
    });
  };

  const onDownload = () => {
    if (!window.pdfMake) { alert("مكتبة PDF غير محملة بعد، انتظر قليلاً وحاول مجدداً."); return; }
    
    if (window.gtag) {
      window.gtag("event", "download_pdf", {
        event_category: "Engagement",
        event_label: "تحميل PDF"
      });
      
      const comp = computeCompletion(data);
      if (comp >= 50) {
        window.gtag("event", "complete_cv", {
          event_category: "Achievement",
          event_label: "إكمال السيرة",
          value: Math.round(comp)
        });
      }

      const startTime = sessionStorage.getItem("masari_start_time");
      if (startTime) {
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        window.gtag("event", "time_to_download", {
          event_category: "Time",
          event_label: "كم استغرق الوقت من البدء حتى تحميل السيرة",
          value: durationSeconds
        });
      }
    }

    const d = data;
    const joinDates = (s, e) => (!s && !e) ? "" : (s && e) ? `${s} — ${e}` : (s || e);

    const sectionIds = (sectionOrder || []).filter(id => id !== "personal");
    const CV_TITLES_AR = {
      summary:"Summary", skills:"Skills", projects:"Projects",
      experience:"Experience", education:"Education",
      certifications:"Certifications", awards:"Awards & Honors", volunteering:"Volunteering"
    };

    const content = [];
    const contactParts = [d.phone, d.email, d.social, d.location].filter(Boolean);

    // ====== CLASSIC ======
    if (template === "classic") {
      content.push({ text: d.name || "Your Name", fontSize: 24, bold: true, alignment: 'center', margin: [0,0,0,4], characterSpacing: -0.4 });
      if (d.highlights) content.push({ text: d.highlights, fontSize: 11, bold: true, color: '#444', alignment: 'center', margin: [0,0,0,6] });
      if (contactParts.length) {
        content.push({
          text: contactParts.join('  ·  '), fontSize: 10, color: '#333', alignment: 'center', margin: [0,0,0,14]
        });
      }

      const secTitle = (t) => ({
        text: t.toUpperCase(), fontSize: 11.5, bold: true, alignment: 'left',
        margin: [0, 14, 0, 2], characterSpacing: 0.5
      });
      const secLine = () => content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#ddd' }], margin: [0,0,0,6] });
      const bullets = (arr) => (arr || []).filter(Boolean).map(b => ({ text: `• ${b}`, fontSize: 10, color: '#111', margin: [16, 0, 0, 2], lineHeight: 1.4 }));

      sectionIds.forEach(id => {
        let hasContent = [d.summary, d.skills, d.projects, d.experience, d.education, d.certifications, d.awards, d.volunteering].some(x => id === 'summary' ? d.summary : (id === 'skills' ? d.skills?.length : (id === 'projects' ? d.projects?.length : (id === 'experience' ? d.experience?.length : (id === 'education' ? d.education?.length : (id === 'certifications' ? d.certifications?.length : (id === 'awards' ? d.awards?.length : (id === 'volunteering' ? d.volunteering?.length : false))))))));
        if (!hasContent) return;

        content.push(secTitle(CV_TITLES_AR[id]));
        secLine();

        if (id === 'summary' && d.summary) content.push({ text: d.summary, fontSize: 10.5, color: '#111', margin: [0,0,0,8], lineHeight: 1.4 });
        if (id === 'skills' && d.skills?.length) {
          d.skills.forEach(s => content.push({ text: [{ text: s.category + ': ', bold: true, color: '#111' }, { text: s.items }], fontSize: 10, margin: [0,0,0,2] }));
          content.push({ text: '', margin: [0,0,0,8] });
        }
        if (id === 'projects' && d.projects?.length) d.projects.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11 }, { text: joinDates(p.start, p.end), fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ columns: [{ text: p.role, italics: true, fontSize: 10, color: '#444' }, { text: '', fontSize: 10, color: '#444', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'experience' && d.experience?.length) d.experience.forEach(p => {
          content.push({ columns: [{ text: p.company, bold: true, fontSize: 11 }, { text: joinDates(p.start, p.end), fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          content.push({ columns: [{ text: p.role, italics: true, fontSize: 10, color: '#444' }, { text: p.location, fontSize: 10, color: '#444', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'education' && d.education?.length) d.education.forEach(p => {
          content.push({ columns: [{ text: p.school, bold: true, fontSize: 11 }, { text: joinDates(p.start, p.end), fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          content.push({ columns: [{ text: p.degree, italics: true, fontSize: 10, color: '#444' }, { text: p.location, fontSize: 10, color: '#444', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'certifications' && d.certifications?.length) d.certifications.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11 }, { text: p.date, fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          if (p.issuer) content.push({ text: p.issuer, fontSize: 10, color: '#444', margin: [0,0,0,3] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'awards' && d.awards?.length) d.awards.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11 }, { text: p.date, fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          if (p.detail) content.push({ text: `• ${p.detail}`, fontSize: 10, color: '#111', margin: [16,0,0,3] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'volunteering' && d.volunteering?.length) d.volunteering.forEach(p => {
          content.push({ columns: [{ text: p.org, bold: true, fontSize: 11 }, { text: p.date, fontSize: 11, bold: true, alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ columns: [{ text: p.role, italics: true, fontSize: 10, color: '#444' }, { text: '', fontSize: 10, color: '#444', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
      });
    } 
    // ====== MODERN ======
    else if (template === "modern") {
      content.push({ text: d.name || "Your Name", fontSize: 22, bold: true, color: '#111', alignment: 'left', margin: [0,0,0,2], characterSpacing: -0.3 });
      if (d.highlights) content.push({ text: d.highlights, fontSize: 10.5, bold: true, color: '#444', alignment: 'left', margin: [0,2,0,0] });
      if (contactParts.length) {
        content.push({
          text: contactParts.join('   |   '), fontSize: 9.5, color: '#444', alignment: 'left', margin: [0,4,0,8]
        });
      }
      content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 2, lineColor: '#111' }], margin: [0,0,0,12] });

      const secTitle = (t) => ({
        text: t.toUpperCase(), fontSize: 10, bold: true, color: '#111', alignment: 'left',
        margin: [0, 10, 0, 3], characterSpacing: 1.2
      });
      const secLine = () => content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5, lineColor: '#ddd' }], margin: [0,0,0,6] });
      const bullets = (arr) => (arr || []).filter(Boolean).map(b => ({ text: `• ${b}`, fontSize: 10, color: '#222', margin: [16, 0, 0, 2], lineHeight: 1.4 }));

      sectionIds.forEach(id => {
        let hasContent = [d.summary, d.skills, d.projects, d.experience, d.education, d.certifications, d.awards, d.volunteering].some(x => id === 'summary' ? d.summary : (id === 'skills' ? d.skills?.length : (id === 'projects' ? d.projects?.length : (id === 'experience' ? d.experience?.length : (id === 'education' ? d.education?.length : (id === 'certifications' ? d.certifications?.length : (id === 'awards' ? d.awards?.length : (id === 'volunteering' ? d.volunteering?.length : false))))))));
        if (!hasContent) return;

        content.push(secTitle(CV_TITLES_AR[id]));
        secLine();

        if (id === 'summary' && d.summary) content.push({ text: d.summary, fontSize: 10.5, color: '#111', margin: [0,0,0,10], lineHeight: 1.4 });
        if (id === 'skills' && d.skills?.length) {
          d.skills.forEach(s => content.push({ text: [{ text: s.category + ': ', bold: true, color: '#111' }, { text: s.items }], fontSize: 10, margin: [0,0,0,2] }));
          content.push({ text: '', margin: [0,0,0,10] });
        }
        if (id === 'projects' && d.projects?.length) d.projects.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ columns: [{ text: p.role, bold: true, fontSize: 10, color: '#444' }, { text: '', fontSize: 10, color: '#555', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'experience' && d.experience?.length) d.experience.forEach(p => {
          content.push({ columns: [{ text: p.company, bold: true, fontSize: 11, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          content.push({ columns: [{ text: p.role, bold: true, fontSize: 10, color: '#444' }, { text: p.location, fontSize: 10, color: '#555', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'education' && d.education?.length) d.education.forEach(p => {
          content.push({ columns: [{ text: p.school, bold: true, fontSize: 11, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          content.push({ columns: [{ text: p.degree, bold: true, fontSize: 10, color: '#444' }, { text: p.location, fontSize: 10, color: '#555', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'certifications' && d.certifications?.length) d.certifications.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11, color: '#111' }, { text: p.date, fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.issuer) content.push({ text: p.issuer, fontSize: 10, color: '#555', margin: [0,0,0,3] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'awards' && d.awards?.length) d.awards.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 11, color: '#111' }, { text: p.date, fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.detail) content.push({ text: `• ${p.detail}`, fontSize: 10, color: '#222', margin: [16,0,0,3] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'volunteering' && d.volunteering?.length) d.volunteering.forEach(p => {
          content.push({ columns: [{ text: p.org, bold: true, fontSize: 11, color: '#111' }, { text: p.date, fontSize: 10, color: '#666', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ columns: [{ text: p.role, bold: true, fontSize: 10, color: '#444' }, { text: '', fontSize: 10, color: '#555', alignment: 'right' }], margin: [0,0,0,3] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
      });
    } 
    // ====== MINIMAL ======
    else {
      content.push({ text: d.name || "Your Name", fontSize: 20, bold: true, color: '#111', alignment: 'left', margin: [0,0,0,2], characterSpacing: -0.2 });
      if (d.highlights) content.push({ text: d.highlights, fontSize: 10, bold: true, color: '#666', alignment: 'left', margin: [0,2,0,0] });
      if (contactParts.length) {
        content.push({
          text: contactParts.join('  ·  '), fontSize: 9.5, color: '#555', alignment: 'left', margin: [0,6,0,14]
        });
      }

      const secTitle = (t) => {
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5, lineColor: '#e8e8e8' }], margin: [0,8,0,8] });
        return {
          text: t.toUpperCase(), fontSize: 9, bold: true, color: '#666', alignment: 'left',
          margin: [0, 0, 0, 6], characterSpacing: 1.5
        };
      };
      const bullets = (arr) => (arr || []).filter(Boolean).map(b => ({ text: `• ${b}`, fontSize: 9.5, color: '#333', margin: [16, 0, 0, 2], lineHeight: 1.4 }));

      sectionIds.forEach(id => {
        let hasContent = [d.summary, d.skills, d.projects, d.experience, d.education, d.certifications, d.awards, d.volunteering].some(x => id === 'summary' ? d.summary : (id === 'skills' ? d.skills?.length : (id === 'projects' ? d.projects?.length : (id === 'experience' ? d.experience?.length : (id === 'education' ? d.education?.length : (id === 'certifications' ? d.certifications?.length : (id === 'awards' ? d.awards?.length : (id === 'volunteering' ? d.volunteering?.length : false))))))));
        if (!hasContent) return;

        content.push(secTitle(CV_TITLES_AR[id]));

        if (id === 'summary' && d.summary) content.push({ text: d.summary, fontSize: 10, color: '#111', margin: [0,0,0,10], lineHeight: 1.4 });
        if (id === 'skills' && d.skills?.length) {
          d.skills.forEach(s => content.push({ columns: [{ text: s.category, bold: true, color: '#111', width: 120 }, { text: s.items, width: '*' }], fontSize: 9.5, margin: [0,0,0,3] }));
          content.push({ text: '', margin: [0,0,0,8] });
        }
        if (id === 'projects' && d.projects?.length) d.projects.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 10.5, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ text: p.role, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'experience' && d.experience?.length) d.experience.forEach(p => {
          content.push({ columns: [{ text: p.company, bold: true, fontSize: 10.5, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          const r2 = [p.role, p.location].filter(Boolean).join(" · ");
          if (r2) content.push({ text: r2, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'education' && d.education?.length) d.education.forEach(p => {
          content.push({ columns: [{ text: p.school, bold: true, fontSize: 10.5, color: '#111' }, { text: joinDates(p.start, p.end), fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          const r2 = [p.degree, p.location].filter(Boolean).join(" · ");
          if (r2) content.push({ text: r2, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'certifications' && d.certifications?.length) d.certifications.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 10.5, color: '#111' }, { text: p.date, fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.issuer) content.push({ text: p.issuer, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'awards' && d.awards?.length) d.awards.forEach(p => {
          content.push({ columns: [{ text: p.title, bold: true, fontSize: 10.5, color: '#111' }, { text: p.date, fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.detail) content.push({ text: p.detail, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          content.push({ text: '', margin: [0,0,0,8] });
        });
        if (id === 'volunteering' && d.volunteering?.length) d.volunteering.forEach(p => {
          content.push({ columns: [{ text: p.org, bold: true, fontSize: 10.5, color: '#111' }, { text: p.date, fontSize: 9.5, color: '#888', alignment: 'right' }], margin: [0,0,0,0] });
          if (p.role) content.push({ text: p.role, fontSize: 9.5, color: '#666', margin: [0,0,0,2] });
          bullets(p.bullets).forEach(b => content.push(b));
          content.push({ text: '', margin: [0,0,0,8] });
        });
      });
    }

    const fMult = cvSize === "sm" ? 0.92 : cvSize === "lg" ? 1.08 : 1;
    const mMult = cvSpacing === "compact" ? 0.6 : cvSpacing === "spacious" ? 1.6 : 1;

    const applyScaling = (node) => {
      if (!node) return;
      if (Array.isArray(node)) { node.forEach(applyScaling); return; }
      if (node.fontSize) node.fontSize *= fMult;
      if (node.margin && Array.isArray(node.margin)) {
        node.margin = node.margin.map((val, idx) => (idx === 1 || idx === 3) ? val * mMult : val);
      }
      if (node.columns) node.columns.forEach(applyScaling);
      if (node.text && Array.isArray(node.text)) node.text.forEach(applyScaling);
    };
    applyScaling(content);

    const docDef = {
      pageSize: 'A4',
      pageMargins: template === "minimal" ? [51, 51, 51, 51] : (template === "classic" ? [45, 45, 45, 45] : [40, 40, 40, 40]),
      content,
      defaultStyle: { font: 'Inter', fontSize: 10.5 * fMult, color: '#111' }
    };

    pdfMake.fonts = {
      Inter: {
        normal:      'Inter-Regular.ttf',
        bold:        'Inter-Bold.ttf',
        italics:     'Inter-Regular.ttf',
        bolditalics: 'Inter-Bold.ttf'
      }
    };

    // إعطاء المتصفح مهلة 150 ملي ثانية لمعالجة إرسال الإحصائيات (gtag) قبل تجميد المتصفح لصناعة الـ PDF
    setTimeout(() => {
      try {
        pdfMake.createPdf(docDef).download(`${d.name || 'resume'}_CV.pdf`);
      } catch(err) {
        console.error(err);
        const fallback = { ...docDef };
        fallback.defaultStyle = { fontSize: 10.5, color: '#111' };
        pdfMake.createPdf(fallback).download(`${d.name || 'resume'}_CV.pdf`);
      }
    }, 150);
  };

  const CV = { classic: CVClassic, modern: CVModern, minimal: CVMinimal }[template] || CVModern;

  const sectionSub = {
    personal: "المعلومات الأساسية ليتواصل معك أصحاب العمل.",
    summary: "نبذة قصيرة تلخّص خبرتك وتوجهك المهني.",
    skills: "مجموعات المهارات التي تريد إبرازها.",
    projects: "مشاريع نوعية تبرز قدراتك العملية.",
    experience: "مسيرتك المهنية وأهم الإنجازات.",
    education: "مؤهلاتك الأكاديمية.",
    certifications: "الشهادات المهنية التي حصلت عليها.",
    awards: "الجوائز والإنجازات البارزة.",
    volunteering: "أعمالك التطوعية ومساهماتك المجتمعية.",
  };

  const templateInfo = {
    classic: { desc: "يتوافق مع المعايير الرسمية، مثالي للجهات الحكومية والأكاديمية.", ats: "متوافق تماماً ومقروء 100% لأنظمة الـ ATS القديمة والحديثة." },
    modern: { desc: "لمسة عصرية بمسافات بصرية أوسع، للمجالات التقنية والشركات الخاصة.", ats: "ممتاز جداً لأنظمة الـ ATS الحديثة بفضل الهيكلة الواضحة." },
    minimal: { desc: "الحد الأدنى من التنسيقات لضمان التركيز على المحتوى بأكبر قدر.", ats: "الأقوى عالمياً في اجتياز أصعب خوارزميات وأنظمة الـ ATS المتقدمة." }
  };

  return (
    <div className="app">
      <Topbar
        previewCollapsed={previewCollapsed}
        onTogglePreview={() => setPreviewCollapsed(c => !c)}
        onDemo={onDemo} onClear={onClear} onDownload={onDownload}
        onMobilePreview={() => setMobilePreview(true)}
        completion={completion}/>

      <div className={"body" + (previewCollapsed ? " preview-collapsed" : "")}>
        <Sidebar sections={orderedSections} current={current} onSelect={setCurrent}
                 counts={counts} completion={completion}
                 onMove={moveSection} onReorder={reorderSections}
                 onResetOrder={resetOrder} onOpenGuide={() => {
                   setShowGuide(true);
                   if (window.gtag) {
                     window.gtag("event", "open_guide", {
                       event_category: "Engagement",
                       event_label: "الضغط على الدليل الشامل لانشاء السيرة"
                     });
                   }
                 }}/>

        <main className="editor" key={current}>
          <div className="editor-inner section-enter">
            <div className="editor-heading">
              <h2>{currentMeta?.label}</h2>
              <span className="step-meta">{String(idx + 1).padStart(2,"0")} / {String(orderedSections.length).padStart(2,"0")}</span>
            </div>
            <p className="editor-sub">{sectionSub[current]}</p>

            {Section && <Section data={data} setData={setData}/>}

            <div className="editor-stepper">
              <button className="stepper-btn" onClick={prev} disabled={idx === 0}>
                <Icon name="chevronR"/> السابق
              </button>
              <span style={{fontSize:12,color:"var(--text-3)"}} className="desktop-only">{currentMeta?.label}</span>
              {idx < orderedSections.length - 1 ? (
                <button className="stepper-btn primary" onClick={next}>
                  التالي <Icon name="chevronL"/>
                </button>
              ) : (
                <button className="stepper-btn primary" onClick={onDownload}>
                  <Icon name="download"/> تحميل PDF
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="preview desktop-only" style={previewCollapsed ? {display:"none"} : {}}>
          <div className="preview-topbar">
            <div className="preview-topbar-label"><span className="dot"/> معاينة مباشرة</div>
            <div className="template-switch">
              {[
                {k:"classic", l:"Classic"},
                {k:"modern", l:"Modern"},
                {k:"minimal", l:"Minimal"},
              ].map(t => (
                <button key={t.k}
                        className={"template-switch-btn" + (template === t.k ? " active" : "")}
                        onClick={() => setTemplate(t.k)}>
                  {t.l} <span className="ats">ATS</span>
                </button>
              ))}
            </div>
            <div className="page-zoom-controls">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} title="تصغير"><Icon name="zoomOut"/></button>
              <span className="zoom-label">{Math.round(zoom*100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} title="تكبير"><Icon name="zoomIn"/></button>
            </div>
          </div>
          <div className="template-info-banner">
            <div className="ti-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div className="ti-content">
              <strong>معلومات القالب ({templateInfo[template]?template:''}):</strong> {templateInfo[template]?.desc}
              <div className="ti-ats-text">{templateInfo[template]?.ats}</div>
            </div>
          </div>
          <div className="customizer-bar">
            <div className="c-group">
                <div className="c-label-col">
                  <span className="c-label">حجم الخط:</span>
                  <span className="c-hint">{cvSize === 'sm' ? 'مثالي لضغط تفاصيل كثيرة بصفحة واحدة.' : cvSize === 'lg' ? 'ممتاز للسير الذاتية القصيرة لإبراز المحتوى.' : 'الحجم الأنسب والأكثر راحة للعين.'}</span>
                </div>
                <div className="c-btn-row">
                  <button className={cvSize==="sm"?"active":""} onClick={()=>setCvSize("sm")}>صغير</button>
                  <button className={cvSize==="md"?"active":""} onClick={()=>setCvSize("md")}>وسط (افتراضي)</button>
                  <button className={cvSize==="lg"?"active":""} onClick={()=>setCvSize("lg")}>كبير</button>
                </div>
            </div>
            <div className="c-sep" />
            <div className="c-group">
                <div className="c-label-col">
                  <span className="c-label">المسافات:</span>
                  <span className="c-hint">{cvSpacing === 'compact' ? 'يقلص المسافات لجمع محتوى مكثف.' : cvSpacing === 'spacious' ? 'يزيد الفراغات للتركيز على المحتوى القليل.' : 'التوازن القياسي بين الفراغات والمحتوى.'}</span>
                </div>
                <div className="c-btn-row">
                  <button className={cvSpacing==="compact"?"active":""} onClick={()=>setCvSpacing("compact")}>مضغوط</button>
                  <button className={cvSpacing==="comfy"?"active":""} onClick={()=>setCvSpacing("comfy")}>مريح (افتراضي)</button>
                  <button className={cvSpacing==="spacious"?"active":""} onClick={()=>setCvSpacing("spacious")}>واسع</button>
                </div>
            </div>
          </div>
          <div className="preview-scroll">
            <div className={`a4-wrap size-${cvSize} spacing-${cvSpacing}`} style={{transform: `scale(${zoom})`, transformOrigin:"top center"}}>
              <div className="a4">
                <CV data={data} sectionOrder={sectionOrder}/>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar — single tap opens sections sheet */}
      <MobileTabBar sections={orderedSections} current={current} onSelect={setCurrent}
                    onOpenSections={() => setMobileSheet(true)}/>
      <MobileSectionsSheet open={mobileSheet}
                           sections={orderedSections} current={current} counts={counts}
                           onSelect={setCurrent} onClose={() => setMobileSheet(false)}
                           onMove={moveSection} onReorder={reorderSections}
                           onOpenGuide={() => { 
                             setMobileSheet(false); 
                             setShowGuide(true); 
                             if (window.gtag) {
                               window.gtag("event", "open_guide", {
                                 event_category: "Engagement",
                                 event_label: "الضغط على الدليل الشامل لانشاء السيرة"
                               });
                             }
                           }}
                           onClear={onClear} onDemo={onDemo}/>


      {mobilePreview && (
        <MobilePreview data={data} template={template} setTemplate={setTemplate}
                       cvSize={cvSize} setCvSize={setCvSize}
                       cvSpacing={cvSpacing} setCvSpacing={setCvSpacing}
                       CV={CV} sectionOrder={sectionOrder}
                       onClose={() => setMobilePreview(false)} onDownload={onDownload}/>
      )}

      {showGuide && <GuideOverlay onClose={() => setShowGuide(false)} />}
      
      <ConfirmModal {...confirmDialog} />
    </div>
  );
}

const GUIDE_TIPS = [
  {
    id: "summary", icon: "user",
    title: "النبذة الشخصية الجوهرية",
    text: "النبذة (الـ Elevator Pitch) هي أول ما يقع عليه عين المُقيّم. في 3 أسطر يجب أن تجيب: من أنت؟ ما التخصص الدقيق؟ وما القيمة النادرة التي تجلبها؟ تجنب العبارات العاطفية الإنشائية.",
    bad: "شاب طموح جدًا ومجتهد، أبحث عن فرصة في شركتكم المرموقة لتطوير مهاراتي وكسب الخبرة.",
    good: "مهندس برمجيات استراتيجي بخبرة 5 سنوات في تطبيقات الويب. نجحت في قيادة فرق لتسليم مشاريع رفعت أداء الأنظمة بنسبة 30% مع تقليص تكاليف الخوادم."
  },
  {
    id: "experience", icon: "briefcase",
    title: "قاعدة الإنجازات المرقّمة (XYZ)",
    text: "أسوأ ما تفعله هو كتابة (المهام اليومية الوظيفية). مدير التوظيف يعرف مهام المهندس! هو يسأل 'كيف تفوقت فيها؟'. اكتب: أنجزت X، عبر أداء Y، وكانت النتيجة Z بالأرقام.",
    bad: "كنت مسؤولاً عن التسويق عبر السوشيال ميديا وكتابة المحتوى والرد على المتابعين.",
    good: "أدرت 4 حملات تسويقية عبر المنصات بميزانية 5 آلاف، مما ضاعف التفاعل بنسبة 45% وحقق زيادة في المبيعات المباشرة بنسبة 15% خلال ربع واحد."
  },
  {
    id: "skills", icon: "star",
    title: "صياغة المهارات بذكاء",
    text: "افصل المهارات التقنية العميقة عن المهارات الناعمة (Soft Skills). وتجنب الحشو بالمصطلحات الفضفاضة التي يكتبها الجميع. كن دقيقاً جداً في تقنياتك.",
    bad: "مهارات التواصل | أتحمل ضغط العمل | أجيد استخدام الحاسب الآلي وتطبيقات الأوفيس.",
    good: "تحليل البيانات المتقدم (Power BI, Excel) | التسويق الرقمي الاستراتيجي (SEO/SEM) | إدارة المشاريع (Agile/Scrum)."
  },
  {
    id: "ats", icon: "terminal",
    title: "تجاوز الذكاء الاصطناعي (ATS)",
    text: "70% من الشركات العالمية تستخدم نظام فلترة آلي يُدعى ATS. هذا النظام يكره الجداول المعقدة والأعمدة والتصاميم المزدحمة. استخدم القوالب النظيفة (مثل قوالبנו) وانسخ الكلمات المفتاحية من إعلان الوظيفة.",
    bad: "تصميم السيرة ببرنامج الفوتوشوب ودمج نصوص في صور للحصول على شكل 'عصري'.",
    good: "ملف PDF نصي نظيف ومباشر، يدمج مصطلحات مثل 'B2B Sales' أو 'Full-Stack' حرفياً كما ذُكرت في إعلان الوظيفة."
  },
  {
    id: "education", icon: "graduation",
    title: "إبراز التعليم للحديثي التخرج",
    text: "إن كنت حديث التخرج وضعفك يكمن في الخبرة المهنية، اجعل التعليم هو نقطة قوتك! اذكر معدلك (إذا كان مرتفعاً)، وأبرز مشاريع التخرج العميقة أو الأبحاث التي قمت بها.",
    bad: "خريج هندسة حاسب، أخذت دورات في البرمجة وتطوير الذات خلال سنوات الدراسة.",
    good: "بكالوريوس هندسة حاسب - (معدل 4.8/5) مع مرتبة الشرف، 2023. مشروع التخرج: ابتكار خوارزمية ذكية مطورة لتقليل استهلاك الطاقة وحصدت المركز الأول إقليمياً."
  },
  {
    id: "tailor", icon: "sparkle",
    title: "التخصيص الدقيق لكل قطاع",
    text: "السيرة الذاتية ليست 'صالح لكل زمان ومكان'. أكبر خطأ هو إرسال نفس الملف لكل المستقطبين. خصص سيرتك بلغة تناسب الشركة المتقدم لها بالضبط، وأعد ترتيب مهاراتك.",
    bad: "إرسال سيرة ذاتية عامة بصيغة 'CV_Final_1.pdf' لـ 50 جهة مختلفة بنقرة واحدة.",
    good: "تحرير نسخة جديدة للجهة X لتركز بقوة على مهارات القيادة، ونسخة للجهة Y لتركز على مهارات البرمجة (بناءً على طلبهم)."
  },
  {
    id: "length", icon: "file-text",
    title: "الطول والتسلسل المثاليين",
    text: "إن كانت خبرتك أقل من 10 سنوات (صفحة واحدة تكفي دائماً). רتب خبراتك زمنياً بالعكس (الأحدث في الأعلى). استخدم المساحات البيضاء (White Space) لراحة عين القارئ.",
    bad: "سيرة ذاتية من 4 صفحات تحتوي على دورة إدخال بيانات من عام 2012 ومشاركة في فعالية مدرسية.",
    good: "صفحة واحدة مركزة وكثيفة المحتوى، تسرد أقوى 3 محطات مهنية لك خلال آخر 5 سنوات، خالية من أي حشو."
  },
  {
    id: "mistakes", icon: "alert",
    title: "أخطاء قاتلة تدمر انطباعك",
    text: "بعض الأخطاء تسبّب الاستبعاد الفوري: الأخطاء الإملائية المستفزة، وضع حالة اجتماعية، ذكر هوايات غريبة لا تفيد الوظيفة كـ (السباحة والمطالعة)، أو صورة شخصية لم تُطلب.",
    bad: "الحالة الاجتماعية: أعزب، الهوايات: كرة القدم. (مع وجود 3 أخطاء إملائية بالملف).",
    good: "ملائم تماماً، مُراجع لغوياً مرتين، محفوظ باسم 'FirstName_LastName_CV.pdf'."
  }
];

function GuideOverlay({ onClose }) {
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400);
  };

  return (
    <div className={`guide-overlay ${isClosing ? 'guide-closing' : ''}`} onClick={handleClose}>
      <div className={`guide-modal-premium ${isClosing ? 'guide-modal-closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="gp-hero">
          <button className="gp-close" onClick={handleClose}><Icon name="x"/></button>
          <div className="gp-hero-content">
            <div className="gp-badge"><Icon name="star"/> الدليل المطلق</div>
            <h1 className="gp-title">كيف تكتب سيرة ذاتية تُجبرهم على توظيفك؟</h1>
            <p className="gp-sub">مجموعة من الأسرار والقواعد الذهبية المعتمدة من قبل خبراء الموارد البشرية ومدراء التوظيف في كبرى الشركات.</p>
          </div>
          <div className="gp-hero-bg"></div>
        </div>

        <div className="gp-grid">
          {GUIDE_TIPS.map((tip, idx) => (
            <div className="gp-card" key={tip.id}>
              <div className="gp-card-num">{idx + 1}</div>
              <div className="gp-card-icon"><Icon name={tip.icon}/></div>
              <h2 className="gp-card-title">{tip.title}</h2>
              <p className="gp-card-text">{tip.text}</p>
              
              {(tip.good || tip.bad) && (
                <div className="gp-examples">
                  {tip.bad && (
                    <div className="gpe gpe-bad">
                      <div className="gpe-head"><Icon name="x"/> تجنب (تقليدي)</div>
                      <div className="gpe-body">"{tip.bad}"</div>
                    </div>
                  )}
                  {tip.good && (
                    <div className="gpe gpe-good">
                      <div className="gpe-head"><Icon name="check"/> اعتمد (احترافي)</div>
                      <div className="gpe-body">"{tip.good}"</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Mobile preview — auto-fits the A4 to viewport width */
function MobilePreview({ data, template, setTemplate, cvSize, setCvSize, cvSpacing, setCvSpacing, CV, sectionOrder, onClose, onDownload }) {
  const [scale, setScale] = useState(0.5);
  const [activeTab, setActiveTab] = useState("template"); // template, size, spacing
  const scrollRef = useRef(null);

  useEffect(() => {
    const compute = () => {
      const sw = scrollRef.current?.clientWidth || window.innerWidth;
      const pad = 24; // 12px each side
      const available = sw - pad;
      const A4_WIDTH = 794; // px @ 96dpi
      setScale(Math.min(1.1, Math.max(0.3, available / A4_WIDTH)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const OptionsPanel = (
    <div className="m-preview-options">
      <div className="m-opts-tabs">
        <button className={activeTab==="template"?"active":""} onClick={()=>setActiveTab("template")}>القالب</button>
        <button className={activeTab==="size"?"active":""} onClick={()=>setActiveTab("size")}>الخط</button>
        <button className={activeTab==="spacing"?"active":""} onClick={()=>setActiveTab("spacing")}>المسافات</button>
      </div>
      <div className="m-opts-content">
        {activeTab === "template" && (
          <div className="m-preview-tpl">
            {[ {k:"classic", l:"Classic"}, {k:"modern", l:"Modern"}, {k:"minimal", l:"Minimal"} ].map(t => (
              <button key={t.k} className={template === t.k ? "active" : ""} onClick={() => setTemplate(t.k)}>{t.l}</button>
            ))}
          </div>
        )}
        {activeTab === "size" && (
          <div className="m-preview-tpl">
            <button className={cvSize==="small"?"active":""} onClick={()=>setCvSize("small")}>صغير</button>
            <button className={cvSize==="medium"?"active":""} onClick={()=>setCvSize("medium")}>وسط</button>
            <button className={cvSize==="large"?"active":""} onClick={()=>setCvSize("large")}>كبير</button>
          </div>
        )}
        {activeTab === "spacing" && (
          <div className="m-preview-tpl">
            <button className={cvSpacing==="compact"?"active":""} onClick={()=>setCvSpacing("compact")}>مضغوط</button>
            <button className={cvSpacing==="comfy"?"active":""} onClick={()=>setCvSpacing("comfy")}>مريح</button>
            <button className={cvSpacing==="spacious"?"active":""} onClick={()=>setCvSpacing("spacious")}>واسع</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="m-preview mobile-only">
      <div className="m-preview-header">
        <div className="t">معاينة وتخصيص</div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x"/></button>
      </div>
      {OptionsPanel}
      <div className="m-preview-scroll" ref={scrollRef} dir="ltr">
        <div className="m-preview-a4-wrap" style={{
          position: "relative",
          width: `${794 * scale}px`,
          height: `${1123 * scale}px`,
          overflow: "hidden"
        }}>
          <div className={`a4 m-preview-a4 size-${cvSize} spacing-${cvSpacing}`} style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left"
          }} dir="rtl">
            <CV data={data} sectionOrder={sectionOrder}/>
          </div>
        </div>
      </div>
      <div className="m-preview-foot">
        <button className="btn btn-primary" onClick={onDownload}>
          <Icon name="download"/> تحميل PDF
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
