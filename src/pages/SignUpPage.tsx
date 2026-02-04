import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Shield, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAuth } from "../contexts/AuthContext";

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // PIN is UI-only for now (not stored server-side yet)
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!email || !password) return setError("Email and password are required.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      handleNext();
      return;
    }

    if (step === 2) {
      if (!firstName || !lastName || !phoneNumber) return setError("Please fill first name, last name, and phone.");
      handleNext();
      return;
    }

    // step === 3
    if (!pin || !pin2) return setError("Please enter your PIN.");
    if (pin !== pin2) return setError("PINs do not match.");
    if (pin.length !== 4) return setError("PIN must be 4 digits.");

    setIsLoading(true);
    try {
      const result = await register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

      if (result.status === "verify") {
        navigate(
          `/verify-email/sent?email=${encodeURIComponent(result.email)}`,
          { replace: true }
        );
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedOrbs />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <GlassCard className="overflow-hidden">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-dark-bg px-2">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${step >= i ? "bg-neon-cyan text-black shadow-glow-cyan" : "bg-white/10 text-gray-500"}
                  `}
                >
                  {step > i ? <Check className="w-4 h-4" /> : i}
                </div>
                <span className={`text-xs ${step >= i ? "text-white" : "text-gray-500"}`}>
                  {i === 1 ? "Account" : i === 2 ? "Personal" : "Security"}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Create Account</h2>
                    <p className="text-gray-400 text-sm">Start your journey with Neobank</p>
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="w-5 h-5" />}
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    icon={<Lock className="w-5 h-5" />}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    icon={<Lock className="w-5 h-5" />}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Personal Details</h2>
                    <p className="text-gray-400 text-sm">Tell us a bit about yourself</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="John"
                      icon={<User className="w-5 h-5" />}
                      required
                      autoFocus
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+972 50-123-4567"
                    icon={<Phone className="w-5 h-5" />}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Secure Your Account</h2>
                    <p className="text-gray-400 text-sm">Set up a PIN for quick access</p>
                  </div>

                  <Input
                    label="4-Digit PIN"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    className="text-center tracking-[1em] text-lg"
                    icon={<Shield className="w-5 h-5" />}
                    required
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />

                  <Input
                    label="Confirm PIN"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    className="text-center tracking-[1em] text-lg"
                    icon={<Shield className="w-5 h-5" />}
                    required
                    value={pin2}
                    onChange={(e) => setPin2(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <Button type="button" variant="ghost" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}

              <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="flex-1 shadow-glow-cyan">
                {step === 3 ? "Create Account" : "Next Step"}
                {step < 3 && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-neon-purple hover:text-purple-300 font-medium transition-colors">
              Log in
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
