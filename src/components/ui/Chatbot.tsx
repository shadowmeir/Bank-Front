import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, X, Wifi, WifiOff, Loader2 } from "lucide-react";
import { HubConnectionState, type HubConnection } from "@microsoft/signalr";

import { GlassCard } from "./GlassCard";
import { useAuth } from "../../contexts/AuthContext";
import { createChatbotConnection } from "../../lib/chatbot";

type Role = "user" | "assistant";

type UiMessage = {
  id: string;
  role: Role;
  content: string;
  ts: number;
};

function newId() {
  // crypto.randomUUID is available in modern browsers; fall back if needed.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Chatbot() {
  const { accessToken, isAuthed } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [messages, setMessages] = useState<UiMessage[]>(() => [
    {
      id: newId(),
      role: "assistant",
      content:
        "Hi! I’m your NEOBANK assistant. Try: Help, Balance, Accounts, RecentTx.",
      ts: Date.now(),
    },
  ]);

  const quickActions = useMemo(
    () => [
      { label: "Help", command: "Help" },
      { label: "Balance", command: "Balance" },
      { label: "Accounts", command: "Accounts" },
      { label: "RecentTx", command: "RecentTx" },
    ],
    []
  );

  const connectionRef = useRef<HubConnection | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Open widget from anywhere (optional)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isOpen]);

  // Establish SignalR connection only when the widget is open and the user is authed.
  // (This keeps things light and also makes token refresh/re-login deterministic.)
  useEffect(() => {
    let disposed = false;

    async function disconnect() {
      setIsConnected(false);
      const c = connectionRef.current;
      connectionRef.current = null;
      if (!c) return;
      try {
        c.off("ReceiveBotMessage");
        await c.stop();
      } catch {
        // ignore
      }
    }

    async function connect() {
      // Not authed OR widget closed => ensure disconnected.
      if (!isAuthed || !accessToken || !isOpen) {
        await disconnect();
        return;
      }

      // Already connected/connecting.
      if (connectionRef.current) return;

      const { conn } = createChatbotConnection();
      connectionRef.current = conn;

      conn.on("ReceiveBotMessage", (reply: string) => {
        if (disposed) return;
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", content: String(reply ?? ""), ts: Date.now() },
        ]);
        setIsTyping(false);
      });

      conn.onreconnecting(() => {
        if (!disposed) setIsConnected(false);
      });
      conn.onreconnected(() => {
        if (!disposed) setIsConnected(true);
      });
      conn.onclose(() => {
        if (!disposed) setIsConnected(false);
      });

      try {
        await conn.start();
        if (!disposed) setIsConnected(true);
      } catch {
        if (disposed) return;
        setIsConnected(false);
        // If start fails, allow a clean retry (e.g. user reopens the widget)
        // by clearing the ref and stopping the connection.
        connectionRef.current = null;
        try {
          await conn.stop();
        } catch {
          // ignore
        }
      }
    }

    void connect();

    return () => {
      disposed = true;
      // If we unmount while open, best-effort cleanup.
      void disconnect();
    };
  }, [isAuthed, accessToken, isOpen]);

  async function send(text: string) {
    const message = text.trim();
    if (!message) return;

    setMessages((prev) => [
      ...prev,
      { id: newId(), role: "user", content: message, ts: Date.now() },
    ]);
    setInput("");
    setIsTyping(true);

    const conn = connectionRef.current;
    if (!conn) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: "You’re not connected. Please refresh and sign in again.",
          ts: Date.now(),
        },
      ]);
      return;
    }

    try {
      // Ensure started
      if (conn.state !== HubConnectionState.Connected) {
        await conn.start();
        setIsConnected(true);
      }

      await conn.invoke("SendToBot", message);
      // Reply arrives via ReceiveBotMessage handler.
    } catch (e: any) {
      setIsTyping(false);
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content:
            "I couldn’t reach the server right now. Please try again in a moment.",
          ts: Date.now(),
        },
      ]);
    }
  }

  // Don’t render the widget on public pages.
  if (!isAuthed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Floating button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 rounded-full flex items-center justify-center shadow-glow-cyan border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 backdrop-blur transition-transform hover:scale-105"
          aria-label="Open chatbot"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Bot className="w-6 h-6 text-neon-cyan relative" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <GlassCard className="w-[360px] h-[520px] !p-0 overflow-hidden flex flex-col !rounded-2xl border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/25 to-neon-purple/25 flex items-center justify-center border border-neon-cyan/20 shadow-glow-cyan">
                <Bot className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="font-semibold tracking-tight">NEOBANK Assistant</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-neon-cyan" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-gray-500" />
                      Connecting…
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                      isUser
                        ? "bg-neon-cyan/10 border-neon-cyan/20 text-white"
                        : "bg-white/5 border-white/10 text-gray-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`mt-2 text-[11px] ${
                        isUser ? "text-neon-cyan/70" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.ts)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-gray-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
                  Thinking…
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick actions */}
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.command}
                  type="button"
                  onClick={() => send(a.command)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-200 hover:border-neon-cyan/30 hover:bg-neon-cyan/10 hover:text-white transition"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form
            className="px-4 pb-4 pt-2 border-t border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-10 w-10 rounded-lg flex items-center justify-center border border-neon-cyan/25 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 hover:border-neon-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
