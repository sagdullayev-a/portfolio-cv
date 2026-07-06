import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

/* ═══════════════════════════════════════════════════════════════
   DATA & TYPES
   ═══════════════════════════════════════════════════════════════ */

type TechCategory = "FE" | "BE" | "TOOL" | "CLOUD" | "AI" | "DX";

interface TechNode {
  name: string;
  icon: string;
  color: string;
  category: TechCategory;
  key: string;
  projects: string[];
}

const categories: { id: TechCategory; label: string; color: string }[] = [
  { id: "FE", label: "Frontend", color: "#6366f1" },
  { id: "BE", label: "Backend", color: "#22c55e" },
  { id: "TOOL", label: "Tools", color: "#f59e0b" },
  { id: "CLOUD", label: "Cloud", color: "#06b6d4" },
  { id: "AI", label: "AI", color: "#ec4899" },
  { id: "DX", label: "Dev Experience", color: "#8b5cf6" },
];

const techStack: TechNode[] = [
  { name: "HTML5",      icon: "https://cdn.simpleicons.org/html5/E34F26",            color: "#E34F26", category: "FE",    key: "html5",      projects: ["allProjects"] },
  { name: "CSS3",      icon: "https://cdn.simpleicons.org/css/1572B6",              color: "#1572B6", category: "FE",    key: "css3",       projects: ["Portfolio"] },
  { name: "JavaScript",icon: "https://cdn.simpleicons.org/javascript/F7DF1E",       color: "#F7DF1E", category: "FE",    key: "javascript", projects: ["allProjects"] },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6",      color: "#3178C6", category: "FE",    key: "typescript", projects: ["Portfolio", "WebKaizen"] },
  { name: "React",      icon: "https://cdn.simpleicons.org/react/61DAFB",           color: "#61DAFB", category: "FE",    key: "react",      projects: ["Portfolio", "WebKaizen"] },
  { name: "Next.js",   icon: "https://cdn.simpleicons.org/nextdotjs/000000",        color: "#6366f1", category: "FE",    key: "nextjs",     projects: ["WebKaizen"] },
  { name: "Node.js",   icon: "https://cdn.simpleicons.org/nodedotjs/339933",        color: "#339933", category: "BE",    key: "nodejs",     projects: ["WebKaizen"] },
  { name: "Tailwind",  icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",      color: "#06B6D4", category: "FE",    key: "tailwind",   projects: ["Portfolio", "WebKaizen"] },
  { name: "Python",    icon: "https://cdn.simpleicons.org/python/3776AB",           color: "#3776AB", category: "AI",    key: "python",     projects: ["aiExperiments"] },
  { name: "Firebase",  icon: "https://cdn.simpleicons.org/firebase/FFCA28",         color: "#FFCA28", category: "CLOUD", key: "firebase",   projects: ["WebKaizen"] },
  { name: "Git",       icon: "https://cdn.simpleicons.org/git/F05032",              color: "#F05032", category: "TOOL",  key: "git",        projects: ["allProjects"] },
  { name: "GitHub",    icon: "https://cdn.simpleicons.org/github/181717",           color: "#8b5cf6", category: "TOOL",  key: "github",     projects: ["allProjects"] },
  { name: "Vercel",    icon: "https://cdn.simpleicons.org/vercel/000000",           color: "#06b6d4", category: "CLOUD", key: "vercel",     projects: ["Portfolio", "WebKaizen"] },
  { name: "Netlify",   icon: "https://cdn.simpleicons.org/netlify/00C7B7",          color: "#00C7B7", category: "CLOUD", key: "netlify",    projects: ["Portfolio"] },
  { name: "Terminal",  icon: "https://cdn.simpleicons.org/gnometerminal/4EAA25",     color: "#4EAA25", category: "TOOL",  key: "terminal",   projects: ["allProjects"] }
];

/* ═══════════════════════════════════════════════════════════════
   MAIN TECH GRAPH COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function TechGraph() {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<TechCategory | null>(null);
  const [selectedTech, setSelectedTech] = useState<TechNode>(techStack[4]); // React by default
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D parameters
  const rotX = useRef(0.3);
  const rotY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0.004);
  const isDragging = useRef(false);
  const lastMX = useRef(0);
  const lastMY = useRef(0);
  const dragVX = useRef(0);
  const dragVY = useRef(0);
  const rafId = useRef<number>();
  const itemEls = useRef<(HTMLDivElement | null)[]>([]);

  // Responsive container dimension state
  const [dimensions, setDimensions] = useState({ size: 420, radius: 160 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDimensions({ size: 300, radius: 105 }); // smaller on mobile
      } else if (window.innerWidth < 1024) {
        setDimensions({ size: 360, radius: 130 }); // tablet
      } else {
        setDimensions({ size: 420, radius: 160 }); // desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const n = techStack.length;

  // Calculate 3D sphere points (Fibonacci sphere distribution)
  const positions = useMemo(() => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });
  }, [n]);

  // Project 3D coordinate onto 2D screen using rotation angles
  function project(pos: { x: number; y: number; z: number }, rx: number, ry: number) {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = pos.x * cosY - pos.z * sinY;
    const z1 = pos.x * sinY + pos.z * cosY;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y2 = pos.y * cosX - z1 * sinX;
    const z2 = pos.y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  // Ref callbacks for mapping elements
  const activeCategoryRef = useRef(activeCategory);
  const selectedTechRef = useRef(selectedTech);
  const hoveredKeyRef = useRef(hoveredKey);
  const dimsRef = useRef(dimensions);

  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);
  useEffect(() => { selectedTechRef.current = selectedTech; }, [selectedTech]);
  useEffect(() => { hoveredKeyRef.current = hoveredKey; }, [hoveredKey]);
  useEffect(() => { dimsRef.current = dimensions; }, [dimensions]);

  useEffect(() => {
    function render() {
      const els = itemEls.current;
      const actCat = activeCategoryRef.current;
      const selTech = selectedTechRef.current;
      const hovKey = hoveredKeyRef.current;
      const { size, radius } = dimsRef.current;

      // Update rotation if not dragging and not hovering a card
      if (!isDragging.current) {
        if (hovKey) {
          // Pause rotation on hover
        } else {
          rotY.current += velY.current;
          rotX.current += velX.current;
          velX.current *= 0.96; // momentum damping
          velY.current = velY.current * 0.98 + 0.004 * 0.02; // return to slow spin
        }
      }

      // Map 3D positions with current rotation angles
      const projected = positions.map((pos, i) => ({
        el: els[i],
        p: project(pos, rotX.current, rotY.current),
        node: techStack[i],
      }));

      // Sort by depth (Z axis) for rendering correct overlapping z-index
      projected
        .slice()
        .sort((a, b) => a.p.z - b.p.z)
        .forEach(({ el, p, node }, idx) => {
          if (!el) return;

          const center = size / 2;
          const cardRadius = 36; // half of 72px card width
          const x = p.x * radius + center - cardRadius;
          const y = p.y * radius + center - cardRadius;

          const depth = (p.z + 1) / 2;
          const isActive = actCat === null || node.category === actCat;
          const isSelected = selTech.key === node.key;
          const isHovered = hovKey === node.key;

          // Opacity & Scale calculation based on depth and filter state
          const opacity = isActive ? (0.25 + depth * 0.75) : 0;
          const scale = isActive ? (0.55 + depth * 0.55) * (isSelected ? 1.25 : isHovered ? 1.15 : 1.0) : 0;
          const pointerEvents = isActive ? "auto" : "none";

          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.style.opacity = `${opacity}`;
          el.style.transform = `scale(${scale})`;
          el.style.zIndex = `${isSelected ? 999 : isHovered ? 990 : idx}`;
          el.style.pointerEvents = pointerEvents;
        });

      rafId.current = requestAnimationFrame(render);
    }

    rafId.current = requestAnimationFrame(render);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [positions]);

  // Mouse Drag Events
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return; // skip if clicking buttons
    isDragging.current = true;
    lastMX.current = e.clientX;
    lastMY.current = e.clientY;
    dragVX.current = 0;
    dragVY.current = 0;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMX.current;
      const dy = e.clientY - lastMY.current;
      dragVX.current = dy * 0.005;
      dragVY.current = dx * 0.005;
      rotX.current += dragVX.current;
      rotY.current += dragVY.current;
      lastMX.current = e.clientX;
      lastMY.current = e.clientY;
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        velX.current = dragVX.current;
        velY.current = dragVY.current || 0.004;
        isDragging.current = false;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Touch Swipe Events (Mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    lastMX.current = e.touches[0].clientX;
    lastMY.current = e.touches[0].clientY;
    dragVX.current = 0;
    dragVY.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastMX.current;
    const dy = e.touches[0].clientY - lastMY.current;
    dragVX.current = dy * 0.005;
    dragVY.current = dx * 0.005;
    rotX.current += dragVX.current;
    rotY.current += dragVY.current;
    lastMX.current = e.touches[0].clientX;
    lastMY.current = e.touches[0].clientY;
  };

  const onTouchEnd = () => {
    velX.current = dragVX.current;
    velY.current = dragVY.current || 0.004;
    isDragging.current = false;
  };

  const handleReset = () => {
    velX.current = 0;
    velY.current = 0.004;
    rotX.current = 0.3;
    rotY.current = 0;
  };

  const handleCategoryChange = (cat: TechCategory | null) => {
    setActiveCategory(cat);
    // Find first node matching category, or default to React (techStack[4])
    if (cat === null) {
      setSelectedTech(techStack[4]);
    } else {
      const match = techStack.find((n) => n.category === cat);
      if (match) setSelectedTech(match);
    }
  };

  const tp = (p: string) => {
    if (p === "allProjects" || p === "aiExperiments") return t(`techGraph.${p}`);
    return p;
  };

  return (
    <div className="space-y-8">
      {/* Horizontal Line Label Decoration */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lg-text-tertiary)]/20" />
        <span className="text-[10px] tracking-[0.3em] font-mono text-[var(--lg-text-tertiary)] uppercase whitespace-nowrap">
          {t("techGraph.subtitle", { count: techStack.length })}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--lg-text-tertiary)]/20" />
      </div>

      {/* Header */}
      <div className="text-center">
        <h2
          className="text-3xl md:text-4xl font-black tracking-tight mb-3"
          style={{
            background: "linear-gradient(135deg, var(--lg-text-primary), var(--lg-text-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t("techGraph.title")}
        </h2>
        <p className="text-sm text-[var(--lg-text-secondary)] max-w-md mx-auto">
          {t("techGraph.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Filters + Info Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filters */}
          <div className="glass-panel p-5">
            <p className="text-xs text-[var(--lg-text-tertiary)] uppercase tracking-wider font-medium mb-3">
              {t("techGraph.categories")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeCategory === null
                    ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-md"
                    : "glass-card text-[var(--lg-text-secondary)] hover:bg-white/40"
                }`}
              >
                {t("techGraph.all")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === cat.id ? "text-white shadow-md" : "glass-card text-[var(--lg-text-secondary)] hover:bg-white/40"
                  }`}
                  style={activeCategory === cat.id ? { background: cat.color } : undefined}
                >
                  <span className="text-[10px] font-mono">{cat.id}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Node Info Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTech.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel-strong p-6 relative overflow-hidden group min-h-[220px] flex flex-col justify-center border border-white/15 bg-white/[0.05]"
            >
              {/* Glowing color stripe matching the logo */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                style={{ backgroundColor: selectedTech.color }}
              />

              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/10 p-2 shadow-inner transition-transform duration-300 group-hover:scale-110"
                  style={{ boxShadow: `0 0 20px -5px ${selectedTech.color}55` }}
                >
                  <img src={selectedTech.icon} alt={selectedTech.name} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-mono block">
                    {t("techGraph.whenLabel")}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-wide">{selectedTech.name}</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                {t(`techGraph.nodes.${selectedTech.key}.description`)}
              </p>

              {/* Projects */}
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] text-[var(--lg-text-tertiary)] uppercase tracking-wider">
                  {t("techGraph.projectsLabel")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTech.projects.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.08)", color: "var(--lg-accent-start)" }}
                    >
                      {tp(p)}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="glass-card !rounded-xl p-5 text-center">
            <p className="text-sm text-[var(--lg-text-tertiary)]">{t("techGraph.hint")}</p>
            <p className="text-[11px] text-[var(--lg-text-tertiary)] mt-1 opacity-60">{t("techGraph.hintSub")}</p>
          </div>
        </div>

        {/* Right: 3D Dome Sphere */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative w-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
            style={{ height: "460px" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
              }}
            />

            {/* Scene */}
            <div
              className="relative"
              style={{
                width: `${dimensions.size}px`,
                height: `${dimensions.size}px`,
              }}
            >
              {techStack.map((tech, i) => {
                const isSelected = selectedTech.key === tech.key;
                return (
                  <div
                    key={tech.key}
                    ref={(el) => { itemEls.current[i] = el; }}
                    style={{
                      position: "absolute",
                      width: "72px",
                      height: "72px",
                      transformStyle: "preserve-3d",
                      willChange: "transform, opacity",
                    }}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTech(tech);
                      }}
                      onMouseEnter={() => setHoveredKey(tech.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      className="w-full h-full rounded-[18px] flex flex-col items-center justify-center gap-[5px] transition-all duration-300 hover:scale-125 cursor-pointer"
                      style={{
                        border: isSelected ? `1.5px solid ${tech.color}` : "1px solid rgba(255,255,255,0.12)",
                        background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(12px)",
                        boxShadow: isSelected ? `0 0 25px 0 ${tech.color}88` : `0 0 20px -8px ${tech.color}55`,
                      }}
                    >
                      <img
                        src={tech.icon}
                        alt={tech.name}
                        loading="lazy"
                        style={{ width: "30px", height: "30px", objectFit: "contain" }}
                      />
                      <span
                        style={{
                          fontSize: "9px",
                          color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          textAlign: "center",
                          lineHeight: 1.2,
                          fontWeight: isSelected ? "bold" : "normal",
                        }}
                      >
                        {tech.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recenter / Reset Button */}
            <button
              onClick={handleReset}
              className="absolute bottom-4 right-4 z-30 btn-glossy-outline !rounded-full !px-3.5 !py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 shadow-sm hover:!bg-white/45 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              🔄 {t("techGraph.recenter")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
