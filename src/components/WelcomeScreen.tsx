import { motion } from "framer-motion";
import { Code2, User, Globe } from "lucide-react";
import { useEffect } from "react";

export default function WelcomeScreen() {
  const icons = [Code2, User, Globe];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.05,
        transition: {
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden p-5"
      style={{
        background:
          "linear-gradient(135deg, var(--lg-bg-start) 0%, var(--lg-bg-mid) 50%, var(--lg-bg-end) 100%)",
      }}
    >
      {/* Background Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[-150px] right-[-80px] w-[300px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative text-center flex flex-col items-center gap-5 w-full max-w-[340px]"
      >
        {/* Icons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
          className="flex gap-4 items-center justify-center"
        >
          {icons.map((Icon, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.3,
                  rotate: -140,
                  y: 60,
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  y: 0,
                },
              }}
              transition={{
                duration: 1.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.08 }}
              className="glass-panel w-[48px] h-[48px] !rounded-full flex items-center justify-center"
            >
              <Icon size={20} className="text-[var(--lg-accent-start)]" />
            </motion.div>
          ))}
        </motion.div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <motion.span
              initial={{ opacity: 0, x: 120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 1,
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[clamp(22px,5vw,34px)] font-black tracking-tight text-[var(--lg-text-primary)]"
            >
              Welcome
            </motion.span>

            <motion.span
              initial={{ opacity: 0, x: -120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 1.2,
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[clamp(22px,5vw,34px)] font-black tracking-tight text-[var(--lg-text-primary)]"
            >
              to my
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1.4,
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-[clamp(24px,6vw,38px)] font-black tracking-tight leading-tight text-center"
            style={{
              background: "linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Portfolio Website
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{
            delay: 1.8,
            duration: 1,
          }}
          className="text-sm text-[var(--lg-text-secondary)] tracking-wide"
        >
          Creating Websites That Feel Alive.
        </motion.p>

        {/* Website Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 2,
            duration: 0.5,
          }}
          className="glass-panel !rounded-full px-4 py-2 text-xs tracking-[0.25em] text-[var(--lg-text-secondary)] overflow-hidden"
        >
          <motion.span
            initial={{ width: "0ch" }}
            animate={{ width: "18ch" }}
            transition={{
              delay: 2.2,
              duration: 2,
              ease: "easeInOut",
            }}
            className="inline-block overflow-hidden whitespace-nowrap"
          >
            sagdullayev.uz
          </motion.span>

          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
            className="ml-[2px] text-[var(--lg-accent-start)]"
          >
            |
          </motion.span>
        </motion.div>

        {/* Bottom Loading Line */}
        <div className="mt-10 w-[240px] h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(99,102,241,0.15)" }}>
          <motion.div
            initial={{ width: "10%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 6.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, var(--lg-accent-start), var(--lg-accent-end))",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}