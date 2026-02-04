import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, setToken } from "../lib/api";

export type UserProfile = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  address: string | null;
};

type AuthResponse = { accessToken: string };

// When email verification is enabled, the API might refuse to issue a JWT
// until the user confirms their email.
type RegisterResponse =
  | AuthResponse
  | { requiresEmailConfirmation: true; email: string };

export type RegisterResult =
  | { status: "authed" }
  | { status: "verify"; email: string };

type AuthContextValue = {
  accessToken: string | null;
  isAuthed: boolean;

  profile: UserProfile | null;
  displayName: string;
  initials: string;

  login(email: string, password: string): Promise<void>;
  register(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
	}): Promise<RegisterResult>;

	// Email verification helpers (no-op unless the backend exposes these endpoints)
	resendEmailConfirmation(email: string): Promise<void>;
	confirmEmail(userId: string, token: string): Promise<void>;

  refreshProfile(): Promise<void>;
  updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<void>;

  logout(): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function computeDisplayName(p: UserProfile | null): string {
  if (!p) return "";
  const fn = (p.firstName ?? "").trim();
  const ln = (p.lastName ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  return full || p.email || "User";
}

function computeInitials(p: UserProfile | null): string {
  if (!p) return "??";
  const fn = (p.firstName ?? "").trim();
  const ln = (p.lastName ?? "").trim();
  if (fn || ln) {
    const a = fn ? fn[0] : "";
    const b = ln ? ln[0] : "";
    return (a + b).toUpperCase() || "??";
  }
  // fallback: email
  const e = (p.email ?? "").trim();
  return (e.slice(0, 2).toUpperCase() || "??");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    localStorage.getItem("bank_access_token")
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const isAuthed = !!accessToken;

  async function refreshProfile() {
    if (!accessToken) {
      setProfile(null);
      return;
    }
    const p = await api<UserProfile>("/users/me", { method: "GET" });
    setProfile(p);
  }

  async function login(email: string, password: string) {
    const res = await api<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });

    setToken(res.accessToken);
    setAccessTokenState(res.accessToken);

    // Immediately fetch user profile using the new token
    const p = await api<UserProfile>("/users/me", { method: "GET" });
    setProfile(p);
  }

  async function register(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) {
    const res = await api<RegisterResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    });

    // If the API issues a JWT immediately (verification off), behave like before.
    if ("accessToken" in res && typeof res.accessToken === "string" && res.accessToken.length > 0) {
      setToken(res.accessToken);
      setAccessTokenState(res.accessToken);

      const p = await api<UserProfile>("/users/me", { method: "GET" });
      setProfile(p);
      return { status: "authed" } as const;
    }

    // Verification ON: no JWT yet.
    const email = ("email" in res && res.email) ? res.email : payload.email;
    return { status: "verify", email } as const;
  }

  async function resendEmailConfirmation(email: string) {
    await api<void>("/auth/resend-confirmation", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    });
  }

  async function confirmEmail(userId: string, token: string) {
    const q = new URLSearchParams({ userId, token });
    await api<void>(`/auth/confirm-email?${q.toString()}`, {
      method: "GET",
      auth: false,
    });
  }

  async function updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
  }) {
    const p = await api<UserProfile>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setProfile(p);
  }

  function logout() {
    clearToken();
    setAccessTokenState(null);
    setProfile(null);
  }

  // On refresh (page reload), if token exists — load profile once
  useEffect(() => {
    if (!accessToken) return;
    refreshProfile().catch(() => {
      // Token might be stale → treat as logged out
      logout();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      accessToken,
      isAuthed,
      profile,
      displayName: computeDisplayName(profile),
      initials: computeInitials(profile),
      login,
      register,
      resendEmailConfirmation,
      confirmEmail,
      refreshProfile,
      updateProfile,
      logout,
    };
  }, [accessToken, isAuthed, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}