import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Zap, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";

import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAccount } from "../contexts/AccountContext";
import { AccountCard } from "../components/ui/AccountCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";

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

function iconForType(t: LedgerEntryType) {
  switch (t) {
    case "Deposit":
      return <ArrowDownRight className="w-5 h-5" />;
    case "Withdraw":
      return <ArrowUpRight className="w-5 h-5" />;
    case "TransferIn":
    case "TransferOut":
      return <ArrowRightLeft className="w-5 h-5" />;
  }
}

export function PortfolioDashboard() {
  const { accounts, setSelectedAccountId } = useAccount();
  const { initials } = useAuth();
  const navigate = useNavigate();

  const totalBalance = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  const currencySymbol = accounts[0]?.currencySymbol ?? "₪";

  const [recent, setRecent] = useState<(Tx & { accountName: string; currencySymbol: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Portfolio view => no single account selected
  useEffect(() => {
    setSelectedAccountId(null);
  }, [setSelectedAccountId]);

  useEffect(() => {
    async function loadMergedRecent() {
      if (!accounts.length) return;
      setLoading(true);
      setErr(null);

      try {
        const results = await Promise.all(
          accounts.map(async (a) => {
            const res = await api<TxResponse>(`/transactions?accountId=${a.id}&limit=5`, { method: "GET" });
            return (res.items ?? []).map((tx) => ({
              ...tx,
              accountName: a.name,
              currencySymbol: a.currencySymbol,
            }));
          })
        );

        const merged = results.flat().sort((x, y) => {
          const ax = Date.parse(x.createdAtUtc);
          const ay = Date.parse(y.createdAtUtc);
          return ay - ax;
        });

        setRecent(merged.slice(0, 10));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load recent activity");
        setRecent([]);
      } finally {
        setLoading(false);
      }
    }

    loadMergedRecent();
  }, [accounts]);

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
    navigate(`/accounts/${accountId}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Portfolio Overview</h1>
            <p className="text-gray-400">All your accounts in one place.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-400">Total Net Worth</p>
              <p className="text-xl font-bold text-white">
                {currencySymbol}
                {totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="font-bold text-sm">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onClick={() => handleAccountClick(account.id)} />
          ))}
        </div>

        {/* Recent Activity (REAL merged) — no useless quick actions */}
        <GlassCard className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              View All
            </Button>
          </div>

          {err ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{err}</div>
          ) : loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-3">
              {recent.length === 0 && <div className="text-gray-400">No activity yet.</div>}

              {recent.map((tx) => {
                const isCredit = tx.amount > 0;
                const when = new Date(tx.createdAtUtc).toLocaleString();
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${
                          isCredit ? "text-emerald-400" : "text-gray-200"
                        } group-hover:scale-110 transition-transform`}
                      >
                        {iconForType(tx.type)}
                      </div>

                      <div>
                        <h3 className="font-medium text-white">
                          {niceType(tx.type)}{" "}
                          {tx.description ? <span className="text-gray-400">• {tx.description}</span> : null}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {when} • <span className="text-neon-cyan/70">{tx.accountName}</span>
                        </p>
                      </div>
                    </div>

                    <div className={`font-bold ${isCredit ? "text-emerald-400" : "text-white"}`}>
                      {tx.currencySymbol}
                      {tx.amount.toFixed(2)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}