/* CV templates — render the data in 3 different styles, honoring section order */

const joinDates = (start, end) => {
  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end;
};

const renderContact = (data) => {
  const parts = [];
  if (data.phone) parts.push({ k: "phone", v: data.phone });
  if (data.email) parts.push({ k: "email", v: data.email });
  if (data.social) parts.push({ k: "social", v: data.social });
  if (data.location) parts.push({ k: "location", v: data.location });
  return parts;
};

// Section ID -> English title
const CV_TITLES = {
  summary: "Summary",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  awards: "Awards & Honors",
  volunteering: "Volunteering",
};

function cvSectionRenderers(style) {
  // style: 'classic' | 'modern' | 'minimal'
  const bullets = (arr) =>
    arr?.filter(Boolean).length ? <ul className="cv-bullets">{arr.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul> : null;

  return {
    summary: (data) => data.summary ? (
      <div style={{fontSize:"10pt", color:"#333"}}>{data.summary}</div>
    ) : null,

    skills: (data) => data.skills?.length ? (
      <>
        {data.skills.map((s,i) => (
          style === "minimal"
            ? <div className="cv-skill-cat" key={i}><b>{s.category}</b><span>{s.items}</span></div>
            : <div className="cv-skill-cat" key={i}><b>{s.category}:</b> {s.items}</div>
        ))}
      </>
    ) : null,

    projects: (data) => data.projects?.length ? (
      <>
        {data.projects.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.title}</span><span className="cv-date">{joinDates(p.start, p.end)}</span></div>
            {p.role && (style === "minimal"
              ? <div className="cv-sub">{p.role}</div>
              : <div className="cv-row-2"><span className="cv-role">{p.role}</span></div>)}
            {bullets(p.bullets)}
          </div>
        ))}
      </>
    ) : null,

    experience: (data) => data.experience?.length ? (
      <>
        {data.experience.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.company}</span><span className="cv-date">{joinDates(p.start, p.end)}</span></div>
            {style === "minimal"
              ? <div className="cv-sub">{p.role}{p.location && ` · ${p.location}`}</div>
              : <div className="cv-row-2"><span className="cv-role">{p.role}</span><span>{p.location}</span></div>}
            {bullets(p.bullets)}
          </div>
        ))}
      </>
    ) : null,

    education: (data) => data.education?.length ? (
      <>
        {data.education.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.school}</span><span className="cv-date">{joinDates(p.start, p.end)}</span></div>
            {style === "minimal"
              ? <div className="cv-sub">{p.degree}{p.location && ` · ${p.location}`}</div>
              : <div className="cv-row-2"><span className="cv-role">{p.degree}</span><span>{p.location}</span></div>}
            {bullets(p.bullets)}
          </div>
        ))}
      </>
    ) : null,

    certifications: (data) => data.certifications?.length ? (
      <>
        {data.certifications.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.title}</span><span className="cv-date">{p.date}</span></div>
            {p.issuer && (style === "minimal"
              ? <div className="cv-sub">{p.issuer}</div>
              : <div className="cv-row-2"><span>{p.issuer}</span></div>)}
          </div>
        ))}
      </>
    ) : null,

    awards: (data) => data.awards?.length ? (
      <>
        {data.awards.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.title}</span><span className="cv-date">{p.date}</span></div>
            {p.detail && (style === "minimal"
              ? <div className="cv-sub">{p.detail}</div>
              : <ul className="cv-bullets"><li>{p.detail}</li></ul>)}
          </div>
        ))}
      </>
    ) : null,

    volunteering: (data) => data.volunteering?.length ? (
      <>
        {data.volunteering.map((p,i) => (
          <div className="cv-item" key={i}>
            <div className="cv-row-1"><span>{p.org}</span><span className="cv-date">{p.date}</span></div>
            {style === "minimal"
              ? <div className="cv-sub">{p.role}</div>
              : <div className="cv-row-2"><span className="cv-role">{p.role}</span></div>}
            {bullets(p.bullets)}
          </div>
        ))}
      </>
    ) : null,
  };
}

function renderOrderedSections(data, sectionOrder, style) {
  const R = cvSectionRenderers(style);
  const ids = sectionOrder?.filter(id => id !== "personal") || Object.keys(R);
  return ids.map(id => {
    if (!R[id]) return null;
    const content = R[id](data);
    if (!content) return null;
    return (
      <div className="cv-section" key={id}>
        <div className="cv-section-title">{CV_TITLES[id]}</div>
        {content}
      </div>
    );
  });
}

function CVClassic({ data, sectionOrder }) {
  const parts = renderContact(data);
  return (
    <div className="cv cv-classic">
      <div className="cv-h-name">{data.name || "Your Name"}</div>
      {data.highlights && <div className="cv-h-high">{data.highlights}</div>}
      <div className="cv-contact">
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">·</span>}
            <span>{p.v}</span>
          </React.Fragment>
        ))}
      </div>
      {renderOrderedSections(data, sectionOrder, "classic")}
    </div>
  );
}

function CVModern({ data, sectionOrder }) {
  const parts = renderContact(data);
  const iconMap = { phone: "phone", email: "mail", social: "link", location: "pin" };
  const style = { "--accent": "#111111" };
  return (
    <div className="cv cv-modern" style={style}>
      <div className="cv-h">
        <div className="cv-h-name">{data.name || "Your Name"}</div>
        {data.highlights && <div className="cv-h-high">{data.highlights}</div>}
        <div className="cv-contact">
          {parts.map((p, i) => (
            <span key={i}><Icon name={iconMap[p.k]} width="11" height="11"/> {p.v}</span>
          ))}
        </div>
      </div>
      {renderOrderedSections(data, sectionOrder, "modern")}
    </div>
  );
}

function CVMinimal({ data, sectionOrder }) {
  const parts = renderContact(data);
  return (
    <div className="cv cv-minimal">
      <div className="cv-h">
        <div className="cv-h-name">{data.name || "Your Name"}</div>
        {data.highlights && <div className="cv-h-high">{data.highlights}</div>}
        <div className="cv-contact">
          {parts.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">·</span>}
              <span>{p.v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      {renderOrderedSections(data, sectionOrder, "minimal")}
    </div>
  );
}

Object.assign(window, { CVClassic, CVModern, CVMinimal });
