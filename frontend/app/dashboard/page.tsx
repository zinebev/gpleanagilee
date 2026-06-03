"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, projectsAPI } from "@/lib/api";

type Projet = {
  id: number;
  nom: string;
  description?: string;
  statut?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    projectsAPI
      .getAll()
      .then((data: Projet[]) => setProjects(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [router]);

  const enCours = projects.filter((p) => p.statut === "en_cours").length;
  const enAttente = projects.filter((p) => p.statut === "en_attente").length;
  const termine = projects.filter((p) => p.statut === "termine").length;

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 className="text-2xl font-semibold text-graphite-700">Dashboard</h1>
      <p className="mt-1 text-sm text-graphite-500">Vue d&apos;ensemble de vos projets</p>

      <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        {[
          { l: "Projets", v: loading ? "..." : String(projects.length) },
          { l: "En cours", v: loading ? "..." : String(enCours) },
          { l: "En attente", v: loading ? "..." : String(enAttente) },
          { l: "Terminés", v: loading ? "..." : String(termine) },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-hairline bg-card p-5">
            <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-graphite-500">{k.l}</p>
            <p className="tnum mt-2 text-2xl font-semibold text-graphite-700">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base font-medium text-graphite-700">Mes projets</h2>
        <Link href="/projects/new" className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Nouveau projet
        </Link>
      </div>

      {loading && <p className="mt-4 text-sm text-graphite-500">Chargement...</p>}
      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="mt-4 text-sm text-graphite-500">Aucun projet pour l&apos;instant.</p>
      )}

      <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-lg border border-hairline bg-card p-5 transition-colors hover:border-hairline-hover">
            <h3 className="text-base font-medium text-graphite-700">{p.nom}</h3>
            <p className="mt-1 text-sm text-graphite-500">{p.description || "Aucune description"}</p>
            <p className="mt-3 text-xs text-graphite-400">Statut : {p.statut || "—"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}