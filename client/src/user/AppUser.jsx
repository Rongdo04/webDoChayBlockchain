import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./layout/SiteLayout.jsx";
// Prefer richer user/page implementations where duplicates exist
import Home from "./pages/Home.jsx"; // advanced user home with loading states
import RecipesList from "./pages/RecipesList.jsx"; // upgraded user version
import RecipeDetail from "./pages/RecipeDetail.jsx"; // advanced detail
import SearchPage from "./pages/SearchPage.jsx";
import Community from "./pages/Community.jsx"; // advanced community with post composer & reports
import Profile from "./pages/Profile.jsx"; // advanced profile with tabs
// Placeholder dashboard reusing Profile for now (avoid redirect loop)
// Use advanced multi-step wizard under user/pages instead of legacy placeholder
import SubmitRecipe from "./pages/SubmitRecipe.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.jsx";
import ResetPasswordForm from "../components/auth/ResetPasswordForm.jsx";
import PersistLogin from "./guards/PersistLogin.jsx";
import RequireAuth from "./guards/RequireAuth.jsx";

// Đã thay thế Protected bằng RequireAuth + PersistLogin

export default function AppUser() {
  return (
    <Routes>
      {/* Auth namespace */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/register" element={<RegisterForm />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
      </Route>
      {/* Public site shell */}
      <Route
        path="/"
        element={
          <SiteLayout>
            <Home />
          </SiteLayout>
        }
      />
      <Route
        path="/recipes"
        element={
          <SiteLayout>
            <RecipesList />
          </SiteLayout>
        }
      />
      <Route
        path="/recipes/:slug"
        element={
          <SiteLayout>
            <RecipeDetail />
          </SiteLayout>
        }
      />
      <Route
        path="/search"
        element={
          <SiteLayout>
            <SearchPage />
          </SiteLayout>
        }
      />
      <Route
        path="/community"
        element={
          <SiteLayout>
            <Community />
          </SiteLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PersistLogin>
            <RequireAuth>
              <SiteLayout>
                <Profile />
              </SiteLayout>
            </RequireAuth>
          </PersistLogin>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PersistLogin>
            <RequireAuth>
              <SiteLayout>
                <Profile />
              </SiteLayout>
            </RequireAuth>
          </PersistLogin>
        }
      />
      <Route
        path="/submit"
        element={
          <PersistLogin>
            <RequireAuth>
              <SiteLayout>
                <SubmitRecipe />
              </SiteLayout>
            </RequireAuth>
          </PersistLogin>
        }
      />
      {/* 404 fallback inside user area */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
