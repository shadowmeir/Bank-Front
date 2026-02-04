import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAccount } from "../contexts/AccountContext";

export function OpenAccountPage() {
  const navigate = useNavigate();
  const { createAccount, setSelectedAccountId } = useAccount();

  const [currency, setCurrency] = useState("ILS");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setIsLoading(true);
    try {
      const newId = await createAccount(currency.trim().toUpperCase());
      setSelectedAccountId(newId);
      navigate(`/accounts/${newId}`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Open New Account</h1>
          <p className="text-gray-400">
            Pick a currency and we’ll create a new account for you.
          </p>

          <p className="text-gray-500 text-sm mt-2">
            Note: your backend currently enforces “one account per currency per user”.
            If you try to create the same currency twice, you’ll get a conflict.
          </p>
        </header>

        <GlassCard className="max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 ml-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3
                           text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50"
              >
                <option value="ILS">ILS (₪)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                isLoading={isLoading}
                onClick={handleCreate}
                className="flex-1 shadow-glow-cyan"
              >
                Create Account
              </Button>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}