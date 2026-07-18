import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, X, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────
// TRANSLATIONS — module scope so they're stable across renders
// ─────────────────────────────────────────────────────────────
type LangKey = "UZ" | "EN" | "RU";

const RESUME_TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  EN: {
    title: "Azizxon Sagdullayev Resume",
    personalDetails: "Personal Details",
    fullName: "Full Name",
    dob: "Date of Birth",
    nationality: "Nationality",
    pob: "Place of Birth",
    contact: "Contact Info",
    professionalSummary: "Professional Summary",
    technicalSkills: "Technical Skills",
    projects: "Projects",
    education: "Education",
    keyStrengths: "Key Strengths",
    careerObjective: "Career Objective",
    languages: "Languages",
    familyBackground: "Family Background",
    showFamily: "Show family details",
    relationship: "Relationship",
    name: "Name",
    birthPlaceYear: "Birth Year & Place",
    workplaceRole: "Workplace & Role",
    residence: "Residence",
    father: "Father",
    mother: "Mother",
    brother: "Brother",
    nationalityVal: "Uzbek",
    placeOfBirthVal: "Sirdaryo region, Boyovut district",
    fatherJob: "Sirdaryo Region police pensioner, currently Head of Guliston City Branch at Kafolat Insurance Company",
    fatherAddress: "House 14, Anhor street, Yusufobod neighborhood, Yangiobod MFY, Boyovut district, Sirdaryo region",
    motherJob: "Housewife",
    motherAddress: "House 14, Anhor street, Yusufobod neighborhood, Yangiobod MFY, Boyovut district, Sirdaryo region",
    brotherJob: "Chief Accountant at Sirdaryo Region SAN MASH AGRO LLC",
    brotherAddress: "House 14, Anhor street, Yusufobod neighborhood, Yangiobod MFY, Boyovut district, Sirdaryo region",
    school28: "Student at 28th Secondary School, Sirdaryo region",
    school11: "Student at 11th Secondary School, Guliston city, Sirdaryo region",
    pdp: "PDP University — Software Development, 3rd-year student",
    timeline: "Education Timeline",
    presently: "Present",
    roleSubtitle: "Frontend Developer | PDP University Student",
    summaryText: "Passionate and self-driven Software Development student at PDP University with a focus on frontend development. Experienced in building modern, responsive, and interactive web applications using React, Next.js, and TypeScript. Capable of developing reliable backend systems with Node.js and PostgreSQL. Enthusiastic about creating user-friendly, high-performance digital products.",
    skillFrontend: "Frontend Development",
    skillBackend: "Backend & Databases",
    langLevel: "English (Intermediate)",
    proj1name: "Turnir.uz",
    proj1desc1: "Built a comprehensive tournament management platform",
    proj1desc2: "Used React for the frontend, Node.js for backend logic, and Prisma/PostgreSQL for database management",
    proj2name: "Wedding Hall",
    proj2desc1: "Developed a modern wedding hall booking and reservation platform",
    proj2desc2: "Implemented Next.js, Tailwind CSS for styling, Zustand for state, and NextAuth for secure authentication",
    proj3name: "Sagdullayev.uz",
    proj3desc1: "Developed a high-performance interactive 3D portfolio website",
    proj3desc2: "Integrated Three.js, Rapier physics, GSAP, and Framer Motion for premium animations",
    strength1: "Fast Learner",
    strength2: "Creative Problem Solving",
    strength3: "Consistent Self-Learning",
    strength4: "Team Collaboration",
    objectiveText: "To build a successful career in the tech industry by continuously improving my skills in frontend development, creating modern, beautiful, and performant web products while contributing to innovative teams.",
  },
  UZ: {
    title: "Azizxon Sagdullayev Rezyumesi",
    personalDetails: "Shaxsiy Ma'lumotlar",
    fullName: "F.I.Sh.",
    dob: "Tug'ilgan sanasi",
    nationality: "Millati",
    pob: "Tug'ilgan joyi",
    contact: "Kontakt Ma'lumotlari",
    professionalSummary: "Professional Ma'lumotnoma",
    technicalSkills: "Texnik Ko'nikmalar",
    projects: "Loyihalar",
    education: "Ta'lim",
    keyStrengths: "Kuchli Tomonlar",
    careerObjective: "Karyera Maqsadi",
    languages: "Tillar",
    familyBackground: "Yaqin Qarindoshlari",
    showFamily: "Oila a'zolari haqidagi ma'lumotlar",
    relationship: "Qarindoshligi",
    name: "F.I.Sh.",
    birthPlaceYear: "Tug'ilgan yili/joyi",
    workplaceRole: "Ish joyi va lavozimi",
    residence: "Turar joyi",
    father: "Otasi",
    mother: "Onasi",
    brother: "Akasi",
    nationalityVal: "O'zbek",
    placeOfBirthVal: "Sirdaryo viloyati, Boyovut tumani",
    fatherJob: "Sirdaryo viloyati IIB nafaqasida, hozirda Kafolat sug'urta kompaniyasi Guliston shahar bo'limi rahbari",
    fatherAddress: "Sirdaryo v., Boyovut t., Yangiobod MFY, Yusufobod mahallasi, Anhor ko'chasi 14-uy",
    motherJob: "Uy bekasi",
    motherAddress: "Sirdaryo v., Boyovut t., Yangiobod MFY, Yusufobod mahallasi, Anhor ko'chasi 14-uy",
    brotherJob: "Sirdaryo viloyati SAN MASH AGRO MChJ bosh buxgalteri",
    brotherAddress: "Sirdaryo v., Boyovut t., Yangiobod MFY, Yusufobod mahallasi, Anhor ko'chasi 14-uy",
    school28: "Sirdaryo viloyati 28-umumiy o'rta ta'lim maktabi o'quvchisi",
    school11: "Sirdaryo viloyati Guliston shahridagi 11-umumiy o'rta ta'lim maktabi o'quvchisi",
    pdp: "PDP University — Software Development yo'nalishi, 3-kurs talabasi",
    timeline: "Ta'lim tarixi",
    presently: "Hozirgacha",
    roleSubtitle: "Frontend Dasturchi | PDP University Talabasi",
    summaryText: "PDP Universitetining Software Development yo'nalishida tahsil olayotgan, frontend dasturlashga ixtisoslashgan, o'z-o'zini rivojlantiradigan talaba. React, Next.js va TypeScript yordamida zamonaviy, sezgir va interaktiv veb-ilovalar yaratishda tajribali. Node.js va PostgreSQL yordamida ishonchli backend tizimlarini ham qura oladi. Foydalanuvchilarga qulay, yuqori samarali raqamli mahsulotlar yaratishga ishtiyoqli.",
    skillFrontend: "Frontend Dasturlash",
    skillBackend: "Backend va Ma'lumotlar Bazasi",
    langLevel: "Ingliz tili (O'rta daraja)",
    proj1name: "Turnir.uz",
    proj1desc1: "Keng qamrovli turnir boshqaruv platformasini yaratdi",
    proj1desc2: "Frontend uchun React, backend mantig'i uchun Node.js, ma'lumotlar bazasi uchun Prisma/PostgreSQL ishlatildi",
    proj2name: "To'yxona",
    proj2desc1: "Zamonaviy to'yxona buyurtma va rezervatsiya platformasini ishlab chiqdi",
    proj2desc2: "Next.js, uslublash uchun Tailwind CSS, holat boshqaruvi uchun Zustand va xavfsiz autentifikatsiya uchun NextAuth joriy etildi",
    proj3name: "Sagdullayev.uz",
    proj3desc1: "Yuqori samarali interaktiv 3D portfolio veb-saytini ishlab chiqdi",
    proj3desc2: "Premium animatsiyalar uchun Three.js, Rapier fizikasi, GSAP va Framer Motion integratsiya qilindi",
    strength1: "Tez O'rganuvchi",
    strength2: "Ijodiy Muammolarni Hal Qilish",
    strength3: "Muntazam O'z-O'zini Rivojlantirish",
    strength4: "Jamoa bilan Ishlash",
    objectiveText: "Frontend dasturlash sohasida ko'nikmalarni doimo rivojlantirish, zamonaviy, chiroyli va samarali veb-mahsulotlar yaratish hamda innovatsion jamoalarga hissa qo'shish orqali texnologiya sanoatida muvaffaqiyatli karyera qurish.",
  },
  RU: {
    title: "Резюме Азизхона Сагдуллаева",
    personalDetails: "Личные Данные",
    fullName: "Ф.И.О.",
    dob: "Дата рождения",
    nationality: "Национальность",
    pob: "Место рождения",
    contact: "Контактная Информация",
    professionalSummary: "Профессиональное Резюме",
    technicalSkills: "Технические Навыки",
    projects: "Проекты",
    education: "Образование",
    keyStrengths: "Ключевые Качества",
    careerObjective: "Цель Карьеры",
    languages: "Языки",
    familyBackground: "Семья / Близкие родственники",
    showFamily: "Сведения о семье",
    relationship: "Родство",
    name: "Ф.И.О.",
    birthPlaceYear: "Год и место рождения",
    workplaceRole: "Место работы и должность",
    residence: "Место жительства",
    father: "Отец",
    mother: "Мать",
    brother: "Брат",
    nationalityVal: "Узбек",
    placeOfBirthVal: "Сырдарьинская область, Баяутский район",
    fatherJob: "Пенсионер МВД Сырдарьинской области, в настоящее время руководитель филиала страховой компании Кафолат в городе Гулистан",
    fatherAddress: "Сырдарьинская обл., Баяутский р-н, ССГ Янгиобод, махалля Юсуфобод, ул. Анхор, дом 14",
    motherJob: "Домохозяйка",
    motherAddress: "Сырдарьинская обл., Баяутский р-н, ССГ Янгиобод, махалля Юсуфобод, ул. Анхор, дом 14",
    brotherJob: "Главный бухгалтер ООО SAN MASH AGRO Сырдарьинской области",
    brotherAddress: "Сырдарьинская обл., Баяутский р-н, ССГ Янгиобод, махалля Юсуфобод, ул. Анхор, дом 14",
    school28: "Ученик средней школы №28 Сырдарьинской области",
    school11: "Ученик средней школы №11 города Гулистан Сырдарьинской области",
    pdp: "PDP University — Software Development, студент 3-го курса",
    timeline: "История обучения",
    presently: "Настоящее время",
    roleSubtitle: "Frontend Разработчик | Студент PDP University",
    summaryText: "Целеустремлённый студент направления Software Development в Университете PDP, специализирующийся на frontend-разработке. Имеет опыт создания современных, адаптивных и интерактивных веб-приложений с использованием React, Next.js и TypeScript. Способен разрабатывать надёжные backend-системы на Node.js и PostgreSQL. Стремится создавать удобные и высокопроизводительные цифровые продукты.",
    skillFrontend: "Frontend Разработка",
    skillBackend: "Backend и Базы данных",
    langLevel: "Английский (Средний уровень)",
    proj1name: "Turnir.uz",
    proj1desc1: "Разработал комплексную платформу управления турнирами",
    proj1desc2: "Использован React для frontend, Node.js для бизнес-логики, Prisma/PostgreSQL для управления базой данных",
    proj2name: "Свадебный зал",
    proj2desc1: "Разработал современную платформу для бронирования свадебных залов",
    proj2desc2: "Реализовано с использованием Next.js, Tailwind CSS для стилизации, Zustand для состояния и NextAuth для безопасной аутентификации",
    proj3name: "Sagdullayev.uz",
    proj3desc1: "Разработал высокопроизводительный интерактивный 3D портфолио-сайт",
    proj3desc2: "Интегрированы Three.js, физический движок Rapier, GSAP и Framer Motion для премиальной анимации",
    strength1: "Быстро Обучается",
    strength2: "Творческое Решение Задач",
    strength3: "Постоянное Самообучение",
    strength4: "Командная Работа",
    objectiveText: "Построить успешную карьеру в технологической отрасли, постоянно совершенствуя навыки frontend-разработки, создавая современные, красивые и производительные веб-продукты и внося вклад в работу инновационных команд.",
  },
};

// ─────────────────────────────────────────────────────────────
// HTML TEMPLATE GENERATOR
// ─────────────────────────────────────────────────────────────
function buildResumeHTML(langKey: LangKey, photoBase64: string): string {
  const tr = RESUME_TRANSLATIONS[langKey];

  return `<!DOCTYPE html>
<html lang="${langKey.toLowerCase()}">
<head>
<meta charset="UTF-8">
<title>${tr.title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter','Segoe UI',sans-serif;background:#020412;padding:28px 20px;min-height:100vh;color:#e2e8f0}
  .page{max-width:900px;margin:0 auto}
  .resume-wrapper{background:#0d0f26;border:1px solid rgba(139,124,246,.2);border-radius:16px;padding:44px;box-shadow:0 20px 50px rgba(5,6,20,.8)}
  /* ── Header ── */
  .header{background:rgba(11,14,42,.4);border:1px solid rgba(139,124,246,.15);border-radius:14px;padding:36px;display:flex;gap:36px;align-items:center;margin-bottom:40px}
  .profile-photo{width:120px;height:120px;border-radius:50%;border:3px solid #6366f1;box-shadow:0 0 20px rgba(99,102,241,.35);flex-shrink:0;object-fit:cover}
  .header-content h1{font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,#fff,#c7d2fe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
  .header-content .title{font-family:'Outfit',sans-serif;font-size:13px;color:#8b5cf6;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:18px}
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px}
  .contact-item{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(20,24,58,.35);border-radius:8px;border:1px solid rgba(139,124,246,.12)}
  .contact-icon{font-size:13px;color:#8b5cf6;min-width:16px}
  .contact-item a,.contact-item span{color:#a8add1;text-decoration:none;word-break:break-all;font-size:12px}
  /* ── Section ── */
  .content{display:flex;flex-direction:column;gap:36px}
  .section{}
  .section-title{font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:12px;letter-spacing:1.5px;text-transform:uppercase}
  .section-title::before{content:'';width:4px;height:16px;background:#6366f1;border-radius:2px;display:inline-block;flex-shrink:0}
  .section-title::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(99,102,241,.4),transparent)}
  /* ── Personal details ── */
  .details-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px}
  /* ── Summary ── */
  .summary-text{color:#a8add1;line-height:1.8;font-size:13px;background:rgba(20,24,58,.35);padding:20px;border:1px solid rgba(139,124,246,.15);border-left:4px solid #6366f1;border-radius:12px}
  /* ── Skills ── */
  .skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .skill-cat{background:rgba(20,24,58,.35);padding:18px;border-radius:12px;border:1px solid rgba(139,124,246,.15)}
  .skill-cat h3{font-family:'Outfit',sans-serif;color:#fff;font-size:12px;font-weight:600;text-transform:uppercase;margin-bottom:14px;letter-spacing:.5px}
  .skill-tags{display:flex;flex-wrap:wrap;gap:8px}
  .skill-tag{background:rgba(99,102,241,.08);color:#e2e8f0;padding:6px 14px;border-radius:30px;font-size:11px;font-weight:500;border:1px solid rgba(99,102,241,.25)}
  /* ── Projects ── */
  .project{background:rgba(20,24,58,.35);padding:18px;border-radius:12px;border:1px solid rgba(139,124,246,.15);border-left:4px solid #6366f1;margin-bottom:12px}
  .project:last-child{margin-bottom:0}
  .project h3{font-family:'Outfit',sans-serif;color:#fff;font-size:14px;font-weight:600;margin-bottom:8px}
  .project p{color:#a8add1;font-size:12px;line-height:1.6;margin-top:4px}
  /* ── Timeline ── */
  .timeline{padding-left:26px;border-left:2px solid rgba(99,102,241,.3)}
  .tl-item{position:relative;margin-bottom:20px}
  .tl-item:last-child{margin-bottom:0}
  .tl-dot{position:absolute;left:-33px;top:4px;width:11px;height:11px;border-radius:50%;background:#6366f1;border:2px solid #0d0f26;box-shadow:0 0 8px rgba(99,102,241,.8)}
  .tl-date{font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;color:#8b5cf6;margin-bottom:5px}
  .tl-content{background:rgba(20,24,58,.35);padding:14px 16px;border-radius:10px;border:1px solid rgba(139,124,246,.12);color:#a8add1;font-size:12px;line-height:1.6}
  /* ── Strengths ── */
  .strengths-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .strength-item{display:flex;align-items:center;gap:10px;padding:14px 16px;background:rgba(20,24,58,.35);border-radius:12px;border:1px solid rgba(139,124,246,.15)}
  .strength-icon{color:#8b5cf6;font-size:16px;font-weight:700}
  .strength-item p{color:#a8add1;font-size:12px;font-weight:500}
  /* ── Objective ── */
  .objective-box{background:rgba(20,24,58,.35);border:1px solid rgba(139,124,246,.15);border-left:4px solid #6366f1;color:#a8add1;padding:20px;border-radius:12px;font-size:13px;line-height:1.8}
  /* ── Family ── */
  .table-wrap{width:100%;overflow-x:auto;margin-top:12px}
  table{width:100%;border-collapse:collapse;font-size:11px;color:#a8add1;min-width:600px}
  th,td{padding:10px 12px;border-bottom:1px solid rgba(139,124,246,.15);vertical-align:top;text-align:left}
  th{color:#fff;font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:10px;background:rgba(11,14,42,.3);font-weight:600}
  tr:last-child td{border-bottom:none}
</style>
</head>
<body>
<div class="page">
<div class="resume-wrapper">

<!-- HEADER -->
<div class="header">
  <img src="${photoBase64}" class="profile-photo" alt="Azizxon Sagdullayev">
  <div class="header-content">
    <h1>Azizxon Sagdullayev</h1>
    <p class="title">${tr.roleSubtitle}</p>
    <div class="contact-grid">
      <div class="contact-item"><span class="contact-icon">🏠</span><span>Guliston, Sirdaryo, Uzbekistan</span></div>
      <div class="contact-item"><span class="contact-icon">✉</span><a href="https://mail.google.com/mail/?view=cm&fs=1&to=azizhon.sagdullayev@gmail.com" target="_blank" rel="noopener noreferrer">azizhon.sagdullayev@gmail.com</a></div>
      <div class="contact-item"><span class="contact-icon">📞</span><a href="tel:+998994746484">+998 99 474 64 84</a></div>
      <div class="contact-item"><span class="contact-icon">📞</span><a href="tel:+998900916484">+998 90 091 64 84 (alt)</a></div>
      <div class="contact-item"><span class="contact-icon">🌐</span><a href="https://sagdullayev.uz">sagdullayev.uz</a></div>
      <div class="contact-item"><span class="contact-icon">🐙</span><a href="https://github.com/sagdullayev-a">sagdullayev-a</a></div>
    </div>
  </div>
</div>

<!-- PERSONAL DETAILS -->
<section class="section" style="margin-bottom:36px">
  <h2 class="section-title">${tr.personalDetails}</h2>
  <div class="details-grid">
    <div class="contact-item"><span class="contact-icon">👤</span><span><b>${tr.fullName}:</b> Sagdullayev Azizxon Ulug'bek o'g'li</span></div>
    <div class="contact-item"><span class="contact-icon">📅</span><span><b>${tr.dob}:</b> 14.02.2006</span></div>
    <div class="contact-item"><span class="contact-icon">🌍</span><span><b>${tr.nationality}:</b> ${tr.nationalityVal}</span></div>
    <div class="contact-item"><span class="contact-icon">📍</span><span><b>${tr.pob}:</b> ${tr.placeOfBirthVal}</span></div>
  </div>
</section>

<div class="content">

<!-- SUMMARY -->
<section class="section">
  <h2 class="section-title">${tr.professionalSummary}</h2>
  <div class="summary-text">${tr.summaryText}</div>
</section>

<!-- SKILLS -->
<section class="section">
  <h2 class="section-title">${tr.technicalSkills}</h2>
  <div class="skills-grid">
    <div class="skill-cat">
      <h3>${tr.skillFrontend}</h3>
      <div class="skill-tags">
        <span class="skill-tag">HTML5</span><span class="skill-tag">CSS3</span><span class="skill-tag">JavaScript</span><span class="skill-tag">TypeScript</span><span class="skill-tag">React.js</span><span class="skill-tag">Next.js</span><span class="skill-tag">Tailwind CSS</span>
      </div>
    </div>
    <div class="skill-cat">
      <h3>${tr.skillBackend}</h3>
      <div class="skill-tags">
        <span class="skill-tag">Node.js</span><span class="skill-tag">Express.js</span><span class="skill-tag">PostgreSQL</span><span class="skill-tag">Prisma ORM</span>
      </div>
    </div>
    <div class="skill-cat">
      <h3>${tr.languages}</h3>
      <div class="skill-tags"><span class="skill-tag">${tr.langLevel}</span></div>
    </div>
  </div>
</section>

<!-- PROJECTS -->
<section class="section">
  <h2 class="section-title">${tr.projects}</h2>
  <div class="project"><h3>${tr.proj1name}</h3><p>• ${tr.proj1desc1}</p><p>• ${tr.proj1desc2}</p></div>
  <div class="project"><h3>${tr.proj2name}</h3><p>• ${tr.proj2desc1}</p><p>• ${tr.proj2desc2}</p></div>
  <div class="project"><h3>${tr.proj3name}</h3><p>• ${tr.proj3desc1}</p><p>• ${tr.proj3desc2}</p></div>
</section>

<!-- EDUCATION TIMELINE -->
<section class="section">
  <h2 class="section-title">${tr.timeline}</h2>
  <div class="timeline">
    <div class="tl-item"><div class="tl-dot"></div><div class="tl-date">09.2013 – 05.2017</div><div class="tl-content">${tr.school28}</div></div>
    <div class="tl-item"><div class="tl-dot"></div><div class="tl-date">09.2017 – 05.2024</div><div class="tl-content">${tr.school11}</div></div>
    <div class="tl-item"><div class="tl-dot"></div><div class="tl-date">10.2024 – ${tr.presently}</div><div class="tl-content"><b>${tr.pdp}</b></div></div>
  </div>
</section>

<!-- KEY STRENGTHS -->
<section class="section">
  <h2 class="section-title">${tr.keyStrengths}</h2>
  <div class="strengths-grid">
    <div class="strength-item"><span class="strength-icon">✔</span><p>${tr.strength1}</p></div>
    <div class="strength-item"><span class="strength-icon">✔</span><p>${tr.strength2}</p></div>
    <div class="strength-item"><span class="strength-icon">✔</span><p>${tr.strength3}</p></div>
    <div class="strength-item"><span class="strength-icon">✔</span><p>${tr.strength4}</p></div>
  </div>
</section>

<!-- CAREER OBJECTIVE -->
<section class="section">
  <h2 class="section-title">${tr.careerObjective}</h2>
  <div class="objective-box">${tr.objectiveText}</div>
</section>

<!-- FAMILY BACKGROUND -->
<section class="section">
  <h2 class="section-title">${tr.familyBackground}</h2>
  <p style="font-size:12px;color:#8b5cf6;margin-bottom:10px;font-style:italic">${tr.showFamily}</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>${tr.relationship}</th><th>${tr.name}</th><th>${tr.birthPlaceYear}</th><th>${tr.workplaceRole}</th><th>${tr.residence}</th></tr></thead>
      <tbody>
        <tr><td><b>${tr.father}</b></td><td>Sagdullayev Ulug'bek Sulaymonovich</td><td>26.12.1974, Sirdaryo v., Boyovut t.</td><td>${tr.fatherJob}</td><td>${tr.fatherAddress}</td></tr>
        <tr><td><b>${tr.mother}</b></td><td>Sagdullayeva Mutabar Sharobiddinovna (Mamajonova)</td><td>18.12.1978, Sirdaryo t.</td><td>${tr.motherJob}</td><td>${tr.motherAddress}</td></tr>
        <tr><td><b>${tr.brother}</b></td><td>Sagdullayev Asilbek Ulug'bek o'g'li</td><td>28.03.2000, Boyovut t.</td><td>${tr.brotherJob}</td><td>${tr.brotherAddress}</td></tr>
      </tbody>
    </table>
  </div>
</section>

</div><!-- /content -->
</div><!-- /resume-wrapper -->
</div><!-- /page -->
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function About() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const text = t("aboutPage.heading");

  const [displayedText, setDisplayedText] = useState("");
  const [showLangModal, setShowLangModal] = useState(false);

  // ── Typing effect ─────────────────────────────────────────
  useEffect(() => {
    let index = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const startTyping = () => {
      setDisplayedText("");
      interval = setInterval(() => {
        index++;
        setDisplayedText(text.slice(0, index));
        if (index === text.length) {
          clearInterval(interval);
          setTimeout(() => { index = 0; startTyping(); }, 5000);
        }
      }, 120);
    };

    startTyping();
    return () => clearInterval(interval);
  }, [text]);

  // ── Close modal on Escape ─────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLangModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── HTML Downloader (native Blob/URL — unchanged mechanism) ──
  const downloadHTML = useCallback((langKey: LangKey) => {
    setShowLangModal(false);

    const doDownload = (photoBase64: string) => {
      const finalHTML = buildResumeHTML(langKey, photoBase64);
      const blob = new Blob([finalHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Azizxon_Sagdullayev_Resume_${langKey}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    // Embed photo as base64 so the file works offline
    fetch("/assets/azizxon.jpg")
      .then((res) => res.blob())
      .then((blob) => {
        const fr = new FileReader();
        fr.onloadend = () => doDownload(fr.result as string);
        fr.readAsDataURL(blob);
      })
      .catch(() => doDownload("/assets/azizxon.jpg")); // fallback: use path
  }, []);

  // ── Current UI language ───────────────────────────────────
  const currentUILang = (i18n.language?.slice(0, 2).toUpperCase() ?? "EN") as LangKey;

  const langOptions: { key: LangKey; label: string; native: string; flag: string }[] = [
    { key: "UZ", label: "O'zbekcha",  native: "UZ", flag: "🇺🇿" },
    { key: "EN", label: "English",    native: "EN", flag: "🇬🇧" },
    { key: "RU", label: "Русский",    native: "RU", flag: "🇷🇺" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[var(--lg-text-primary)] px-4 sm:px-6 py-10">
      {/* BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => { window.scrollTo(0, 0); navigate("/"); }}
        className="fixed top-5 left-5 z-50 btn-glossy-outline !rounded-full w-11 h-11 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 flex items-center justify-center gap-2 shadow-lg"
        aria-label="Back to home"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">{t("aboutPage.back")}</span>
      </motion.button>

      {/* MAIN CONTENT */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen gap-8 pt-28 pb-12 px-4 sm:px-6 md:px-12">

        {/* IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <img
            src="/assets/azizxon.jpg"
            alt="Azizxon Sagdullayev"
            className="w-[200px] sm:w-[280px] md:w-[320px] rounded-2xl border border-[var(--lg-glass-border)] object-cover shadow-[0_20px_60px_rgba(31,38,135,0.06)] hover:border-[var(--lg-accent-start)]/30 transition-all duration-300"
          />
          <div
            className="mt-6 h-[1px] w-[90vw] sm:w-[400px] md:w-[500px]"
            style={{ background: "linear-gradient(90deg, transparent, var(--lg-accent-start)/30, transparent)" }}
          />
        </motion.div>

        {/* GLASS BOX CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl h-[500px] sm:h-[550px] md:h-[600px] glass-panel-strong overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          {/* HEADER */}
          <div className="relative z-20 flex items-center justify-center px-6 py-6 sm:py-8 border-b border-[var(--lg-glass-border-subtle)] bg-white/5 backdrop-blur-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--lg-text-primary)]">
              {displayedText}
              <span className="animate-pulse ml-2 text-[var(--lg-accent-start)]">|</span>
            </h1>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="relative z-10 h-[calc(100%-80px)] overflow-y-auto px-6 sm:px-10 md:px-12 py-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--lg-accent-start)]/10 hover:scrollbar-thumb-[var(--lg-accent-start)]/20">
            <div className="text-[var(--lg-text-secondary)] text-sm sm:text-base leading-8 tracking-wide space-y-6">
              {["p1","p2","p3","p4","p5","p6","p7","p8"].map((key) => {
                const paragraphText = t(`aboutPage.${key}`);
                if (!paragraphText) return null;
                return <p key={key}>{paragraphText}</p>;
              })}
            </div>
          </div>
        </motion.div>

        {/* DOWNLOAD BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          onClick={() => setShowLangModal(true)}
          className="btn-glossy !px-8 sm:!px-10 py-3.5 sm:!py-4 shadow-lg flex items-center justify-center min-h-[48px] gap-3"
        >
          <Download size={20} />
          <span className="font-semibold tracking-wide">
            {t("aboutPage.downloadBtn")}
          </span>
        </motion.button>
      </div>

      {/* ── LANGUAGE SELECTION MODAL ────────────────────────── */}
      <AnimatePresence>
        {showLangModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLangModal(false)}
            />

            {/* Modal Panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "rgba(13, 15, 38, 0.92)",
                  border: "1px solid rgba(139, 124, 246, 0.3)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow: "0 20px 60px rgba(5, 6, 20, 0.8), 0 0 0 1px rgba(139,124,246,0.1) inset",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  className="flex items-center justify-between px-6 py-5 border-b"
                  style={{ borderColor: "rgba(139, 124, 246, 0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-wide">
                        Download Resume
                      </h2>
                      <p className="text-xs text-[var(--lg-text-tertiary)] mt-0.5">
                        Choose language · HTML format
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLangModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-[var(--lg-text-tertiary)] hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Language Options */}
                <div className="p-5 flex flex-col gap-3">
                  {langOptions.map(({ key, label, native, flag }) => {
                    const isCurrentLang = key === currentUILang;
                    return (
                      <button
                        key={key}
                        onClick={() => downloadHTML(key)}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200 group relative overflow-hidden"
                        style={{
                          background: isCurrentLang
                            ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
                            : "rgba(20, 24, 58, 0.4)",
                          border: isCurrentLang
                            ? "1px solid rgba(99, 102, 241, 0.5)"
                            : "1px solid rgba(139, 124, 246, 0.12)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentLang) {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(20, 24, 58, 0.7)";
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(99,102,241,0.35)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentLang) {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(20, 24, 58, 0.4)";
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(139, 124, 246, 0.12)";
                          }
                        }}
                      >
                        <span className="text-2xl leading-none select-none">{flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: isCurrentLang ? "#c7d2fe" : "#e2e8f0" }}
                            >
                              {label}
                            </span>
                            {isCurrentLang && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                                style={{
                                  background: "rgba(99,102,241,0.25)",
                                  color: "#818cf8",
                                  border: "1px solid rgba(99,102,241,0.3)",
                                }}
                              >
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--lg-text-tertiary)] mt-0.5">
                            {`Azizxon_Sagdullayev_Resume_${native}.html`}
                          </p>
                        </div>
                        <Download
                          size={15}
                          style={{ color: isCurrentLang ? "#818cf8" : "#6b7280", flexShrink: 0 }}
                          className="group-hover:text-white transition-colors"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Footer note */}
                <div
                  className="px-5 pb-5 pt-1 text-center text-[11px]"
                  style={{ color: "var(--lg-text-tertiary)" }}
                >
                  Instant HTML download · works offline
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}