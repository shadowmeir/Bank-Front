import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAccount } from "../contexts/AccountContext";
import { api } from "../lib/api";

type LedgerEntryType = "Deposit" | "Withdraw" | "TransferOut" | "TransferIn";

type Tx = {
  id: string;
  amount: number;
  type: LedgerEntryType;
  correlationId: string;
  counterpartyAccountId: string | null;
  idempotencyKey: string;
  description: string | null;
  createdAtUtc: string;
};

type TxResponse = {
  accountId: string;
  items: Tx[];
};

function niceType(t: LedgerEntryType) {
  switch (t) {
    case "Deposit":
      return "Deposit";
    case "Withdraw":
      return "Withdraw";
    case "TransferIn":
      return "Transfer In";
    case "TransferOut":
      return "Transfer Out";
  }
}

export function TransactionsPage() {
  const { accounts, selectedAccountId, setSelectedAccountId } = useAccount();

  const account = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  const [items, setItems] = useState<Tx[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAccountId && accounts.length) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId]);

  useEffect(() => {
    async function load() {
      if (!selectedAccountId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api<TxResponse>(`/transactions?accountId=${selectedAccountId}&limit=100`, {
          method: "GET",
        });
        setItems(res.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedAccountId]);

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />
      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-neon-cyan" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Transactions</h1>
              <p className="text-gray-400">Your recent ledger entries</p>
            </div>

            <div className="min-w-[260px]">
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan/50 text-gray-200"
                value={selectedAccountId ?? ""}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currencySymbol}{a.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <GlassCard>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-gray-400">Loading…</div>
            ) : (
              <div className="space-y-3">
                {items.length === 0 && (
                  <div className="text-gray-400">No transactions yet for this account.</div>
                )}

                {items.map((tx) => {
                  const isCredit = tx.amount > 0;
                  const when = new Date(tx.createdAtUtc).toLocaleString();
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {niceType(tx.type)}{" "}
                          {tx.description ? <span className="text-gray-400">• {tx.description}</span> : null}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {when} • corr: {tx.correlationId.slice(0, 8)}…
                        </div>
                      </div>

                      <div className={`font-bold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                        {account?.currencySymbol ?? ""}
                        {tx.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}