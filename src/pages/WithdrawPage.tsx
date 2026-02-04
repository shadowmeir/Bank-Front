import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, Shield, CheckCircle2 } from "lucide-react";
import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAccount } from "../contexts/AccountContext";
import { api } from "../lib/api";

type WithdrawResult = {
  ledgerEntryId: string;
  accountId: string;
  newBalance: number;
  correlationId: string;
};

function newIdempotencyKey(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function WithdrawPage() {
  const { accounts, currentAccount, setSelectedAccountId, refreshAccounts } = useAccount();

  const defaultAcc = currentAccount?.id ?? accounts[0]?.id ?? "";
  const [accountId, setAccountId] = useState(defaultAcc);

  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [idemKey, setIdemKey] = useState<string>(() => newIdempotencyKey());

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<WithdrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => accounts.find((a) => a.id === accountId), [accounts, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    const amt = Number(amount);
    if (!accountId) return setError("Please select an account.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Amount must be > 0.");

    setIsLoading(true);
    try {
      const res = await api<WithdrawResult>(`/accounts/${accountId}/withdraw`, {
        method: "POST",
        idempotencyKey: idemKey,
        body: JSON.stringify({
          amount: amt,
          description: description || null,
        }),
      });

      setDone(res);
      setIdemKey(newIdempotencyKey());
      setAmount("");
      setDescription("");

      setSelectedAccountId(accountId);
      await refreshAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />
      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Withdraw</h1>
              <p className="text-gray-400">Remove funds from an account</p>
            </div>
          </div>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {done && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Withdraw OK. New balance:{" "}
                  <span className="font-mono">
                    {selected?.currencySymbol ?? ""}{done.newBalance.toFixed(2)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-300 ml-1">Account</label>
                <select
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currencySymbol}{a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <Input
                label="Description (optional)"
                placeholder="e.g., ATM"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Shield className="w-5 h-5 text-neon-cyan mt-0.5" />
                <div className="text-sm text-gray-300">
                  <div className="font-medium text-white">Idempotency-Key</div>
                  <div className="font-mono break-all text-gray-400">{idemKey}</div>
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} className="shadow-glow-cyan">
                Withdraw
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}