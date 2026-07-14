import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function SceneBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkPerformanceMode = () => {
      setIsMobile(window.innerWidth < 768);
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };

    checkPerformanceMode();
    window.addEventListener("resize", checkPerformanceMode);
    return () => window.removeEventListener("resize", checkPerformanceMode);
  }, []);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001
  });


  // Blob 1: Top-Left Indigo/Violet Orb
  const blob1Y = useTransform(smoothScroll, [0, 0.85], [0, 600]);
  const blob1X = useTransform(smoothScroll, [0, 0.85], [0, 200]);
  const blob1Scale = useTransform(smoothScroll, [0, 0.45, 0.85], [1, 1.25, 0.9]);

  // Blob 2: Mid-Right Purple/Pink Orb
  const blob2Y = useTransform(smoothScroll, [0, 0.85], [0, -450]);
  const blob2X = useTransform(smoothScroll, [0, 0.85], [0, -180]);
  const blob2Scale = useTransform(smoothScroll, [0, 0.45, 0.85], [1, 0.8, 1.2]);

  // Blob 3: Bottom-Left Blue/Cyan Orb
  const blob3Y = useTransform(smoothScroll, [0, 0.85], [0, 350]);
  const blob3X = useTransform(smoothScroll, [0, 0.85], [0, -100]);
  const blob3Scale = useTransform(smoothScroll, [0, 0.85], [1, 1.22]);

  // Check if we should run heavy Framer Motion scroll parallax animations
  const shouldAnimate = !isMobile && !reducedMotion;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020412] select-none">
      {/* Core Background Mesh Gradient */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle at 50% -20%, rgba(20, 24, 68, 0.85) 0%, rgba(11, 14, 42, 1) 100%)",
        }}
      />

      {/* Blob 1 */}
      <motion.div
        style={{
          y: shouldAnimate ? blob1Y : undefined,
          x: shouldAnimate ? blob1X : undefined,
          scale: shouldAnimate ? blob1Scale : undefined,
          background: "linear-gradient(135deg, #6366f1, #a5b4fc)",
          willChange: shouldAnimate ? "transform" : "auto",
        }}
        className={`absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.22] pointer-events-none filter blur-[100px] ${
          isMobile && !reducedMotion ? "animate-[blobFloat1_24s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Blob 2 */}
      <motion.div
        style={{
          y: shouldAnimate ? blob2Y : undefined,
          x: shouldAnimate ? blob2X : undefined,
          scale: shouldAnimate ? blob2Scale : undefined,
          background: "linear-gradient(135deg, #8b5cf6, #c4b5fd)",
          willChange: shouldAnimate ? "transform" : "auto",
        }}
        className={`absolute top-[35%] -right-[10%] w-[450px] h-[450px] rounded-full opacity-[0.18] pointer-events-none filter blur-[100px] ${
          isMobile && !reducedMotion ? "animate-[blobFloat2_28s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Blob 3 */}
      <motion.div
        style={{
          y: shouldAnimate ? blob3Y : undefined,
          x: shouldAnimate ? blob3X : undefined,
          scale: shouldAnimate ? blob3Scale : undefined,
          background: "linear-gradient(135deg, #3b82f6, #93c5fd)",
          willChange: shouldAnimate ? "transform" : "auto",
        }}
        className={`absolute -bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-[0.15] pointer-events-none filter blur-[90px] ${
          isMobile && !reducedMotion ? "animate-[blobFloat3_22s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Film Grain Texture Overlay (SVG fractalNoise) */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="grainFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.85 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainFilter)" />
        </svg>
      </div>

      {/* Twinkling Star Sparkles for depth */}
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
