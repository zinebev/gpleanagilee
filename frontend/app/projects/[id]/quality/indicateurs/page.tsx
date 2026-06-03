"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, ncAPI } from "@/lib/api";

type NC = {
  id: number;
  projet: number;
  gravite: "faible" | "moyenne" | "elevee";
  statut: "ouverte" | "en_cours" | "resolue";
};

export default function IndicateursQualitePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [items, setItems] = useState<NC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    ncAPI
      .getAll()
      .then((data: NC[]) => setItems((Array.isArray(data) ? data : []).filter((n) => n.projet === projectId)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const s = useMemo(() => {
    const total = items.length;
    const resolue = items.filter((n) => n.statut === "resolue").length;
    const ouverte = items.filter((n) => n.statut === "ouverte").length;
    const elevee = items.filter((n) => n.gravite === "elevee").length;
    const taux = total > 0 ? Math.round((resolue / total) * 100) : 0;
    return { total, resolue, ouverte, elevee, taux };
  }, [items]);

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        Retour au projet
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-graphite-700">Indicateurs qualite</h1>

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}

      {!loading && (
        <>
          <div className="mt-6 rounded-lg border border-hairline bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-graphite-700">Taux de resolution</span>
              <span className="tnum text-sm font-semibold text-teal-700">{s.taux}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full" style={{ background: "var(--color-inset)" }}>
              <div className="h-full rounded-full" style={{ width: `${s.taux}%`, background: "var(--color-teal)" }} />
            </div>
          </div>

          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {[
              { l: "Total NC", v: s.total, tone: "text-graphite-700" },
              { l: "Resolues", v: s.resolue, tone: "text-teal-700" },
              { l: "Ouvertes", v: s.ouverte, tone: "text-risk" },
              { l: "Gravite elevee", v: s.elevee, tone: "text-amber-700" },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
                <p className={`tnum mt-2 text-2xl font-semibold ${c.tone}`}>{c.v}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
