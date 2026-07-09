import { ArrowUpRight, Menu, X, Command, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef, lazy, Suspense, Component, ErrorInfo, ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import favicon from "/favicon.ico";

import WelcomeScreen from "@/components/WelcomeScreen";
import FrontendDeveloperSection from "@/components/FrontendDeveloperSection";
import AiChatBlock from "@/components/AiChatBlock";
import Showcase from "./components/Showcase";
import ContactSection from "@/components/ContactSection";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import About from "./pages/About";

gsap.registerPlugin(ScrollToPlugin);



const logos = ["PRINCE", "WEBKAIZEN", "FRONTEND", "DEVELOPER"];

const LANGS = ["UZ", "EN", "RU"] as const;
type Lang = (typeof LANGS)[number];

const navKeys = [
  { id: "Home", key: "home" },
  { id: "about", key: "about" },
  { id: "showcase", key: "showcase" },
  { id: "contact", key: "contact" },
] as const;

export default function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [showWelcome, setShowWelcome] = useState(true);
  const [time, setTime] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Scroll and Mouse coordinates for Layer Parallax
  const { scrollY } = useScroll();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  // Layer Parallax Transforms
  const bgX = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const bgY = useTransform(springY, [-0.5, 0.5], [-5, 5]);

  const blobX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const blobY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

  const splineX = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const splineY = useTransform(springY, [-0.5, 0.5], [-25, 25]);

  const textX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const textY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  // Scroll Storytelling Transforms (Hero Viewport 1 to Viewport 2 transitions)
  const heroElementsOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const heroElementsY = useTransform(scrollY, [0, 250], [0, -30]);

  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0.8]);
  const splineScale = useTransform(scrollY, [0, 600], [1.1, 0.75]);
  const splineOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const splineYScroll = useTransform(scrollY, [0, 600], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) - 0.5);
      mouseY.set((e.clientY / innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const logoRef = useRef<HTMLDivElement>(null);



  // Active language from i18n (normalise to uppercase 2-letter code)
  const activeLang = (i18n.language?.slice(0, 2).toUpperCase() ?? "UZ") as Lang;

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showWelcome || mobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showWelcome, mobileMenu]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);



  // Scroll detection — hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrolled(currentY > 40);
          if (currentY < 100) {
            setNavbarVisible(true);
          } else if (currentY > lastScrollY.current) {
            setNavbarVisible(false);
          } else {
            setNavbarVisible(true);
          }
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (location.pathname !== "/") {
      setPendingScroll(id);
      navigate("/");
    } else {
      const element = document.getElementById(id);
      if (id === "Home") {
        gsap.to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "power3.inOut" });
      } else if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setActiveNav(id);
      setMobileMenu(false);
    }
  };

  // GSAP logo click — spring pulse + premium scroll to top
  const handleLogoClick = () => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          duration: 0.15,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(logoRef.current, { scale: 1, duration: 0.2, ease: "back.out(3)" });
          },
        }
      );
    }
    if (location.pathname !== "/") {
      setPendingScroll("Home");
      navigate("/");
    } else {
      gsap.to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "power3.inOut" });
      setActiveNav("Home");
    }
  };

  const handleLangChange = (lang: Lang) => {
    i18n.changeLanguage(lang.toLowerCase());
  };

  // Scroll to pending target on route change to '/'
  useEffect(() => {
    if (location.pathname === "/" && pendingScroll) {
      const timer = setTimeout(() => {
        if (pendingScroll === "Home") {
          gsap.to(window, { duration: 1.1, scrollTo: { y: 0 }, ease: "power3.inOut" });
        } else {
          const element = document.getElementById(pendingScroll);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }
        setActiveNav(pendingScroll);
        setPendingScroll(null);
      }, 150); // slight delay to allow rendering
      return () => clearTimeout(timer);
    }
  }, [location.pathname, pendingScroll]);

  // Set active nav to "about" when on '/about' page
  useEffect(() => {
    if (location.pathname === "/about") {
      setActiveNav("about");
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="lg-blob lg-blob-1 -top-[200px] -left-[100px]" />
        <div className="lg-blob lg-blob-2 top-[40%] -right-[150px]" />
        <div className="lg-blob lg-blob-3 bottom-[-100px] left-[30%]" />
      </div>

      <AnimatePresence>
        {showWelcome && location.pathname === "/" && <WelcomeScreen />}
      </AnimatePresence>

      {/* ═══ NAVBAR ═══ */}
      <div
        className="fixed top-4 left-1/2 z-50 transition-transform duration-[350ms]"
        style={{
          transform: `translateX(-50%) translateY(${navbarVisible ? "0" : "-150%"})`,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav
          className={`flex items-center gap-1 px-2 transition-all duration-500 ${
            scrolled ? "py-1.5 px-3 shadow-lg shadow-indigo-500/5" : "py-2 px-4"
          }`}
          style={{
            borderRadius: "var(--lg-radius-pill)",
            background: scrolled ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.55)",
            backdropFilter: `blur(${scrolled ? "24px" : "20px"}) saturate(180%)`,
            WebkitBackdropFilter: `blur(${scrolled ? "24px" : "20px"}) saturate(180%)`,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: scrolled
              ? "0 12px 40px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "0 8px 32px rgba(31,38,135,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Logo */}
          <div
            ref={logoRef}
            onClick={handleLogoClick}
            className="flex items-center gap-2 pr-3 border-r border-[var(--lg-glass-border-subtle)] cursor-pointer select-none"
            style={{ transformOrigin: "center" }}
          >
            <img src={favicon} alt="Logo" className="w-7 h-7 rounded-full object-cover ring-2 ring-white/50" />
            <span className="text-[10px] md:text-xs tracking-[0.2em] text-[var(--lg-text-secondary)] uppercase font-medium whitespace-nowrap">
              PRINCE
            </span>
          </div>

          {/* Nav Items (Desktop) */}
          <ul className="hidden md:flex items-center gap-0.5 px-2">
            {navKeys.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`relative px-4 py-1.5 text-[11px] tracking-[0.15em] uppercase font-medium rounded-full transition-all duration-300 ${
                    activeNav === item.id
                      ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-md shadow-indigo-500/20"
                      : "text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] hover:bg-white/40"
                  }`}
                >
                  {t(`navbar.${item.key}`)}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Switcher (Desktop) */}
          <div className="hidden md:flex items-center gap-1 px-2 border-l border-[var(--lg-glass-border-subtle)]">
            {LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 ${
                  activeLang === lang
                    ? "bg-[var(--lg-accent-start)] text-white shadow-sm"
                    : "text-[var(--lg-text-tertiary)] hover:text-[var(--lg-text-secondary)] hover:bg-white/30 cursor-pointer"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Search shortcut */}
          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-[var(--lg-glass-border-subtle)]">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/30 text-[var(--lg-text-tertiary)]">
              <Command size={12} />
              <span className="text-[10px] font-mono">K</span>
            </div>
          </div>

          {/* Time */}
          <div className="hidden md:block text-[10px] tracking-[0.2em] text-[var(--lg-text-tertiary)] uppercase pl-2 border-l border-[var(--lg-glass-border-subtle)]">
            {time}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-[var(--lg-text-primary)] w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/40 transition-colors ml-1"
            aria-label="Toggle Menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
            style={{
              background: "rgba(245,247,250,0.92)",
              backdropFilter: "blur(30px) saturate(200%)",
              WebkitBackdropFilter: "blur(30px) saturate(200%)",
            }}
          >
            <div className="absolute top-28 text-center">
              <p className="text-[10px] text-[var(--lg-text-tertiary)] tracking-[0.3em] mb-2">TIME</p>
              <h2 className="text-2xl tracking-widest font-semibold text-[var(--lg-text-primary)]">{time}</h2>
            </div>

            {navKeys.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => scrollTo(item.id)}
                className="w-full max-w-xs py-3.5 text-sm uppercase tracking-[0.3em] font-semibold text-[var(--lg-text-primary)] hover:text-[var(--lg-accent-start)] transition-colors flex items-center justify-center min-h-[44px]"
              >
                {t(`navbar.${item.key}`)}
              </motion.button>
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex gap-2 mt-4">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { handleLangChange(lang); setMobileMenu(false); }}
                  className={`text-xs font-semibold min-w-[44px] min-h-[44px] px-4 py-2.5 rounded-full transition-all duration-200 ${
                    activeLang === lang
                      ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white"
                      : "glass-card text-[var(--lg-text-tertiary)]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route
          path="/"
          element={
            <div className="relative z-10">
              {/* ═══ HERO (Viewport 1 Scroll Track) ═══ */}
              <section id="Home" className="relative w-full h-[140vh] z-10 pointer-events-none">
                {/* Sticky Container */}
                <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-auto">
                  {/* Layer 1: Animated background (radial gradient) */}
                  <motion.div
                    style={{ opacity: bgOpacity, x: bgX, y: bgY }}
                    className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#F5F7FA] via-[#E8EDF5] to-[#DCE3F0]"
                  />

                  {/* Layer 2: Gradient blobs (floating blurred light blobs) */}
                  <motion.div
                    style={{ x: blobX, y: blobY }}
                    className="absolute inset-0 pointer-events-none z-0"
                  >
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-40"
                      style={{ background: "radial-gradient(circle, rgba(186,230,253,0.5), transparent 70%)", filter: "blur(100px)", animation: "blobFloat1 25s ease-in-out infinite" }} />
                    <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full opacity-35"
                      style={{ background: "radial-gradient(circle, rgba(237,233,254,0.6), transparent 70%)", filter: "blur(120px)", animation: "blobFloat2 30s ease-in-out infinite" }} />
                    <div className="absolute top-[30%] right-[30%] w-[400px] h-[400px] rounded-full opacity-25"
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)", filter: "blur(80px)", animation: "blobFloat1 20s ease-in-out infinite" }} />
                  </motion.div>

                  {/* Layer 3: Spline Scene */}
                  <motion.div
                    style={{ scale: splineScale, opacity: splineOpacity, x: splineX, y: splineY, translateY: splineYScroll }}
                    className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-auto"
                  >
                    <iframe
                      src="https://my.spline.design/interactiveaiwebsite-iEJdikEMPai70V0dx4x3hr2d/"
                      title="Interactive 3D Hero Scene"
                      className="w-full h-full border-none bg-transparent scale-110 md:scale-125"
                      allow="autoplay; fullscreen"
                      onLoad={() => setIframeLoaded(true)}
                    ></iframe>
                  </motion.div>

                  {/* Premium Loading Shimmer Loader */}
                  <AnimatePresence>
                    {!iframeLoaded && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-15 flex items-center justify-center bg-gradient-to-b from-[#F5F7FA] via-[#E8EDF5] to-[#DCE3F0] pointer-events-none"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-[var(--lg-accent-start)]/30 border-t-[var(--lg-accent-start)] animate-spin" />
                          <div className="text-[var(--lg-text-tertiary)] font-mono text-[10px] uppercase tracking-[0.25em] animate-pulse">
                            Loading 3D Scene...
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Layer 4: Role Labels */}
                  {/* Left Label */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, y: heroElementsY, x: textX }}
                    className="absolute left-6 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block"
                  >
                    <div className="-rotate-90 origin-center font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--lg-text-tertiary)] whitespace-nowrap">
                      AI Engineer
                    </div>
                  </motion.div>

                  {/* Right Label */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, y: heroElementsY, x: textX }}
                    className="absolute right-6 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block"
                  >
                    <div className="rotate-90 origin-center font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--lg-text-tertiary)] whitespace-nowrap">
                      Full Stack Developer
                    </div>
                  </motion.div>

                  {/* Scroll Indicator */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, y: heroElementsY }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer pointer-events-auto z-20"
                    onClick={() => {
                      const target = document.getElementById("Intro");
                      if (target) {
                        gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 0 }, ease: "power2.out" });
                      }
                    }}
                  >
                    <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-[var(--lg-text-tertiary)]">
                      Scroll to Explore
                    </span>
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="text-[var(--lg-text-secondary)]"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </motion.div>
                </div>
              </section>

              {/* ═══ INTRO SECTION (Viewport 2 Content Intro) ═══ */}
              <section id="Intro" className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-12 lg:px-20 py-24 z-20 bg-gradient-to-b from-[#DCE3F0] to-[#F5F7FA]">
                <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
                  {/* Section Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-[11px] font-mono tracking-[0.25em] text-[var(--lg-text-secondary)] uppercase mb-6"
                  >
                    <span>01 • {t("hero.badge")}</span>
                  </motion.div>

                  {/* Heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans font-extrabold leading-[1.1] tracking-tight text-[clamp(2.25rem,6vw,4.25rem)] max-w-3xl text-[var(--lg-text-primary)]"
                    style={{
                      background: `linear-gradient(135deg, var(--lg-text-primary) 30%, var(--lg-text-secondary) 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    {t("hero.heading")}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 text-base md:text-lg lg:text-xl text-[var(--lg-text-secondary)] max-w-[550px] leading-relaxed font-[Poppins] font-medium"
                  >
                    {t("hero.description_new")}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                  >
                    <button
                      onClick={() => {
                        const target = document.getElementById("showcase");
                        if (target) {
                          gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 70 }, ease: "power2.out" });
                        }
                      }}
                      className="group relative btn-glossy w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs rounded-full bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {t("hero.explore")}
                        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        const target = document.getElementById("contact");
                        if (target) {
                          gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 70 }, ease: "power2.out" });
                        }
                      }}
                      className="glass-panel w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs rounded-full text-[var(--lg-text-primary)] hover:bg-white/40 transition-colors"
                    >
                      {t("hero.contact")}
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* Marquee */}
              <div className="glass-panel-strong py-4 overflow-hidden mx-4 md:mx-8 -mt-4 relative z-10">
                <div className="flex items-center gap-16 whitespace-nowrap" style={{ animation: "marquee 10s linear infinite" }}>
                  {[...logos, ...logos, ...logos].map((logo, i) => (
                    <span key={i} className="text-[var(--lg-text-tertiary)] text-xs tracking-[0.3em] uppercase font-medium">
                      {logo}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Chat Block */}
              <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
                <AiChatBlock />
              </section>

              {/* Sections */}
              <section id="about" className="relative z-10">
                <FrontendDeveloperSection />
              </section>
              <section id="showcase" className="relative z-10">
                <Showcase />
              </section>
              <section id="contact" className="relative z-10">
                <ContactSection />
              </section>
            </div>
          }
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}
