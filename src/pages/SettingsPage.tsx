import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Monitor,
  LogOut,
Camera,
} from "lucide-react";

import { Sidebar } from "../components/ui/Sidebar";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Toggle } from "../components/ui/Toggle";
import { Switch } from "../components/ui/Switch";
import { AnimatedOrbs } from "../components/ui/AnimatedOrbs";

import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type SettingsSection = "personal" | "security" | "notifications" | "appearance" | "cards" | "language";

export function SettingsPage() {
  const { profile, initials, displayName, refreshProfile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Left-nav section selection (original UI behavior)
  const [activeSection, setActiveSection] = useState<SettingsSection>("personal");

  // ====== Personal info (REAL backend-backed fields) ======
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ====== Original UI-only preferences (kept as-is) ======
  const [accountVisibility, setAccountVisibility] = useState("private");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showBalanceOnHome, setShowBalanceOnHome] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [appTheme, setAppTheme] = useState("dark");

  const settingsNav = useMemo(
    () => [
      { id: "personal" as const, label: "Personal Info", icon: <User className="w-5 h-5" /> },
      { id: "security" as const, label: "Security", icon: <Shield className="w-5 h-5" /> },
      { id: "notifications" as const, label: "Notifications", icon: <Bell className="w-5 h-5" /> },
      { id: "appearance" as const, label: "Appearance", icon: <Palette className="w-5 h-5" /> },
      { id: "cards" as const, label: "Cards", icon: <CreditCard className="w-5 h-5" /> },
      { id: "language" as const, label: "Language", icon: <Globe className="w-5 h-5" /> },
    ],
    []
  );

  // Ensure fresh profile on entry
  useEffect(() => {
    refreshProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bind form fields to loaded profile
  useEffect(() => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setPhoneNumber(profile?.phoneNumber ?? "");
    setAddress(profile?.address ?? "");
  }, [profile]);

  async function onSavePersonalInfo() {
    setErr(null);
    setMsg(null);
    setIsSaving(true);
    try {
      await updateProfile({ firstName, lastName, phoneNumber, address });
      setMsg("Saved ✅");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  function onSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex">
      <AnimatedOrbs />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 p-4 z-20 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 z-10 overflow-y-auto h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and security</p>
          </div>

          {/* Profile + Actions (original UI) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="font-bold">{initials}</span>
                  </div>
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center text-black hover:bg-cyan-300 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="hidden sm:block">
                <h3 className="font-bold">{displayName}</h3>
                <p className="text-sm text-gray-400">{profile?.email ?? ""}</p>
              </div>
            </div>
            {/* b6: This is the SIGN OUT button you asked about — now wired */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-red-500/30 text-red-300 hover:!border-red-400 hover:!text-red-200 hover:bg-red-500/10"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <GlassCard className="!p-4">
              <nav className="space-y-2">
                {settingsNav.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </GlassCard>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status banners */}
            {err && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {err}
              </div>
            )}
            {msg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
                {msg}
              </div>
            )}

            {/* Personal Info */}
            {activeSection === "personal" && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  <Input label="Email (read only)" value={profile?.email ?? ""} disabled />
                </div>

                <div className="mt-4">
                  <Input
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, city, country"
                  />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button fullWidth isLoading={isSaving} className="shadow-glow-cyan" onClick={onSavePersonalInfo}>
                    Save changes
                  </Button>

                  {/* Optional: keep a sign out also here (doesn’t remove other settings UI) */}
                  <Button
                    fullWidth
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:!border-red-400 hover:!text-red-200 hover:bg-red-500/10"
                    onClick={onSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Security Settings (original UI kept) */}
            {activeSection === "security" && (
              <>
                <GlassCard>
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Account Visibility</h3>
                      <Toggle
                        options={[
                          { value: "private", label: "Private" },
                          { value: "friends", label: "Friends" },
                          { value: "public", label: "Public" },
                        ]}
                        value={accountVisibility}
                        setValue={setAccountVisibility}
                      />
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Authentication</h3>
                      <div className="space-y-3">
                        <Switch
                          label="Two-Factor Authentication"
                          description="Add an extra layer of security to your account"
                          checked={twoFactorEnabled}
                          onChange={setTwoFactorEnabled}
                        />
                        <Switch
                          label="Biometric Authentication"
                          description="Use fingerprint or Face ID to sign in"
                          checked={biometricEnabled}
                          onChange={setBiometricEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-xl font-bold mb-6">Password</h2>

                  <div className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />

                    <Button variant="primary" className="mt-2">
                      Update Password
                    </Button>
                  </div>
                </GlassCard>
              </>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>

                <div className="space-y-4">
                  <Switch
                    label="Show Balance on Dashboard"
                    description="Display your total balance on the home screen"
                    checked={showBalanceOnHome}
                    onChange={setShowBalanceOnHome}
                  />
                  <Switch
                    label="Transaction Alerts"
                    description="Receive notifications for every transaction"
                    checked={transactionAlerts}
                    onChange={setTransactionAlerts}
                  />
                  <Switch
                    label="Marketing Emails"
                    description="Get updates about new features and promotions"
                    checked={marketingEmails}
                    onChange={setMarketingEmails}
                  />
                </div>
              </GlassCard>
            )}

            {/* Appearance */}
            {activeSection === "appearance" && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Appearance</h2>

                <div>
                  <h3 className="font-medium mb-3">Theme</h3>
                  <Toggle
                    options={[
                      { value: "dark", label: "Dark" },
                      { value: "light", label: "Light" },
                      { value: "system", label: "System" },
                    ]}
                    value={appTheme}
                    setValue={setAppTheme}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      appTheme === "dark" ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-white/10 bg-white/5"
                    }`}
                    onClick={() => setAppTheme("dark")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4" />
                      <span className="font-medium">Dark</span>
                    </div>
                    <div className="h-10 rounded bg-black/50 border border-white/10" />
                  </div>

                  <div
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      appTheme === "light" ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-white/10 bg-white/5"
                    }`}
                    onClick={() => setAppTheme("light")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4" />
                      <span className="font-medium">Light</span>
                    </div>
                    <div className="h-10 rounded bg-white/70 border border-white/10" />
                  </div>

                  <div
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      appTheme === "system" ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-white/10 bg-white/5"
                    }`}
                    onClick={() => setAppTheme("system")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4" />
                      <span className="font-medium">System</span>
                    </div>
                    <div className="h-10 rounded bg-white/10 border border-white/10" />
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Cards (placeholder section, preserved) */}
            {activeSection === "cards" && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Cards</h2>
                <p className="text-gray-400">
                  Card services are not implemented yet — but the UI remains intact.
                </p>
              </GlassCard>
            )}

            {/* Language (placeholder section, preserved) */}
            {activeSection === "language" && (
              <GlassCard>
                <h2 className="text-xl font-bold mb-6">Language</h2>
                <p className="text-gray-400">Language selection UI stays here (not wired yet).</p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Mobile-only Sign out (kept) */}
        <div className="sm:hidden mt-6">
          <Button
            fullWidth
            variant="outline"
            className="border-red-500/30 text-red-300 hover:!border-red-400 hover:!text-red-200 hover:bg-red-500/10"
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}