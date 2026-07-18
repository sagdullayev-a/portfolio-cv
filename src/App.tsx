import { ArrowUpRight, Menu, X, Command, ChevronDown, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { useEffect, useState, useRef, lazy, Suspense, Component, ErrorInfo, ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import WelcomeScreen from "@/components/WelcomeScreen";
import FrontendDeveloperSection from "@/components/FrontendDeveloperSection";
import AiChatBlock from "@/components/AiChatBlock";
import Showcase from "./components/Showcase";
import ContactSection from "@/components/ContactSection";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import About from "./pages/About";
const ShaderBackground = lazy(() => import("@/components/ShaderBackground"));

gsap.registerPlugin(ScrollToPlugin);



const logos = ["HAN", "FRONTEND", "DEVELOPER", "CREATIVE"];

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
  const [langOpen, setLangOpen] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Scroll and Mouse coordinates for Layer Parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const heroScrollProgress = useTransform(scrollY, (y) => {
    const height = typeof window !== "undefined" ? window.innerHeight : 800;
    const range = height * 1.4;
    return Math.min(1, Math.max(0, y / range));
  });

  const smoothProgress = useSpring(heroScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
  const heroElementsOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroElementsY = useTransform(smoothProgress, [0, 0.2], [0, -30]);

  const bgOpacity = useTransform(smoothProgress, [0, 0.55], [1, 0.85]);
  const splineScale = useTransform(smoothProgress, [0, 0.55], [1, 0.82]);
  const splineOpacity = useTransform(smoothProgress, [0, 0.55], [1, 0.15]);
  const splineYScroll = useTransform(smoothProgress, [0, 0.55], [0, -80]);
  const splineBlurValue = useTransform(smoothProgress, [0, 0.55], [0, 8]);
  const splineBlur = useTransform(splineBlurValue, (v) => `blur(${v}px)`);

  const leftSidebarY = useTransform(smoothProgress, [0, 0.2], ["-50%", "calc(-50% - 30px)"]);
  const rightSidebarY = useTransform(smoothProgress, [0, 0.2], ["-50%", "calc(-50% - 30px)"]);

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
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setIframeLoaded(true);
    };
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
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      const supported = !!gl;
      setWebglSupported(supported);
      if (!supported) {
        setIframeLoaded(true);
      }
    } catch (e) {
      setWebglSupported(false);
      setIframeLoaded(true);
    }
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
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

  // Scroll spy to update activeNav based on visible section on '/'
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = [
      { id: "Home", el: document.getElementById("Home") },
      { id: "about", el: document.getElementById("about") },
      { id: "showcase", el: document.getElementById("showcase") },
      { id: "contact", el: document.getElementById("contact") },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(({ el }) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = () => setLangOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [langOpen]);

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
    } else if (location.pathname === "/") {
      // Reset scroll to top when returning to home so hero transforms are correct
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  const headingText = t("hero.heading") || "Building Intelligent Digital Experiences.";
  const splitIndex = headingText.indexOf("Digital Experiences.");
  const firstPart = splitIndex !== -1 ? headingText.substring(0, splitIndex) : headingText;
  const secondPart = splitIndex !== -1 ? "Digital Experiences." : "";

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Animated WebGL Shader Background Mesh & Film Grain Texture */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#020412] z-0 pointer-events-none" />}>
        <ShaderBackground />
      </Suspense>

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
          className={`flex items-center gap-1.5 px-2 transition-all duration-500 ${
            scrolled ? "py-1.5 px-3 shadow-lg shadow-indigo-950/10" : "py-2.5 px-4"
          }`}
          style={{
            borderRadius: "var(--lg-radius-pill)",
            background: "var(--lg-glass-bg)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid var(--lg-glass-border)",
            boxShadow: "0 12px 32px rgba(5, 6, 20, 0.4)",
          }}
        >
          {/* Logo */}
          <div
            ref={logoRef}
            onClick={handleLogoClick}
            className="flex items-center gap-2 pr-3 border-r border-white/10 cursor-pointer select-none"
            style={{ transformOrigin: "center" }}
          >
            <img src="/assets/logo.jpg" alt="Logo" className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10" />
            <span className="text-[10px] md:text-xs tracking-[0.2em] text-[var(--lg-text-primary)] uppercase font-bold whitespace-nowrap">
              HAN
            </span>
          </div>

          {/* Nav Items (Desktop) */}
          <ul className="hidden md:flex items-center gap-0.5 px-1">
            {navKeys.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`relative px-4 py-1.5 text-[11px] tracking-[0.15em] uppercase font-bold rounded-full transition-all duration-300 ${
                    activeNav === item.id
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-[var(--lg-text-secondary)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t(`navbar.${item.key}`)}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Switcher Dropdown (Desktop) */}
          <div className="relative hidden md:block border-l border-white/10 pl-2 pr-1">
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--lg-text-secondary)] hover:text-white uppercase px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <span>{activeLang}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-20 bg-[#14183a] border border-white/10 rounded-xl shadow-xl flex flex-col p-1 z-50"
                >
                  {LANGS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        handleLangChange(lang);
                        setLangOpen(false);
                      }}
                      className={`text-[10px] font-bold py-1.5 rounded-lg transition-colors uppercase ${
                        activeLang === lang
                          ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white"
                          : "text-[var(--lg-text-secondary)] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger (Mobile only) */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="w-9 h-9 rounded-full border border-white/10 hover:border-white/20 bg-white/5 flex md:hidden items-center justify-center text-[var(--lg-text-secondary)] hover:text-white hover:bg-white/10 transition-all duration-200 ml-1.5 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenu ? <X size={16} /> : <Menu size={16} />}
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
            onClick={(e) => { if (e.target === e.currentTarget) setMobileMenu(false); }}
            style={{
              background: "rgba(11, 14, 42, 0.96)",
              backdropFilter: "blur(30px) saturate(200%)",
              WebkitBackdropFilter: "blur(30px) saturate(200%)",
            }}
          >
            {/* Soft decorative background orb inside mobile menu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--lg-accent-start)]/10 filter blur-[80px] pointer-events-none" />

            <div className="absolute top-28 text-center z-10">
              <p className="text-[10px] text-[var(--lg-text-tertiary)] tracking-[0.3em] mb-2">TIME</p>
              <h2 className="text-2xl tracking-widest font-semibold text-[var(--lg-text-primary)]">{time}</h2>
            </div>

            <div className="flex flex-col items-center gap-6 z-10 w-full">
              {navKeys.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => {
                    scrollTo(item.id);
                    setMobileMenu(false);
                  }}
                  className="w-full max-w-xs py-3 text-sm uppercase tracking-[0.3em] font-bold text-[var(--lg-text-primary)] hover:text-[var(--lg-accent-start)] transition-colors flex items-center justify-center min-h-[44px]"
                >
                  {t(`navbar.${item.key}`)}
                </motion.button>
              ))}
            </div>

            {/* Mobile Language Switcher */}
            <div className="flex gap-2 mt-4 z-10">
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { handleLangChange(lang); setMobileMenu(false); }}
                  className={`text-xs font-bold min-w-[44px] min-h-[44px] px-4 py-2 rounded-full transition-all duration-200 ${
                    activeLang === lang
                      ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-md shadow-indigo-500/25"
                      : "bg-white/5 border border-white/10 text-[var(--lg-text-secondary)]"
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
              <section id="Home" ref={heroRef} className="relative w-full h-[140vh] z-10 pointer-events-none">
                {/* Sticky Container */}
                <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-auto">
                  {/* Layer 1: Animated background (radial gradient) */}
                  <motion.div
                    style={{ opacity: bgOpacity, x: bgX, y: bgY }}
                    className="absolute inset-0 pointer-events-none overflow-hidden z-0"
                  >
                    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% -20%, rgba(200, 203, 255, 0.4) 0%, rgba(18, 21, 63, 0.95) 45%, rgba(11, 14, 42, 1) 100%)" }} />
                  </motion.div>

                  {/* Layer 2: Gradient blobs (floating blurred light blobs) */}
                  <motion.div
                    style={{ x: blobX, y: blobY }}
                    className="absolute inset-0 pointer-events-none z-0"
                  >
                    {/* Large Purple-Blue Planet on Left */}
                    <div className="absolute top-[20%] left-[-10%] w-[380px] h-[380px] rounded-full opacity-60"
                      style={{ background: "radial-gradient(circle at center, rgba(168, 85, 247, 0.4) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)", filter: "blur(40px)", animation: "blobFloat1 25s ease-in-out infinite" }} />
                    
                    {/* Small Lavender Planet on Top Right */}
                    <div className="absolute top-[10%] right-[15%] w-[200px] h-[200px] rounded-full opacity-50"
                      style={{ background: "radial-gradient(circle at center, rgba(199, 210, 254, 0.45) 0%, rgba(139, 92, 246, 0.15) 60%, transparent 80%)", filter: "blur(20px)", animation: "blobFloat2 30s ease-in-out infinite" }} />
                    
                    {/* Medium Indigo-Purple Planet on Bottom Right */}
                    <div className="absolute bottom-[10%] right-[-8%] w-[450px] h-[450px] rounded-full opacity-45"
                      style={{ background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.08) 60%, transparent 80%)", filter: "blur(50px)", animation: "blobFloat1 20s ease-in-out infinite" }} />

                    {/* Sparkles / Star Dots */}
                    <div className="absolute top-[15%] left-[12%] w-[2px] h-[2px] bg-white rounded-full opacity-60 animate-pulse" />
                    <div className="absolute top-[40%] left-[8%] w-[3px] h-[3px] bg-blue-200 rounded-full opacity-40" />
                    <div className="absolute top-[75%] left-[25%] w-[2px] h-[2px] bg-white rounded-full opacity-50 animate-pulse" />
                    <div className="absolute top-[25%] right-[18%] w-[2px] h-[2px] bg-purple-200 rounded-full opacity-70 animate-pulse" />
                    <div className="absolute top-[60%] right-[8%] w-[3px] h-[3px] bg-white rounded-full opacity-35" />
                  </motion.div>

                  {/* Concentric Elliptical Orbit Rings */}
                  <div className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center">
                    <svg className="w-full h-full opacity-35 max-w-5xl max-h-[80vh]" viewBox="0 0 1000 600" fill="none">
                      <ellipse cx="500" cy="300" rx="360" ry="140" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.2" transform="rotate(-12 500 300)" />
                      <ellipse cx="500" cy="300" rx="420" ry="170" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" strokeDasharray="3 6" transform="rotate(8 500 300)" />
                      <circle cx="210" cy="220" r="2.5" fill="#fff" className="animate-pulse" />
                      <circle cx="790" cy="380" r="3" fill="#c7d2fe" className="animate-pulse" />
                      <circle cx="500" cy="160" r="1.5" fill="#fff" />
                      <circle cx="450" cy="440" r="2" fill="#a5b4fc" />
                    </svg>
                  </div>

                  {/* Layer 3: Spline Scene */}
                  {webglSupported && !isMobile && (
                    <motion.div
                      style={{ scale: splineScale, opacity: splineOpacity, x: splineX, y: splineY, translateY: splineYScroll, filter: splineBlur }}
                      className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-auto"
                    >
                      <iframe
                        src="https://my.spline.design/interactiveaiwebsite-Khl7eAw5ScnSq53JnqIW0APA/"
                        frameBorder="0"
                        width="100%"
                        height="100%"
                        title="Interactive 3D Hero Scene"
                        className="w-full h-full border-none bg-transparent"
                        allow="autoplay; fullscreen"
                        onLoad={() => setIframeLoaded(true)}
                      ></iframe>
                    </motion.div>
                  )}

                  {/* Premium Loading Shimmer Loader */}
                  <AnimatePresence>
                    {!iframeLoaded && !isMobile && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-15 flex items-center justify-center bg-gradient-to-b from-[#0B0E2A] via-[#0D1036] to-[#06081B] pointer-events-none"
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

                  {/* Layer 4: Sidebars & Rotate Scroll */}
                  {/* Left Sidebar: Social Links */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, translateY: leftSidebarY, x: textX }}
                    className="absolute left-6 md:left-12 lg:left-20 top-1/2 z-20 pointer-events-auto hidden md:flex flex-col items-center gap-5"
                  >
                    {[
                      { icon: Github, url: "https://github.com/sagdullayev-a" },
                      { icon: Linkedin, url: "https://linkedin.com/in/azizxon-sagdullayev" },
                      { icon: Instagram, url: "https://instagram.com/sagdulayev_a" },
                      { icon: Mail, url: "mailto:azizhon.sagdullayev@gmail.com" },
                    ].map((soc, idx) => {
                      const Icon = soc.icon;
                      return (
                        <a
                          key={idx}
                          href={soc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--lg-text-secondary)] hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer z-20"
                        >
                          <Icon size={16} />
                        </a>
                      );
                    })}
                  </motion.div>

                  {/* Right Sidebar: Rotate SCROLL Label */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, translateY: rightSidebarY, x: textX }}
                    className="absolute right-6 md:right-12 lg:right-20 top-1/2 z-20 pointer-events-none hidden md:flex flex-col items-center gap-6"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-[var(--lg-text-tertiary)] rotate-90 origin-center translate-y-12 select-none">
                      Scroll
                    </span>
                    <div className="w-[1px] h-20 bg-gradient-to-b from-[var(--lg-text-tertiary)]/50 to-transparent mt-16" />
                  </motion.div>

                  {/* Scroll Indicator */}
                  <motion.div
                    style={{ opacity: heroElementsOpacity, translateX: "-50%", y: heroElementsY }}
                    className="absolute bottom-8 left-1/2 flex flex-col items-center gap-1 cursor-pointer pointer-events-auto z-20"
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
              <section id="Intro" className="relative w-full px-6 md:px-12 lg:px-20 pt-32 pb-12 md:pt-40 md:pb-16 z-20 bg-gradient-to-b from-[#0B0E2A]/30 to-[#080A1F]/30 backdrop-blur-sm border-t border-[var(--lg-glass-border-subtle)]">
                <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                  
                  {/* Left Column (span 7) */}
                  <div className="lg:col-span-7 flex flex-col items-start text-left">
                    {/* Section Indicator */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-[11px] font-mono tracking-[0.25em] text-[var(--lg-text-secondary)] uppercase mb-6"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--lg-accent-start)] animate-pulse" />
                      <span>01 • {t("hero.badge")}</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="font-sans font-extrabold leading-[1.1] tracking-tight text-[clamp(2.25rem,5vw,3.75rem)] text-[var(--lg-text-primary)]"
                    >
                      {firstPart}
                      {secondPart && (
                        <span
                          className="inline-block mt-1 md:mt-0"
                          style={{
                            background: `linear-gradient(135deg, var(--lg-accent-start) 30%, var(--lg-accent-end) 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                          }}
                        >
                          {secondPart}
                        </span>
                      )}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-6 text-sm md:text-base text-[var(--lg-text-secondary)] max-w-xl leading-relaxed font-medium"
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
                        className="group relative w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs rounded-full bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40"
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
                        className="w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 cursor-pointer font-semibold uppercase tracking-wider text-xs rounded-full border border-[var(--lg-glass-border)] bg-[var(--lg-glass-bg)] hover:bg-[var(--lg-glass-bg-strong)] text-[var(--lg-text-primary)] transition-all duration-300 hover:scale-105"
                      >
                        <span className="flex items-center gap-2">
                          {t("hero.contact")}
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--lg-accent-end)]" />
                        </span>
                      </button>
                    </motion.div>
                  </div>

                  {/* Right Column - Stat Cards (span 5) */}
                  <div className="lg:col-span-5 w-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="glass-panel w-full p-8 md:p-10 flex flex-col gap-8 relative overflow-hidden"
                    >
                      {/* Subtle glow orb behind stats */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--lg-accent-start)]/10 filter blur-xl pointer-events-none" />
                      
                      {[
                        { value: "3+", label: t("hero.stats.projects") },
                        { value: "15+", label: t("hero.stats.tech") },
                        { value: "3-Kurs", label: t("hero.stats.student") },
                      ].map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-start border-b last:border-0 border-[var(--lg-glass-border-subtle)] pb-6 last:pb-0">
                          <span
                            className="text-4xl md:text-5xl font-black tracking-tight"
                            style={{
                              background: `linear-gradient(135deg, var(--lg-accent-start) 0%, var(--lg-accent-end) 100%)`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text"
                            }}
                          >
                            {stat.value}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-[var(--lg-text-secondary)] mt-1 uppercase tracking-wider">
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                </div>
              </section>

              {/* Marquee */}
              <div className="glass-panel-strong py-4 overflow-hidden mx-4 md:mx-8 mt-4 md:mt-6 relative z-10">
                <div className="flex items-center gap-16 whitespace-nowrap" style={{ animation: "marquee 10s linear infinite" }}>
                  {[...logos, ...logos, ...logos].map((logo, i) => (
                    <span key={i} className="text-[var(--lg-text-tertiary)] text-xs tracking-[0.3em] uppercase font-medium">
                      {logo}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Chat Block */}
              <section className="relative z-10 px-4 md:px-8 py-12 md:py-16">
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
        <Route path="*" element={
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
            <div className="text-[clamp(80px,15vw,160px)] font-black leading-none" style={{ background: "linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>404</div>
            <p className="text-[var(--lg-text-secondary)] text-lg font-medium">Sahifa topilmadi</p>
            <button onClick={() => { window.location.href = "/"; }} className="btn-glossy !px-8 !py-3">
              Bosh sahifaga qaytish
            </button>
          </div>
        } />
      </Routes>
    </div>
  );
}
