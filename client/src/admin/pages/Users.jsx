import React from "react";
import UsersTable from "../components/UsersTable.jsx";
import { t } from "../../i18n";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
            {t("nav.users")}
          </h1>
          <p className="text-xs text-emerald-800/70">{t("users.manage")}</p>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
