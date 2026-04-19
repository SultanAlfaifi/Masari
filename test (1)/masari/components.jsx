/* Shared UI components */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Topbar({ previewCollapsed, onTogglePreview, onDemo, onClear, onDownload }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">م</div>
        <div className="brand-name">مساري</div>
        <div className="brand-sub">صانع السيرة الذاتية</div>
      </div>
      <div className="topbar-creator desktop-only">
        صُنع بشغف بواسطة <a href="#" onClick={e=>e.preventDefault()}>سلطان الفيفي</a>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost desktop-only" onClick={onDemo}>
          <Icon name="refresh"/> بيانات تجريبية
        </button>
        <button className="btn btn-ghost danger desktop-only" onClick={onClear}>
          <Icon name="trash"/> تفريغ
        </button>
        <div style={{width:1, height:22, background:"var(--border)", margin:"0 4px"}} className="desktop-only"/>
        <button className="btn btn-ghost btn-icon desktop-only" onClick={onTogglePreview} title="إخفاء/إظهار المعاينة">
          <Icon name="panelL"/>
        </button>
        <button className="btn btn-primary" onClick={onDownload}>
          <Icon name="download"/> تحميل PDF
        </button>
      </div>
    </div>
  );
}

/* ============ Sidebar with drag-and-drop ============ */
function Sidebar({ sections, current, onSelect, counts, completion, onMove, onReorder }) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const handleDragStart = (e, id, isPinned) => {
    if (isPinned) { e.preventDefault(); return; }
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", id); } catch {}
  };
  const handleDragOver = (e, id, isPinned) => {
    if (isPinned || !dragId || dragId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverId(id);
  };
  const handleDrop = (e, id, isPinned) => {
    e.preventDefault();
    if (isPinned || !dragId || dragId === id) { setDragId(null); setOverId(null); return; }
    onReorder(dragId, id);
    setDragId(null); setOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setOverId(null); };

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        <div className="sidebar-section-label">
          <span>الأقسام</span>
          <span className="sidebar-section-hint">اسحب الأيقونة ⋮⋮ للترتيب</span>
        </div>
        {sections.map((s, i) => {
          const isPinned = s.pinned;
          const movableIdxs = sections.map((x, idx) => x.pinned ? null : idx).filter(v => v !== null);
          const movableIdxInList = movableIdxs.indexOf(i);
          const firstMovable = movableIdxInList === 0;
          const lastMovable = movableIdxInList === movableIdxs.length - 1;
          return (
            <div key={s.id}
                 className={
                   "nav-item" +
                   (current === s.id ? " active" : "") +
                   (isPinned ? " pinned" : "") +
                   (dragId === s.id ? " dragging" : "") +
                   (overId === s.id ? " drag-over" : "")
                 }
                 onClick={() => onSelect(s.id)}
                 onDragOver={e => handleDragOver(e, s.id, isPinned)}
                 onDragLeave={() => setOverId(o => o === s.id ? null : o)}
                 onDrop={e => handleDrop(e, s.id, isPinned)}
                 onDragEnd={handleDragEnd}>
              {!isPinned ? (
                <span className="drag-grip"
                      draggable
                      onDragStart={e => handleDragStart(e, s.id, false)}
                      onClick={e => e.stopPropagation()}
                      title="اسحب للترتيب">
                  <Icon name="grip"/>
                </span>
              ) : (
                <span className="drag-grip pinned-lock" title="البيانات الشخصية ثابتة">
                  <Icon name="pinFill"/>
                </span>
              )}
              <Icon name={s.icon} className="nav-icon"/>
              <span className="nav-label">{s.label}</span>
              {counts[s.id] != null && counts[s.id] > 0 && <span className="nav-count">{counts[s.id]}</span>}
              {!isPinned && (
                <div className="nav-reorder" onClick={e => e.stopPropagation()}>
                  <button className="nav-reorder-btn" onClick={() => onMove(s.id, -1)} disabled={firstMovable} title="تحريك لأعلى">
                    <Icon name="chevronUp"/>
                  </button>
                  <button className="nav-reorder-btn" onClick={() => onMove(s.id, 1)} disabled={lastMovable} title="تحريك لأسفل">
                    <Icon name="chevronDown"/>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sidebar-footer">
        {/* Bitaqa promo card */}
        <a className="bitaqa-card" href="#" onClick={e => e.preventDefault()}>
          <div className="bitaqa-shine"/>
          <div className="bitaqa-badge-row">
            <div className="bitaqa-logo">
              <Icon name="link"/>
            </div>
            <span className="bitaqa-new">جديد</span>
          </div>
          <div className="bitaqa-title">بِطاقة</div>
          <div className="bitaqa-sub">رابط واحد يجمع سيرتك، مشاريعك، وروابطك — جاهز للمشاركة.</div>
          <div className="bitaqa-cta">
            جرّب بِطاقة الآن
            <Icon name="chevronL"/>
          </div>
        </a>

        <div className="ats-badge">
          <span className="ats-dot"/>
          <div>
            <div className="ats-title">جاهز لأنظمة ATS</div>
            <div className="ats-sub">قوالب متوافقة مع أنظمة تتبّع المتقدّمين</div>
          </div>
        </div>
        <div className="progress-label">
          <span>اكتمال السيرة</span>
          <span>{Math.round(completion)}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width: completion + "%"}}/></div>
        <div className="sidebar-footer-row">
          <span className="sidebar-footer-label"><Icon name="shield" width="13" height="13"/> بياناتك محليّة فقط</span>
        </div>
      </div>
    </aside>
  );
}

/* ============ Mobile bottom tab bar ============ */
function MobileTabBar({ sections, current, onSelect, onOpenSections }) {
  // Show current section + quick pills of 4 others + "more" button
  return (
    <nav className="mobile-tabbar mobile-only">
      <button className="mtab-more" onClick={onOpenSections}>
        <Icon name="grid"/>
        <span>كل الأقسام</span>
      </button>
      <div className="mtab-current">
        <div className="mtab-current-label">القسم الحالي</div>
        <div className="mtab-current-name">
          <Icon name={sections.find(s => s.id === current)?.icon}/>
          {sections.find(s => s.id === current)?.label}
        </div>
      </div>
    </nav>
  );
}

/* Mobile sections sheet */
function MobileSectionsSheet({ open, sections, current, counts, onSelect, onClose, onMove, onReorder }) {
  if (!open) return null;
  return (
    <div className="m-sheet-backdrop" onClick={onClose}>
      <div className="m-sheet" onClick={e => e.stopPropagation()}>
        <div className="m-sheet-handle"/>
        <div className="m-sheet-header">
          <div className="t">الأقسام</div>
          <button className="m-sheet-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="m-sheet-hint">اضغط للتنقل • اسحب ▲▼ لإعادة الترتيب</div>
        <div className="m-sheet-list">
          {sections.map((s, i) => {
            const movableIdxs = sections.map((x, idx) => x.pinned ? null : idx).filter(v => v !== null);
            const midx = movableIdxs.indexOf(i);
            const firstMovable = midx === 0;
            const lastMovable = midx === movableIdxs.length - 1;
            return (
              <div key={s.id} className={"m-sheet-row" + (current === s.id ? " active" : "") + (s.pinned ? " pinned" : "")}
                   onClick={() => { onSelect(s.id); onClose(); }}>
                <Icon name={s.icon} className="m-sheet-icon"/>
                <div className="m-sheet-row-main">
                  <div className="m-sheet-row-label">{s.label}</div>
                  {s.pinned && <div className="m-sheet-row-sub">ثابت</div>}
                </div>
                {counts[s.id] > 0 && <span className="m-sheet-count">{counts[s.id]}</span>}
                {!s.pinned && (
                  <div className="m-sheet-arrows" onClick={e => e.stopPropagation()}>
                    <button disabled={firstMovable} onClick={() => onMove(s.id, -1)}><Icon name="chevronUp"/></button>
                    <button disabled={lastMovable} onClick={() => onMove(s.id, 1)}><Icon name="chevronDown"/></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, Sidebar, MobileTabBar, MobileSectionsSheet });
