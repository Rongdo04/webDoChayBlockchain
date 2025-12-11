import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout.jsx";
import RouteGuard from "./components/RouteGuard.jsx";
import { AdminApiProvider } from "./contexts/AdminApiContext.jsx";
import { AdminErrorBoundary } from "./components/ErrorBoundary.jsx";
import Forbidden from "./pages/Forbidden.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RecipesPage from "./pages/Recipes.jsx";
import RecipeEditor from "./pages/RecipeEditor.jsx";
import PostsPage from "./pages/Posts.jsx";
import MediaLibrary from "./pages/MediaLibrary.jsx";
import TaxonomyPage from "./pages/Taxonomy.jsx";
import ModerationPage from "./pages/Moderation.jsx";
import ReportsPage from "./pages/Reports.jsx"; // added
import UsersPage from "./pages/Users.jsx"; // added
import SettingsPage from "./pages/Settings.jsx"; // added
import AdminApiTest from "./components/AdminApiTest.jsx"; // test component

// Temporary placeholder pages for each nav section
const Section = ({ title }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 text-emerald-900">{title}</h2>
    <p className="text-sm text-emerald-800/80">
      UI-only placeholder: {title} module đang được phát triển.
    </p>
  </div>
);

export default function AppAdmin() {
  return (
    <AdminErrorBoundary>
      <AdminApiProvider>
        <Routes>
          <Route path="/forbidden" element={<Forbidden />} />
          <Route
            path="/*"
            element={
              <RouteGuard>
                <AdminLayout />
              </RouteGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="recipes/new" element={<RecipeEditor />} />
            <Route path="recipes/:id/edit" element={<RecipeEditor />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="taxonomy" element={<TaxonomyPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="api-test" element={<AdminApiTest />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminApiProvider>
    </AdminErrorBoundary>
  );
}
