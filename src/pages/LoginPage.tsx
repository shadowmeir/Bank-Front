import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
	const { login, resendEmailConfirmation } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
	const [needsVerify, setNeedsVerify] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [resendMsg, setResendMsg] = useState<string | null>(null);
	const [resendErr, setResendErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
		setNeedsVerify(false);
		setResendMsg(null);
		setResendErr(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
			if (err instanceof ApiError && err.status === 403) {
				setNeedsVerify(true);
			}
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

	const handleResend = async () => {
		const e = email.trim();
		setResendMsg(null);
		setResendErr(null);
		if (!e) {
			setResendErr("Please enter your email above first.");
			return;
		}
		setIsResending(true);
		try {
			await resendEmailConfirmation(e);
			navigate(`/verify-email/sent?email=${encodeURIComponent(e)}`);
		} catch (err) {
			setResendErr(err instanceof Error ? err.message : "Failed to resend verification email");
		} finally {
			setIsResending(false);
		}
	};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedOrbs />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <GlassCard className="border-t border-white/20 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

			{needsVerify && (
				<div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
					<div className="font-semibold text-amber-100">Email not verified</div>
					<div className="mt-1 text-amber-200/90">
						Please confirm your email to sign in.
					</div>
					<div className="mt-3 flex items-center gap-3">
						<Button type="button" isLoading={isResending} onClick={handleResend}>
							Resend verification email
						</Button>
						<Link to="/verify-email/sent" className="text-sm text-neon-cyan hover:text-cyan-300 transition-colors">
							Help
						</Link>
					</div>
					{resendErr && <div className="mt-2 text-red-300">{resendErr}</div>}
					{resendMsg && <div className="mt-2 text-emerald-200">{resendMsg}</div>}
				</div>
			)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-neon-cyan hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} className="shadow-glow-cyan">
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-neon-purple hover:text-purple-300 font-medium transition-colors"
            >
              Create one now
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
