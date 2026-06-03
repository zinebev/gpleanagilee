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
};

export default function SprintsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    tasksAPI
      .getAll()
      .then((data: Tache[]) => setTaches((Array.isArray(data) ? data : []).filter((t) => t.projet === projectId)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const stats = useMemo(() => {
    const total = taches.length;
    const done = taches.filter((t) => t.statut === "done").length;
    const enCours = taches.filter((t) => t.statut === "en_cours").length;
    const todo = taches.filter((t) => t.statut === "todo").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, enCours, todo, pct };
  }, [taches]);

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        Retour au projet
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-graphite-700">Sprint en cours</h1>

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}

      {!loading && (
        <>
          <div className="mt-6 rounded-lg border border-hairline bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-graphite-700">Avancement du sprint</span>
              <span className="tnum text-sm font-semibold text-teal-700">{stats.pct}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full" style={{ background: "var(--color-inset)" }}>
              <div className="h-full rounded-full" style={{ width: `${stats.pct}%`, background: "var(--color-teal)" }} />
            </div>
            <p className="mt-2 text-xs text-graphite-500">{stats.done} terminees sur {stats.total} taches</p>
          </div>

          <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {[
              { l: "A faire", v: stats.todo },
              { l: "En cours", v: stats.enCours },
              { l: "Terminees", v: stats.done },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
                <p className="tnum mt-2 text-2xl font-semibold text-graphite-700">{c.v}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-base font-medium text-graphite-700">Taches du sprint</h2>
          {taches.length === 0 && <p className="mt-3 text-sm text-graphite-500">Aucune tache. Ajoutez-en dans le Backlog ou le Kanban.</p>}
          <div className="mt-3 flex flex-col gap-2">
            {taches.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-hairline bg-card p-3">
                <span className="text-sm text-graphite-700">{t.titre}</span>
                <span className="text-xs text-graphite-500">{t.statut === "done" ? "Terminee" : t.statut === "en_cours" ? "En cours" : "A faire"}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
