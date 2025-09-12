/** Taxonomy Page
 * Renders categories & tags management using TaxonomyList with API integration
 */
import React from "react";
import TaxonomyList from "../components/TaxonomyList.jsx";
import { t } from "../../i18n";

export default function TaxonomyPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-emerald-900">
          {t("nav.taxonomy")}
        </h2>
        <p className="text-xs text-emerald-800/70">{t("taxonomy.manage")}</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
            {t("taxonomy.categories")}
          </h3>
          <TaxonomyList type="categories" />
        </section>
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
            {t("taxonomy.tags")}
          </h3>
          <TaxonomyList type="tags" />
        </section>
      </div>
    </div>
  );
}
