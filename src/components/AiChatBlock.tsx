import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

interface HistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function AiChatBlock() {
  const { t } = useTranslation();

  // Build question/answer arrays from i18n keys
  const questionKeys = ["q0", "q1", "q2", "q3"] as const;

  const quickQuestions = questionKeys.map((qk, idx) => ({
    q: t(`chat.questions.${qk}`),
    a: t(`chat.answers.a${idx}`),
  }));

  const statusItems = [
    { label: t("chat.status.statusLabel"), value: t("chat.status.statusValue"), color: "#22c55e" },
    { label: t("chat.status.locationLabel"), value: t("chat.status.locationValue"), color: "#6366f1" },
    { label: t("chat.status.focusLabel"), value: t("chat.status.focusValue"), color: "#8b5cf6" },
  ];

  const interestTags = ["AI Integration", "3D Web", "Motion Design", "Open Source"];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: t("chat.greeting") },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<Set<number>>(new Set());
  const chatRef = useRef<HTMLDivElement>(null);

  // Reset chat when language changes (greeting should update)
  const prevLang = useRef(t("chat.greeting"));
  useEffect(() => {
    const newGreeting = t("chat.greeting");
    if (prevLang.current !== newGreeting) {
      prevLang.current = newGreeting;
      setMessages([{ role: "bot", text: newGreeting }]);
      setHistory([]);
      setAskedQuestions(new Set());
    }
  }, [t]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleQuestion = (index: number) => {
    if (typing || isSending || askedQuestions.has(index)) return;
    const item = quickQuestions[index];
    setAskedQuestions((prev) => new Set(prev).add(index));
    setMessages((prev) => [...prev, { role: "user", text: item.q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: item.a }]);
      setHistory((prev) => [
        ...prev.slice(-18),
        { role: "user", parts: [{ text: item.q }] },
        { role: "model", parts: [{ text: item.a }] },
      ]);
    }, 1200 + Math.random() * 800);
  };

  const handleFreeformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputQuery.trim();
    if (!text || typing || isSending) return;

    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setTyping(true);
    setIsSending(true);

    const endpoint = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3001/chat";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const replyText = data.reply || t("chat.fallbackError");

      setHistory((prev) => [
        ...prev.slice(-18),
        { role: "user", parts: [{ text }] },
        { role: "model", parts: [{ text: replyText }] },
      ]);

      setTyping(false);
      setIsSending(false);
      setMessages((prev) => [...prev, { role: "bot", text: replyText }]);
    } catch {
      setTyping(false);
      setIsSending(false);
      setMessages((prev) => [...prev, { role: "bot", text: t("chat.fallbackError") }]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Panel */}
        <div className="lg:col-span-2 glass-panel-strong p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-40" />
              </div>
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                {t("chat.online")}
              </span>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-mono px-3 py-1 rounded-full"
              style={{ background: "rgba(99,102,241,0.08)", color: "var(--lg-accent-start)" }}
            >
              {t("chat.mode")}
            </span>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="space-y-4 max-h-[340px] overflow-y-auto pr-2 mb-6"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.2) transparent" }}
          >
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-2xl rounded-br-md text-white"
                        : "glass-card !rounded-2xl !rounded-bl-md text-[var(--lg-text-primary)]"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, var(--lg-accent-start), var(--lg-accent-end))" }
                        : undefined
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="glass-card !rounded-2xl !rounded-bl-md px-5 py-3 flex gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 rounded-full bg-[var(--lg-accent-start)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Questions */}
          <div>
            <p className="text-xs text-[var(--lg-text-tertiary)] uppercase tracking-wider mb-3 font-medium">
              {t("chat.askLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(i)}
                  disabled={askedQuestions.has(i) || typing || isSending}
                  className={`px-4 py-2.5 sm:py-2 text-xs font-medium rounded-full transition-all duration-300 min-h-[40px] sm:min-h-0 flex items-center justify-center cursor-pointer ${
                    askedQuestions.has(i)
                      ? "opacity-40 cursor-not-allowed glass-card"
                      : "glass-card hover:!bg-[rgba(99,102,241,0.1)] text-[var(--lg-text-primary)]"
                  }`}
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Freeform Chat Input */}
          <form onSubmit={handleFreeformSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              maxLength={500}
              disabled={typing || isSending}
              placeholder={t("chat.inputPlaceholder")}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full
                bg-white/5 border border-[var(--lg-glass-border-subtle)]
                text-[var(--lg-text-primary)] placeholder:text-[var(--lg-text-tertiary)]
                outline-none transition-all duration-300
                focus:border-[var(--lg-accent-start)]/50
                disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || typing || isSending}
              className="px-5 py-2.5 text-xs font-semibold rounded-full btn-glossy
                disabled:opacity-50 disabled:cursor-not-allowed disabled:!transform-none
                flex items-center gap-1.5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span>{t("chat.send")}</span>
            </button>
          </form>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Status Cards */}
          {statusItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="glass-card !rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <span className="text-xs text-[var(--lg-text-tertiary)] uppercase tracking-wider font-medium">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-sm font-semibold text-[var(--lg-text-primary)]">{item.value}</span>
              </div>
            </motion.div>
          ))}

          {/* Current Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="glass-card !rounded-xl px-5 py-4"
          >
            <p className="text-xs text-[var(--lg-text-tertiary)] uppercase tracking-wider font-medium mb-3">
              {t("chat.interests.title")}
            </p>
            <div className="flex flex-wrap gap-2">
              {interestTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(99,102,241,0.08)", color: "var(--lg-accent-start)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
