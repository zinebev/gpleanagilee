"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, projectsAPI } from "@/lib/api";

type Projet = {
  id: number;
  nom: string;
  description?: string;
  statut?: string;
  date_debut?: string;
  date_fin?: string;
  budget_prevu?: string;
  budget_reel?: string;
};

const statutLabel: Record<string, string> = {
  en_cours: "En cours",
  en_attente: "En attente",
  termine: "Terminé",
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [project, setProject] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (!id) return;
    projectsAPI
      .getById(id)
      .then((data: Projet) => setProject(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const modules = [
    { label: "Tableau Kanban", href: `/projects/${id}/agile/board` },
    { label: "Sprints", href: `/projects/${id}/agile/sprints` },
    { label: "Backlog", href: `/projects/${id}/agile/backlog` },
    { label: "Budget", href: `/projects/${id}/budget` },
    { label: "Gantt", href: `/projects/${id}/gantt` },
    { label: "Indicateurs (KPI)", href: `/projects/${id}/kpi` },
    { label: "VSM", href: `/projects/${id}/lean/vsm` },
    { label: "Muda", href: `/projects/${id}/lean/muda` },
    { label: "Kaizen", href: `/projects/${id}/lean/kaizen` },
    { label: "Non-conformités", href: `/projects/${id}/quality/nc` },
    { label: "Actions correctives", href: `/projects/${id}/quality/actions` },
    { label: "Indicateurs qualité", href: `/projects/${id}/quality/indicateurs` },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      <Link href="/projects" className="text-sm text-teal-700 hover:underline">
        ← Retour aux projets
      </Link>

      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {error && <p className="mt-6 text-sm text-risk">{error}</p>}

      {!loading && !error && project && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-graphite-700">{project.nom}</h1>
              <p className="mt-1 max-w-xl text-sm text-graphite-500">
                {project.description || "Aucune description"}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-teal-soft px-3 py-1 text-xs font-medium text-teal-700">
              {statutLabel[project.statut || ""] || project.statut || "—"}
            </span>
          </div>

          {/* summary cards */}
          <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {[
              { l: "Date début", v: project.date_debut || "—" },
              { l: "Date fin", v: project.date_fin || "—" },
              { l: "Budget prévu", v: project.budget_prevu ? `${project.budget_prevu} MAD` : "—" },
              { l: "Budget réel", v: project.budget_reel ? `${project.budget_reel} MAD` : "—" },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
                <p className="tnum mt-2 text-base font-semibold text-graphite-700">{c.v}</p>
              </div>
            ))}
          </div>

          {/* module navigation */}
          <h2 className="mt-10 text-base font-medium text-graphite-700">Modules</h2>
          <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {modules.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="rounded-lg border border-hairline bg-card px-4 py-3 text-sm font-medium text-graphite-700 transition-colors hover:border-hairline-hover hover:bg-inset"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}