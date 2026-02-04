import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function VerifyEmailSentPage() {
  const { resendEmailConfirmation } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();

  const queryEmail = query.get("email") ?? "";
  const [email, setEmail] = useState(queryEmail);
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (queryEmail && !email) setEmail(queryEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryEmail]);

  async function onResend() {
    setErr(null);
    setMsg(null);

    const e = email.trim();
    if (!e) {
      setErr("Please enter your email.");
      return;
    }

    setIsSending(true);
    try {
      await resendEmailConfirmation(e);
      setMsg("Verification email sent ✅");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      <AnimatedOrbs />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <GlassCard className="border-t border-white/20 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Verify your email</h1>
                <p className="text-gray-400 mt-1">
                  We sent you a verification link. Open your inbox and click the link to activate your account.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
              <div className="font-medium text-white mb-1">Tips</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your spam / promotions folder.</li>
                <li>Make sure you typed your email correctly.</li>
                <li>Links can expire; you can resend a fresh one below.</li>
              </ul>
            </div>

            <div className="mt-6">
              {err && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{err}</div>}
              {msg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {msg}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button onClick={onResend} isLoading={isSending} fullWidth>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend verification
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate("/login", { replace: true })}
                  className="hover:!border-neon-cyan/50"
                >
                  Go to login
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
