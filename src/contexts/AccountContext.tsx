import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

export type AccountType = "Personal" | "Joint";

export interface Account {
  id: string;

  // UI fields (MagicPatterns expects these)
  name: string;
  type: AccountType;
  currency: string;
  currencySymbol: string;
  balance: number;
  accountNumber: string;
  color: "emerald" | "blue";
}

type AccountContextType = {
  accounts: Account[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  currentAccount: Account | undefined;

  // NEW
  refreshAccounts: () => Promise<void>;
  createAccount: (currency: string) => Promise<string>; // returns new accountId
};

type ApiAccount = {
  id?: string;
  accountId?: string;
  currency?: string;
  balance?: number;
  balanceCached?: number;
};

type CreateAccountResponse = {
  accountId: string;
  currency: string;
  balance: number;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

function symbolForCurrency(currency: string): string {
  switch (currency.toUpperCase()) {
    case "ILS":
      return "₪";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currency.toUpperCase() + " ";
  }
}

function maskAccountNumber(id: string): string {
  // Not real banking number — just UI masking from GUID
  const last4 = id.replace(/-/g, "").slice(-4).toUpperCase();
  return `****${last4}`;
}

function mapApiToUi(accounts: ApiAccount[]): Account[] {
  return accounts
    .map((a, idx) => {
      const id = a.id ?? a.accountId ?? "";
      const currency = (a.currency ?? "ILS").toUpperCase();
      const balance = a.balance ?? a.balanceCached ?? 0;

      return {
        id,
        name: `${currency} Account`,
        type: "Personal",
        currency,
        currencySymbol: symbolForCurrency(currency),
        balance: Number(balance),
        accountNumber: maskAccountNumber(id),
        color: idx % 2 === 0 ? "emerald" : "blue",
      } as Account;
    })
    .filter((x) => !!x.id);
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, _setSelectedAccountId] = useState<string | null>(
    localStorage.getItem("bank_selected_account_id")
  );

  const setSelectedAccountId = useCallback((id: string | null) => {
    _setSelectedAccountId(id);
    if (id) localStorage.setItem("bank_selected_account_id", id);
    else localStorage.removeItem("bank_selected_account_id");
  }, []);

  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  const refreshAccounts = useCallback(async () => {
    // Your backend convention (we used it in comments earlier)
    const list = await api<ApiAccount[]>("/accounts/mine", { method: "GET" });
    const ui = mapApiToUi(list);
    setAccounts(ui);

    // If the selected account no longer exists, reset selection
    if (selectedAccountId && !ui.some((a) => a.id === selectedAccountId)) {
      setSelectedAccountId(null);
    }
  }, [selectedAccountId, setSelectedAccountId]);

  const createAccount = useCallback(
    async (currency: string) => {
      const res = await api<CreateAccountResponse>("/accounts", {
        method: "POST",
        body: JSON.stringify({ currency }),
      });

      // refresh list so UI gets the new account
      await refreshAccounts();

      return res.accountId;
    },
    [refreshAccounts]
  );

  // Load accounts on mount
  useEffect(() => {
    refreshAccounts().catch(() => {
      // If this fails (e.g. token expired), we keep accounts empty.
      // ProtectedRoute should handle redirect if not authed.
      setAccounts([]);
    });
  }, [refreshAccounts]);

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        setSelectedAccountId,
        currentAccount,
        refreshAccounts,
        createAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within an AccountProvider");
  return ctx;
}