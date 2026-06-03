"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, ncAPI } from "@/lib/api";

type NC = {
  id: number;
  projet: number;
  titre: string;
  description: string;
  gravite: "faible" | "moyenne" | "elevee";
  statut: "ouverte" | "en_cours" | "resolue";
  action_corrective?: string;
};

const graviteTone: Record<NC["gravite"], string> = {
  faible: "bg-info-soft text-info-700",
  moyenne: "bg-amber-soft text-amber-700",
  elevee: "bg-risk-soft text-risk-700",
};

const statutTone: Record<NC["statut"], string> = {
  ouverte: "bg-risk-soft text-risk-700",
  en_cours: "bg-amber-soft text-amber-700",
  resolue: "bg-ok-soft text-ok-700",
};

const statutLabel: Record<NC["statut"], string> = {
  ouverte: "Ouverte",
  en_cours: "En cours",
  resolue: "Résolue",
};

export default function NcPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [items, setItems] = useState<NC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", gravite: "moyenne" });

  const load = () => {
    ncAPI
      .getAll()
      .then((data: NC[]) => setItems((Array.isArray(data) ? data : []).filter((n) => n.projet === projectId)))
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

  const addNC = async () => {
    if (!form.titre.trim()) return;
    try {
      await ncAPI.create({
        projet: projectId,
        titre: form.titre,
        description: form.description,
        gravite: form.gravite,
        statut: "ouverte",
      });
      setForm({ titre: "", description: "", gravite: "moyenne" });
      setShowForm(false);
      load();
    } catch {
      setError("Création impossible");
    }
  };

  const changeStatut = async (nc: NC, statut: NC["statut"]) => {
    setItems((prev) => prev.map((n) => (n.id === nc.id ? { ...n, statut } : n)));
    try {
      await ncAPI.update(nc.id, { statut });
    } catch {
      load();
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        ← Retour au projet
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Non-conformités</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouvelle non-conformité"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-hairline bg-card p-5">
          <input
            placeholder="Titre"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            className="h-[38px] w-full rounded-md border border-hairline bg-card px-3 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-3 w-full rounded-md border border-hairline bg-card p-3 text-sm"
            rows={3}
          />
          <select
            value={form.gravite}
            onChange={(e) => setForm({ ...form, gravite: e.target.value })}
            className="mt-3 h-[38px] rounded-md border border-hairline bg-card px-3 text-sm"
          >
            <option value="faible">Gravité faible</option>
            <option value="moyenne">Gravité moyenne</option>
            <option value="elevee">Gravité élevée</option>
          </select>
          <div className="mt-4">
            <button onClick={addNC} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && items.length === 0 && (
        <p className="mt-6 text-sm text-graphite-500">Aucune non-conformité enregistrée.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {items.map((nc) => (
          <div key={nc.id} className="rounded-lg border border-hairline bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-medium text-graphite-700">{nc.titre}</h3>
                {nc.description && <p className="mt-1 text-sm text-graphite-500">{nc.description}</p>}
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${graviteTone[nc.gravite]}`}>
                {nc.gravite}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutTone[nc.statut]}`}>
                {statutLabel[nc.statut]}
              </span>
              <div className="ml-auto flex gap-2">
                {(["ouverte", "en_cours", "resolue"] as NC["statut"][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatut(nc, s)}
                    disabled={nc.statut === s}
                    className="rounded-md border border-hairline px-2.5 py-1 text-xs text-graphite-700 hover:bg-inset disabled:opacity-40"
                  >
                    {statutLabel[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}