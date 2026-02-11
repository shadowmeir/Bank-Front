import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Send,
  CreditCard,
  Settings,
  LogOut,
  Home,
  Plus,
  ArrowDownRight,
} from "lucide-react";

import { GlassCard } from "./GlassCard";
import { Chatbot } from "./Chatbot";
import { AccountSwitcher } from "./AccountSwitcher";
import { useAccount } from "../../contexts/AccountContext";
import { useAuth } from "../../contexts/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAccount, setSelectedAccountId } = useAccount();
  const { logout } = useAuth();

  const links = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Portfolio Overview",
    },

    ...(currentAccount
      ? [
          {
            path: `/accounts/${currentAccount.id}`,
            icon: <Home className="w-5 h-5" />,
            label: "Account Home",
          },
        ]
      : []),
    {
      path: "/transactions",
      icon: <ArrowRightLeft className="w-5 h-5" />,
      label: "Transactions",
    },
    {
      path: "/deposit",
      icon: <Plus className="w-5 h-5" />,
      label: "Deposit",
    },
    {
      path: "/withdraw",
      icon: <ArrowDownRight className="w-5 h-5" />,
      label: "Withdraw",
    },
    {
      path: "/transfer",
      icon: <Send className="w-5 h-5" />,
      label: "Transfer",
    },
    {
      path: "/cards",
      icon: <CreditCard className="w-5 h-5" />,
      label: "Cards",
    },
    {
      path: "/open-account",
      icon: <Plus className="w-5 h-5" />,
      label: "Open Account",
    },
    {
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
    },
  ];

  function handleLogout() {
    setSelectedAccountId(null);
    logout();
    navigate("/login", { replace: true });
  }

  const isActivePath = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <>
      <GlassCard className="h-full flex flex-col !p-4 !rounded-xl">
        <div className="flex items-center gap-2 px-4 py-4 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg shadow-glow-cyan" />
          <span className="text-xl font-bold tracking-tight">NEOBANK</span>
        </div>

        <AccountSwitcher />

        <nav className="flex-1 space-y-2 mt-4">
          {links.map((link) => {
            const active = isActivePath(link.path);

            const classes = `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full
              ${
                active
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `;

            return (
              <Link key={link.path} to={link.path} className={classes}>
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </GlassCard>

      {/* Floating chatbot widget (fixed positioning) */}
      <Chatbot />
    </>
  );
}
