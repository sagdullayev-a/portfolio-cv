import { useState } from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaInstagram, FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function ContactSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    message: "",
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSend = () => {
    if (!form.name || !form.message) return;
    const text = `Hello, my name is ${form.name}%0A%0A${form.message}`;
    const phone = "998994746484";
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <section
      className="relative w-full overflow-hidden
      px-4 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24"
    >
      {/* background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-220px] right-[-120px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* heading */}
        <div className="text-center space-y-5 mb-16">
          {/* label */}
          <div className="relative flex items-center justify-center gap-4 opacity-0 animate-[fadeSlideDown_0.8s_ease_forwards]">
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
              {t("contact.label")}
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

          {/* title */}
          <div className="relative overflow-hidden">
            <h1
              className="font-black tracking-tight leading-none opacity-0 animate-[headingReveal_1s_cubic-bezier(0.22,1,0.36,1)_0.15s_forwards]"
              style={{ fontSize: "clamp(42px,7vw,92px)" }}
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
                {t("contact.title")}
              </span>
            </h1>
          </div>
        </div>

        {/* layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* left side */}
          <div
            className="flex flex-col items-center lg:items-start
              text-center lg:text-left
              justify-center gap-8 opacity-0
              animate-[fadeSlideUp_0.8s_ease_0.35s_forwards]"
          >
            <div className="space-y-4">
              <p className="text-sm sm:text-base lg:text-xl leading-relaxed max-w-md font-[Poppins] font-medium tracking-wide text-[var(--lg-text-secondary)]">
                {t("contact.description")}
              </p>
            </div>

            {/* social icons */}
            <div className="flex items-center justify-center lg:justify-start gap-5 mt-2">
              {/* gmail */}
              <a
                href="mailto:azizhon.sagdullayev@gmail.com"
                className="group glass-card !rounded-2xl w-12 h-12 sm:w-14 sm:h-14
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110
                  hover:!shadow-[0_8px_30px_rgba(99,102,241,0.15)]"
              >
                <FaEnvelope className="text-[var(--lg-text-secondary)] group-hover:text-[var(--lg-accent-start)] text-[18px] sm:text-[20px] transition-all duration-300" />
              </a>

              {/* whatsapp */}
              <a
                href="https://wa.me/998994746484"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative glass-card !rounded-2xl w-12 h-12 sm:w-14 sm:h-14
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110
                  hover:!shadow-[0_8px_30px_rgba(34,197,94,0.2)]"
              >
                <FaWhatsapp className="text-[var(--lg-text-secondary)] group-hover:text-green-500 text-[20px] sm:text-[24px] transition-all duration-300" />
              </a>
            </div>
          </div>

          {/* contact card */}
          <div
            className="relative rounded-[var(--lg-radius-lg)] overflow-hidden opacity-0
              animate-[cardReveal_1s_ease_0.4s_forwards,floatCard_6s_ease-in-out_infinite]"
          >
            <motion.div
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPosition({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
              whileHover={{
                rotateX: 4,
                rotateY: -4,
                scale: 1.01,
              }}
              transition={{ duration: 0.4 }}
              className="glass-panel-strong !rounded-[var(--lg-radius-lg)] overflow-hidden group"
            >
              {/* glow follower */}
              <div
                className="absolute w-72 h-72 rounded-full pointer-events-none
                  blur-[90px] opacity-10 transition-all duration-200"
                style={{
                  left: position.x - 140,
                  top: position.y - 140,
                  background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)",
                }}
              />

              {/* top line */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-60"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--lg-accent-start), transparent)",
                }}
              />

              <div className="relative z-10 p-6 sm:p-7 space-y-6">
                {/* top */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <h2
                      className="text-2xl font-black tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, var(--lg-text-primary), var(--lg-text-secondary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {t("contact.sendTitle")}
                    </h2>
                    <span className="text-xs uppercase tracking-widest text-[var(--lg-text-tertiary)] font-mono">
                      {t("contact.sendDirect")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--lg-text-tertiary)] leading-relaxed">
                    {t("contact.sendDescription")}
                  </p>
                </div>

                {/* form */}
                <div className="space-y-4">
                  {/* input */}
                  <div className="relative group/input">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t("contact.namePlaceholder")}
                      className="w-full h-14 px-6 rounded-[16px]
                        bg-white/5 backdrop-blur-xl
                        border border-[var(--lg-glass-border-subtle)]
                        group-hover/input:border-[var(--lg-accent-start)]/30
                        text-[var(--lg-text-primary)] placeholder:text-[var(--lg-text-tertiary)]
                        outline-none transition-all duration-300
                        focus:border-[var(--lg-accent-start)]/50
                        focus:shadow-[0_0_20px_rgba(99,102,241,0.08)]
                        font-medium"
                    />
                  </div>

                  {/* textarea */}
                  <div className="relative group/textarea">
                    <textarea
                      rows={4}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t("contact.messagePlaceholder")}
                      className="w-full p-5 rounded-[16px] resize-none
                        bg-white/5 backdrop-blur-xl
                        border border-[var(--lg-glass-border-subtle)]
                        group-hover/textarea:border-[var(--lg-accent-start)]/30
                        text-[var(--lg-text-primary)] placeholder:text-[var(--lg-text-tertiary)]
                        outline-none transition-all duration-300
                        focus:border-[var(--lg-accent-start)]/50
                        focus:shadow-[0_0_20px_rgba(99,102,241,0.08)]
                        font-medium leading-relaxed"
                    />
                  </div>

                  {/* button */}
                  <button
                    onClick={handleSend}
                    disabled={!form.name || !form.message}
                    className="btn-glossy w-full !h-12 !rounded-[16px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:!transform-none"
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16126562 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99621575 L3.03521743,10.4371852 C3.03521743,10.5942826 3.19218622,10.75138 3.50612381,10.75138 L16.6915026,11.5368670 C16.6915026,11.5368670 17.1624089,11.5368670 17.1624089,12.0081591 C17.1624089,12.4794512 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                    </svg>
                    {t("contact.sendBtn")}
                  </button>

                  {/* status */}
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--lg-glass-border-subtle)]">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-40" />
                    </div>
                    <p className="text-xs text-[var(--lg-text-tertiary)] font-mono">
                      {t("contact.replyTime")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10 mt-24 pt-12 pb-8">
        <div className="relative flex flex-col items-center gap-7">
          <h2
            className="text-center font-black tracking-[0.25em] uppercase opacity-0 animate-[headingReveal_1s_cubic-bezier(0.22,1,0.36,1)_0.15s_forwards]"
            style={{ fontSize: "clamp(14px,2vw,18px)" }}
          >
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(180deg, var(--lg-text-primary), var(--lg-text-tertiary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("contact.followMe")}
            </span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/sagdulayev_a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group glass-card !rounded-[20px] h-14 w-14 grid place-items-center
                transition-all duration-500 ease-out
                hover:-translate-y-1.5 hover:scale-105
                hover:!shadow-[0_8px_30px_rgba(238,42,123,0.15)]"
            >
              <FaInstagram className="text-[28px] text-[var(--lg-text-secondary)] transition-all duration-500 group-hover:scale-110 group-hover:text-pink-500" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/sagdullayev-a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="group glass-card !rounded-[20px] h-14 w-14 grid place-items-center
                transition-all duration-500 ease-out
                hover:-translate-y-1.5 hover:scale-105
                hover:!shadow-[0_8px_30px_rgba(31,38,135,0.15)]"
            >
              <FaGithub className="text-[28px] text-[var(--lg-text-secondary)] transition-all duration-500 group-hover:scale-110 group-hover:text-[var(--lg-text-primary)]" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/azizxon-sagdullayev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="group glass-card !rounded-[20px] h-14 w-14 grid place-items-center
                transition-all duration-500 ease-out
                hover:-translate-y-1.5 hover:scale-105
                hover:!shadow-[0_8px_30px_rgba(30,136,229,0.15)]"
            >
              <FaLinkedin className="text-[28px] text-[var(--lg-text-secondary)] transition-all duration-500 group-hover:scale-110 group-hover:text-blue-600" />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/sagdulayev_a"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="group glass-card !rounded-[20px] h-14 w-14 grid place-items-center
                transition-all duration-500 ease-out
                hover:-translate-y-1.5 hover:scale-105
                hover:!shadow-[0_8px_30px_rgba(14,165,233,0.15)]"
            >
              <FaTelegram className="text-[28px] text-[var(--lg-text-secondary)] transition-all duration-500 group-hover:scale-110 group-hover:text-sky-500" />
            </a>
          </div>

          <div
            className="h-px w-32"
            style={{
              background: "linear-gradient(90deg, transparent, var(--lg-text-tertiary)/40, transparent)",
            }}
          />

          <p className="text-center text-sm tracking-[0.22em] text-[var(--lg-text-tertiary)]">
            {t("contact.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </section>
  );
}