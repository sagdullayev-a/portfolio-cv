import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

/* ═══════════════════════════════════════════════════════════════
   DATA & TYPES
   ═══════════════════════════════════════════════════════════════ */

type TechCategory = "FE" | "BE" | "TOOL" | "CLOUD";
type Mode = "sphere" | "space" | "grid";

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
];

const techStack: TechNode[] = [
  { name: "HTML5",      icon: "https://cdn.simpleicons.org/html5/E34F26",            color: "#E34F26", category: "FE",    key: "html5",      projects: ["allProjects"] },
  { name: "CSS3",      icon: "https://cdn.simpleicons.org/css/1572B6",              color: "#1572B6", category: "FE",    key: "css3",       projects: ["Portfolio"] },
  { name: "JavaScript",icon: "https://cdn.simpleicons.org/javascript/F7DF1E",       color: "#F7DF1E", category: "FE",    key: "javascript", projects: ["allProjects"] },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6",      color: "#3178C6", category: "FE",    key: "typescript", projects: ["Portfolio", "WebKaizen"] },
  { name: "React",      icon: "https://cdn.simpleicons.org/react/61DAFB",           color: "#61DAFB", category: "FE",    key: "react",      projects: ["Portfolio", "WebKaizen"] },
  { name: "Next.js",   icon: "https://cdn.simpleicons.org/nextdotjs/000000",        color: "#6366f1", category: "FE",    key: "nextjs",     projects: ["WebKaizen"] },
  { name: "Node.js",   icon: "https://cdn.simpleicons.org/nodedotjs/339933",        color: "#339933", category: "BE",    key: "nodejs",     projects: ["WebKaizen"] },
  { name: "Express.js", icon: "https://cdn.simpleicons.org/express/ffffff",         color: "#ffffff", category: "BE",    key: "express",    projects: ["Turnir.uz"] },
  { name: "Tailwind",  icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",      color: "#06B6D4", category: "FE",    key: "tailwind",   projects: ["Portfolio", "WebKaizen"] },
  { name: "Git",       icon: "https://cdn.simpleicons.org/git/F05032",              color: "#F05032", category: "TOOL",  key: "git",        projects: ["allProjects"] },
  { name: "GitHub",    icon: "https://cdn.simpleicons.org/github/181717",           color: "#8b5cf6", category: "TOOL",  key: "github",     projects: ["allProjects"] },
  { name: "Vercel",    icon: "https://cdn.simpleicons.org/vercel/000000",           color: "#06b6d4", category: "CLOUD", key: "vercel",     projects: ["Portfolio", "WebKaizen"] },
  { name: "Netlify",   icon: "https://cdn.simpleicons.org/netlify/00C7B7",          color: "#00C7B7", category: "CLOUD", key: "netlify",    projects: ["Portfolio"] },
  { name: "Terminal",  icon: "https://cdn.simpleicons.org/gnometerminal/4EAA25",     color: "#4EAA25", category: "TOOL",  key: "terminal",   projects: ["allProjects"] }
];

interface NodePhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  x3d: number;
  y3d: number;
  z3d: number;
  gridX: number;
  gridY: number;
  isDragging: boolean;
  seed: number;
}

export default function TechGraph() {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<TechCategory | null>(null);
  const [selectedTech, setSelectedTech] = useState<TechNode>(techStack[4]); // React default
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("sphere");

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef<(HTMLDivElement | null)[]>([]);

  // Mouse coords for repulsion field
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // 3D rotation parameters
  const rotX = useRef(0.3);
  const rotY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0.004);
  const isDraggingBackground = useRef(false);
  const lastMX = useRef(0);
  const lastMY = useRef(0);
  const dragVX = useRef(0);
  const dragVY = useRef(0);
  const rafId = useRef<number | undefined>(undefined);

  // Responsive dimension state
  const [dimensions, setDimensions] = useState({ size: 420, radius: 160 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDimensions({ size: 300, radius: 100 });
      } else if (window.innerWidth < 1024) {
        setDimensions({ size: 360, radius: 130 });
      } else {
        setDimensions({ size: 420, radius: 160 });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Card dimensions
  const cardW = dimensions.size < 350 ? 54 : 72;
  const cardH = dimensions.size < 350 ? 54 : 72;

  // Initialize nodes physics state once
  const physicsStates = useRef<NodePhysicsState[]>(
    techStack.map(() => ({
      x: 210 - cardW / 2,
      y: 210 - cardH / 2,
      vx: 0,
      vy: 0,
      x3d: 0,
      y3d: 0,
      z3d: 0,
      gridX: 0,
      gridY: 0,
      isDragging: false,
      seed: Math.random() * 1000,
    }))
  );

  // Dynamic calculations for modes when parameters update
  useEffect(() => {
    const N = activeCategory
      ? techStack.filter((node) => node.category === activeCategory).length
      : techStack.length;

    // Recalculate Fibonacci coordinates for active nodes, scale radius based on N
    let activeIdx = 0;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    techStack.forEach((node, i) => {
      const state = physicsStates.current[i];
      const isActive = !activeCategory || node.category === activeCategory;

      if (isActive) {
        // Fibonacci coordinates calculation
        const y = N > 1 ? 1 - (activeIdx / (N - 1)) * 2 : 0;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * activeIdx;
        state.x3d = Math.cos(theta) * r;
        state.y3d = y;
        state.z3d = Math.sin(theta) * r;

        // Structured Grid coordinates calculation
        const cols = dimensions.size < 350 ? 3 : dimensions.size < 400 ? 4 : 5;
        const colW = dimensions.size < 350 ? 62 : 82;
        const rowH = dimensions.size < 350 ? 62 : 82;
        const gridW = cols * colW;
        const gridH = Math.ceil(N / cols) * rowH;
        const startX = (dimensions.size - gridW) / 2 + (colW - cardW) / 2;
        const startY = (dimensions.size - gridH) / 2 + (rowH - cardH) / 2;

        state.gridX = startX + (activeIdx % cols) * colW;
        state.gridY = startY + Math.floor(activeIdx / cols) * rowH;

        activeIdx++;
      } else {
        // Move inactive items to the center
        state.x3d = 0;
        state.y3d = 0;
        state.z3d = 0;
        state.gridX = dimensions.size / 2 - cardW / 2;
        state.gridY = dimensions.size / 2 - cardH / 2;
      }
    });
  }, [activeCategory, dimensions]);

  // Project 3D coordinate onto 2D viewport
  function project(pos: { x: number; y: number; z: number }, rx: number, ry: number) {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = pos.x * cosY - pos.z * sinY;
    const z1 = pos.x * sinY + pos.z * cosY;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y2 = pos.y * cosX - z1 * sinX;
    const z2 = pos.y * sinX + z1 * cosX;
    return { x: x1, y: y2, z: z2 };
  }

  // Ref bindings for frame callbacks
  const activeCategoryRef = useRef(activeCategory);
  const selectedTechRef = useRef(selectedTech);
  const hoveredKeyRef = useRef(hoveredKey);
  const dimsRef = useRef(dimensions);
  const modeRef = useRef(mode);

  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);
  useEffect(() => { selectedTechRef.current = selectedTech; }, [selectedTech]);
  useEffect(() => { hoveredKeyRef.current = hoveredKey; }, [hoveredKey]);
  useEffect(() => { dimsRef.current = dimensions; }, [dimensions]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Main physics & animation rendering loop
  useEffect(() => {
    let lastTime = performance.now();

    function render(timestamp: number) {
      const els = itemEls.current;
      const actCat = activeCategoryRef.current;
      const selTech = selectedTechRef.current;
      const hovKey = hoveredKeyRef.current;
      const currentMode = modeRef.current;
      const { size, radius } = dimsRef.current;
      const mouse = mouseRef.current;

      const center = size / 2;
      const N = actCat ? techStack.filter((node) => node.category === actCat).length : techStack.length;
      const cW = size < 350 ? 54 : 72;
      const cH = size < 350 ? 54 : 72;

      // Adjust radius based on active N
      const dynamicRadius = currentMode === "sphere" ? Math.min(radius, 80 + N * 5) : radius;

      // Update background rotation for Sphere mode
      if (!isDraggingBackground.current && currentMode === "sphere") {
        rotY.current += velY.current;
        rotX.current += velX.current;
        velX.current *= 0.96;
        velY.current = velY.current * 0.98 + 0.004 * 0.02;
      }

      techStack.forEach((node, i) => {
        const el = els[i];
        if (!el) return;

        const state = physicsStates.current[i];
        const isActive = actCat === null || node.category === actCat;
        const isSelected = selTech.key === node.key;
        const isHovered = hovKey === node.key;

        // Targets for smooth animation interpolation
        let targetX = state.x;
        let targetY = state.y;
        let targetScale = 1.0;
        let targetOpacity = 1.0;
        let zIndex = 10 + i;

        if (!isActive) {
          // Fade and move inactive items to the center
          targetX = center - cW / 2;
          targetY = center - cH / 2;
          targetScale = 0;
          targetOpacity = 0;
          zIndex = 0;

          state.x += (targetX - state.x) * 0.15;
          state.y += (targetY - state.y) * 0.15;
        } else {
          if (currentMode === "sphere") {
            // Project active nodes on 3D sphere
            const p = project({ x: state.x3d, y: state.y3d, z: state.z3d }, rotX.current, rotY.current);
            targetX = p.x * dynamicRadius + center - cW / 2;
            targetY = p.y * dynamicRadius + center - cH / 2;

            const depth = (p.z + 1) / 2;
            targetScale = 0.55 + depth * 0.55;
            targetOpacity = 0.25 + depth * 0.75;
            zIndex = Math.round(depth * 100);

            if (isSelected) {
              targetScale *= 1.25;
              zIndex = 999;
            } else if (isHovered) {
              targetScale *= 1.15;
              zIndex = 990;
            }

            state.x += (targetX - state.x) * 0.1;
            state.y += (targetY - state.y) * 0.1;
            state.vx = 0;
            state.vy = 0;

          } else if (currentMode === "grid") {
            // Spring align into neat grid positions
            targetX = state.gridX;
            targetY = state.gridY;
            targetScale = 1.0;
            targetOpacity = 1.0;

            if (isSelected) {
              targetScale = 1.2;
              zIndex = 999;
            } else if (isHovered) {
              targetScale = 1.1;
              zIndex = 990;
            }

            state.x += (targetX - state.x) * 0.15;
            state.y += (targetY - state.y) * 0.15;
            state.vx = 0;
            state.vy = 0;

          } else if (currentMode === "space") {
            // Zero-G Physics Engine
            targetOpacity = 1.0;
            targetScale = 1.0;

            if (isSelected) {
              targetScale = 1.25;
              zIndex = 999;
            } else if (isHovered) {
              targetScale = 1.15;
              zIndex = 990;
            }

            if (state.isDragging) {
              // Position is set directly via drag mouse move handlers, velocity updated relative to cursor
            } else {
              // Apply velocity
              state.x += state.vx;
              state.y += state.vy;

              // Apply low friction damping ( frictionless outer-space feel)
              state.vx *= 0.985;
              state.vy *= 0.985;

              // Sinusoidal space drift simulation
              const tVal = timestamp * 0.001;
              state.x += Math.sin(tVal + state.seed) * 0.12;
              state.y += Math.cos(tVal * 1.1 + state.seed) * 0.12;

              // Mouse Repulsion Field (Anti-gravity field)
              if (mouse.active) {
                const dx = (state.x + cW / 2) - mouse.x;
                const dy = (state.y + cH / 2) - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150 && distance > 1) {
                  const force = (1 - distance / 150) * 0.45;
                  state.vx += (dx / distance) * force;
                  state.vy += (dy / distance) * force;
                }
              }

              // Boundary Collisions with elastic energy loss bouncing
              const bounce = -0.85;
              if (state.x < 0) {
                state.x = 0;
                state.vx *= bounce;
              } else if (state.x > size - cW) {
                state.x = size - cW;
                state.vx *= bounce;
              }

              if (state.y < 0) {
                state.y = 0;
                state.vy *= bounce;
              } else if (state.y > size - cH) {
                state.y = size - cH;
                state.vy *= bounce;
              }
            }
          }
        }

        // Write directly to GPU-accelerated translate3d style transform properties
        el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0px) scale(${targetScale})`;
        el.style.opacity = `${targetOpacity}`;
        el.style.zIndex = `${zIndex}`;
        el.style.pointerEvents = isActive ? "auto" : "none";
      });

      lastTime = timestamp;
      rafId.current = requestAnimationFrame(render);
    }

    rafId.current = requestAnimationFrame(render);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  // Background drag to rotate 3D sphere
  const onMouseDownBg = (e: React.MouseEvent) => {
    if (mode !== "sphere") return;
    if ((e.target as HTMLElement).closest(".tech-card-inner")) return; // skip card clicks
    isDraggingBackground.current = true;
    lastMX.current = e.clientX;
    lastMY.current = e.clientY;
    dragVX.current = 0;
    dragVY.current = 0;
  };

  const onTouchStartBg = (e: React.TouchEvent) => {
    if (mode !== "sphere") return;
    if ((e.target as HTMLElement).closest(".tech-card-inner")) return;
    isDraggingBackground.current = true;
    lastMX.current = e.touches[0].clientX;
    lastMY.current = e.touches[0].clientY;
    dragVX.current = 0;
    dragVY.current = 0;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Background rotation drag move
      if (isDraggingBackground.current && modeRef.current === "sphere") {
        const dx = e.clientX - lastMX.current;
        const dy = e.clientY - lastMY.current;
        dragVX.current = dy * 0.005;
        dragVY.current = dx * 0.005;
        rotX.current += dragVX.current;
        rotY.current += dragVY.current;
        lastMX.current = e.clientX;
        lastMY.current = e.clientY;
      }
    };

    const onMouseUp = () => {
      if (isDraggingBackground.current) {
        velX.current = dragVX.current;
        velY.current = dragVY.current || 0.004;
        isDraggingBackground.current = false;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const onTouchMoveBg = (e: React.TouchEvent) => {
    if (!isDraggingBackground.current || modeRef.current !== "sphere") return;
    const dx = e.touches[0].clientX - lastMX.current;
    const dy = e.touches[0].clientY - lastMY.current;
    dragVX.current = dy * 0.005;
    dragVY.current = dx * 0.005;
    rotX.current += dragVX.current;
    rotY.current += dragVY.current;
    lastMX.current = e.touches[0].clientX;
    lastMY.current = e.touches[0].clientY;
  };

  const onTouchEndBg = () => {
    if (isDraggingBackground.current) {
      velX.current = dragVX.current;
      velY.current = dragVY.current || 0.004;
      isDraggingBackground.current = false;
    }
  };

  // Mouse repulsion field coordinates update
  const handleMouseMoveContainer = (e: React.MouseEvent) => {
    if (mode !== "space") return;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }
  };

  const handleMouseLeaveContainer = () => {
    mouseRef.current.active = false;
    setHoveredKey(null);
  };

  // Node Dragging pointer capture handlers (Drag & Toss in Space Mode)
  const dragInfo = useRef<{ index: number; pointerId: number; lastX: number; lastY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if (mode !== "space") return;
    e.stopPropagation();
    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);

    const state = physicsStates.current[idx];
    state.isDragging = true;
    dragInfo.current = {
      index: idx,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent, idx: number) => {
    if (mode !== "space" || !dragInfo.current || dragInfo.current.index !== idx) return;
    e.stopPropagation();

    const state = physicsStates.current[idx];
    const dx = e.clientX - dragInfo.current.lastX;
    const dy = e.clientY - dragInfo.current.lastY;

    state.x += dx;
    state.y += dy;

    // Track frame velocity for toss physics
    state.vx = dx;
    state.vy = dy;

    dragInfo.current.lastX = e.clientX;
    dragInfo.current.lastY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent, idx: number) => {
    if (mode !== "space" || !dragInfo.current || dragInfo.current.index !== idx) return;
    e.stopPropagation();
    const el = e.currentTarget as HTMLDivElement;
    el.releasePointerCapture(e.pointerId);

    const state = physicsStates.current[idx];
    state.isDragging = false;
    dragInfo.current = null;
  };

  const handleCategoryChange = (cat: TechCategory | null) => {
    setActiveCategory(cat);
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
    <div className="space-y-8 select-none">
      {/* Dynamic Header Badge Decoration */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--lg-text-tertiary)]/20" />
        <span className="text-[10px] tracking-[0.3em] font-mono text-[var(--lg-text-tertiary)] uppercase whitespace-nowrap">
          {t("techGraph.subtitle", { count: techStack.length })}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--lg-text-tertiary)]/20" />
      </div>

      {/* 3-Way Mode Switcher */}
      <div className="flex justify-center">
        <div className="glass-panel p-1 flex gap-1 rounded-full relative z-30">
          {(["sphere", "space", "grid"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                mode === m
                  ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-md shadow-indigo-500/20"
                  : "text-[var(--lg-text-secondary)] hover:text-white hover:bg-white/10"
              }`}
            >
              {t(`techGraph.modes.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filters */}
          <div className="glass-panel p-5 relative z-25">
            <p className="text-xs text-[var(--lg-text-tertiary)] uppercase tracking-wider font-medium mb-3">
              {t("techGraph.categories")}
            </p>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-none snap-x snap-mandatory -mx-2 px-2 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-3.5 py-2.5 sm:py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer min-h-[40px] sm:min-h-0 flex items-center justify-center snap-start ${
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
                  className={`px-3.5 py-2.5 sm:py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-0 flex items-center justify-center snap-start ${
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

          {/* Selected Node Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTech.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel-strong p-6 relative overflow-hidden group min-h-[220px] flex flex-col justify-center"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                style={{ backgroundColor: selectedTech.color }}
              />

              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/40 border border-[var(--lg-glass-border-subtle)] p-2 shadow-inner transition-transform duration-300 group-hover:scale-110"
                  style={{ boxShadow: `0 0 20px -5px ${selectedTech.color}33` }}
                >
                  <img src={selectedTech.icon} alt={selectedTech.name} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--lg-text-tertiary)] font-mono block">
                    {t("techGraph.whenLabel")}
                  </span>
                  <h3 className="text-2xl font-black text-[var(--lg-text-primary)] tracking-wide">{selectedTech.name}</h3>
                </div>
              </div>

              <p className="text-[var(--lg-text-secondary)] text-sm leading-relaxed mb-4">
                {t(`techGraph.nodes.${selectedTech.key}.description`)}
              </p>

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
        </div>

        {/* Right Canvas Area */}
        <div className="lg:col-span-3 flex flex-col items-center w-full">
          <div
            ref={containerRef}
            className={`glass-panel relative w-full flex items-center justify-center overflow-hidden select-none ${
              mode === "sphere" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
            style={{ height: "460px" }}
            onMouseDown={onMouseDownBg}
            onTouchStart={onTouchStartBg}
            onTouchMove={onTouchMoveBg}
            onTouchEnd={onTouchEndBg}
            onMouseMove={handleMouseMoveContainer}
            onMouseLeave={handleMouseLeaveContainer}
          >
            {/* Background ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)",
              }}
            />

            {/* Simulated physics boundary box */}
            <div
              ref={sceneRef}
              className="relative"
              style={{
                width: `${dimensions.size}px`,
                height: `${dimensions.size}px`,
              }}
            >
              {techStack.map((tech, i) => {
                const isSelected = selectedTech.key === tech.key;
                const isHovered = hoveredKey === tech.key;

                return (
                  <div
                    key={tech.key}
                    ref={(el) => { itemEls.current[i] = el; }}
                    onPointerDown={(e) => handlePointerDown(e, i)}
                    onPointerMove={(e) => handlePointerMove(e, i)}
                    onPointerUp={(e) => handlePointerUp(e, i)}
                    style={{
                      position: "absolute",
                      width: `${cardW}px`,
                      height: `${cardH}px`,
                      transformStyle: "preserve-3d",
                      willChange: "transform, opacity",
                      touchAction: "none",
                    }}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTech(tech);
                      }}
                      onMouseEnter={() => setHoveredKey(tech.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      className="tech-card-inner w-full h-full rounded-[18px] flex flex-col items-center justify-center gap-[5px] transition-all duration-300 hover:scale-125 cursor-pointer select-none"
                      style={{
                        border: (isSelected || isHovered)
                          ? `1.5px solid ${tech.color}`
                          : "1px solid var(--lg-glass-border-subtle)",
                        background: isSelected
                          ? "rgba(99, 102, 241, 0.22)"
                          : isHovered
                          ? "rgba(20, 24, 58, 0.75)"
                          : "rgba(20, 24, 58, 0.45)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: (isSelected || isHovered)
                          ? `0 0 25px 0 ${tech.color}55`
                          : `0 4px 16px rgba(31, 38, 135, 0.05)`,
                      }}
                    >
                      <img
                        src={tech.icon}
                        alt={tech.name}
                        loading="lazy"
                        draggable="false"
                        style={{ width: "30px", height: "30px", objectFit: "contain", pointerEvents: "none" }}
                      />
                      <span
                        className="select-none pointer-events-none"
                        style={{
                          fontSize: "9px",
                          color: isSelected ? "var(--lg-text-primary)" : "var(--lg-text-secondary)",
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
          </div>
        </div>
      </div>
    </div>
  );
}
