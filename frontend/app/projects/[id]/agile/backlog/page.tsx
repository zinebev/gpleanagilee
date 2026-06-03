"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, tasksAPI } from "@/lib/api";

type Tache = {
  id: number;
  projet: number;
  titre: string;
  description?: string;
  statut: "todo" | "en_cours" | "done";
  priorite?: number;
};

const statutLabel: Record<string, string> = {
  todo: "A faire",
  en_cours: "En cours",
  done: "Termine",
};
const statutTone: Record<string, string> = {
  todo: "bg-risk-soft text-risk-700",
  en_cours: "bg-amber-soft text-amber-700",
  done: "bg-ok-soft text-ok-700",
};

export default function BacklogPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", priorite: "1" });

  const load = () => {
    tasksAPI
      .getAll()
      .then((data: Tache[]) => {
        const list = (Array.isArray(data) ? data : []).filter((t) => t.projet === projectId);
        list.sort((a, b) => (a.priorite ?? 99) - (b.priorite ?? 99));
        setTaches(list);
      })
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

  const addTask = async () => {
    if (!form.titre.trim()) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      await tasksAPI.create({
        projet: projectId,
        titre: form.titre,
        description: form.description,
        statut: "todo",
        priorite: Number(form.priorite) || 1,
        date_debut: today,
        date_fin: today,
      });
      setForm({ titre: "", description: "", priorite: "1" });
      setShowForm(false);
      load();
    } catch {
      setError("Creation impossible");
    }
  };

  const changePriorite = async (t: Tache, priorite: number) => {
    if (priorite < 1) return;
    setTaches((prev) => {
      const next = prev.map((x) => (x.id === t.id ? { ...x, priorite } : x));
      next.sort((a, b) => (a.priorite ?? 99) - (b.priorite ?? 99));
      return next;
    });
    try {
      await tasksAPI.update(t.id, { priorite });
    } catch {
      load();
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        Retour au projet
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Backlog</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouvelle tache"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-hairline bg-card p-5">
          <input placeholder="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-md border border-hairline bg-card p-3 text-sm" rows={2} />
          <div className="mt-3 flex items-center gap-2">
            <label className="text-sm text-graphite-500">Priorite</label>
            <input type="number" min={1} value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })} className="h-[38px] w-20 rounded-md border border-hairline bg-card px-3 text-sm" />
          </div>
          <div className="mt-4">
            <button onClick={addTask} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Enregistrer</button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && taches.length === 0 && (
        <p className="mt-6 text-sm text-graphite-500">Le backlog est vide.</p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {taches.map((t) => (
          <div key={t.id} className="flex items-center gap-4 rounded-lg border border-hairline bg-card p-4">
            <div className="flex flex-col items-center">
              <button onClick={() => changePriorite(t, (t.priorite ?? 1) - 1)} className="text-graphite-400 hover:text-graphite-700">^</button>
              <span className="tnum text-sm font-semibold text-graphite-700">{t.priorite ?? 1}</span>
              <button onClick={() => changePriorite(t, (t.priorite ?? 1) + 1)} className="text-graphite-400 hover:text-graphite-700">v</button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-graphite-700">{t.titre}</p>
              {t.description && <p className="mt-0.5 truncate text-xs text-graphite-500">{t.description}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statutTone[t.statut]}`}>
              {statutLabel[t.statut]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
