import React from "react";
import SettingsForm from "../components/SettingsForm.jsx";
import { t } from "../../i18n";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
            {t("nav.settings")}
          </h1>
          <p className="text-xs text-emerald-800/70">
            {t("settings.branding")}
          </p>
        </div>
      </div>
      <SettingsForm />
    </div>
  );
}
