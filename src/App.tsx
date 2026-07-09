import { ArrowUpRight, Menu, X, Command } from "lucide-react";
import { useEffect, useState, useRef, lazy, Suspense, Component, ErrorInfo, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import favicon from "/favicon.ico";
import heroEye from "@/assets/hero-eye.png";

import WelcomeScreen from "@/components/WelcomeScreen";
import FrontendDeveloperSection from "@/components/FrontendDeveloperSection";
import AiChatBlock from "@/components/AiChatBlock";
import Showcase from "./components/Showcase";
import ContactSection from "@/components/ContactSection";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import About from "./pages/About";

gsap.registerPlugin(ScrollToPlugin);

const Spline = lazy(() => import("@splinetool/react-spline"));
const HERO_SPLINE_URL = "SPLINE_SCENE_URL_PLACEHOLDER";

class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  public state = { hasError: false };

  public static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Spline Error Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const text = "PRINCE";
  const [displayed, setDisplayed] = useState("");
  const [colorMode, setColorMode] = useState(0);

  const colors = [
    "bg-gradient-to-b from-[var(--lg-text-primary)] via-[var(--lg-text-secondary)] to-[var(--lg-text-tertiary)] text-transparent bg-clip-text",
    "text-[var(--lg-text-primary)]",
    "bg-gradient-to-b from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-transparent bg-clip-text",
  ];

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

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    function type() {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i < text.length) setTimeout(type, 200);
    }
    type();
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
              {/* ═══ HERO ═══ */}
              <section id="Home" className="relative w-full h-screen min-h-[640px] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)", filter: "blur(60px)", animation: "blobFloat1 15s ease-in-out infinite" }} />
                  <div className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)", filter: "blur(50px)", animation: "blobFloat2 18s ease-in-out infinite" }} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  {isMobile || HERO_SPLINE_URL === "SPLINE_SCENE_URL_PLACEHOLDER" ? (
                    <HeroSplineFallback
                      isMobile={isMobile}
                      isPlaceholder={HERO_SPLINE_URL === "SPLINE_SCENE_URL_PLACEHOLDER"}
                    />
                  ) : (
                    <div className="w-full h-full relative z-0">
                      <ErrorBoundary fallback={<HeroSplineFallback />}>
                        <Suspense fallback={<HeroSplineFallback />}>
                          <Spline scene={HERO_SPLINE_URL} />
                        </Suspense>
                      </ErrorBoundary>
                    </div>
                  )}
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 md:px-12 pt-28 pb-10 pointer-events-none">
                  <h1
                    onClick={() => setColorMode((prev) => (prev + 1) % colors.length)}
                    className={`font-display uppercase leading-[0.85] tracking-[-0.03em] text-[clamp(2.5rem,14vw,10rem)] cursor-pointer transition-all duration-300 pointer-events-auto ${colors[colorMode]}`}
                  >
                    {displayed || "\u00A0"}
                  </h1>

                  <p
                    className="md:absolute md:top-28 md:right-12 mt-4 md:mt-0 text-right text-3xl md:text-4xl lg:text-5xl leading-[1.05] max-w-md font-[Poppins] font-bold tracking-wide pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, var(--lg-text-primary), var(--lg-text-secondary))`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t("hero.tagline_1")}
                    <br />{t("hero.tagline_2")}
                    <br />{t("hero.tagline_3")}
                    <br />{t("hero.tagline_4")}
                  </p>

                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-auto pointer-events-none">
                    <p className="text-sm sm:text-base lg:text-xl leading-relaxed max-w-md font-[Poppins] font-medium tracking-wide text-[var(--lg-text-secondary)] pointer-events-auto">
                      {t("hero.description")}
                    </p>
                    <a href="https://www.webkaizen.in" target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
                      <button className="btn-glossy">
                        {t("hero.cta")}
                        <ArrowUpRight size={16} />
                      </button>
                    </a>
                  </div>
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

function HeroSplineFallback({
  isMobile = false,
  isPlaceholder = false,
}: {
  isMobile?: boolean;
  isPlaceholder?: boolean;
}) {
  const showPlaceholder = isMobile || isPlaceholder;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-[80%] h-[80%] max-w-4xl max-h-[500px] glass-panel-strong overflow-hidden relative flex items-center justify-center opacity-40">
        {!showPlaceholder && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="text-[var(--lg-text-tertiary)] font-mono text-xs uppercase tracking-[0.25em] animate-pulse">
              Loading 3D Scene...
            </div>
          </>
        )}
        {showPlaceholder && (
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 backdrop-blur-xl shadow-lg flex items-center justify-center animate-[floatCard_6s_ease-in-out_infinite]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--lg-accent-start)]/10 blur-md" />
          </div>
        )}
      </div>
    </div>
  );
}