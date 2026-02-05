import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import { DepositPage } from "./pages/DepositPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { VerifyEmailSentPage } from "./pages/VerifyEmailSentPage";

import { PortfolioDashboard } from "./pages/PortfolioDashboard";
import { AccountWorkspace } from "./pages/AccountWorkspace";
import { TransactionsPage } from "./pages/TransactionsPage";
import { TransferPage } from "./pages/TransferPage";
import { CardsPage } from "./pages/CardsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OpenAccountPage } from "./pages/OpenAccountPage";

import { AccountProvider } from "./contexts/AccountContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AuthedLayout() {
  return (
    <AccountProvider>
      <Outlet />
    </AccountProvider>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/sent" element={<VerifyEmailSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthedLayout />}>
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/dashboard" element={<PortfolioDashboard />} />
            <Route path="/open-account" element={<OpenAccountPage />} />
            <Route path="/accounts/:accountId" element={<AccountWorkspace />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}