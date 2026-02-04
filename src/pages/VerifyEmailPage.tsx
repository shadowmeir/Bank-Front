import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function VerifyEmailPage() {
  const { confirmEmail } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();

  const userId = query.get("userId") ?? "";
  const token = query.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!userId || !token) {
        setStatus("error");
        setError("Missing verification parameters. Please use the link from your email.");
        return;
      }

      try {
        await confirmEmail(userId, token);
        if (!mounted) return;
        setStatus("ok");
      } catch (e) {
        if (!mounted) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "Email verification failed");
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [confirmEmail, userId, token]);

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
            {status === "loading" && (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                <div>
                  <div className="text-xl font-bold">Verifying…</div>
                  <div className="text-sm text-gray-400">Please wait while we confirm your email.</div>
                </div>
              </div>
            )}

            {status === "ok" && (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">Email verified ✅</div>
                  <div className="text-gray-400 mt-1">You can now log in.</div>

                  <div className="mt-6">
                    <Button fullWidth onClick={() => navigate("/login", { replace: true })} className="shadow-glow-cyan">
                      Go to login
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-300" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">Verification failed</div>
                  <div className="text-gray-400 mt-1">{error ?? "Something went wrong."}</div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      fullWidth
                      onClick={() => navigate("/verify-email/sent", { replace: true })}
                      className="shadow-glow-cyan"
                    >
                      Resend email
                    </Button>
                    <Button fullWidth variant="outline" onClick={() => navigate("/login", { replace: true })}>
                      Back to login
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
