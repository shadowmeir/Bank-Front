import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedOrbs } from '../components/ui/AnimatedOrbs';
export function LandingPage() {
  const features = [
  {
    icon: <Zap className="w-6 h-6 text-neon-cyan" />,
    title: 'Instant Transfers',
    description: 'Send money globally in seconds with zero hidden fees.'
  },
  {
    icon: <Shield className="w-6 h-6 text-neon-purple" />,
    title: 'Bank-Grade Security',
    description: 'Your assets are protected by military-grade encryption.'
  },
  {
    icon: <Globe className="w-6 h-6 text-blue-400" />,
    title: 'Global Access',
    description: 'Access your funds from anywhere in the world, 24/7.'
  },
  {
    icon: <Smartphone className="w-6 h-6 text-pink-400" />,
    title: 'Mobile First',
    description: 'Designed for the modern lifestyle, right in your pocket.'
  }];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedOrbs />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg" />
          <span className="text-xl font-bold tracking-tight">NEOBANK</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" className="hidden sm:flex">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6
            }}>

            <span className="px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-sm font-medium mb-6 inline-block">
              The Future of Banking is Here
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6,
              delay: 0.1
            }}>

            Banking for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple">
              Digital Generation
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 max-w-2xl mb-10"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6,
              delay: 0.2
            }}>

            Experience seamless transactions, powerful insights, and total
            control over your finances. No branches, no queues, just pure
            banking.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6,
              delay: 0.3
            }}>

            <Link to="/signup">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.4 + index * 0.1
            }}>

              <GlassCard className="h-full" hoverEffect>
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-md" />
            <span className="text-lg font-bold">NEOBANK</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2024 Neobank Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>);

}