/* Shared UI components */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Topbar({ previewCollapsed, onTogglePreview, onDemo, onClear, onDownload, onMobilePreview, completion }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">م</div>
        <div className="brand-name">مساري</div>
        <div className="brand-sub">صانع السيرة الذاتية</div>
      </div>
      <div className="topbar-creator desktop-only">
        صُنع بشغف بواسطة <a href="https://www.linkedin.com/in/alfaifi-sultan" target="_blank" rel="noopener noreferrer">سلطان الفيفي</a>
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
        {/* Mobile preview button — inside topbar next to download */}
        <button className="btn btn-ghost mobile-only topbar-preview-btn" onClick={onMobilePreview}>
          <Icon name="eye"/>
          <span className="topbar-preview-pct">{Math.round(completion || 0)}%</span>
        </button>
        <button className="btn btn-primary" onClick={onDownload}>
          <Icon name="download"/> <span className="action-label">تحميل PDF</span>
        </button>
      </div>
    </div>
  );
}

/* ============ Sidebar with drag-and-drop ============ */
function Sidebar({ sections, current, onSelect, counts, completion, onMove, onReorder, onResetOrder, onOpenGuide }) {
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
        <div className="sh-box">
          <div className="sh-top">
            <span className="sh-title">الأقسام</span>
            <button className="sh-reset-btn" onClick={onResetOrder} title="إعادة ترتيب الأقسام">
              <Icon name="refresh" /> استعادة الترتيب
            </button>
          </div>
          <div className="sh-hint">اسحب أي قسم لإعادة ترتيبه للأعلى أو للأسفل</div>
        </div>
        {sections.map((s, i) => {
          const isPinned = s.pinned;
          return (
            <div key={s.id}
                 className={
                   "nav-item" +
                   (current === s.id ? " active" : "") +
                   (isPinned ? " pinned" : "") +
                   (dragId === s.id ? " dragging" : "") +
                   (overId === s.id ? " drag-over" : "")
                 }
                 title={!isPinned ? "اضغط للتعديل، واسحب للترتيب" : ""}
                 onClick={() => onSelect(s.id)}
                 draggable={!isPinned}
                 onDragStart={e => handleDragStart(e, s.id, isPinned)}
                 onDragOver={e => handleDragOver(e, s.id, isPinned)}
                 onDragLeave={() => setOverId(o => o === s.id ? null : o)}
                 onDrop={e => handleDrop(e, s.id, isPinned)}
                 onDragEnd={handleDragEnd}>
              {isPinned && (
                <Icon name="pinFill" className="nav-pin-icon" />
              )}
              <Icon name={s.icon} className="nav-icon"/>
              <span className="nav-label">{s.label}</span>
              <div className="nav-right-actions">
                {counts[s.id] != null && counts[s.id] > 0 && <span className="nav-count">{counts[s.id]}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sidebar-footer">
        {/* Bitaqa promo card — compact height matching ATS badge */}
        <a className="bitaqa-card" href="https://bitaqa-production.up.railway.app/" target="_blank" rel="noopener noreferrer" onClick={() => {
          if (window.gtag) {
            window.gtag("event", "click_bitaqa", {
              event_category: "Outbound Link",
              event_label: "الضغط على منصة بطاقة"
            });
          }
        }}>
          <div className="bitaqa-shine"/>
          <div className="bitaqa-inner">
            <div className="bitaqa-badge-row">
              <div className="bitaqa-logo">
                <Icon name="link"/>
              </div>
              <span className="bitaqa-new">جديد</span>
            </div>
            <div className="bitaqa-right">
              <div className="bitaqa-title">بِطاقة</div>
              <div className="bitaqa-sub">رابط واحد يجمع سيرتك، مشاريعك، وروابطك — جاهز للمشاركة.</div>
              <div className="bitaqa-cta">
                جرّب بِطاقة الآن
                <Icon name="chevronL"/>
              </div>
            </div>
          </div>
        </a>

        <button className="guide-btn" onClick={onOpenGuide}>
          <div className="guide-btn-icon"><Icon name="star"/></div>
          <div className="guide-btn-text" style={{textAlign: 'right'}}>
            <div className="gb-title">الدليل الشامل</div>
            <div className="gb-sub">أسرار السيرة الذاتية الناجحة وتصميمها</div>
          </div>
          <Icon name="chevronL"/>
        </button>

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
          <span className="sidebar-footer-label"><Icon name="shield" width="13" height="13"/> بياناتك تُحفظ بأمان</span>
        </div>
      </div>
    </aside>
  );
}

/* ============ Mobile bottom tab bar ============ */
function MobileTabBar({ sections, current, onSelect, onOpenSections }) {
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
function MobileSectionsSheet({ open, sections, current, counts, onSelect, onClose, onMove, onReorder, onOpenGuide, onClear, onDemo }) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  if (!open) return null;

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
    <div className="m-sheet-backdrop" onClick={onClose}>
      <div className="m-sheet" onClick={e => e.stopPropagation()}>
        <div className="m-sheet-handle"/>
        <div className="m-sheet-header">
          <div className="t">الأقسام</div>
          <button className="m-sheet-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="m-sheet-hint">اضغط للفتح • اسحب القسم من الجانب لإعادة الترتيب</div>
        <div className="m-sheet-list">
          {sections.map((s) => {
            const isPinned = s.pinned;
            return (
              <div key={s.id} 
                   className={
                     "m-sheet-row" + 
                     (current === s.id ? " active" : "") + 
                     (isPinned ? " pinned" : "") +
                     (dragId === s.id ? " dragging" : "") +
                     (overId === s.id ? " drag-over" : "")
                   }
                   onClick={() => { onSelect(s.id); onClose(); }}
                   draggable={!isPinned}
                   onDragStart={e => handleDragStart(e, s.id, isPinned)}
                   onDragOver={e => handleDragOver(e, s.id, isPinned)}
                   onDragLeave={() => setOverId(o => o === s.id ? null : o)}
                   onDrop={e => handleDrop(e, s.id, isPinned)}
                   onDragEnd={handleDragEnd}>
                
                {/* Visual drag handle proxy instead of arrows */}
                {!isPinned && <div className="m-sheet-drag-handle" style={{opacity: 0.3}}><Icon name="grip" width="16" height="16"/></div>}
                
                <Icon name={s.icon} className="m-sheet-icon" style={!isPinned ? {marginLeft: 8} : {}}/>
                <div className="m-sheet-row-main">
                  <div className="m-sheet-row-label">{s.label}</div>
                  {isPinned && <div className="m-sheet-row-sub">ثابت</div>}
                </div>
                {counts[s.id] > 0 && <span className="m-sheet-count">{counts[s.id]}</span>}
              </div>
            );
          })}
        </div>
        <div className="m-sheet-guide">
          <button className="guide-btn" onClick={onOpenGuide}>
            <div className="guide-btn-icon"><Icon name="star"/></div>
            <div className="guide-btn-text">
              <div className="gb-title">الدليل الشامل</div>
              <div className="gb-sub">أسرار السيرة الذاتية الناجحة وتصميمها</div>
            </div>
            <Icon name="chevronL"/>
          </button>
          
          <div className="m-sheet-actions">
            <button className="btn btn-ghost m-action-btn" onClick={onDemo}><Icon name="refresh"/> تعبئة تجريبية</button>
            <button className="btn btn-ghost danger m-action-btn" onClick={onClear}><Icon name="trash"/> تفريغ بالكامل</button>
          </div>

          <div className="m-sheet-footer">
            <div className="m-sheet-footer-sec"><Icon name="shield" width="13" height="13"/> بياناتك تُحفظ بأمان</div>
            <div className="m-sheet-footer-dev">صُنع بشغف بواسطة <a href="https://www.linkedin.com/in/alfaifi-sultan" target="_blank" rel="noopener noreferrer">سلطان الفيفي</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "تأكيد", cancelLabel = "إلغاء", isDanger = false }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = (action) => {
    setIsClosing(true);
    setTimeout(() => {
      action();
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className={`c-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={() => handleClose(onCancel)}>
      <div className={`c-modal ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="c-modal-icon" style={isDanger ? {background: "#fee2e2", color: "#dc2626"} : {background: "#ebf5ff", color: "#2563eb"}}>
          <Icon name={isDanger ? "trash" : "alert"} width="28" height="28" />
        </div>
        <div className="c-modal-title">{title}</div>
        <div className="c-modal-message">{message}</div>
        <div className="c-modal-actions">
          <button className="btn btn-ghost cancel-btn" onClick={() => handleClose(onCancel)}>{cancelLabel}</button>
          <button className={`btn ${isDanger ? 'danger' : 'btn-primary'} confirm-btn`} onClick={() => handleClose(onConfirm)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, Sidebar, MobileTabBar, MobileSectionsSheet, ConfirmModal });
