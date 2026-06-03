"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, projectsAPI } from "@/lib/api";

type Kpi = {
  projet: string;
  taux_avancement: number;
  spi: number;
  cpi: number;
  total_taches: number;
  taches_terminees: number;
  budget_prevu: number;
  budget_reel: number;
  taux_non_conformite: number;
};

function indexState(v: number): { tone: string; label: string } {
  if (v >= 1) return { tone: "var(--color-teal)", label: "Bon" };
  if (v >= 0.9) return { tone: "var(--color-amber)", label: "À surveiller" };
  return { tone: "var(--color-risk)", label: "En retard" };
}

function IndexRail({ label, value }: { label: string; value: number }) {
  const s = indexState(value);
  // map 0.6..1.2 onto 0..100% for the rail
  const pct = Math.max(0, Math.min(100, ((value - 0.6) / 0.6) * 100));
  return (
    <div className="rounded-lg border border-hairline bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-[0.04em] text-graphite-500">{label}</span>
        <span className="text-xs font-medium" style={{ color: s.tone }}>{s.label}</span>
      </div>
      <p className="tnum mt-2 text-3xl font-semibold text-graphite-700">{value.toFixed(2)}</p>
      <div className="relative mt-4 h-2 rounded-full" style={{ background: "var(--color-inset)" }}>
        {/* baseline marker at 1.0 */}
        <div className="absolute top-[-3px] bottom-[-3px] w-px" style={{ left: `${((1 - 0.6) / 0.6) * 100}%`, background: "var(--color-baseline)" }} />
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.tone }} />
      </div>
      <p className="mt-2 text-[11px] text-graphite-400">Seuil de référence : 1.00</p>
    </div>
  );
}

export default function KpiPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    projectsAPI
      .getKpi(id)
      .then((data: Kpi) => setKpi(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const ecartBudget = kpi ? kpi.budget_prevu - kpi.budget_reel : 0;

  return (
    <div style={{ maxWidth: 1000 }}>
      <Link href={`/projects/${id}`} className="text-sm text-teal-700 hover:underline">
        ← Retour au projet
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-graphite-700">Indicateurs (KPI)</h1>

      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {error && <p className="mt-6 text-sm text-risk">{error}</p>}

      {!loading && !error && kpi && (
        <>
          <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <IndexRail label="SPI (délai)" value={kpi.spi} />
            <IndexRail label="CPI (coût)" value={kpi.cpi} />
          </div>

          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {[
              { l: "Avancement", v: `${kpi.taux_avancement}%` },
              { l: "Tâches terminées", v: `${kpi.taches_terminees}/${kpi.total_taches}` },
              { l: "Non-conformité", v: `${kpi.taux_non_conformite}%` },
              { l: "Écart budget", v: `${ecartBudget.toFixed(2)} MAD` },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
                <p className="tnum mt-2 text-xl font-semibold text-graphite-700">{c.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div className="rounded-lg border border-hairline bg-card p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">Budget prévu</p>
              <p className="tnum mt-2 text-xl font-semibold text-graphite-700">{kpi.budget_prevu.toFixed(2)} MAD</p>
            </div>
            <div className="rounded-lg border border-hairline bg-card p-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">Budget réel</p>
              <p className="tnum mt-2 text-xl font-semibold text-graphite-700">{kpi.budget_reel.toFixed(2)} MAD</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}