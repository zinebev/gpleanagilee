"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, kaizenAPI } from "@/lib/api";

type Kaizen = {
  id: number;
  projet: number;
  titre: string;
  description?: string;
  gain_estime?: string;
  statut: "propose" | "en_cours" | "realise";
};

const statutLabel: Record<string, string> = {
  propose: "Propose",
  en_cours: "En cours",
  realise: "Realise",
};
const statutTone: Record<string, string> = {
  propose: "bg-info-soft text-info-700",
  en_cours: "bg-amber-soft text-amber-700",
  realise: "bg-ok-soft text-ok-700",
};

export default function KaizenPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [items, setItems] = useState<Kaizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", gain_estime: "" });

  const load = () => {
    kaizenAPI
      .getAll()
      .then((data: Kaizen[]) => setItems((Array.isArray(data) ? data : []).filter((k) => k.projet === projectId)))
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

  const add = async () => {
    if (!form.titre.trim()) return;
    try {
      await kaizenAPI.create({ projet: projectId, ...form, statut: "propose" });
      setForm({ titre: "", description: "", gain_estime: "" });
      setShowForm(false);
      load();
    } catch {
      setError("Creation impossible");
    }
  };

  const cycle = async (k: Kaizen) => {
    const next = k.statut === "propose" ? "en_cours" : k.statut === "en_cours" ? "realise" : "propose";
    setItems((prev) => prev.map((x) => (x.id === k.id ? { ...x, statut: next } : x)));
    try {
      await kaizenAPI.update(k.id, { statut: next });
    } catch {
      load();
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">Retour au projet</Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Kaizen</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouvelle amelioration"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-hairline bg-card p-5">
          <input placeholder="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-md border border-hairline bg-card p-3 text-sm" rows={2} />
          <input placeholder="Gain estime (ex: 2 jours, 5000 MAD)" value={form.gain_estime} onChange={(e) => setForm({ ...form, gain_estime: e.target.value })} className="mt-3 h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm" />
          <div className="mt-4">
            <button onClick={add} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Enregistrer</button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && items.length === 0 && <p className="mt-6 text-sm text-graphite-500">Aucune amelioration enregistree.</p>}

      <div className="mt-6 flex flex-col gap-3">
        {items.map((k) => (
          <div key={k.id} className="rounded-lg border border-hairline bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-graphite-700">{k.titre}</h3>
              <button onClick={() => cycle(k)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statutTone[k.statut]}`}>
                {statutLabel[k.statut]}
              </button>
            </div>
            {k.description && <p className="mt-1 text-sm text-graphite-500">{k.description}</p>}
            {k.gain_estime && <p className="mt-2 text-xs text-teal-700">Gain estime : {k.gain_estime}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
