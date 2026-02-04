import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard, Lock, Eye, EyeOff, Settings, Shield, Wifi, Copy } from "lucide-react";

import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAuth } from "../contexts/AuthContext";

export function CardsPage() {
  const [showPin, setShowPin] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const { displayName, profile } = useAuth();

  const cardHolder = useMemo(() => {
    const name = displayName?.trim() || `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || profile?.email || "CARD HOLDER";
    return name.toUpperCase();
  }, [displayName, profile]);

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-gray-400">Manage your physical and virtual cards.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card Visual */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-md aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/10 transition-all duration-500 ${
                  isFrozen ? "grayscale opacity-70" : ""
                }`}
              />

              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16" />

              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                    </div>
                    <span className="font-bold tracking-wider text-white/90">NEOBANK</span>
                  </div>
                  <Wifi className="w-6 h-6 text-white/50 rotate-90" />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-200 w-12 h-8 rounded flex overflow-hidden">
                      <div className="w-1/2 h-full bg-amber-300" />
                      <div className="w-1/2 h-full bg-amber-200" />
                    </div>
                    <Wifi className="w-6 h-6 text-white/50 rotate-90" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-xl tracking-[0.2em] text-white shadow-black drop-shadow-md">
                        4582 •••• •••• 8923
                      </p>
                      <button className="text-white/50 hover:text-white transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Card Holder</p>
                    <p className="font-medium tracking-wide">{cardHolder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Expires</p>
                    <p className="font-medium tracking-wide">09/28</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/80" />
                    <div className="w-8 h-8 rounded-full bg-white/50" />
                  </div>
                </div>
              </div>

              {isFrozen && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">Card Frozen</span>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="flex gap-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors" />
              <div className="w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Card Settings */}
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-lg font-bold mb-4">Card Controls</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setIsFrozen(!isFrozen)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isFrozen ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
                      }`}
                    >
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Freeze Card</h3>
                      <p className="text-sm text-gray-400">Temporarily disable this card</p>
                    </div>
                  </div>

                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isFrozen ? "bg-emerald-500" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isFrozen ? "translate-x-6" : "translate-x-0"}`} />
                  </div>
                </button>

                <button
                  onClick={() => setShowPin(!showPin)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">View PIN</h3>
                      <p className="text-sm text-gray-400">Show your 4-digit PIN</p>
                    </div>
                  </div>
                  <span className="font-mono text-lg tracking-widest">{showPin ? "8492" : "••••"}</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Limits & Controls</h3>
                      <p className="text-sm text-gray-400">Set spending limits</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <div className="w-2 h-2 border-t-2 border-r-2 border-white/50 rotate-45" />
                  </div>
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-bold mb-4">Security</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-medium text-emerald-400">Card is Secure</h3>
                  <p className="text-sm text-gray-400">No suspicious activity detected</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}