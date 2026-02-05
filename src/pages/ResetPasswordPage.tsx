import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { api, ApiError } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function ResetPasswordPage() {
  const q = useQuery();
  const navigate = useNavigate();

  const userId = q.get("userId") ?? "";
  const token = q.get("token") ?? "";

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!userId || !token) {
      setErr("Missing reset parameters. Please use the link from your email.");
      return;
    }
    if (!pw1 || pw1.length < 6) {
      setErr("Please choose a stronger password (at least 6 characters).");
      return;
    }
    if (pw1 !== pw2) {
      setErr("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ userId, token, newPassword: pw1 }),
      });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message);
      else setErr(e2 instanceof Error ? e2.message : "Reset failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedOrbs />

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <GlassCard className="border-t border-white/20 shadow-2xl shadow-black/50">
          {!done ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-gray-400 text-sm">Choose a new password for your account.</p>
              </div>

              {err && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {err}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Create a strong password"
                  icon={<Lock className="w-5 h-5" />}
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  icon={<Lock className="w-5 h-5" />}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  required
                />

                <Button type="submit" fullWidth isLoading={isLoading} className="shadow-glow-cyan">
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password updated ✅</h2>
              <p className="text-gray-400 mb-6">Redirecting to login…</p>
              <Button fullWidth variant="outline" onClick={() => navigate("/login", { replace: true })}>
                Go to login
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}