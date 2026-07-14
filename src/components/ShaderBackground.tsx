import React, { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScroll } from "framer-motion";

// Custom shader material implementation
const ShaderBackgroundInner = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, gl } = useThree();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contextLost, setContextLost] = useState(false);

  // Get scroll progress from framer-motion useScroll
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const canvasEl = gl.domElement;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("ShaderBackground WebGL context lost.");
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("ShaderBackground WebGL context restored.");
      setContextLost(false);
    };

    canvasEl.addEventListener("webglcontextlost", handleContextLost);
    canvasEl.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      canvasEl.removeEventListener("webglcontextlost", handleContextLost);
      canvasEl.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, [gl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_scrollProgress: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) }
  }), []);

  // Update resolution on size change
  useEffect(() => {
    uniforms.u_resolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  // Update uniforms in animation frame
  useFrame((state) => {
    const clock = state.clock;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // u_time updates (freeze if reducedMotion)
    if (!reducedMotion) {
      uniforms.u_time.value = clock.getElapsedTime();
    } else {
      uniforms.u_time.value = 0;
    }

    // u_scrollProgress updates
    uniforms.u_scrollProgress.value = scrollYProgress.get();

    // u_mouse interpolation (spring behavior for smooth reaction)
    uniforms.u_mouse.value.x += (mousePos.x - uniforms.u_mouse.value.x) * 0.05;
    uniforms.u_mouse.value.y += (mousePos.y - uniforms.u_mouse.value.y) * 0.05;
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float u_time;
    uniform float u_scrollProgress;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    varying vec2 vUv;

    // GLSL coordinate distortion / domain warping
    vec2 distort(vec2 p, float t) {
      p.x += 0.45 * sin(p.y * 3.0 + t * 0.45 + u_scrollProgress * 2.0);
      p.y += 0.35 * cos(p.x * 2.5 - t * 0.35 + u_scrollProgress * 1.5);
      p.x += 0.25 * sin(p.y * 4.5 - t * 0.65 + u_mouse.x * 1.2);
      p.y += 0.20 * cos(p.x * 5.0 + t * 0.55 + u_mouse.y * 1.2);
      return p;
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = uv - 0.5;
      p.x *= u_resolution.x / u_resolution.y;

      float t = u_time * 0.12;
      vec2 distortedP = distort(p, t);
      float noise = 0.5 + 0.5 * sin(length(distortedP) * 4.0 - t * 1.5);

      // Liquid plasma color palettes mapping to indigo-violet brand accent
      vec3 color1 = vec3(0.02, 0.03, 0.08); // Deep Space Blue (#050714)
      vec3 color2 = vec3(0.388, 0.400, 0.945); // Indigo (#6366F1)
      vec3 color3 = vec3(0.545, 0.361, 0.965); // Violet (#8B5CF6)
      vec3 color4 = vec3(0.15, 0.35, 0.85); // Blue Accent (#2659D9)

      vec3 baseColor = mix(color1, color2, noise * 0.85);
      baseColor = mix(baseColor, color3, (0.5 + 0.5 * cos(distortedP.x * 2.0 + t)) * 0.7);
      baseColor = mix(baseColor, color4, (0.3 + 0.3 * sin(distortedP.y * 1.5 - t * 0.8)) * 0.6);

      // Vignette filter for border depth
      float distFromCenter = length(uv - 0.5);
      float vignette = smoothstep(0.85, 0.35, distFromCenter);
      vec3 finalColor = baseColor * mix(0.4, 1.0, vignette);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  if (contextLost) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default function ShaderBackground() {
  // 1. Detect WebGL support synchronously on initial render
  const [webglSupported, setWebglSupported] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch {
      return false;
    }
  });

  // 2. Detect mobile viewport or low threads synchronously on initial render
  const [isLowPower, setIsLowPower] = useState(() => {
    if (typeof window === "undefined") return false;
    const isMobile = window.innerWidth < 768;
    const lowThreads = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4;
    return isMobile || lowThreads;
  });

  // 3. Detect prefers-reduced-motion synchronously on initial render
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Keep listeners active to dynamically adapt on resize or settings changes
  useEffect(() => {
    const checkLowPower = () => {
      const isMobile = window.innerWidth < 768;
      const lowThreads = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4;
      setIsLowPower(isMobile || lowThreads);
    };
    window.addEventListener("resize", checkLowPower);
    return () => window.removeEventListener("resize", checkLowPower);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Render Fallback Background if WebGL unsupported, Mobile, Low-Power, or Reduced Motion active
  const useFallback = !webglSupported || isLowPower || reducedMotion;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020412] select-none">
      {useFallback ? (
        // --- CSS FALLBACK BACKGROUND (Vibrant aurora matching WebGL scheme) ---
        <div className="absolute inset-0">
          {/* Base space gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% -20%, rgba(20, 24, 68, 0.85) 0%, rgba(11, 14, 42, 1) 100%)",
            }}
          />

          {/* Floating Vibrant Blobs (Frozen if reduced motion) */}
          <div
            className={`absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.25] filter blur-[120px] ${
              !reducedMotion ? "animate-[blobFloat1_20s_ease-in-out_infinite]" : ""
            }`}
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          />

          <div
            className={`absolute top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.20] filter blur-[110px] ${
              !reducedMotion ? "animate-[blobFloat2_25s_ease-in-out_infinite]" : ""
            }`}
            style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)" }}
          />

          <div
            className={`absolute -bottom-[10%] left-[10%] w-[450px] h-[450px] rounded-full opacity-[0.18] filter blur-[100px] ${
              !reducedMotion ? "animate-[blobFloat3_22s_ease-in-out_infinite]" : ""
            }`}
            style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}
          />
        </div>
      ) : (
        // --- WebGL SHADER CANVAS ---
        <Canvas
          gl={{
            alpha: false,
            antialias: false,
            powerPreference: "high-performance",
            depth: false,
            stencil: false,
          }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1] }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Suspense fallback={null}>
            <ShaderBackgroundInner />
          </Suspense>
        </Canvas>
      )}

      {/* --- OVERLAY LAYERS (Shared across WebGL and CSS Fallbacks) --- */}
      {/* 1. SVG Film Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="grainFilterShader">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.85 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainFilterShader)" />
        </svg>
      </div>

      {/* 2. Twinkling Star sparkles overlay (Disabled if reducedMotion) */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none z-5 opacity-60">
          <div className="absolute top-[15%] left-[12%] w-[2px] h-[2px] bg-white rounded-full animate-pulse [animation-duration:3s]" />
          <div className="absolute top-[40%] left-[8%] w-[2px] h-[2px] bg-blue-200 rounded-full opacity-40" />
          <div className="absolute top-[75%] left-[25%] w-[1.5px] h-[1.5px] bg-white rounded-full opacity-50 animate-pulse [animation-duration:4s]" />
          <div className="absolute top-[25%] right-[18%] w-[2px] h-[2px] bg-purple-200 rounded-full opacity-70 animate-pulse [animation-duration:5s]" />
          <div className="absolute top-[60%] right-[8%] w-[2px] h-[2px] bg-white rounded-full opacity-35" />
        </div>
      )}
    </div>
  );
}
