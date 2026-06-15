/* Editor sections — one component per data type */

function PersonalSection({ data, setData }) {
  const upd = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <div className="notice">
        <Icon name="alert"/>
        <div><b>تنبيه:</b> حاليًا الموقع لا يدعم اللغة العربية في تصميم الـ PDF. يُرجى الإدخال بالإنجليزية للحصول على أفضل نتيجة.</div>
      </div>
      <Field label="الاسم الكامل" required>
        <input className="input ltr" dir="ltr" placeholder="e.g. Sultan AlFaifi" value={data.name} onChange={e => upd("name", e.target.value)}/>
      </Field>
      <Field label="مميزات مختصرة" hint="اختياري — 2-3 عناصر مفصولة بـ ·">
        <input className="input ltr" dir="ltr" placeholder="e.g. KAUST AI Program · McKinsey Fellow" value={data.highlights} onChange={e => upd("highlights", e.target.value)}/>
      </Field>
      <FieldRow>
        <Field label="البريد الإلكتروني"><input className="input ltr" dir="ltr" placeholder="you@example.com" value={data.email} onChange={e => upd("email", e.target.value)}/></Field>
        <Field label="رقم الجوال"><input className="input ltr" dir="ltr" placeholder="0599999999" value={data.phone} onChange={e => upd("phone", e.target.value)}/></Field>
      </FieldRow>
      <FieldRow>
        <Field label="رابط تواصل" hint="LinkedIn, GitHub, X…">
          <div className="input-with-icon ltr-input">
            <span className="icon-left"><Icon name="link" width="15" height="15"/></span>
            <input className="input ltr" dir="ltr" placeholder="linkedin.com/in/you" value={data.social} onChange={e => upd("social", e.target.value)}/>
          </div>
        </Field>
        <Field label="المدينة، الدولة"><input className="input ltr" dir="ltr" placeholder="e.g. Makkah, KSA" value={data.location} onChange={e => upd("location", e.target.value)}/></Field>
      </FieldRow>
    </>
  );
}

function SummarySection({ data, setData }) {
  return (
    <Field label="نبذة (Summary)" hint="2-4 جمل تعرّف بك بشكل مختصر">
      <textarea className="textarea ltr" dir="ltr" placeholder="Software engineer with 5+ years of experience…" value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })}/>
    </Field>
  );
}

function SkillsSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const skills = data.skills || [];
  const upd = (next) => setData({ ...data, skills: next });

  const add = (category = "") => { upd([...skills, { category, items: "" }]); setOpenIdx(skills.length); };
  const remove = (i) => upd(skills.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= skills.length) return;
    const next = [...skills]; [next[i], next[j]] = [next[j], next[i]]; upd(next);
  };
  const update = (i, patch) => upd(skills.map((s, j) => j === i ? { ...s, ...patch } : s));

  const suggestions = ["Languages", "Tools & Frameworks", "Soft Skills", "Databases", "Cloud"];

  return (
    <>
      <div style={{marginBottom:10, fontSize:12, color:"var(--text-3)"}}>إضافة سريعة:</div>
      <div className="chip-row">
        {suggestions.map(s => <button key={s} className="chip" onClick={() => add(s)}><Icon name="plus" width="12" height="12"/> {s}</button>)}
      </div>
      {skills.map((s, i) => (
        <ItemCard key={i}
          open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === skills.length - 1}
          title={s.category} subtitle={s.items}>
          <Field label="تصنيف المهارة">
            <input className="input ltr" dir="ltr" placeholder="e.g. Languages" value={s.category} onChange={e => update(i, { category: e.target.value })}/>
          </Field>
          <Field label="المهارات (مفصولة بفواصل)">
            <input className="input ltr" dir="ltr" placeholder="e.g. Python, JavaScript, TypeScript" value={s.items} onChange={e => update(i, { items: e.target.value })}/>
          </Field>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={() => add()}><Icon name="plus"/> إضافة فئة مهارات</button>
    </>
  );
}

function ProjectsSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.projects || [];
  const upd = (next) => setData(prev => ({ ...prev, projects: typeof next === "function" ? next(prev.projects || []) : next }));
  const add = () => { upd([...items, { title: "", role: "", start: "", end: "", bullets: [""] }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j = i+dir; if (j<0||j>=items.length) return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));

  return (
    <>
      {items.map((p, i) => {
        const present = p.end === "Present";
        return (
          <ItemCard key={i} open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            onDelete={() => remove(i)}
            onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
            isFirst={i === 0} isLast={i === items.length - 1}
            title={p.title} subtitle={p.role || p.start}>
            <FieldRow>
              <Field label="اسم المشروع" required><input className="input ltr" dir="ltr" placeholder="e.g. Hajj Guide App" value={p.title} onChange={e => update(i, { title: e.target.value })}/></Field>
              <Field label="الدور"><input className="input ltr" dir="ltr" placeholder="e.g. Lead Developer" value={p.role} onChange={e => update(i, { role: e.target.value })}/></Field>
            </FieldRow>
            <Field label="المدة">
              <DatePicker start={p.start} end={p.end} present={present}
                onStart={v => update(i, { start: v })}
                onEnd={v => update(i, { end: v })}
                onPresent={v => update(i, { end: v ? "Present" : "" })}/>
            </Field>
            <Field label="أهم النقاط والإنجازات">
              <BulletsEditor bullets={p.bullets || [""]} onChange={b => update(i, { bullets: b })}
                placeholder="e.g. Built cross-platform mobile app used by 10k+ users" />
            </Field>
          </ItemCard>
        );
      })}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة مشروع</button>
    </>
  );
}

function ExperienceSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.experience || [];
  const upd = (next) => setData(prev => ({ ...prev, experience: typeof next === "function" ? next(prev.experience || []) : next }));
  const add = () => { upd([...items, { company: "", role: "", location: "", start: "", end: "", bullets: [""] }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j=i+dir; if(j<0||j>=items.length)return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <>
      {items.map((p, i) => (
        <ItemCard key={i} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === items.length - 1}
          title={p.company} subtitle={p.role}>
          <FieldRow>
            <Field label="الشركة" required><input className="input ltr" dir="ltr" placeholder="e.g. Tech Solutions Co." value={p.company} onChange={e => update(i, { company: e.target.value })}/></Field>
            <Field label="المسمى الوظيفي"><input className="input ltr" dir="ltr" placeholder="e.g. Software Engineer" value={p.role} onChange={e => update(i, { role: e.target.value })}/></Field>
          </FieldRow>
          <Field label="الموقع"><input className="input ltr" dir="ltr" placeholder="e.g. Makkah, KSA" value={p.location} onChange={e => update(i, { location: e.target.value })}/></Field>
          <Field label="المدة">
            <DatePicker start={p.start} end={p.end} present={p.end === "Present"}
              onStart={v => update(i, { start: v })}
              onEnd={v => update(i, { end: v })}
              onPresent={v => update(i, { end: v ? "Present" : "" })}/>
          </Field>
          <Field label="الإنجازات والمهام">
            <BulletsEditor bullets={p.bullets || [""]} onChange={b => update(i, { bullets: b })}
              placeholder="e.g. Reduced database query times by 40%"/>
          </Field>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة خبرة</button>
    </>
  );
}

function EducationSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.education || [];
  const upd = (next) => setData(prev => ({ ...prev, education: typeof next === "function" ? next(prev.education || []) : next }));
  const add = () => { upd([...items, { school: "", degree: "", location: "", start: "", end: "", bullets: [""] }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j=i+dir; if(j<0||j>=items.length)return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <>
      {items.map((p, i) => (
        <ItemCard key={i} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === items.length - 1}
          title={p.school} subtitle={p.degree}>
          <FieldRow>
            <Field label="المؤسسة التعليمية" required><input className="input ltr" dir="ltr" placeholder="e.g. Umm Al-Qura University" value={p.school} onChange={e => update(i, { school: e.target.value })}/></Field>
            <Field label="الدرجة والتخصص"><input className="input ltr" dir="ltr" placeholder="e.g. B.S. in Computer Science" value={p.degree} onChange={e => update(i, { degree: e.target.value })}/></Field>
          </FieldRow>
          <Field label="الموقع"><input className="input ltr" dir="ltr" placeholder="e.g. Makkah, KSA" value={p.location} onChange={e => update(i, { location: e.target.value })}/></Field>
          <Field label="المدة">
            <DatePicker start={p.start} end={p.end} present={p.end === "Present"}
              onStart={v => update(i, { start: v })}
              onEnd={v => update(i, { end: v })}
              onPresent={v => update(i, { end: v ? "Present" : "" })}/>
          </Field>
          <Field label="تفاصيل إضافية (اختياري)">
            <BulletsEditor bullets={p.bullets || [""]} onChange={b => update(i, { bullets: b })}
              placeholder="e.g. GPA: 4.0 / 5.0 · First Class Honors"/>
          </Field>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة مؤهل</button>
    </>
  );
}

function CertificationsSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.certifications || [];
  const upd = (next) => setData(prev => ({ ...prev, certifications: typeof next === "function" ? next(prev.certifications || []) : next }));
  const add = () => { upd([...items, { title: "", issuer: "", date: "" }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j=i+dir; if(j<0||j>=items.length)return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <>
      {items.map((p, i) => (
        <ItemCard key={i} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === items.length - 1}
          title={p.title} subtitle={p.issuer}>
          <Field label="اسم الشهادة" required><input className="input ltr" dir="ltr" placeholder="e.g. AWS Certified Developer" value={p.title} onChange={e => update(i, { title: e.target.value })}/></Field>
          <FieldRow>
            <Field label="الجهة المانحة"><input className="input ltr" dir="ltr" placeholder="e.g. Amazon Web Services" value={p.issuer} onChange={e => update(i, { issuer: e.target.value })}/></Field>
            <Field label="التاريخ"><input className="input ltr" dir="ltr" placeholder="e.g. Mar 2022" value={p.date} onChange={e => update(i, { date: e.target.value })}/></Field>
          </FieldRow>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة شهادة</button>
    </>
  );
}

function AwardsSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.awards || [];
  const upd = (next) => setData(prev => ({ ...prev, awards: typeof next === "function" ? next(prev.awards || []) : next }));
  const add = () => { upd([...items, { title: "", issuer: "", date: "", detail: "" }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j=i+dir; if(j<0||j>=items.length)return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <>
      {items.map((p, i) => (
        <ItemCard key={i} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === items.length - 1}
          title={p.title} subtitle={p.date}>
          <Field label="الجائزة" required><input className="input ltr" dir="ltr" placeholder="e.g. First Place — Hackathon" value={p.title} onChange={e => update(i, { title: e.target.value })}/></Field>
          <FieldRow>
            <Field label="الجهة"><input className="input ltr" dir="ltr" value={p.issuer} onChange={e => update(i, { issuer: e.target.value })}/></Field>
            <Field label="التاريخ"><input className="input ltr" dir="ltr" placeholder="e.g. Sept 2020" value={p.date} onChange={e => update(i, { date: e.target.value })}/></Field>
          </FieldRow>
          <Field label="تفاصيل"><textarea className="textarea ltr" dir="ltr" value={p.detail} onChange={e => update(i, { detail: e.target.value })}/></Field>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة جائزة</button>
    </>
  );
}

function VolunteeringSection({ data, setData }) {
  const [openIdx, setOpenIdx] = useState(0);
  const items = data.volunteering || [];
  const upd = (next) => setData(prev => ({ ...prev, volunteering: typeof next === "function" ? next(prev.volunteering || []) : next }));
  const add = () => { upd([...items, { org: "", role: "", date: "", bullets: [""] }]); setOpenIdx(items.length); };
  const remove = (i) => upd(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j=i+dir; if(j<0||j>=items.length)return; const n=[...items]; [n[i],n[j]]=[n[j],n[i]]; upd(n); };
  const update = (i, patch) => upd(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
  return (
    <>
      {items.map((p, i) => (
        <ItemCard key={i} open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          onDelete={() => remove(i)}
          onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
          isFirst={i === 0} isLast={i === items.length - 1}
          title={p.org} subtitle={p.role}>
          <FieldRow>
            <Field label="المنظمة" required><input className="input ltr" dir="ltr" value={p.org} onChange={e => update(i, { org: e.target.value })}/></Field>
            <Field label="الدور"><input className="input ltr" dir="ltr" value={p.role} onChange={e => update(i, { role: e.target.value })}/></Field>
          </FieldRow>
          <Field label="التاريخ"><input className="input ltr" dir="ltr" placeholder="e.g. Ramadan 2019" value={p.date} onChange={e => update(i, { date: e.target.value })}/></Field>
          <Field label="الوصف"><BulletsEditor bullets={p.bullets || [""]} onChange={b => update(i, { bullets: b })}/></Field>
        </ItemCard>
      ))}
      <button className="btn-add-item" onClick={add}><Icon name="plus"/> إضافة عمل تطوعي</button>
    </>
  );
}

Object.assign(window, {
  PersonalSection, SummarySection, SkillsSection, ProjectsSection, ExperienceSection,
  EducationSection, CertificationsSection, AwardsSection, VolunteeringSection,
});
