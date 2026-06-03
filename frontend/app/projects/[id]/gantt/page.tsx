"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, tasksAPI } from "@/lib/api";

type Tache = {
  id: number;
  projet: number;
  titre: string;
  statut: "todo" | "en_cours" | "done";
  date_debut?: string;
  date_fin?: string;
};

const tone: Record<string, string> = {
  todo: "var(--color-baseline)",
  en_cours: "var(--color-amber)",
  done: "var(--color-teal)",
};
const toneSoft: Record<string, string> = {
  todo: "rgba(183,192,198,0.18)",
  en_cours: "rgba(217,138,11,0.12)",
  done: "rgba(14,124,114,0.12)",
};
const statutLabel: Record<string, string> = { todo: "A faire", en_cours: "En cours", done: "Termine" };

const DAY = 86400000;
const parse = (d?: string) => {
  if (!d) return null;
  const t = new Date(d).getTime();
  return isNaN(t) ? null : t;
};

export default function GanttPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    tasksAPI
      .getAll()
      .then((data: Tache[]) => setTaches((Array.isArray(data) ? data : []).filter((t) => t.projet === projectId)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    load();
  }, [projectId, router]);

  const updateDate = async (t: Tache, field: "date_debut" | "date_fin", value: string) => {
    setTaches((prev) => prev.map((x) => (x.id === t.id ? { ...x, [field]: value } : x)));
    try {
      await tasksAPI.update(t.id, { [field]: value });
    } catch {
      setError("Mise a jour impossible");
      load();
    }
  };

  const { min, span, months, dated, todayPct } = useMemo(() => {
    const dated = taches.filter((t) => parse(t.date_debut) && parse(t.date_fin));
    if (dated.length === 0) return { min: 0, span: 1, months: [] as { label: string; pct: number }[], dated, todayPct: -1 };
    const starts = dated.map((t) => parse(t.date_debut)!);
    const ends = dated.map((t) => parse(t.date_fin)!);
    let min = Math.min(...starts) - 5 * DAY;
    let max = Math.max(...ends) + 5 * DAY;
    const span = max - min || 1;
    const months: { label: string; pct: number }[] = [];
    const d = new Date(min);
    d.setDate(1);
    while (d.getTime() < max) {
      const pct = ((d.getTime() - min) / span) * 100;
      if (pct >= -2 && pct <= 100) months.push({ label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), pct });
      d.setMonth(d.getMonth() + 1);
    }
    const now = Date.now();
    const todayPct = now >= min && now <= max ? ((now - min) / span) * 100 : -1;
    return { min, span, months, dated, todayPct };
  }, [taches]);

  const durationDays = (s: number, e: number) => Math.max(1, Math.round((e - s) / DAY));

  return (
    <div style={{ maxWidth: 1150 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">Retour au projet</Link>
      <h1 className="mt-4 text-2xl font-semibold text-graphite-700">Diagramme de Gantt</h1>
      <p className="mt-1 text-sm text-graphite-500">Cliquez sur les dates pour ajuster le planning de chaque tache.</p>

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && taches.length === 0 && (
        <p className="mt-6 text-sm text-graphite-500">Aucune tache. Ajoutez-en dans le Backlog ou le Kanban.</p>
      )}

      {!loading && taches.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-hairline" style={{ background: "var(--color-card)", boxShadow: "0 4px 12px rgba(17,24,28,0.06)" }}>
          {/* header */}
          <div className="flex items-stretch border-b border-hairline" style={{ background: "var(--color-inset)" }}>
            <div className="w-64 shrink-0 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-graphite-500">Tache</div>
            <div className="relative flex-1">
              {months.map((m, i) => (
                <span key={i} className="absolute top-3 text-[11px] font-medium text-graphite-500" style={{ left: `calc(${m.pct}% + 6px)` }}>{m.label}</span>
              ))}
            </div>
          </div>

          {/* rows */}
          {taches.map((t, idx) => {
            const s = parse(t.date_debut);
            const e = parse(t.date_fin);
            const hasBar = s !== null && e !== null && dated.length > 0;
            const left = hasBar ? ((s! - min) / span) * 100 : 0;
            const width = hasBar ? Math.max(((e! - s!) / span) * 100, 2) : 0;
            const days = hasBar ? durationDays(s!, e!) : 0;
            return (
              <div key={t.id} className="flex items-stretch border-b border-hairline last:border-0">
                {/* left panel */}
                <div className="w-64 shrink-0 px-5 py-3" style={{ background: idx % 2 ? "var(--color-inset)" : "transparent" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tone[t.statut] }} />
                    <p className="truncate text-sm font-medium text-graphite-700">{t.titre}</p>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <input type="date" value={t.date_debut ? t.date_debut.slice(0, 10) : ""} onChange={(ev) => updateDate(t, "date_debut", ev.target.value)} className="w-[108px] rounded-md border border-hairline bg-card px-1.5 py-1 text-[11px] text-graphite-700" />
                    <input type="date" value={t.date_fin ? t.date_fin.slice(0, 10) : ""} onChange={(ev) => updateDate(t, "date_fin", ev.target.value)} className="w-[108px] rounded-md border border-hairline bg-card px-1.5 py-1 text-[11px] text-graphite-700" />
                  </div>
                </div>
                {/* track */}
                <div className="relative flex-1" style={{ minHeight: 64, background: idx % 2 ? "var(--color-inset)" : "transparent" }}>
                  {months.map((m, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${m.pct}%`, background: "var(--color-hairline)" }} />
                  ))}
                  {todayPct >= 0 && (
                    <div className="absolute top-0 bottom-0 w-px" style={{ left: `${todayPct}%`, background: "var(--color-risk)", opacity: 0.5 }} title="Aujourd'hui" />
                  )}
                  {hasBar ? (
                    <div
                      className="absolute top-1/2 flex h-7 -translate-y-1/2 items-center rounded-lg px-2"
                      style={{ left: `${left}%`, width: `${width}%`, background: tone[t.statut], boxShadow: "0 2px 4px rgba(17,24,28,0.15)" }}
                      title={`${statutLabel[t.statut]} - ${days} jour(s)`}
                    >
                      <span className="truncate text-[11px] font-medium" style={{ color: t.statut === "todo" ? "var(--color-graphite-700)" : "#fff" }}>
                        {days}j
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-2">
                      <span className="rounded-md px-2 py-1 text-[11px]" style={{ background: toneSoft.todo, color: "var(--color-graphite-500)" }}>
                        Definissez les dates a gauche
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-hairline px-5 py-3 text-xs text-graphite-500" style={{ background: "var(--color-inset)" }}>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-baseline)" }} /> A faire</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-amber)" }} /> En cours</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-teal)" }} /> Termine</span>
            <span className="ml-auto flex items-center gap-1.5"><span className="h-3 w-px" style={{ background: "var(--color-risk)", opacity: 0.6 }} /> Aujourd'hui</span>
          </div>
        </div>
      )}
    </div>
  );
}
