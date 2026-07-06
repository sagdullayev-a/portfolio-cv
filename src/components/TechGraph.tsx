import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   DATA  (non-translatable parts only — descriptions come from i18n)
   ═══════════════════════════════════════════════════════════════ */

type TechCategory = "FE" | "BE" | "TOOL" | "CLOUD" | "AI" | "DX";

interface TechNodeBase {
  name: string;
  icon: string;
  color: string;
  category: TechCategory;
  /** i18n key suffix, e.g. "react", "nextjs", "threejs" */
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

const techNodesBase: TechNodeBase[] = [
  { name: "React",      icon: "https://cdn.simpleicons.org/react/61DAFB",           color: "#61DAFB", category: "FE",    key: "react",      projects: ["Portfolio", "WebKaizen"] },
  { name: "Next.js",   icon: "https://cdn.simpleicons.org/nextdotjs/1A1D29",        color: "#6366f1", category: "FE",    key: "nextjs",     projects: ["WebKaizen"] },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6",      color: "#3178C6", category: "FE",    key: "typescript", projects: ["Portfolio", "WebKaizen"] },
  { name: "Tailwind",  icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4",      color: "#06B6D4", category: "FE",    key: "tailwind",   projects: ["Portfolio", "WebKaizen"] },
  { name: "HTML5",     icon: "https://cdn.simpleicons.org/html5/E34F26",            color: "#E34F26", category: "FE",    key: "html5",      projects: ["allProjects"] },
  { name: "CSS3",      icon: "https://cdn.simpleicons.org/css/1572B6",              color: "#1572B6", category: "FE",    key: "css3",       projects: ["Portfolio"] },
  { name: "JavaScript",icon: "https://cdn.simpleicons.org/javascript/F7DF1E",       color: "#F7DF1E", category: "FE",    key: "javascript", projects: ["allProjects"] },
  { name: "Node.js",   icon: "https://cdn.simpleicons.org/nodedotjs/339933",        color: "#339933", category: "BE",    key: "nodejs",     projects: ["WebKaizen"] },
  { name: "Python",    icon: "https://cdn.simpleicons.org/python/3776AB",           color: "#3776AB", category: "AI",    key: "python",     projects: ["aiExperiments"] },
  { name: "Firebase",  icon: "https://cdn.simpleicons.org/firebase/FFCA28",         color: "#FFCA28", category: "CLOUD", key: "firebase",   projects: ["WebKaizen"] },
  { name: "Git",       icon: "https://cdn.simpleicons.org/git/F05032",              color: "#F05032", category: "TOOL",  key: "git",        projects: ["allProjects"] },
  { name: "GitHub",    icon: "https://cdn.simpleicons.org/github/1A1D29",           color: "#8b5cf6", category: "TOOL",  key: "github",     projects: ["allProjects"] },
  { name: "Vercel",    icon: "https://cdn.simpleicons.org/vercel/1A1D29",           color: "#06b6d4", category: "CLOUD", key: "vercel",     projects: ["Portfolio", "WebKaizen"] },
  { name: "Three.js",  icon: "https://cdn.simpleicons.org/threedotjs/1A1D29",       color: "#ec4899", category: "DX",    key: "threejs",    projects: ["Portfolio"] },
  { name: "Framer",    icon: "https://cdn.simpleicons.org/framer/1A1D29",           color: "#6366f1", category: "DX",    key: "framer",     projects: ["Portfolio"] },
];

/* ═══════════════════════════════════════════════════════════════
   GLOBE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const GLOBE_RADIUS = 2.5;

function fibonacciSphere(samples: number, radius: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    out.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]);
  }
  return out;
}

function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const c = Math.max(inMin, Math.min(inMax, v));
  return outMin + ((c - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/* ═══════════════════════════════════════════════════════════════
   GLOBE SCENE (must be inside Canvas)
   ═══════════════════════════════════════════════════════════════ */

interface GlobeSceneProps {
  nodes: TechNodeBase[];
  activeCategory: TechCategory | null;
  selectedKey: string | null;
  hoveredKey: string | null;
  onSelect: (node: TechNodeBase) => void;
  onHover: (key: string | null) => void;
}

function GlobeScene({ nodes, activeCategory, selectedKey, hoveredKey, onSelect, onHover }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isUserDragging = useRef(false);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>(nodes.map(() => null));
  const htmlRefs = useRef<(HTMLDivElement | null)[]>(nodes.map(() => null));
  const currentScales = useRef<number[]>(nodes.map(() => 0.75));
  const currentOpacities = useRef<number[]>(nodes.map(() => 0.75));

  const activeCategoryRef = useRef(activeCategory);
  const selectedKeyRef = useRef(selectedKey);
  const hoveredKeyRef = useRef(hoveredKey);
  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);
  useEffect(() => { selectedKeyRef.current = selectedKey; }, [selectedKey]);
  useEffect(() => { hoveredKeyRef.current = hoveredKey; }, [hoveredKey]);

  const positions = useMemo(() => fibonacciSphere(nodes.length, GLOBE_RADIUS), [nodes.length]);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    if (groupRef.current && !isUserDragging.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    const camLen = camera.position.length();
    if (camLen === 0) return;

    nodes.forEach((node, i) => {
      const mesh = nodeRefs.current[i];
      const htmlDiv = htmlRefs.current[i];
      if (!mesh) return;

      mesh.getWorldPosition(tmpVec);
      const dot =
        (tmpVec.x * camera.position.x + tmpVec.y * camera.position.y + tmpVec.z * camera.position.z) /
        (GLOBE_RADIUS * camLen);
      const depthFactor = (dot + 1) / 2;

      const isActive = !activeCategoryRef.current || node.category === activeCategoryRef.current;
      const isSelected = selectedKeyRef.current === node.key;
      const isHovered = hoveredKeyRef.current === node.key;

      const baseScale = isActive ? mapRange(depthFactor, 0, 1, 0.45, 1.05) : 0.01;
      const targetScale = baseScale * (isSelected ? 1.55 : isHovered ? 1.28 : 1.0);
      const targetOpacity = isActive ? mapRange(depthFactor, 0, 1, 0.14, 1.0) : 0;

      currentScales.current[i] += (targetScale - currentScales.current[i]) * 0.1;
      currentOpacities.current[i] += (targetOpacity - currentOpacities.current[i]) * 0.08;

      const finalScale = Math.max(0.001, currentScales.current[i]);
      const finalOpacity = Math.max(0, Math.min(1, currentOpacities.current[i]));

      mesh.scale.setScalar(finalScale);
      (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        isSelected ? 0.65 : isHovered ? 0.45 : mapRange(depthFactor, 0, 1, 0.05, 0.28);

      if (htmlDiv) {
        htmlDiv.style.opacity = finalOpacity.toString();
        htmlDiv.style.pointerEvents = finalOpacity < 0.18 ? "none" : "auto";
      }
    });
  });

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.35} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        onStart={() => { isUserDragging.current = true; }}
        onEnd={() => { isUserDragging.current = false; }}
      />
      <group ref={groupRef}>
        {/* Wireframe globe */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 32, 24]} />
          <meshBasicMaterial wireframe color="#6366f1" transparent opacity={0.045} />
        </mesh>

        {/* Tech nodes */}
        {nodes.map((node, i) => (
          <group key={node.key} position={positions[i]}>
            <mesh
              ref={(el) => { nodeRefs.current[i] = el; }}
              onClick={(e) => { e.stopPropagation(); onSelect(node); }}
              onPointerOver={(e) => { e.stopPropagation(); onHover(node.key); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { onHover(null); document.body.style.cursor = "default"; }}
            >
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.22} roughness={0.3} metalness={0.1} />
            </mesh>
            <Html center zIndexRange={[1, 50]}>
              <div
                ref={(el) => { htmlRefs.current[i] = el; }}
                style={{ pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", userSelect: "none" }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1.5px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <img src={node.icon} alt={node.name} style={{ width: 16, height: 16, objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: "8px", fontWeight: 600, color: "#374151", fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap", background: "rgba(255,255,255,0.75)", padding: "1px 5px", borderRadius: "8px", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
                  {node.name}
                </span>
              </div>
            </Html>
          </group>
        ))}
      </group>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TECH GRAPH EXPORT
   ═══════════════════════════════════════════════════════════════ */

export default function TechGraph() {
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<TechCategory | null>(null);
  const [selectedNode, setSelectedNode] = useState<TechNodeBase | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const handleCategoryChange = (cat: TechCategory | null) => {
    setActiveCategory(cat);
    setSelectedNode(null);
  };

  // Translate a project key (e.g. "allProjects", "aiExperiments") or return as-is
  const tp = (p: string) => {
    if (p === "allProjects" || p === "aiExperiments") return t(`techGraph.${p}`);
    return p;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-3xl md:text-4xl font-black tracking-tight mb-3"
          style={{ background: "linear-gradient(135deg, var(--lg-text-primary), var(--lg-text-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  activeCategory === null
                    ? "bg-gradient-to-r from-[var(--lg-accent-start)] to-[var(--lg-accent-end)] text-white shadow-md"
                    : "glass-card text-[var(--lg-text-secondary)]"
                }`}
              >
                {t("techGraph.all")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    activeCategory === cat.id ? "text-white shadow-md" : "glass-card text-[var(--lg-text-secondary)]"
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
                transition={{ duration: 0.3 }}
                className="glass-panel-strong p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={selectedNode.icon} alt={selectedNode.name} className="w-10 h-10 object-contain" />
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

        {/* Right: Globe Canvas */}
        <div className="lg:col-span-3 glass-panel overflow-hidden flex items-center justify-center min-h-[440px] select-none">
          <Canvas camera={{ position: [0, 0, 7], fov: 48 }} style={{ width: "100%", height: "440px" }} gl={{ antialias: true, alpha: true }}>
            <GlobeScene
              nodes={techNodesBase}
              activeCategory={activeCategory}
              selectedKey={selectedNode?.key ?? null}
              hoveredKey={hoveredKey}
              onSelect={(node) => setSelectedNode(node)}
              onHover={setHoveredKey}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
