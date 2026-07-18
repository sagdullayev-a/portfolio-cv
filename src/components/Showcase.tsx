import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import TechGraph from "./TechGraph";

const projects = [
  {
    title: "Turnir.uz",
    tech: "React + Node.js + Prisma",
    thumbnail: "/assets/website.png",
    github: "https://github.com/sagdullayev-a/turnir.uz",
  },
  {
    title: "Wedding Hall",
    tech: "Next.js + Zustand + NextAuth",
    thumbnail: "/assets/website.png",
    github: "https://github.com/sagdullayev-a/wedding-hall",
  },
  {
    title: "Sagdullayev.uz",
    tech: "Three.js + Rapier + GSAP",
    thumbnail: "/assets/website.png",
    github: "https://github.com/sagdullayev-a/portfolio",
  },
];

const certificates = [
  {
    title: "showcase.certs.frontend.title",
    tech: "showcase.certs.frontend.tech",
    thumbnail: "/assets/frontend-cert.jpg",
  },
  {
    title: "showcase.certs.backend.title",
    tech: "showcase.certs.backend.tech",
    thumbnail: "/assets/backend-cert.png",
  },
  {
    title: "showcase.certs.btec.title",
    tech: "showcase.certs.btec.tech",
    thumbnail: "/assets/btec-cert.png",
  },
];

const GithubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-8 4h16v-2H4v2z" />
  </svg>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 2v4m0 12v4m10-10h-4M6 12H2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function ProjectCard({ item }: { item: typeof projects[0] }) {
  return (
    <div
      className="group glass-card overflow-hidden
      hover:!shadow-[0_12px_40px_rgba(99,102,241,0.12)] transition-all duration-500
      hover:-translate-y-2"
    >
      <div className="relative h-48 overflow-hidden bg-white/10">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E2A]/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[var(--lg-text-primary)] font-semibold text-sm leading-snug line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--lg-text-tertiary)] font-mono">
          {item.tech}
        </span>
        <a
          href={item.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full
          bg-white/5 border border-white/10 text-[var(--lg-text-secondary)]
          hover:bg-[var(--lg-accent-start)] hover:text-white hover:border-transparent
          transition-all duration-200 active:scale-95"
        >
          <GithubIcon />
        </a>
      </div>
    </div>
  );
}

function CertCard({ item }: { item: typeof certificates[0] }) {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(item.thumbnail, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = t(item.title).replace(/\s+/g, "_").toLowerCase();
      const ext = item.thumbnail.endsWith(".png") ? "png" : "jpg";
      link.download = `${fileName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setTimeout(() => setDownloading(false), 500);
  };

  return (
    <div
      className="group glass-card overflow-hidden
      hover:!shadow-[0_12px_40px_rgba(99,102,241,0.12)] transition-all duration-500
      hover:-translate-y-2"
    >
      <div className="relative h-48 overflow-hidden bg-white/10">
        <img
          src={item.thumbnail}
          alt={t(item.title)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E2A]/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[var(--lg-text-primary)] font-semibold text-sm leading-snug line-clamp-2">
            {t(item.title)}
          </p>
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--lg-text-tertiary)] font-mono">
          {t(item.tech)}
        </span>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center w-8 h-8 rounded-full
          bg-white/5 border border-white/10 text-[var(--lg-text-secondary)]
          hover:bg-[var(--lg-accent-start)] hover:text-white hover:border-transparent
          transition-all duration-200 active:scale-95"
        >
          {downloading ? <Spinner /> : <DownloadIcon />}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOWCASE SECTION
   ═══════════════════════════════════════════════════════════════ */

type TabId = "projects" | "certificates" | "tech";

// tabs definition moved inside component or mapped dynamically to support i18n properly.
const tabIds: TabId[] = ["projects", "certificates", "tech"];

export default function ShowcaseSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabId>("projects");
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const switchTab = useCallback(
    (id: TabId) => {
      if (id === active) return;
      setActive(id);
      setAnimKey((k) => k + 1);
    },
    [active]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 50) return;
    const order = tabIds;
    const idx = order.indexOf(active);
    if (dx < 0 && idx < order.length - 1) switchTab(order[idx + 1]);
    if (dx > 0 && idx > 0) switchTab(order[idx - 1]);
    touchStartX.current = null;
  };

  const activePillLeft =
    active === "projects"
      ? "6px"
      : active === "certificates"
      ? "calc(33.333% + 2px)"
      : "calc(66.666% - 2px)";

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
      <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto">
        {/* Label */}
        <div className="relative flex items-center justify-center gap-4 mb-5 opacity-0 animate-[fadeSlideDown_0.8s_ease_forwards]">
          <div className="relative overflow-hidden">
            <div className="w-10 h-px bg-[var(--lg-text-tertiary)]/30" />
            <div
              className="absolute inset-0 animate-[lineMove_2s_linear_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, var(--lg-accent-start), transparent)",
              }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.45em] text-[var(--lg-text-tertiary)] font-mono">
            {t("showcase.label")}
          </span>
          <div className="relative overflow-hidden">
            <div className="w-10 h-px bg-[var(--lg-text-tertiary)]/30" />
            <div
              className="absolute inset-0 animate-[lineMove_2s_linear_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, var(--lg-accent-start), transparent)",
              }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="relative overflow-hidden mb-12">
          <h1
            className="text-center font-black tracking-tight leading-none opacity-0 whitespace-nowrap animate-[headingReveal_1s_cubic-bezier(0.22,1,0.36,1)_0.15s_forwards]"
            style={{ fontSize: "clamp(32px,6vw,80px)" }}
          >
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(180deg, var(--lg-text-primary) 0%, var(--lg-text-secondary) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("showcase.title")}
            </span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div
          className="relative flex items-center p-1.5 rounded-full mb-14 w-full max-w-md opacity-0 animate-[fadeSlideUp_0.6s_ease_0.3s_forwards] glass-panel-strong"
        >
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full transition-[left] duration-300 ease-out"
            style={{
              width: "calc(33.333% - 4px)",
              left: activePillLeft,
              background: "linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end))",
              boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
            }}
          />
          {tabIds.map((tabId) => (
            <button
              key={tabId}
              onClick={() => switchTab(tabId)}
              className="relative z-10 flex-1 h-11 sm:h-12 rounded-full text-[10px] sm:text-xs font-medium tracking-wide transition-colors duration-200 flex items-center justify-center"
            >
              <span
                className={
                  active === tabId
                    ? "text-white font-semibold"
                    : "text-[var(--lg-text-tertiary)] hover:text-[var(--lg-text-primary)]"
                }
              >
                {t(`showcase.tabs.${tabId}`)}
              </span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div
          key={animKey}
          className="w-full opacity-0 animate-[contentIn_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {active === "projects" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {projects.map((item, i) => (
                <div
                  key={i}
                  className="opacity-0"
                  style={{
                    animation: `fadeSlideUp 0.5s ease ${i * 0.08}s forwards`,
                  }}
                >
                  <ProjectCard item={item} />
                </div>
              ))}
            </div>
          )}

          {active === "certificates" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {certificates.map((item, i) => (
                <div
                  key={i}
                  className="opacity-0"
                  style={{
                    animation: `fadeSlideUp 0.5s ease ${i * 0.08}s forwards`,
                  }}
                >
                  <CertCard item={item} />
                </div>
              ))}
            </div>
          )}

          {active === "tech" && (
            <div
              className="opacity-0"
              style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
            >
              <TechGraph />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
