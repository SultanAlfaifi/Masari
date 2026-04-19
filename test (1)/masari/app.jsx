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
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("masari_data_v2")) || DEMO; } catch { return DEMO; }
  });
  const [current, setCurrent] = useState(() => localStorage.getItem("masari_section_v2") || "personal");
  const [template, setTemplate] = useState(() => localStorage.getItem("masari_template_v2") || "modern");
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

  useEffect(() => { localStorage.setItem("masari_data_v2", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("masari_section_v2", current); }, [current]);
  useEffect(() => { localStorage.setItem("masari_template_v2", template); }, [template]);
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

  const onDemo = () => { if (confirm("تعبئة الحقول ببيانات تجريبية؟ سيتم استبدال البيانات الحالية.")) setData(DEMO); };
  const onClear = () => { if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) setData(EMPTY); };
  const onDownload = () => { alert("سيتم تحميل الـ PDF (تجريبي في هذا الـ prototype)"); };

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

  return (
    <div className="app">
      <Topbar
        previewCollapsed={previewCollapsed}
        onTogglePreview={() => setPreviewCollapsed(c => !c)}
        onDemo={onDemo} onClear={onClear} onDownload={onDownload}/>

      <div className={"body" + (previewCollapsed ? " preview-collapsed" : "")}>
        <Sidebar sections={orderedSections} current={current} onSelect={setCurrent}
                 counts={counts} completion={completion}
                 onMove={moveSection} onReorder={reorderSections}/>

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
          <div className="preview-scroll">
            <div className="a4-wrap" style={{transform: `scale(${zoom})`, transformOrigin:"top center"}}>
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
                           onMove={moveSection} onReorder={reorderSections}/>

      {/* Mobile floating preview button */}
      <button className="mobile-preview-fab mobile-only" onClick={() => setMobilePreview(true)}>
        <Icon name="eye"/>
        معاينة السيرة
        <span className="count">{Math.round(completion)}%</span>
      </button>

      {mobilePreview && (
        <MobilePreview data={data} template={template} setTemplate={setTemplate}
                       CV={CV} sectionOrder={sectionOrder}
                       onClose={() => setMobilePreview(false)} onDownload={onDownload}/>
      )}
    </div>
  );
}

/* Mobile preview — auto-fits the A4 to viewport width */
function MobilePreview({ data, template, setTemplate, CV, sectionOrder, onClose, onDownload }) {
  const [scale, setScale] = useState(0.5);
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

  const TemplatePicker = (
    <div className="m-preview-tpl">
      {[
        {k:"classic", l:"Classic"},
        {k:"modern", l:"Modern"},
        {k:"minimal", l:"Minimal"},
      ].map(t => (
        <button key={t.k} className={template === t.k ? "active" : ""} onClick={() => setTemplate(t.k)}>{t.l}</button>
      ))}
    </div>
  );

  return (
    <div className="m-preview mobile-only">
      <div className="m-preview-header">
        <div className="t">معاينة السيرة الذاتية</div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x"/></button>
      </div>
      {TemplatePicker}
      <div className="m-preview-scroll" ref={scrollRef}>
        <div className="m-preview-a4-wrap" style={{
          width: `${794 * scale}px`,
          height: `${1123 * scale}px`,
        }}>
          <div className="a4 m-preview-a4" style={{transform: `scale(${scale})`, transformOrigin: "top left"}}>
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
