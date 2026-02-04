import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowDownRight,
  Plus,
  Send,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";

import { useAccount } from "../contexts/AccountContext";
import { useAuth } from "../contexts/AuthContext";
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

// (still dummy chart for now — you said we’ll do C1/C2/C3 later)
const chartData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 4500 },
  { name: "Thu", value: 3200 },
  { name: "Fri", value: 5800 },
  { name: "Sat", value: 4900 },
  { name: "Sun", value: 6000 },
];

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

export function AccountWorkspace() {
  const { accountId } = useParams<{ accountId: string }>();
  const { accounts, setSelectedAccountId } = useAccount();
  const { initials } = useAuth();
  const navigate = useNavigate();

  const account = useMemo(() => accounts.find((a) => a.id === accountId), [accounts, accountId]);

  const [txs, setTxs] = useState<Tx[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) setSelectedAccountId(accountId);
  }, [accountId, setSelectedAccountId]);

  useEffect(() => {
    async function loadRecent() {
      if (!accountId) return;
      setTxLoading(true);
      setTxError(null);
      try {
        const res = await api<TxResponse>(`/transactions?accountId=${accountId}&limit=8`, { method: "GET" });
        setTxs(res.items ?? []);
      } catch (e) {
        setTxError(e instanceof Error ? e.message : "Failed to load transactions");
        setTxs([]);
      } finally {
        setTxLoading(false);
      }
    }
    loadRecent();
  }, [accountId]);

  if (!account) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <p>Account not found</p>
        <Button onClick={() => navigate("/dashboard")} className="ml-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const isPersonal = account.type === "Personal";
  const themeColor = isPersonal ? "emerald" : "blue";
  const themeHex = isPersonal ? "#10b981" : "#3b82f6";

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{account.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  isPersonal
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
              >
                {account.type}
              </span>
            </div>
            <p className="text-gray-400 font-mono text-sm">
              {account.accountNumber} • {account.currency}
            </p>
          </div>

          {/* b5: initials in the top-right avatar */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="font-bold text-sm">{initials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Available Balance"
            value={`${account.currencySymbol}${account.balance.toLocaleString()}`}
            trend="+2.5%"
            trendUp={true}
            icon={<Wallet className="w-6 h-6" />}
            color={themeColor === "emerald" ? "cyan" : "blue"}
            delay={0.1}
          />

          <StatCard
            title="Monthly Spending"
            value={`${account.currencySymbol}1,240.50`}
            trend="-4.2%"
            trendUp={true}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
            delay={0.2}
          />

          <StatCard
            title="Savings Goal"
            value={`${account.currencySymbol}8,400.00`}
            trend="Target: 10k"
            trendUp={true}
            icon={<PiggyBank className="w-6 h-6" />}
            color={themeColor === "emerald" ? "blue" : "cyan"}
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Spending Overview</h2>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-emerald-500 text-gray-300">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeHex} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={themeHex} stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      tickFormatter={(v) => `${account.currencySymbol}${v}`}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0f",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: themeHex }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={themeHex}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions (fix #4: Deposit + Withdraw go to the right pages) */}
          <div className="lg:col-span-1">
            <GlassCard className="h-full">
              <h2 className="text-lg font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Button
                  variant="primary"
                  fullWidth
                  className={`justify-start h-14 !text-white border-none ${
                    isPersonal
                      ? "!bg-emerald-500 hover:!bg-emerald-400 !shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "!bg-blue-600 hover:!bg-blue-500 !shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  }`}
                  onClick={() => navigate("/transfer")}
                >
                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-3">
                    <Send className="w-4 h-4" />
                  </div>
                  Transfer
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  className="justify-start h-14 !bg-white/10 hover:!bg-white/20 !text-white border-none"
                  onClick={() => navigate("/deposit")}
                >
                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-3">
                    <Plus className="w-4 h-4" />
                  </div>
                  Deposit
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start h-14 hover:!border-teal-400 hover:!text-teal-400 hover:!shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                  onClick={() => navigate("/withdraw")}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  Withdraw
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start h-14 hover:!border-teal-400 hover:!text-teal-400 hover:!shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                  onClick={() => navigate("/cards")}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  Cards
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Recent Transactions (REAL) */}
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              View All
            </Button>
          </div>

          {txError ? (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{txError}</div>
          ) : txLoading ? (
            <div className="text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-3">
              {txs.length === 0 && <div className="text-gray-400">No transactions yet for this account.</div>}

              {txs.map((tx) => {
                const isCredit = tx.amount > 0;
                const when = new Date(tx.createdAtUtc).toLocaleString();
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group"
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
                      {account.currencySymbol}
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