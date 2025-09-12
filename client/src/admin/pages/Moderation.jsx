import React from "react";
import ModerationQueue_fixed from "../components/ModerationQueue_fixed.jsx";
import { t } from "../../i18n";

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
            {t("nav.moderation")}
          </h1>
          <p className="text-xs text-emerald-800/70">
            {t(
              "moderation.reviewDesc",
              "Xem xét và quản lý nội dung cộng đồng."
            )}
          </p>
        </div>
      </div>
      <ModerationQueue_fixed />
    </div>
  );
}
