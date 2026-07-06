import { useState, useMemo, useRef, useEffect } from "react";
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
  size: "lg" | "md" | "sm";
}

const categories: { id: TechCategory; label: string; color: string }[] = [
  { id: "FE", label: "Frontend", color: "#6366f1" },
  { id: "BE", label: "Backend", color: "#22c55e" },
  { id: "TOOL", label: "Tools", color: "#f59e0b" },
  { id: "CLOUD", label: "Cloud", color: "#06b6d4" },
  { id: "AI", label: "AI", color: "#ec4899" },
  { id: "DX", label: "Dev Experience", color: "#8b5cf6" },
];

const techNodesBase: TechNode[] = [
  { name: "React",      icon: "https://cdn.simpleicons.org/react/61DAFB",           color: "#61DAFB", category: "FE",    key: "react",      projects: ["Portfolio", "WebKaizen"], size: "lg" },
  { name: "Next.js",   icon: "https://cdn.simpleicons.org/nextdotjs/000000",        color: "#6366f1", category: "FE",    key: "nextjs",     projects: ["WebKaizen"],              size: "lg" },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6",      color: "#3178C6", category: "FE",    key: "typescript", projects: ["Portfolio", "WebKaizen"], size: "lg" },
  { name: "Tailwind",  icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",      color: "#06B6D4", category: "FE",    key: "tailwind",   projects: ["Portfolio", "WebKaizen"], size: "lg" },
  { name: "HTML5",     icon: "https://cdn.simpleicons.org/html5/E34F26",            color: "#E34F26", category: "FE",    key: "html5",      projects: ["allProjects"],            size: "sm" },
  { name: "CSS3",      icon: "https://cdn.simpleicons.org/css/1572B6",              color: "#1572B6", category: "FE",    key: "css3",       projects: ["Portfolio"],              size: "sm" },
  { name: "JavaScript",icon: "https://cdn.simpleicons.org/javascript/F7DF1E",       color: "#F7DF1E", category: "FE",    key: "javascript", projects: ["allProjects"],            size: "sm" },
  { name: "Node.js",   icon: "https://cdn.simpleicons.org/nodedotjs/339933",        color: "#339933", category: "BE",    key: "nodejs",     projects: ["WebKaizen"],              size: "md" },
  { name: "Python",    icon: "https://cdn.simpleicons.org/python/3776AB",           color: "#3776AB", category: "AI",    key: "python",     projects: ["aiExperiments"],          size: "sm" },
  { name: "Firebase",  icon: "https://cdn.simpleicons.org/firebase/FFCA28",         color: "#FFCA28", category: "CLOUD", key: "firebase",   projects: ["WebKaizen"],              size: "md" },
  { name: "Git",       icon: "https://cdn.simpleicons.org/git/F05032",              color: "#F05032", category: "TOOL",  key: "git",        projects: ["allProjects"],            size: "md" },
  { name: "GitHub",    icon: "https://cdn.simpleicons.org/github/181717",           color: "#8b5cf6", category: "TOOL",  key: "github",     projects: ["allProjects"],            size: "md" },
  { name: "Vercel",    icon: "https://cdn.simpleicons.org/vercel/000000",           color: "#06b6d4", category: "CLOUD", key: "vercel",     projects: ["Portfolio", "WebKaizen"], size: "md" },
  { name: "Three.js",  icon: "https://cdn.simpleicons.org/threedotjs/000000",       color: "#ec4899", category: "DX",    key: "threejs",    projects: ["Portfolio"],              size: "md" },
  { name: "Framer",    icon: "https://cdn.simpleicons.org/framer/000000",           color: "#6366f1", category: "DX",    key: "framer",     projects: ["Portfolio"],              size: "md" },
];

/* ═══════════════════════════════════════════════════════════════
   TECH GRAPH EXPORT
   ═══════════════════════════════════════════════════════════════ */

export default function TechGraph() {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<TechCategory | null>(null);
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // 3D Rotation State
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [radius, setRadius] = useState(200);

  const velocity = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  // Responsive radius adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRadius(135);
      } else if (window.innerWidth < 1024) {
        setRadius(165);
      } else {
        setRadius(205);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3D Physics Loop (Auto-rotation and inertia damping)
  useEffect(() => {
    let lastT = performance.now();
    const update = (time: number) => {
      // Calculate delta time
      const dt = time - lastT;
      lastT = time;

      if (!isDragging) {
        // If has momentum/velocity from drag, decelerate slowly
        if (Math.abs(velocity.current.x) > 0.02 || Math.abs(velocity.current.y) > 0.02) {
          setRotation((prev) => ({
            x: Math.max(-60, Math.min(60, prev.x + velocity.current.x)),
            y: prev.y + velocity.current.y,
          }));
          velocity.current.x *= 0.95; // friction damping
          velocity.current.y *= 0.95;
        } else {
          // Slow continuous idle rotation if untouched and not hovered
          if (!hoveredKey) {
            setRotation((prev) => ({
              x: prev.x,
              y: prev.y + 0.15, // rotation speed
            }));
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(update);
    };

    animationFrameId.current = requestAnimationFrame(update);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isDragging, hoveredKey]);

  // Pointer Event Handlers for Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return; // Don't drag if clicking buttons
    setIsDragging(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;

    const sensitivity = 0.28;
    setRotation((prev) => ({
      // Clamp vertical rotation (rotateX) to avoid getting inverted
      x: Math.max(-60, Math.min(60, prev.x - dy * sensitivity)),
      y: prev.y + dx * sensitivity,
    }));

    velocity.current = {
      x: -dy * sensitivity * 0.4,
      y: dx * sensitivity * 0.4,
    };

    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleReset = () => {
    velocity.current = { x: 0, y: 0 };
    setRotation({ x: 0, y: 0 });
  };

  const handleCategoryChange = (cat: TechCategory | null) => {
    setActiveCategory(cat);
    setSelectedNode(null);
  };

  // Translate project labels
  const tp = (p: string) => {
    if (p === "allProjects" || p === "aiExperiments") return t(`techGraph.${p}`);
    return p;
  };

  // Calculate 3D points on sphere (Fibonacci sphere distribution)
  const spherePoints = useMemo(() => {
    const N = techNodesBase.length;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(Math.max(0, 1 - y * y)); // radius at y
      const theta = phi * i;

      const x = Math.cos(theta) * r * radius;
      const z = Math.sin(theta) * r * radius;
      const yPos = y * radius;
      pts.push({ x, y: yPos, z });
    }
    return pts;
  }, [radius]);

  return (
    <div className="space-y-8">
      {/* Horizontal Line Label Decoration */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lg-text-tertiary)]/20" />
        <span className="text-[10px] tracking-[0.3em] font-mono text-[var(--lg-text-tertiary)] uppercase whitespace-nowrap">
          {t("techGraph.subtitle", { count: techNodesBase.length })}
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
            {selectedNode && (
              <motion.div
                key={selectedNode.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass-panel-strong p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/45 border border-white/60 p-1.5 shadow-sm">
                    <img src={selectedNode.icon} alt={selectedNode.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--lg-text-primary)]">{selectedNode.name}</h3>
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: `${categories.find((c) => c.id === selectedNode.category)?.color}20`,
                        color: categories.find((c) => c.id === selectedNode.category)?.color,
                      }}
                    >
                      {categories.find((c) => c.id === selectedNode.category)?.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[var(--lg-text-secondary)] leading-relaxed mb-4">
                  {t(`techGraph.nodes.${selectedNode.key}.description`)}
                </p>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[var(--lg-text-tertiary)] uppercase tracking-wider">
                      {t("techGraph.whenLabel")}
                    </span>
                    <p className="text-sm font-medium text-[var(--lg-text-primary)]">
                      {t(`techGraph.nodes.${selectedNode.key}.useCase`)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--lg-text-tertiary)] uppercase tracking-wider">
                      {t("techGraph.projectsLabel")}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedNode.projects.map((p) => (
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedNode && (
            <div className="glass-card !rounded-xl p-5 text-center">
              <p className="text-sm text-[var(--lg-text-tertiary)]">{t("techGraph.hint")}</p>
              <p className="text-[11px] text-[var(--lg-text-tertiary)] mt-1 opacity-60">{t("techGraph.hintSub")}</p>
            </div>
          )}
        </div>

        {/* Right: 3D Orbital Cluster Layout */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="lg:col-span-3 glass-panel overflow-hidden relative min-h-[480px] w-full select-none flex items-center justify-center bg-gradient-to-tr from-white/10 to-indigo-50/5 cursor-grab active:cursor-grabbing touch-none select-none"
          style={{
            perspective: "1000px",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* 3D Scene Wrapper */}
          <div
            className="w-full h-full relative flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              width: "100%",
              height: "100%",
            }}
          >
            {techNodesBase.map((node, i) => {
              const pos = spherePoints[i] || { x: 0, y: 0, z: 0 };
              const isActive = activeCategory === null || node.category === activeCategory;
              const isSelected = selectedNode?.key === node.key;
              const isHovered = hoveredKey === node.key;

              return (
                <AnimatePresence key={node.key}>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: isSelected ? 1.15 : isHovered ? 1.1 : 1.0,
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                        opacity: { duration: 0.25 },
                      }}
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        // Translate to 3D sphere coordinate & Counter-rotate (billboard) card to face screen
                        transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) translate(-50%, -50%) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
                        transformStyle: "preserve-3d",
                        zIndex: isSelected ? 50 : isHovered ? 40 : Math.round(pos.z + 200),
                      }}
                    >
                      <div
                        onClick={() => setSelectedNode(node)}
                        onMouseEnter={() => setHoveredKey(node.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        className={`select-none cursor-pointer flex flex-col items-center justify-center backdrop-blur-[16px] saturate-[180%] border transition-all duration-300 ${
                          node.size === "lg"
                            ? "w-[82px] h-[82px] sm:w-[94px] sm:h-[94px] rounded-[18px]"
                            : node.size === "md"
                            ? "w-[66px] h-[66px] sm:w-[76px] sm:h-[76px] rounded-[15px]"
                            : "w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] rounded-[12px]"
                        } ${
                          isSelected
                            ? "bg-white/90 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40"
                            : isHovered
                            ? "bg-white/80 border-indigo-500/30 shadow-md"
                            : "bg-white/60 border-white/70 shadow-sm"
                        }`}
                        style={{
                          boxShadow: isSelected
                            ? `0 12px 30px ${node.color}35, inset 0 1px 0 rgba(255,255,255,0.9)`
                            : isHovered
                            ? `0 8px 20px ${node.color}25, inset 0 1px 0 rgba(255,255,255,0.9)`
                            : "0 6px 16px rgba(31,38,135,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                        }}
                      >
                        {/* Icon Container */}
                        <div
                          className={`${
                            node.size === "lg"
                              ? "w-8 h-8 sm:w-10 sm:h-10"
                              : node.size === "md"
                              ? "w-6 h-6 sm:w-7 sm:h-7"
                              : "w-5 h-5 sm:w-6 sm:h-6"
                          } flex items-center justify-center p-1 sm:p-1.5`}
                        >
                          <img src={node.icon} alt={node.name} className="w-full h-full object-contain" />
                        </div>
                        {/* Label (only for lg and md sizes to prevent clutter) */}
                        {node.size !== "sm" && (
                          <span className="text-[8px] sm:text-[9px] font-bold text-[var(--lg-text-secondary)] tracking-wider mt-1 uppercase font-mono">
                            {node.name}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>

          {/* Reset / Recenter Button */}
          <button
            onClick={handleReset}
            className="absolute bottom-4 right-4 z-30 btn-glossy-outline !rounded-full !px-3.5 !py-2 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 shadow-sm hover:!bg-white/45 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            🔄 {t("techGraph.recenter")}
          </button>
        </div>
      </div>
    </div>
  );
}
