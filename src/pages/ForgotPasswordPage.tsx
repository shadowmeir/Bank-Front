import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedOrbs } from '../components/ui/AnimatedOrbs';
export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedOrbs />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="w-full max-w-md relative z-10">

        <Link
          to="/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">

          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <GlassCard>
          {!isSubmitted ?
          <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-gray-400 text-sm">
                  Enter your email and we'll send you instructions to reset your
                  password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-5 h-5" />}
                required />


                <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="shadow-glow-cyan">

                  Send Reset Link
                </Button>
              </form>
            </> :

          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            className="text-center py-8">

              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-gray-400 mb-8">
                We've sent a password reset link to your email address.
              </p>
              <Button
              variant="outline"
              fullWidth
              onClick={() => setIsSubmitted(false)}>

                Try another email
              </Button>
            </motion.div>
          }
        </GlassCard>
      </motion.div>
    </div>);

}