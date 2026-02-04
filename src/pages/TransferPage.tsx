import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Shield, CheckCircle2, UserRoundSearch } from "lucide-react";
import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";
import { useAccount } from "../contexts/AccountContext";
import { api } from "../lib/api";

type TransferResult = {
  correlationId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fromBalanceAfter: number;
  toBalanceAfter: number;
  createdAtUtc: string;
};

type RecipientAccountDto = { id: string; currency: string };
type RecipientResolveResponse = {
  email: string;
  emailMasked: string;
  accounts: RecipientAccountDto[];
};

function newIdempotencyKey(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type Mode = "my-accounts" | "other-user";

export function TransferPage() {
  const { accounts, currentAccount, refreshAccounts } = useAccount();

  // ---- common (From) ----
  const defaultFrom = currentAccount?.id ?? accounts[0]?.id ?? "";
  const [fromAccountId, setFromAccountId] = useState(defaultFrom);

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId),
    [accounts, fromAccountId]
  );

  // ---- mode ----
  const [mode, setMode] = useState<Mode>("my-accounts");

  // ---- internal (To = my accounts) ----
  const defaultTo = useMemo(() => {
    const other = accounts.find((a) => a.id !== defaultFrom);
    return other?.id ?? "";
  }, [accounts, defaultFrom]);

  const [toAccountId, setToAccountId] = useState(defaultTo);

  // ---- external (To = recipient accounts) ----
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipient, setRecipient] = useState<RecipientResolveResponse | null>(null);
  const [recipientToAccountId, setRecipientToAccountId] = useState<string>("");

  // For P2P, prefer an account in SAME currency as From (when possible)
  const recipientAccountsForCurrency = useMemo(() => {
    if (!recipient || !fromAccount) return [];
    return recipient.accounts.filter((a) => a.currency === fromAccount.currency);
  }, [recipient, fromAccount]);

  useEffect(() => {
    // keep From in sync when accounts load
    if (!fromAccountId && accounts.length) setFromAccountId(accounts[0].id);
  }, [accounts, fromAccountId]);

  useEffect(() => {
    // When recipient resolves, auto-pick a matching currency account if unique
    if (mode !== "other-user") return;

    if (recipientAccountsForCurrency.length === 1) {
      setRecipientToAccountId(recipientAccountsForCurrency[0].id);
    } else {
      setRecipientToAccountId("");
    }
  }, [mode, recipientAccountsForCurrency]);

  // ---- form state ----
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One idempotency key per attempt
  const [idemKey, setIdemKey] = useState<string>(() => newIdempotencyKey());

  async function resolveRecipient() {
    setError(null);
    setDone(null);
    setRecipient(null);
    setRecipientToAccountId("");

    const email = recipientEmail.trim();
    if (!email) {
      setError("Please enter a recipient email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api<RecipientResolveResponse>(`/recipients/resolve?email=${encodeURIComponent(email)}`, {
        method: "GET",
      });
      setRecipient(res);

      // If we can't find same-currency accounts, tell the user clearly
      if (fromAccount && res.accounts.every((a) => a.currency !== fromAccount.currency)) {
        setError(`Recipient has no ${fromAccount.currency} account. Choose a different 'From' account/currency.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve recipient");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    const amt = Number(amount);
    if (!fromAccountId) {
      setError("Please select a From account.");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be > 0.");
      return;
    }

    let finalToAccountId = "";

    if (mode === "my-accounts") {
      if (!toAccountId) {
        setError("Please select a To account.");
        return;
      }
      if (fromAccountId === toAccountId) {
        setError("From and To accounts must be different.");
        return;
      }
      finalToAccountId = toAccountId;
    } else {
      if (!recipient) {
        setError("Resolve a recipient first.");
        return;
      }
      if (!recipientToAccountId) {
        if (recipientAccountsForCurrency.length > 1) {
          setError("Recipient has multiple matching accounts. Please pick one.");
        } else {
          setError("Please select a recipient account.");
        }
        return;
      }
      finalToAccountId = recipientToAccountId;
    }

    setIsLoading(true);
    try {
      const res = await api<TransferResult>("/transactions/transfer", {
        method: "POST",
        idempotencyKey: idemKey,
        body: JSON.stringify({
          fromAccountId,
          toAccountId: finalToAccountId,
          amount: amt,
          description: description || null,
        }),
      });

      setDone(res);
      await refreshAccounts();

      setIdemKey(newIdempotencyKey());
      setAmount("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
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
              <ArrowRightLeft className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Transfer</h1>
              <p className="text-gray-400">Move money between your accounts or to another bank user</p>
            </div>
          </div>

          <GlassCard>
            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("my-accounts")}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  mode === "my-accounts"
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                My accounts
              </button>
              <button
                type="button"
                onClick={() => setMode("other-user")}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  mode === "other-user"
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Another user (same bank)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {done && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Transfer OK. CorrelationId: <span className="font-mono">{done.correlationId}</span>
                </div>
              )}

              {/* From */}
              <div>
                <label className="text-sm font-medium text-gray-300 ml-1">From account</label>
                <select
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50"
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currencySymbol}{a.balance.toFixed(2)} {a.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              {mode === "my-accounts" ? (
                <div>
                  <label className="text-sm font-medium text-gray-300 ml-1">To account</label>
                  <select
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                  >
                    {accounts
                      .filter((a) => a.id !== fromAccountId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.currencySymbol}{a.balance.toFixed(2)} {a.currency})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Input
                        label="Recipient email"
                        type="email"
                        placeholder="friend@bank.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={resolveRecipient} isLoading={isLoading} className="h-11">
                      <UserRoundSearch className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  </div>

                  {recipient && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm">
                      <div className="text-gray-300">
                        Recipient: <span className="font-medium text-white">{recipient.emailMasked}</span>
                      </div>

                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-300 ml-1">Recipient account</label>
                        <select
                          className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan/50"
                          value={recipientToAccountId}
                          onChange={(e) => setRecipientToAccountId(e.target.value)}
                        >
                          <option value="">Select…</option>
                          {(fromAccount ? recipientAccountsForCurrency : recipient.accounts).map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.currency} • {a.id.slice(0, 8)}…
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-gray-500 mt-2">
                          We prefer accounts matching the sender currency ({fromAccount?.currency ?? "unknown"}).
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                placeholder="e.g., rent"
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
                Send Transfer
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}