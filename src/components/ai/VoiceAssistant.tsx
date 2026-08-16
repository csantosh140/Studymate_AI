"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, X, Send, GraduationCap, MessageCircle, Volume2, VolumeX, Minimize2, Maximize2 } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";
import { cn } from "@/lib/utils";

type Mode = "study" | "english";
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  corrections?: string[];
  tips?: string[];
  ts: Date;
}

// Self-contained Speech Recognition types (no external package needed)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>("study");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [micAvailable, setMicAvailable] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setMicAvailable(!!SR);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.05;
    utt.pitch = 1;
    window.speechSynthesis?.speak(utt);
  }, [ttsEnabled]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), mode, history }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong");
      }

      const data = json.data as {
        reply: string;
        corrections?: string[];
        tips?: string[];
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        corrections: data.corrections,
        tips: data.tips,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      speak(data.reply);
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        ts: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, mode, speak]);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) sendMessage(transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [sendMessage]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false);
  }, []);

  const toggleMic = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const welcomeMsg = mode === "study"
    ? "👋 Hi! I'm your personal Study Assistant. Ask me anything — concepts, problems, study tips!"
    : "👋 Hi! I'm your English Coach. Talk to me naturally and I'll help you improve your communication skills!";

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="voice-assistant-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Voice Assistant"
        className={cn(
          "voice-fab",
          open && "voice-fab--open",
          recording && "voice-fab--recording",
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : recording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
        {recording && <span className="voice-fab__pulse" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          id="voice-assistant-panel"
          className={cn("voice-panel", expanded && "voice-panel--expanded")}
        >
          {/* Header */}
          <div className="voice-panel__header">
            <div className="flex items-center gap-2.5">
              <span className="voice-panel__avatar">
                <Mic className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">AI Assistant</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {mode === "study" ? "Study Mode" : "English Coach"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Mode toggle */}
              <div className="voice-mode-toggle">
                <button
                  onClick={() => setMode("study")}
                  className={cn("voice-mode-btn", mode === "study" && "voice-mode-btn--active")}
                  title="Study Assistant"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Study</span>
                </button>
                <button
                  onClick={() => setMode("english")}
                  className={cn("voice-mode-btn", mode === "english" && "voice-mode-btn--active")}
                  title="English Coach"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">English</span>
                </button>
              </div>

              <button
                onClick={() => setTtsEnabled((v) => !v)}
                className="voice-icon-btn"
                title={ttsEnabled ? "Mute voice" : "Enable voice"}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setExpanded((v) => !v)}
                className="voice-icon-btn hidden lg:flex"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button onClick={() => setOpen(false)} className="voice-icon-btn" title="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="voice-panel__body">
            {/* Welcome */}
            <div className="voice-bubble voice-bubble--assistant">
              <p className="text-sm leading-relaxed">{welcomeMsg}</p>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn("voice-bubble", `voice-bubble--${msg.role}`)}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* English coach extras */}
                {msg.role === "assistant" && msg.corrections && msg.corrections.length > 0 && (
                  <div className="voice-corrections">
                    <p className="voice-corrections__label">✍️ Corrections</p>
                    {msg.corrections.map((c, i) => (
                      <p key={i} className="voice-correction-item">{c}</p>
                    ))}
                  </div>
                )}
                {msg.role === "assistant" && msg.tips && msg.tips.length > 0 && (
                  <div className="voice-tips">
                    <p className="voice-tips__label">💡 Tip</p>
                    {msg.tips.map((t, i) => (
                      <p key={i} className="text-[11px] text-[var(--muted)] mt-0.5">{t}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="voice-bubble voice-bubble--assistant">
                <span className="voice-typing">
                  <span /><span /><span />
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="voice-panel__footer">
            {recording && (
              <div className="voice-recording-bar">
                <VoiceWaveform active={recording} />
                <span className="text-xs text-[var(--brand)] font-medium animate-pulse">Listening…</span>
              </div>
            )}
            <div className="voice-input-row">
              {micAvailable && (
                <button
                  onClick={toggleMic}
                  className={cn("voice-mic-btn", recording && "voice-mic-btn--active")}
                  title={recording ? "Stop recording" : "Speak"}
                >
                  {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <input
                ref={inputRef}
                id="voice-assistant-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={mode === "study" ? "Ask a study question…" : "Say something in English…"}
                className="voice-text-input"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="voice-send-btn"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
