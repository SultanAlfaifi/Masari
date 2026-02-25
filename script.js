const LOCAL_KEY = 'bluder_v7_full_cv';

let resumeData = {
    personal: {
        name: "Sultan AlFifi",
        phone: "+966 50 123 4567",
        email: "sultan@example.com",
        social: "https://www.linkedin.com/in/alfaifi-sultan",
        location: "Makkah, KSA"
    },
    skills: [
        { id: 101, category: "Languages", items: "Python, JavaScript, TypeScript, Java" },
        { id: 102, category: "Tools", items: "React, Node.js, Git, Figma, Docker" }
    ],
    projects: [
        {
            id: 3,
            name: "Hajj & Umrah Guide App",
            date: "Mar. 2021 -- Nov. 2021",
            items: "Built a cross-platform mobile application to assist pilgrims.\nIntegrated live maps and offline features for accessibility."
        }
    ],
    experience: [
        {
            id: 1,
            company: "Tech Solutions Co.",
            date: "Jan. 2022 -- Present",
            role: "Software Engineer",
            location: "Makkah, KSA",
            items: "Developed scalable web applications serving thousands of users.\nOptimized database queries, reducing load times by 40%."
        }
    ],
    education: [
        {
            id: 4,
            school: "Umm Al-Qura University",
            date: "Aug. 2017 -- May. 2021",
            degree: "B.S. in Computer Science",
            location: "Makkah, KSA",
            items: "**GPA**: 4.8/5.0 with First Class Honors.\n**Coursework**: Data Structures, Web Engineering."
        }
    ],
    certifications: [
        {
            id: 103,
            name: "AWS Certified Developer – Associate",
            date: "Mar. 2022",
            issuer: "Amazon Web Services",
            items: ""
        }
    ],
    awards: [
        {
            id: 104,
            name: "First Place - Hackathon Makkah",
            date: "Sept. 2020",
            items: "Led a team of 4 to build an innovative crowd-management AI solution."
        }
    ],
    volunteering: [
        {
            id: 105,
            role: "Mentor & Tech Support",
            date: "Ramadan 2019",
            org: "Grand Mosque Visitors Care",
            location: "Makkah, KSA",
            items: "Assisted elderly pilgrims with digital apps and wayfinding."
        }
    ]
};

window.onload = () => {
    const template = document.getElementById('pdf-root');
    document.getElementById('desktop-preview-container').appendChild(template);

    loadProgress();
    renderAll();
    lucide.createIcons();
    handleSocialInput(resumeData.personal.social || "");
};

/* --- NAVIGATION --- */
function showSection(num) {
    document.querySelectorAll('.section-wrapper').forEach(el => el.classList.remove('active'));
    document.querySelector(`#sec-${num}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeNav = document.querySelector(`#nav-sec-${num}`);
    activeNav.classList.add('active');

    // Smooth horizontal scroll to center active tab on mobile
    if (window.innerWidth <= 1024) {
        activeNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    document.getElementById('main-editor').scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileModal() {
    const modal = document.getElementById('mobilePreviewModal');
    const root = document.getElementById('pdf-root');
    const isOpening = !modal.classList.contains('active');

    if (isOpening) {
        document.getElementById('mobile-preview-container').appendChild(root);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        document.getElementById('desktop-preview-container').appendChild(root);
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* --- LOGIC  --- */
function handleSocialInput(val) {
    resumeData.personal.social = val;
    const iconBox = document.getElementById('social-icon-box');
    const previewIcon = document.getElementById('cv-social-icon');

    let iconClass = "fas fa-link";
    const low = (val || "").toLowerCase();

    if (low.includes('linkedin.com')) iconClass = "fab fa-linkedin color-linkedin";
    else if (low.includes('github.com')) iconClass = "fab fa-github color-github";
    else if (low.includes('twitter.com') || low.includes('x.com')) iconClass = "fab fa-x-twitter-alt color-x";
    else if (low.includes('behance.net')) iconClass = "fab fa-behance color-behance";
    else if (low.includes('dribbble.com')) iconClass = "fab fa-dribbble color-dribbble";
    else if (low.includes('vimeo.com')) iconClass = "fab fa-vimeo color-vimeo";
    else if (low.includes('youtube.com')) iconClass = "fab fa-youtube color-youtube";

    iconBox.innerHTML = `<i class="${iconClass}" style="opacity:1;"></i>`;

    // Clean CV icon
    let cvClass = iconClass.split(' ')[0] + " " + iconClass.split(' ')[1];
    previewIcon.className = `${cvClass} cv-icon`;

    // Extraction logic
    let docSocial = val;
    try {
        if (val.startsWith('http')) {
            const url = new URL(val);
            let path = url.pathname;
            if (low.includes('linkedin.com/in/')) {
                const matches = path.match(/\/in\/([^\/]+)/);
                if (matches && matches[1]) docSocial = matches[1];
            } else {
                docSocial = path.replace(/^\//, '').replace(/\/$/, '') || url.hostname;
            }
        }
    } catch (e) { }

    document.getElementById('cv-social').textContent = docSocial || val || "";
    saveAndRefresh(false);
}

function updateInputFields() {
    const p = resumeData.personal;
    document.getElementById('in-name').value = p.name || "";
    document.getElementById('in-phone').value = p.phone || "";
    document.getElementById('in-email').value = p.email || "";
    document.getElementById('in-social').value = p.social || "";
    document.getElementById('in-location').value = p.location || "";
}

function renderAll() {
    renderPersonal();
    renderSkills();
    renderProjects();
    renderExperience();
    renderEducation();
    renderCertifications();
    renderAwards();
    renderVolunteering();
}

function formatBold(txt) {
    return txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/* RENDERING BLOCKS */
function renderPersonal() {
    const p = resumeData.personal;
    document.getElementById('cv-name').textContent = p.name || "";
    document.getElementById('cv-phone').textContent = p.phone || "";
    document.getElementById('cv-email').textContent = p.email || "";
    document.getElementById('cv-location').textContent = p.location || "";

    const hp = !!p.phone, he = !!p.email, hs = !!p.social, hl = !!p.location;
    document.getElementById('c-icon-phone').style.display = hp ? "inline-block" : "none";
    document.getElementById('c-sep-1').style.display = (hp && (he || hs || hl)) ? "inline-block" : "none";
    document.getElementById('c-icon-email').style.display = he ? "inline-block" : "none";
    document.getElementById('c-sep-2').style.display = (he && (hs || hl)) ? "inline-block" : "none";
    document.getElementById('c-icon-social').style.display = hs ? "inline-block" : "none";
    document.getElementById('c-sep-3').style.display = (hs && hl) ? "inline-block" : "none";
    document.getElementById('c-icon-loc').style.display = hl ? "inline-block" : "none";
}

function buildBulletPoints(text) {
    if (!text) return "";
    return `<ul class="cv-bullets">${text.split('\n').filter(i => i.trim()).map(i => `<li>${formatBold(i)}</li>`).join('')}</ul>`;
}

function renderSkills() {
    const editList = document.getElementById('skills-list');
    const viewList = document.getElementById('v-skills-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-skills').style.display = resumeData.skills.length ? "block" : "none";

    resumeData.skills.forEach(sk => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('skills', ${sk.id})" title="حذف الفئة"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">عنوان الفئة</label><input type="text" style="direction:ltr;" class="form-input" value="${sk.category}" oninput="updateItem('skills', ${sk.id}, 'category', this.value)" placeholder="Category Name"></div>
                <div class="form-group col-span-2"><label class="form-label">محتوى الفئة (افصل بفاصلة)</label><textarea style="direction:ltr;" class="form-input form-textarea" style="min-height: 60px;" oninput="updateItem('skills', ${sk.id}, 'items', this.value)" placeholder="JavaScript, Python, SQL...">${sk.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        if (sk.category || sk.items) viewList.innerHTML += `<div style="font-size:9.5pt;margin-bottom:4px;"><strong>${sk.category ? sk.category + ":" : ""}</strong> ${sk.items}</div>`;
    });
}

function addSkillSuggestion(cat) {
    let items = "";
    if (cat === "Languages") items = "Python, JavaScript, SQL";
    if (cat === "Tools & Frameworks") items = "React, Docker, AWS, Git";
    if (cat === "Soft Skills") items = "Leadership, Problem Solving, Communication";
    resumeData.skills.push({ id: Date.now(), category: cat, items: items });
    saveAndRefresh();
}

function addSkillObj() { resumeData.skills.push({ id: Date.now(), category: "", items: "" }); saveAndRefresh(); }

function renderProjects() {
    const editList = document.getElementById('project-list');
    const viewList = document.getElementById('v-project-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-proj').style.display = resumeData.projects.length ? "block" : "none";

    resumeData.projects.forEach(p => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('projects', ${p.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">المشروع</label><input type="text" style="direction:ltr;" class="form-input" value="${p.name}" oninput="updateItem('projects', ${p.id}, 'name', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('projects', ${p.id}, 'date')"><span style="direction:ltr; display:inline-block">${p.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group col-span-2"><label class="form-label">التفاصيل (كل سطر نقطة)</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('projects', ${p.id}, 'items', this.value)">${p.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        const item = document.createElement('div'); item.className = "cv-item";
        item.innerHTML = `<div class="cv-row-1"><span><strong>${p.name}</strong></span><span class="cv-date">${p.date}</span></div>${buildBulletPoints(p.items)}`;
        viewList.appendChild(item);
    });
}

function renderExperience() {
    const editList = document.getElementById('experience-list');
    const viewList = document.getElementById('v-experience-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-exp').style.display = resumeData.experience.length ? "block" : "none";

    resumeData.experience.forEach(exp => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('experience', ${exp.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">الشركة (Company)</label><input type="text" style="direction:ltr;" class="form-input" value="${exp.company}" oninput="updateItem('experience', ${exp.id}, 'company', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('experience', ${exp.id}, 'date')"><span style="direction:ltr; display:inline-block">${exp.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group"><label class="form-label">المسمى (Role)</label><input type="text" style="direction:ltr;" class="form-input" value="${exp.role}" oninput="updateItem('experience', ${exp.id}, 'role', this.value)"></div>
                <div class="form-group"><label class="form-label">المنطقة (Location)</label><input type="text" style="direction:ltr;" class="form-input" value="${exp.location}" oninput="updateItem('experience', ${exp.id}, 'location', this.value)"></div>
                <div class="form-group col-span-2"><label class="form-label">المهام والانجازات</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('experience', ${exp.id}, 'items', this.value)">${exp.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        const item = document.createElement('div'); item.className = "cv-item";
        item.innerHTML = `<div class="cv-row-1"><span>${exp.company}</span><span class="cv-date">${exp.date}</span></div><div class="cv-row-2"><span class="cv-role">${exp.role}</span><span>${exp.location}</span></div>${buildBulletPoints(exp.items)}`;
        viewList.appendChild(item);
    });
}

function renderEducation() {
    const editList = document.getElementById('education-list');
    const viewList = document.getElementById('v-education-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-edu').style.display = resumeData.education.length ? "block" : "none";

    resumeData.education.forEach(e => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('education', ${e.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">المؤسسة / الجامعة</label><input type="text" style="direction:ltr;" class="form-input" value="${e.school}" oninput="updateItem('education', ${e.id}, 'school', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('education', ${e.id}, 'date')"><span style="direction:ltr; display:inline-block">${e.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group"><label class="form-label">الدرجة (Degree)</label><input type="text" style="direction:ltr;" class="form-input" value="${e.degree}" oninput="updateItem('education', ${e.id}, 'degree', this.value)"></div>
                <div class="form-group"><label class="form-label">المدينة</label><input type="text" style="direction:ltr;" class="form-input" value="${e.location}" oninput="updateItem('education', ${e.id}, 'location', this.value)"></div>
                <div class="form-group col-span-2"><label class="form-label">التفاصيل المؤهل (كالمعدل)</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('education', ${e.id}, 'items', this.value)">${e.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        const item = document.createElement('div'); item.className = "cv-item";
        item.innerHTML = `<div class="cv-row-1"><span>${e.school}</span><span class="cv-date">${e.date}</span></div><div class="cv-row-2"><span class="cv-role">${e.degree}</span><span>${e.location}</span></div>${buildBulletPoints(e.items)}`;
        viewList.appendChild(item);
    });
}

function renderCertifications() {
    const editList = document.getElementById('certification-list');
    const viewList = document.getElementById('v-certification-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-cert').style.display = resumeData.certifications.length ? "block" : "none";

    resumeData.certifications.forEach(cert => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('certifications', ${cert.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group col-span-2"><label class="form-label">اسم الشهادة (Certificate Name)</label><input type="text" style="direction:ltr;" class="form-input" value="${cert.name}" oninput="updateItem('certifications', ${cert.id}, 'name', this.value)"></div>
                <div class="form-group"><label class="form-label">جهة الإصدار (Issuer)</label><input type="text" style="direction:ltr;" class="form-input" value="${cert.issuer}" oninput="updateItem('certifications', ${cert.id}, 'issuer', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('certifications', ${cert.id}, 'date')"><span style="direction:ltr; display:inline-block">${cert.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group col-span-2"><label class="form-label">تفاصيل إضافية (اختياري)</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('certifications', ${cert.id}, 'items', this.value)">${cert.items}</textarea></div>
            </div>`;
        editList.appendChild(card);

        const item = document.createElement('div'); item.className = "cv-item";
        let titleLine = `<div class="cv-row-1"><span>${cert.name}</span><span class="cv-date">${cert.date}</span></div>`;
        if (cert.issuer) titleLine += `<div class="cv-row-2"><span class="cv-role">${cert.issuer}</span></div>`;
        item.innerHTML = titleLine + buildBulletPoints(cert.items);
        viewList.appendChild(item);
    });
}

function renderAwards() {
    const editList = document.getElementById('award-list');
    const viewList = document.getElementById('v-award-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-award').style.display = resumeData.awards.length ? "block" : "none";

    resumeData.awards.forEach(aw => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('awards', ${aw.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">عنوان الجائزة</label><input type="text" style="direction:ltr;" class="form-input" value="${aw.name}" oninput="updateItem('awards', ${aw.id}, 'name', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('awards', ${aw.id}, 'date')"><span style="direction:ltr; display:inline-block">${aw.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group col-span-2"><label class="form-label">التفاصيل أو الإنجاز</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('awards', ${aw.id}, 'items', this.value)">${aw.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        const item = document.createElement('div'); item.className = "cv-item";
        item.innerHTML = `<div class="cv-row-1"><span>${aw.name}</span><span class="cv-date">${aw.date}</span></div>${buildBulletPoints(aw.items)}`;
        viewList.appendChild(item);
    });
}

function renderVolunteering() {
    const editList = document.getElementById('volunteering-list');
    const viewList = document.getElementById('v-volunteering-items');
    editList.innerHTML = ""; viewList.innerHTML = "";
    document.getElementById('v-vol').style.display = resumeData.volunteering.length ? "block" : "none";

    resumeData.volunteering.forEach(vol => {
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `<button class="btn-delete" onclick="removeItem('volunteering', ${vol.id})"><i data-lucide="trash-2" style="width:18px;"></i></button>
            <div class="form-grid">
                <div class="form-group"><label class="form-label">المنظمة (Organization)</label><input type="text" style="direction:ltr;" class="form-input" value="${vol.org}" oninput="updateItem('volunteering', ${vol.id}, 'org', this.value)"></div>
                <div class="form-group"><label class="form-label">الفترة (Date)</label><div class="fake-input" onclick="openDatePicker('volunteering', ${vol.id}, 'date')"><span style="direction:ltr; display:inline-block">${vol.date || 'اختر الفترة...'}</span><i data-lucide="calendar" style="width:16px;"></i></div></div>
                <div class="form-group"><label class="form-label">الدور (Role)</label><input type="text" style="direction:ltr;" class="form-input" value="${vol.role}" oninput="updateItem('volunteering', ${vol.id}, 'role', this.value)"></div>
                <div class="form-group"><label class="form-label">المدينة</label><input type="text" style="direction:ltr;" class="form-input" value="${vol.location}" oninput="updateItem('volunteering', ${vol.id}, 'location', this.value)"></div>
                <div class="form-group col-span-2"><label class="form-label">المهام التطوعية</label><textarea style="direction:ltr;" class="form-input form-textarea" oninput="updateItem('volunteering', ${vol.id}, 'items', this.value)">${vol.items}</textarea></div>
            </div>`;
        editList.appendChild(card);
        const item = document.createElement('div'); item.className = "cv-item";
        item.innerHTML = `<div class="cv-row-1"><span>${vol.org}</span><span class="cv-date">${vol.date}</span></div>
            <div class="cv-row-2"><span class="cv-role">${vol.role}</span><span>${vol.location}</span></div>${buildBulletPoints(vol.items)}`;
        viewList.appendChild(item);
    });
    lucide.createIcons();
}

/** CRUD HELPERS **/
function saveAndRefresh(fullRender = true) {
    resumeData.personal.name = document.getElementById('in-name').value;
    resumeData.personal.phone = document.getElementById('in-phone').value;
    resumeData.personal.email = document.getElementById('in-email').value;
    resumeData.personal.social = document.getElementById('in-social').value;
    resumeData.personal.location = document.getElementById('in-location').value;
    saveProgress();
    if (fullRender) renderAll();
}

function updateItem(type, id, key, value) {
    const item = resumeData[type].find(i => i.id === id);
    if (item) item[key] = value;
    saveProgress();
    renderAll();
}

function addExperience() { resumeData.experience.push({ id: Date.now(), company: "", date: "", role: "", location: "", items: "" }); saveAndRefresh(); }
function addProject() { resumeData.projects.push({ id: Date.now(), name: "", date: "", items: "" }); saveAndRefresh(); }
function addEducation() { resumeData.education.push({ id: Date.now(), school: "", date: "", degree: "", location: "", items: "" }); saveAndRefresh(); }
function addCertification() { resumeData.certifications.push({ id: Date.now(), name: "", date: "", issuer: "", items: "" }); saveAndRefresh(); }
function addAward() { resumeData.awards.push({ id: Date.now(), name: "", date: "", items: "" }); saveAndRefresh(); }
function addVolunteering() { resumeData.volunteering.push({ id: Date.now(), role: "", date: "", org: "", location: "", items: "" }); saveAndRefresh(); }

function removeItem(type, id) { resumeData[type] = resumeData[type].filter(i => i.id !== id); saveAndRefresh(); }

function saveProgress() { localStorage.setItem(LOCAL_KEY, JSON.stringify(resumeData)); }
function loadProgress() {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
        let loaded = JSON.parse(saved);
        // Ensure new arrays exist if user loads older state
        ['certifications', 'awards', 'volunteering', 'skills', 'experience', 'projects', 'education'].forEach(arr => {
            if (!loaded[arr]) loaded[arr] = [];
        });
        resumeData = loaded;
        updateInputFields();
    }
}
function resetData() {
    if (confirm("هل أنت متأكد من مسح جميع البيانات للبدء من جديد؟")) {
        localStorage.removeItem(LOCAL_KEY);
        location.reload();
    }
}

/* PDF Generate */
document.getElementById('download-btn-desktop').addEventListener('click', downloadPDF);

function downloadPDF() {
    const btnIconWrapper = document.getElementById('download-btn-desktop');
    const originalContent = btnIconWrapper.innerHTML;
    btnIconWrapper.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-inline-end: 8px;"></i> جاري التصدير...';

    const element = document.getElementById('pdf-root');
    const opt = {
        margin: 0,
        filename: `${resumeData.personal.name || 'CV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btnIconWrapper.innerHTML = originalContent;
    });
}

/* --- Date Picker Logic --- */
let dpTargetType = null;
let dpTargetId = null;
let dpTargetKey = null;
let currentCalType = 'gregorian';

const dpMonths = {
    gregorian: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    hijri: ["Muharram", "Safar", "Rabi I", "Rabi II", "Jumada I", "Jumada II", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"]
};

function generateYears(type) {
    let years = [];
    if (type === 'gregorian') {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear + 2; i >= 1990; i--) years.push(i);
    } else {
        for (let i = 1450; i >= 1410; i--) years.push(i);
    }
    return years;
}

function renderDateSelectors() {
    const sMonth = document.getElementById('dp-start-month');
    const sYear = document.getElementById('dp-start-year');
    const eMonth = document.getElementById('dp-end-month');
    const eYear = document.getElementById('dp-end-year');

    const mList = dpMonths[currentCalType];
    const yList = generateYears(currentCalType);

    const mHtml = mList.map(m => `<option value="${m}">${m}</option>`).join('');
    const yHtml = yList.map(y => `<option value="${y}">${y}</option>`).join('');

    sMonth.innerHTML = mHtml; eMonth.innerHTML = mHtml;
    sYear.innerHTML = yHtml; eYear.innerHTML = yHtml;
}

function setCalType(type) {
    currentCalType = type;
    document.querySelectorAll('.dp-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${type}`).classList.add('active');
    renderDateSelectors();
}

function toggleEndPicker() {
    const type = document.querySelector('input[name="dp_end_type"]:checked').value;
    const endGroup = document.getElementById('dp-end-group');
    if (type === 'range') {
        endGroup.style.opacity = '1';
        endGroup.style.pointerEvents = 'auto';
    } else {
        endGroup.style.opacity = '0.3';
        endGroup.style.pointerEvents = 'none';
    }
}

function openDatePicker(type, id, key) {
    dpTargetType = type;
    dpTargetId = id;
    dpTargetKey = key;
    renderDateSelectors();
    document.getElementById('datePickerModal').classList.add('active');
}

function closeDatePicker() {
    document.getElementById('datePickerModal').classList.remove('active');
}

function saveDateSelection() {
    const sM = document.getElementById('dp-start-month').value;
    const sY = document.getElementById('dp-start-year').value;
    let finalVal = (currentCalType === 'gregorian') ? `${sM}. ${sY}` : `${sM} ${sY}`;

    const type = document.querySelector('input[name="dp_end_type"]:checked').value;

    if (type === 'present') {
        finalVal += " -- Present";
    } else if (type === 'range') {
        const eM = document.getElementById('dp-end-month').value;
        const eY = document.getElementById('dp-end-year').value;
        const endStr = (currentCalType === 'gregorian') ? `${eM}. ${eY}` : `${eM} ${eY}`;
        finalVal += ` -- ${endStr}`;
    }

    updateItem(dpTargetType, dpTargetId, dpTargetKey, finalVal);
    closeDatePicker();
}
