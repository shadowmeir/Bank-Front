import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAuth } from "../contexts/AuthContext";

export function ConfirmEmailPage() {
  const { confirmEmail } = useAuth();
  const nav = useNavigate();
  const q = new URLSearchParams(useLocation().search);

  const userId = q.get("userId") ?? "";
  const token = q.get("token") ?? "";

  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    async function run() {
      try {
        if (!userId || !token) throw new Error("Missing confirmation parameters.");
        await confirmEmail(userId, token);
        setState("ok");
        // optional auto redirect
        setTimeout(() => nav("/login", { replace: true }), 1200);
      } catch (e) {
        setState("err");
        setErr(e instanceof Error ? e.message : "Confirmation failed");
      }
    }
    run();
  }, [userId, token, confirmEmail, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedOrbs />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <GlassCard className="border-t border-white/20 shadow-2xl shadow-black/50">
          {state === "loading" && <div className="text-gray-300">Confirming…</div>}

          {state === "ok" && (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xl font-bold">Email confirmed ✅</div>
                <div className="text-gray-400 text-sm">Redirecting to login…</div>
              </div>
            </div>
          )}

          {state === "err" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <div className="text-xl font-bold">Confirmation failed</div>
                  <div className="text-red-300 text-sm">{err}</div>
                </div>
              </div>

              <Link to="/login" className="text-neon-purple hover:text-purple-300 font-medium transition-colors">
                Back to login
              </Link>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}