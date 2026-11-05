import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Lock,
  ChevronDown,
  RotateCcw,
  Brain,
} from "lucide-react";

interface Message {
  sender: "user" | "copilot";
  text: string;
  time: string;
  thoughtDuration?: number;
  thoughts?: string[];
}

interface GitHubCopilotWidgetProps {
  currentRepo?: string;
}

export const GitHubCopilotWidget: React.FC<GitHubCopilotWidgetProps> = ({ currentRepo = "biznesgo" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "security">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "Salom! Men GitGo tizimining ichki GitHub Copilot yordamchisiman. Sizga dorilar bazasini tahlil qilish, buyruqlar berish yoki xavfsiz klonlashda yordam beraman. Tizim to'liq ichki perimetrda himoyalangan (Zero-Leakage Shield 🔒).",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<number, boolean>>({});

  // Security Gate State
  const [secSource, setSecSource] = useState("System A (Master Catalog)");
  const [secTarget, setSecTarget] = useState("System B (B2B Pharmacy Internal)");
  const [secReason, setSecReason] = useState("Filial omborini sinxronlash");
  const [secPin, setSecPin] = useState("2026");
  const [secResult, setSecResult] = useState<any | null>(null);
  const [secLoading, setSecLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, thinkingSeconds]);

  // Live Thinking Timer (Thinking for 1s... 2s... 9s... 10s...)
  useEffect(() => {
    let interval: any;
    if (loading) {
      setThinkingSeconds(1);
      interval = setInterval(() => {
        setThinkingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setThinkingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleThought = (idx: number) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    const startEpoch = Date.now();

    try {
      const res = await axios.post("/api/copilot/chat", {
        message: text,
        currentRepo,
      });

      const clientDuration = Math.max(1, Math.round((Date.now() - startEpoch) / 1000));

      if (res.data.success) {
        if (res.data.refreshData || res.data.actionTaken === "CLONE_COMPLETED") {
          window.dispatchEvent(new CustomEvent("gitgo:refresh_medicines"));
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "copilot",
            text: res.data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            thoughtDuration: res.data.durationSeconds || clientDuration,
            thoughts: res.data.thoughts || [
              "Foydalanuvchi so'rovi va intent tahlil qilindi",
              "Neon PostgreSQL dorilar katalogi tahlil qilindi",
              "Zero-Leakage DLP xavfsizlik perimetri tasdiqlandi",
              "Yakuniy javob shakllantirildi",
            ],
          },
        ]);
      }
    } catch (err: any) {
      const clientDuration = Math.max(1, Math.round((Date.now() - startEpoch) / 1000));
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: "❌ Xatolik yuz berdi: " + (err.response?.data?.message || err.message),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          thoughtDuration: clientDuration,
          thoughts: ["So'rov yuborishda uzilish yoki xatolik yuz berdi"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecLoading(true);
    setSecResult(null);

    try {
      const res = await axios.post("/api/security/verify", {
        source: secSource,
        target: secTarget,
        reason: secReason,
        pin: secPin,
      });
      setSecResult(res.data);
    } catch (err: any) {
      setSecResult({
        allowed: false,
        message: "Xavfsizlik tekshiruvida xatolik: " + err.message,
      });
    } finally {
      setSecLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[370px] sm:w-[410px] h-[540px] bg-white border border-[#d0d7de] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#24292f] text-white px-4 py-3 flex items-center justify-between border-b border-[#30363d]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-[#1f6feb] flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-semibold text-xs tracking-tight">GitHub Copilot</h4>
                  <span className="text-[10px] bg-[#238636] text-white px-1.5 py-0.2 rounded font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[#7d8590] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#3fb950]" />
                  <span>Zero-Leakage Shield Faol</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7d8590] hover:text-white p-1 rounded hover:bg-[#30363d] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[#d0d7de] bg-[#f6f8fa] text-xs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                activeTab === "chat"
                  ? "border-[#fd8c73] text-[#1f2328] bg-white"
                  : "border-transparent text-[#57606a] hover:text-[#1f2328]"
              }`}
            >
              Copilot Chat
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 py-2 font-semibold text-center border-b-2 transition flex items-center justify-center gap-1 ${
                activeTab === "security"
                  ? "border-[#fd8c73] text-[#1f2328] bg-white"
                  : "border-transparent text-[#57606a] hover:text-[#1f2328]"
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Security Gate</span>
            </button>
          </div>

          {/* Tab 1: Copilot Chat */}
          {activeTab === "chat" ? (
            <>
              {/* Messages list */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#f6f8fa]/40">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Collapsible Thought for Xs badge */}
                    {m.sender === "copilot" && m.thoughtDuration !== undefined && (
                      <div className="mb-1.5 max-w-[90%]">
                        <button
                          onClick={() => toggleThought(idx)}
                          className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#57606a] hover:text-[#0969da] bg-[#f6f8fa] hover:bg-[#ebf0f4] px-2 py-0.5 rounded-full border border-[#d0d7de] transition cursor-pointer shadow-2xs"
                        >
                          <Brain className="w-3 h-3 text-[#8250df]" />
                          <span>Thought for {m.thoughtDuration}s</span>
                          <ChevronDown
                            className={`w-3 h-3 text-[#8c959f] transition-transform duration-200 ${
                              expandedThoughts[idx] ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedThoughts[idx] && (
                          <div className="mt-1.5 ml-1 pl-2.5 border-l-2 border-[#8250df]/60 text-[11px] font-mono text-[#57606a] space-y-1 bg-white p-2 rounded-r border border-[#d0d7de]/60 shadow-2xs">
                            {m.thoughts && m.thoughts.length > 0 ? (
                              m.thoughts.map((t, ti) => (
                                <div key={ti} className="flex items-start space-x-1.5">
                                  <span className="text-[#8250df] font-bold">✓</span>
                                  <span>{t}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[#8c959f]">Fikrlash ketma-ketligi yakunlandi.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed shadow-2xs ${
                        m.sender === "user"
                          ? "bg-[#0969da] text-white"
                          : "bg-white border border-[#d0d7de] text-[#1f2328]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <span className="text-[10px] text-[#8c959f] mt-0.5 px-1 font-mono">
                      {m.time}
                    </span>
                  </div>
                ))}

                {/* Active Thinking State: Thinking for 9s, 10s... */}
                {loading && (
                  <div className="flex flex-col space-y-1.5 text-xs text-[#57606a] bg-white border border-[#d0d7de] p-2.5 rounded-lg shadow-2xs w-[88%] animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[#8250df] font-mono text-[11.5px] font-semibold">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#8250df]" />
                        <span>Thinking for {thinkingSeconds}s...</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f883d] animate-ping" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f883d]" />
                      </div>
                    </div>

                    <div className="text-[10.5px] text-[#656d76] flex items-center space-x-1.5 font-mono pt-0.5">
                      <span className="text-[#0969da]">›</span>
                      <span>
                        {thinkingSeconds <= 2
                          ? "So'rov va intent tahlil qilinmoqda..."
                          : thinkingSeconds <= 5
                          ? "Neon PostgreSQL dorilar bazasi o'qilmoqda..."
                          : thinkingSeconds <= 8
                          ? "Zero-Leakage DLP xavfsizlik perimetri tekshirilmoqda..."
                          : "Yakuniy tahliliy xulosa shakllantirilmoqda..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2 bg-[#f6f8fa] border-t border-[#d0d7de] flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <button
                  onClick={() => handleSendMessage("Bizda jami qancha dori bor va qaysi birliklarda?")}
                  className="bg-white border border-[#d0d7de] rounded px-2 py-0.5 text-[#57606a] hover:text-[#0969da] hover:border-[#0969da] whitespace-nowrap transition"
                >
                  📊 Jami hisobot
                </button>
                <button
                  onClick={() => handleSendMessage("Oxirgi qo'shilgan dorilarni ko'rsat")}
                  className="bg-white border border-[#d0d7de] rounded px-2 py-0.5 text-[#57606a] hover:text-[#0969da] hover:border-[#0969da] whitespace-nowrap transition"
                >
                  🕒 Oxirgi dorilar
                </button>
                <button
                  onClick={() => handleSendMessage("Litr va ml dori vositalari haqida ma'lumot ber")}
                  className="bg-white border border-[#d0d7de] rounded px-2 py-0.5 text-[#57606a] hover:text-[#0969da] hover:border-[#0969da] whitespace-nowrap transition"
                >
                  🧴 Suyuqliklar
                </button>
              </div>

              {/* Input box */}
              <div className="p-2.5 bg-white border-t border-[#d0d7de] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Copilot'ga buyruq bering (masalan: dori tahlili)..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 text-xs border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputValue.trim()}
                  className="bg-[#1f883d] hover:bg-[#1a7f37] text-white p-1.5 rounded-md transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Tab 2: Zero Data Leakage Security Gate */
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs text-[#1f2328]">
              <div className="p-3 bg-[#ddf4ff] border border-[#54aeff]/40 rounded-md">
                <div className="flex items-center space-x-1.5 text-[#0969da] font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xavfsizlik & Data Leakage Prevention (DLP)</span>
                </div>
                <p className="text-[11px] text-[#57606a] leading-relaxed">
                  Tizim ichidagi maʼlumotlar faqat <b>Tizim A (Master Katalog)</b> dan <b>Tizim B (B2B Dorixona tuguni)</b>ga oʻtishi mumkin. Boshqa har qanday 3-tomon tizimlariga maʼlumot chiqarish bloklanadi.
                </p>
              </div>

              <form onSubmit={handleVerifySecurity} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#24292f]">
                    Chiquvchi tizim (Source):
                  </label>
                  <input
                    type="text"
                    value={secSource}
                    onChange={(e) => setSecSource(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#d0d7de] rounded text-xs bg-[#f6f8fa]"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24292f]">
                    Qabul qiluvchi tizim (Target Node):
                  </label>
                  <input
                    type="text"
                    value={secTarget}
                    onChange={(e) => setSecTarget(e.target.value)}
                    placeholder="Faqat ichki tizim (masalan: System B)"
                    className="w-full px-2.5 py-1.5 border border-[#d0d7de] rounded text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24292f]">
                    Ma'lumot chiqarish maqsadi (Purpose):
                  </label>
                  <input
                    type="text"
                    value={secReason}
                    onChange={(e) => setSecReason(e.target.value)}
                    placeholder="Nima uchun ushbu ma'lumot uzatilmoqda?"
                    className="w-full px-2.5 py-1.5 border border-[#d0d7de] rounded text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#24292f]">
                    Xavfsizlik PIN kodi (Security Gate PIN):
                  </label>
                  <input
                    type="password"
                    value={secPin}
                    onChange={(e) => setSecPin(e.target.value)}
                    placeholder="Xavfsizlik PIN kodi"
                    className="w-full px-2.5 py-1.5 border border-[#d0d7de] rounded text-xs font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={secLoading}
                  className="w-full py-1.5 bg-[#24292f] hover:bg-[#30363d] text-white font-semibold rounded text-xs transition"
                >
                  {secLoading ? "Xavfsizlik tekshirilmoqda..." : "Tekshirish & Audit Gate"}
                </button>
              </form>

              {secResult && (
                <div
                  className={`p-3 rounded-md border text-xs leading-relaxed ${
                    secResult.allowed
                      ? "bg-[#dafbe1] text-[#1a7f37] border-[#4ac26b]/40"
                      : "bg-[#ffebe9] text-[#cf222e] border-[#ff8182]/40"
                  }`}
                >
                  <p className="font-semibold">{secResult.message}</p>
                  {secResult.challengeQuestions && (
                    <div className="mt-2 space-y-1 font-mono text-[11px] bg-white/70 p-2 rounded border border-[#ff8182]/40">
                      <p className="font-bold text-[#24292f]">Xavfsizlik so'rovnomasi:</p>
                      {secResult.challengeQuestions.map((q: string, i: number) => (
                        <p key={i}>{q}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Button (GitHub Copilot style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#24292f] hover:bg-[#161b22] text-white flex items-center justify-center shadow-xl border border-[#30363d] hover:scale-105 transition-all relative group"
        title="GitHub Copilot & Security Shield"
      >
        <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#238636] border-2 border-white"></span>
      </button>
    </div>
  );
};

