import { useEffect, useMemo, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";

import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Sidebar } from "../components/ui/Sidebar";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { Bot } from "lucide-react";
import { createChatbotConnection, type ChatMessage } from "../lib/chatbot";

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(epochMs: number) {
  const d = new Date(epochMs);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatbotPage() {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting"
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: nowId(),
      role: "system",
      text: "Hi! I'm your bank bot. Try: Balance, Recent Transactions, Help.",
      at: Date.now(),
    },
  ]);
  const [text, setText] = useState("");

  const connRef = useRef<HubConnection | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const quickCommands = useMemo(
    () => [
      { label: "Balance", value: "Balance" },
      { label: "Recent transactions", value: "Recent Transactions" },
      { label: "Help", value: "Help" },
    ],
    []
  );

  // Auto-scroll to newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Create + start SignalR connection.
  useEffect(() => {
    let isMounted = true;
    const { conn } = createChatbotConnection();
    connRef.current = conn;

    conn.on("ReceiveBotMessage", (reply: string) => {
      if (!isMounted) return;
      setMessages((prev) => [
        ...prev,
        { id: nowId(), role: "bot", text: reply, at: Date.now() },
      ]);
    });

    async function start() {
      try {
        setStatus("connecting");
        await conn.start();
        if (!isMounted) return;
        setStatus("connected");
      } catch {
        if (!isMounted) return;
        setStatus("disconnected");
      }
    }

    start();

    conn.onreconnecting(() => {
      if (!isMounted) return;
      setStatus("connecting");
    });
    conn.onreconnected(() => {
      if (!isMounted) return;
      setStatus("connected");
    });
    conn.onclose(() => {
      if (!isMounted) return;
      setStatus("disconnected");
    });

    return () => {
      isMounted = false;
      conn.off("ReceiveBotMessage");
      void conn.stop();
      connRef.current = null;
    };
  }, []);

  async function send(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: nowId(), role: "user", text: trimmed, at: Date.now() },
    ]);
    setText("");

    const conn = connRef.current;
    if (!conn) {
      setMessages((prev) => [
        ...prev,
        {
          id: nowId(),
          role: "system",
          text: "Not connected to the bot server.",
          at: Date.now(),
        },
      ]);
      return;
    }

    try {
      // Backend hub method name: SendToBot(string message)
      await conn.invoke("SendToBot", trimmed);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nowId(),
          role: "system",
          text: "Failed to send message. Please try again.",
          at: Date.now(),
        },
      ]);
    }
  }

  const canSend = status === "connected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      <AnimatedOrbs />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold">Chatbot</h1>
                <p className="text-sm text-white/70">
                  Status: {status === "connected" ? "Connected" : status === "connecting" ? "Connecting…" : "Disconnected"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickCommands.map((c) => (
                <Button
                  key={c.value}
                  variant="secondary"
                  onClick={() => send(c.value)}
                  disabled={!canSend}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          <GlassCard className="p-4">
            <div className="h-[60vh] overflow-y-auto space-y-3 pr-1">
          {messages.map((m) => (
            <div key={m.id} className="flex">
              <div
                className={
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed " +
                  (m.role === "user"
                    ? "ml-auto bg-white/15"
                    : m.role === "bot"
                      ? "mr-auto bg-white/10"
                      : "mr-auto bg-white/5 text-white/80")
                }
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="mt-1 text-[11px] text-white/50">
                  {m.role.toUpperCase()} · {formatTime(m.at)}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={canSend ? "Type a message…" : "Connect to send messages…"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send(text);
                }}
              />
              <Button onClick={() => send(text)} disabled={!canSend}>
                Send
              </Button>
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
}

export default ChatbotPage;
