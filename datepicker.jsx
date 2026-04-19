/* Large DatePicker modal (desktop) + bottom sheet (mobile) */
/* FIX: Both modal and sheet are rendered via ReactDOM.createPortal to document.body
   so they escape any overflow:hidden / stacking-context and always appear on top */

const G_MONTHS_FULL = [
  { k: "Jan", n: "يناير" }, { k: "Feb", n: "فبراير" }, { k: "Mar", n: "مارس" },
  { k: "Apr", n: "أبريل" }, { k: "May", n: "مايو" },   { k: "Jun", n: "يونيو" },
  { k: "Jul", n: "يوليو" }, { k: "Aug", n: "أغسطس" },  { k: "Sep", n: "سبتمبر" },
  { k: "Oct", n: "أكتوبر" },{ k: "Nov", n: "نوفمبر" }, { k: "Dec", n: "ديسمبر" },
];
const H_MONTHS_FULL = [
  { k: "Muh",  n: "مُحرّم" },      { k: "Saf",  n: "صَفَر" },       { k: "RbI",  n: "ربيع الأول" },
  { k: "RbII", n: "ربيع الآخر" },   { k: "JuI",  n: "جمادى الأولى" },{ k: "JuII", n: "جمادى الآخرة" },
  { k: "Raj",  n: "رَجَب" },        { k: "Sha",  n: "شَعبان" },      { k: "Ram",  n: "رَمضان" },
  { k: "Shw",  n: "شَوّال" },       { k: "DhQ",  n: "ذو القَعدة" },   { k: "DhH",  n: "ذو الحِجّة" },
];

function parseToken(s) {
  if (!s) return { m: "", y: "" };
  const parts = s.trim().split(/\s+/);
  return { m: parts[0] || "", y: parts[1] || "" };
}
function formatToken(m, y) { return [m, y].filter(Boolean).join(" "); }

/* Portal helper — renders children directly into document.body */
function Portal({ children }) {
  const el = useRef(null);
  if (!el.current) {
    el.current = document.createElement("div");
    el.current.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:none";
  }
  useEffect(() => {
    document.body.appendChild(el.current);
    return () => { if (el.current.parentNode) el.current.parentNode.removeChild(el.current); };
  }, []);
  // Reset pointer-events on the portal root so children are clickable
  el.current.style.pointerEvents = "none";
  return ReactDOM.createPortal(
    <div style={{position:"fixed",inset:0,zIndex:99999,pointerEvents:"auto"}}>{children}</div>,
    el.current
  );
}

/* Inline trigger: shows chosen date as a big pill, clicking opens the modal/sheet */
function DatePicker({ start, end, onStart, onEnd, present, onPresent }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const h = () => setIsMobile(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  const summary = () => {
    const sText = start || "—";
    const eText = present ? "حتى الآن" : (end || "—");
    return { sText, eText };
  };
  const { sText, eText } = summary();

  return (
    <>
      <button type="button" className={"date-trigger" + ((start || end || present) ? " filled" : "")}
              onClick={() => setOpen(true)}>
        <div className="date-trigger-col">
          <span className="date-trigger-label">من</span>
          <span className="date-trigger-value">{sText}</span>
        </div>
        <div className="date-trigger-arrow"><Icon name="chevronL"/></div>
        <div className="date-trigger-col">
          <span className="date-trigger-label">إلى</span>
          <span className={"date-trigger-value" + (present ? " present" : "")}>{eText}</span>
        </div>
        <div className="date-trigger-edit" aria-hidden>
          <Icon name="calendar"/>
        </div>
      </button>
      {open && (
        <Portal>
          {isMobile
            ? <DateSheetMobile start={start} end={end} present={present}
                               onStart={onStart} onEnd={onEnd} onPresent={onPresent}
                               onClose={() => setOpen(false)}/>
            : <DateModalDesktop start={start} end={end} present={present}
                                onStart={onStart} onEnd={onEnd} onPresent={onPresent}
                                onClose={() => setOpen(false)}/>
          }
        </Portal>
      )}
    </>
  );
}

/* ========= Desktop modal ========= */
function DateModalDesktop({ start, end, present, onStart, onEnd, onPresent, onClose }) {
  const [cal, setCal] = useState("gregorian");
  const [active, setActive] = useState("start");
  const [yearPickerFor, setYearPickerFor] = useState(null);

  const [local, setLocal] = useState({
    start: parseToken(start),
    end: parseToken(end === "Present" ? "" : end),
    present: !!present,
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const months = cal === "gregorian" ? G_MONTHS_FULL : H_MONTHS_FULL;
  const thisYear = new Date().getFullYear();
  const years = cal === "gregorian"
    ? Array.from({length: 30}, (_, i) => thisYear + 2 - i)
    : Array.from({length: 30}, (_, i) => 1448 - i);

  const cur = local[active];
  const setYear = (y) => setLocal(l => ({ ...l, [active]: { ...l[active], y: String(y) } }));
  const setMonth = (m) => setLocal(l => ({ ...l, [active]: { ...l[active], m } }));
  const togglePresent = (v) => setLocal(l => ({ ...l, present: v }));

  const commit = () => {
    onStart(formatToken(local.start.m, local.start.y));
    if (local.present) {
      onEnd("Present"); onPresent(true);
    } else {
      onEnd(formatToken(local.end.m, local.end.y)); onPresent(false);
    }
    onClose();
  };
  const clear = () => setLocal({ start:{m:"",y:""}, end:{m:"",y:""}, present:false });

  const displayText = (which) => {
    const t = local[which];
    if (which === "end" && local.present) return "حتى الآن";
    if (!t.m && !t.y) return "—";
    return [t.m, t.y].filter(Boolean).join(" ");
  };

  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div className="dm-modal" onClick={e => e.stopPropagation()}>
        <div className="dm-header">
          <div className="dm-title">
            <Icon name="calendar"/>
            <span>اختر المدة</span>
          </div>
          <button className="dm-close" onClick={onClose}><Icon name="x"/></button>
        </div>

        <div className="dm-subhead">
          <div className="dm-cal-tabs">
            <button className={"dm-cal-tab" + (cal === "gregorian" ? " active" : "")} onClick={() => setCal("gregorian")}>ميلادي</button>
            <button className={"dm-cal-tab" + (cal === "hijri" ? " active" : "")} onClick={() => setCal("hijri")}>هجري</button>
          </div>
          <label className={"dm-present-toggle" + (local.present ? " on" : "")}>
            <input type="checkbox" checked={local.present} onChange={e => togglePresent(e.target.checked)}/>
            <span className="dm-toggle-dot"/>
            <span>أعمل هنا حتى الآن</span>
          </label>
        </div>

        <div className="dm-tab-cards">
          <button className={"dm-tab-card" + (active === "start" ? " active" : "")} onClick={() => setActive("start")}>
            <span className="dm-tab-label">البداية</span>
            <span className="dm-tab-val">{displayText("start")}</span>
          </button>
          <div className="dm-tab-sep">→</div>
          <button className={"dm-tab-card" + (active === "end" ? " active" : "") + (local.present ? " locked" : "")}
                  onClick={() => !local.present && setActive("end")}
                  disabled={local.present}>
            <span className="dm-tab-label">النهاية</span>
            <span className="dm-tab-val">{displayText("end")}</span>
          </button>
        </div>

        <div className="dm-body">
          <div className="dm-year-row">
            <button className="dm-year-nav" onClick={() => setYear(parseInt(cur.y || thisYear) - 1)}><Icon name="chevronR"/></button>
            <button className="dm-year-display" onClick={() => setYearPickerFor(active === "start" ? "start" : "end")}>
              {cur.y || (cal === "gregorian" ? thisYear : 1446)}
              <Icon name="chevronDown"/>
            </button>
            <button className="dm-year-nav" onClick={() => setYear(parseInt(cur.y || thisYear) + 1)}><Icon name="chevronL"/></button>
          </div>

          <div className="dm-month-grid">
            {months.map(m => (
              <button key={m.k} type="button"
                className={"dm-month-btn" + (cur.m === m.k ? " active" : "")}
                onClick={() => setMonth(m.k)}>
                <span className="dm-month-k">{m.k}</span>
                <span className="dm-month-n">{m.n}</span>
              </button>
            ))}
          </div>

          {yearPickerFor && (
            <div className="dm-year-overlay" onClick={() => setYearPickerFor(null)}>
              <div className="dm-year-grid" onClick={e => e.stopPropagation()}>
                {years.map(y => (
                  <button key={y} type="button"
                    className={"dm-year-item" + (String(local[yearPickerFor].y) === String(y) ? " active" : "") + (y === thisYear && cal === "gregorian" ? " current" : "")}
                    onClick={() => { setLocal(l => ({...l, [yearPickerFor]: {...l[yearPickerFor], y: String(y)}})); setYearPickerFor(null); }}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dm-footer">
          <button className="dm-clear-btn" onClick={clear}>مسح</button>
          <div className="dm-footer-actions">
            <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button className="btn btn-primary" onClick={commit}><Icon name="check"/> حفظ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========= Mobile bottom sheet ========= */
function DateSheetMobile({ start, end, present, onStart, onEnd, onPresent, onClose }) {
  const [cal, setCal] = useState("gregorian");
  const [active, setActive] = useState("start");
  const [local, setLocal] = useState({
    start: parseToken(start),
    end: parseToken(end === "Present" ? "" : end),
    present: !!present,
  });

  const months = cal === "gregorian" ? G_MONTHS_FULL : H_MONTHS_FULL;
  const thisYear = new Date().getFullYear();
  const years = cal === "gregorian"
    ? Array.from({length: 30}, (_, i) => thisYear + 2 - i)
    : Array.from({length: 30}, (_, i) => 1448 - i);

  const cur = local[active];

  const commit = () => {
    onStart(formatToken(local.start.m, local.start.y));
    if (local.present) { onEnd("Present"); onPresent(true); }
    else { onEnd(formatToken(local.end.m, local.end.y)); onPresent(false); }
    onClose();
  };

  const displayText = (which) => {
    const t = local[which];
    if (which === "end" && local.present) return "حتى الآن";
    if (!t.m && !t.y) return "—";
    return [t.m, t.y].filter(Boolean).join(" ");
  };

  return (
    <div className="ds-backdrop" onClick={onClose}>
      <div className="ds-sheet" onClick={e => e.stopPropagation()}>
        <div className="ds-handle"/>
        <div className="ds-header">
          <div className="ds-title">اختر المدة</div>
          <button className="ds-close" onClick={onClose}><Icon name="x"/></button>
        </div>

        <div className="ds-cal-tabs">
          <button className={"ds-cal-tab" + (cal === "gregorian" ? " active" : "")} onClick={() => setCal("gregorian")}>ميلادي</button>
          <button className={"ds-cal-tab" + (cal === "hijri" ? " active" : "")} onClick={() => setCal("hijri")}>هجري</button>
        </div>

        <div className="ds-tab-cards">
          <button className={"ds-tab-card" + (active === "start" ? " active" : "")} onClick={() => setActive("start")}>
            <span className="ds-tab-label">من</span>
            <span className="ds-tab-val">{displayText("start")}</span>
          </button>
          <button className={"ds-tab-card" + (active === "end" ? " active" : "") + (local.present ? " locked" : "")}
                  onClick={() => !local.present && setActive("end")}>
            <span className="ds-tab-label">إلى</span>
            <span className="ds-tab-val">{displayText("end")}</span>
          </button>
        </div>

        <label className={"ds-present" + (local.present ? " on" : "")}>
          <input type="checkbox" checked={local.present} onChange={e => setLocal(l => ({...l, present: e.target.checked}))}/>
          <span className="ds-present-dot"/>
          أعمل/أدرس هنا حتى الآن
        </label>

        <div className="ds-body">
          <div className="ds-year-row">
            <button onClick={() => setLocal(l => ({...l, [active]: {...cur, y: String(parseInt(cur.y || thisYear)-1)}}))}>
              <Icon name="chevronR"/>
            </button>
            <div className="ds-year-val">{cur.y || thisYear}</div>
            <button onClick={() => setLocal(l => ({...l, [active]: {...cur, y: String(parseInt(cur.y || thisYear)+1)}}))}>
              <Icon name="chevronL"/>
            </button>
          </div>
          <div className="ds-month-grid">
            {months.map(m => (
              <button key={m.k} type="button"
                className={"ds-month-btn" + (cur.m === m.k ? " active" : "")}
                onClick={() => setLocal(l => ({...l, [active]: {...cur, m: m.k}}))}>
                <span className="ds-month-k">{m.k}</span>
                <span className="ds-month-n">{m.n}</span>
              </button>
            ))}
          </div>
          <div className="ds-year-list-label">أو اختر السنة:</div>
          <div className="ds-year-list">
            {years.map(y => (
              <button key={y} type="button"
                className={"ds-year-chip" + (String(cur.y) === String(y) ? " active" : "")}
                onClick={() => setLocal(l => ({...l, [active]: {...cur, y: String(y)}}))}>
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="ds-footer">
          <button className="ds-clear" onClick={() => setLocal({start:{m:"",y:""}, end:{m:"",y:""}, present:false})}>مسح</button>
          <button className="btn btn-primary ds-save" onClick={commit}>حفظ</button>
        </div>
      </div>
    </div>
  );
}

/* ========= Item card ========= */
function ItemCard({ open, onToggle, onDelete, onMoveUp, onMoveDown, isFirst, isLast, title, subtitle, children }) {
  return (
    <div className={"item-card" + (open ? " open" : "")}>
      <div className="item-header" onClick={onToggle}>
        <Icon name="grip" className="drag-handle"/>
        <div className="item-title">
          <div className={"t1" + (!title ? " empty" : "")}>{title || "عنصر جديد (اضغط للفتح)"}</div>
          {subtitle && <div className="t2">{subtitle}</div>}
        </div>
        <div className="item-actions" onClick={e => e.stopPropagation()}>
          <button className="item-action-btn" onClick={onMoveUp} disabled={isFirst} title="تحريك لأعلى"><Icon name="chevronUp"/></button>
          <button className="item-action-btn" onClick={onMoveDown} disabled={isLast} title="تحريك لأسفل"><Icon name="chevronDown"/></button>
          <button className="item-action-btn danger" onClick={onDelete} title="حذف"><Icon name="trash"/></button>
          <button className="item-action-btn" onClick={onToggle}><Icon name="chevron" className="chevron"/></button>
        </div>
      </div>
      {open && <div className="item-body">{children}</div>}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          <span>{required && <span className="req">*</span>}{label}</span>
          {hint && <span className="field-hint">{hint}</span>}
        </label>
      )}
      {children}
    </div>
  );
}
function FieldRow({ children, cols = 2 }) {
  return <div className={"field-row" + (cols === 3 ? " three" : "")}>{children}</div>;
}
function BulletsEditor({ bullets, onChange, placeholder }) {
  const update = (i, val) => { const n=[...bullets]; n[i]=val; onChange(n); };
  const remove = (i) => onChange(bullets.filter((_, j) => j !== i));
  const add = () => onChange([...bullets, ""]);
  return (
    <div>
      <div className="bullets">
        {bullets.map((b, i) => (
          <div className="bullet-row" key={i}>
            <div className="bullet-dot"/>
            <input className="input ltr" dir="ltr" value={b} placeholder={placeholder || "نقطة إنجاز…"} onChange={e => update(i, e.target.value)}/>
            <button className="remove-btn" onClick={() => remove(i)} title="حذف"><Icon name="x" width="14" height="14"/></button>
          </div>
        ))}
      </div>
      <button className="btn-add-bullet" onClick={add} style={{marginTop: bullets.length ? 8 : 0}}>
        <Icon name="plus"/> إضافة نقطة
      </button>
    </div>
  );
}

Object.assign(window, { DatePicker, ItemCard, Field, FieldRow, BulletsEditor });
