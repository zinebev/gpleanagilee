"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, vsmAPI } from "@/lib/api";

type Step = {
  id: number;
  projet: number;
  nom: string;
  temps_valeur: number;
  temps_attente: number;
  ordre: number;
};

export default function VsmPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", temps_valeur: "", temps_attente: "" });

  const load = () => {
    vsmAPI
      .getAll()
      .then((data: Step[]) => {
        const list = (Array.isArray(data) ? data : []).filter((s) => s.projet === projectId);
        list.sort((a, b) => a.ordre - b.ordre);
        setSteps(list);
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

  const totals = useMemo(() => {
    const valeur = steps.reduce((s, x) => s + (x.temps_valeur || 0), 0);
    const attente = steps.reduce((s, x) => s + (x.temps_attente || 0), 0);
    const total = valeur + attente;
    const efficacite = total > 0 ? Math.round((valeur / total) * 100) : 0;
    return { valeur, attente, total, efficacite };
  }, [steps]);

  const add = async () => {
    if (!form.nom.trim()) return;
    try {
      await vsmAPI.create({
        projet: projectId,
        nom: form.nom,
        temps_valeur: Number(form.temps_valeur) || 0,
        temps_attente: Number(form.temps_attente) || 0,
        ordre: steps.length + 1,
      });
      setForm({ nom: "", temps_valeur: "", temps_attente: "" });
      setShowForm(false);
      load();
    } catch {
      setError("Creation impossible");
    }
  };

  const remove = async (id: number) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    try { await vsmAPI.delete(id); } catch { load(); }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">Retour au projet</Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Value Stream Mapping</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouvelle etape"}
        </button>
      </div>

      <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {[
          { l: "Temps valeur", v: `${totals.valeur} min`, tone: "text-teal-700" },
          { l: "Temps attente", v: `${totals.attente} min`, tone: "text-amber-700" },
          { l: "Temps total", v: `${totals.total} min`, tone: "text-graphite-700" },
          { l: "Efficacite", v: `${totals.efficacite}%`, tone: "text-teal-700" },
        ].map((c) => (
          <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
            <p className={`tnum mt-2 text-xl font-semibold ${c.tone}`}>{c.v}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-hairline bg-card p-5">
          <input placeholder="Nom de l'etape" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm" />
          <div className="mt-3 flex gap-3">
            <input type="number" placeholder="Temps valeur (min)" value={form.temps_valeur} onChange={(e) => setForm({ ...form, temps_valeur: e.target.value })} className="h-[38px] flex-1 rounded-md border border-hairline bg-card px-3 text-sm" />
            <input type="number" placeholder="Temps attente (min)" value={form.temps_attente} onChange={(e) => setForm({ ...form, temps_attente: e.target.value })} className="h-[38px] flex-1 rounded-md border border-hairline bg-card px-3 text-sm" />
          </div>
          <div className="mt-4">
            <button onClick={add} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Enregistrer</button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && steps.length === 0 && <p className="mt-6 text-sm text-graphite-500">Aucune etape. Ajoutez les etapes de votre processus.</p>}

      {!loading && steps.length > 0 && (
        <div className="mt-6 flex flex-wrap items-stretch gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="min-w-[150px] flex-1 rounded-lg border border-hairline bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-graphite-700">{s.nom}</span>
                  <button onClick={() => remove(s.id)} className="text-xs text-risk hover:underline">x</button>
                </div>
                <p className="mt-2 text-xs text-teal-700">Valeur : {s.temps_valeur} min</p>
                <p className="text-xs text-amber-700">Attente : {s.temps_attente} min</p>
              </div>
              {i < steps.length - 1 && <div className="flex items-center text-graphite-400">&rarr;</div>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
