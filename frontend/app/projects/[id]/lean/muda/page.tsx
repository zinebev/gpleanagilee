"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, mudaAPI } from "@/lib/api";

type Muda = {
  id: number;
  projet: number;
  type_gaspillage: string;
  description?: string;
  impact?: string;
};

const TYPES = [
  ["surproduction", "Surproduction"],
  ["attente", "Attente"],
  ["transport", "Transport"],
  ["stock", "Stock"],
  ["mouvement", "Mouvement"],
  ["defaut", "Defaut"],
  ["surtraitement", "Surtraitement"],
];
const labelOf = (v: string) => TYPES.find((t) => t[0] === v)?.[1] || v;

export default function MudaPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [items, setItems] = useState<Muda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type_gaspillage: "attente", description: "", impact: "" });

  const load = () => {
    mudaAPI
      .getAll()
      .then((data: Muda[]) => setItems((Array.isArray(data) ? data : []).filter((m) => m.projet === projectId)))
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
    try {
      await mudaAPI.create({ projet: projectId, ...form });
      setForm({ type_gaspillage: "attente", description: "", impact: "" });
      setShowForm(false);
      load();
    } catch {
      setError("Creation impossible");
    }
  };

  const remove = async (id: number) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    try { await mudaAPI.delete(id); } catch { load(); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">Retour au projet</Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Muda (gaspillages)</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouveau gaspillage"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-hairline bg-card p-5">
          <select value={form.type_gaspillage} onChange={(e) => setForm({ ...form, type_gaspillage: e.target.value })} className="h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm">
            {TYPES.map((t) => <option key={t[0]} value={t[0]}>{t[1]}</option>)}
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-md border border-hairline bg-card p-3 text-sm" rows={2} />
          <input placeholder="Impact" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="mt-3 h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm" />
          <div className="mt-4">
            <button onClick={add} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Enregistrer</button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && items.length === 0 && <p className="mt-6 text-sm text-graphite-500">Aucun gaspillage identifie.</p>}

      <div className="mt-6 flex flex-col gap-3">
        {items.map((m) => (
          <div key={m.id} className="rounded-lg border border-hairline bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-medium text-amber-700">{labelOf(m.type_gaspillage)}</span>
              <button onClick={() => remove(m.id)} className="text-xs text-risk hover:underline">Supprimer</button>
            </div>
            {m.description && <p className="mt-2 text-sm text-graphite-700">{m.description}</p>}
            {m.impact && <p className="mt-1 text-xs text-graphite-500">Impact : {m.impact}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
