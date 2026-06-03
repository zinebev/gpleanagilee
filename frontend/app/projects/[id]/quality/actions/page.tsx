"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, ncAPI } from "@/lib/api";

type NC = {
  id: number;
  projet: number;
  titre: string;
  gravite: string;
  statut: "ouverte" | "en_cours" | "resolue";
  action_corrective?: string;
};

export default function ActionsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [items, setItems] = useState<NC[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    ncAPI
      .getAll()
      .then((data: NC[]) => {
        const list = (Array.isArray(data) ? data : []).filter((n) => n.projet === projectId);
        setItems(list);
        const d: Record<number, string> = {};
        list.forEach((n) => (d[n.id] = n.action_corrective || ""));
        setDrafts(d);
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

  const save = async (nc: NC, markResolved: boolean) => {
    try {
      await ncAPI.update(nc.id, {
        action_corrective: drafts[nc.id] || "",
        ...(markResolved ? { statut: "resolue" } : {}),
      });
      load();
    } catch {
      setError("Enregistrement impossible");
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        Retour au projet
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-graphite-700">Actions correctives</h1>
      <p className="mt-1 text-sm text-graphite-500">Definissez les actions pour traiter les non-conformites.</p>

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && items.length === 0 && (
        <p className="mt-6 text-sm text-graphite-500">Aucune non-conformite. Ajoutez-en dans le module Non-conformites.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {items.map((nc) => (
          <div key={nc.id} className="rounded-lg border border-hairline bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-graphite-700">{nc.titre}</h3>
              <span className="rounded-full bg-inset px-2.5 py-0.5 text-xs font-medium text-graphite-700">
                {nc.statut === "resolue" ? "Resolue" : nc.statut === "en_cours" ? "En cours" : "Ouverte"}
              </span>
            </div>
            <textarea
              value={drafts[nc.id] ?? ""}
              onChange={(e) => setDrafts({ ...drafts, [nc.id]: e.target.value })}
              placeholder="Decrivez l'action corrective..."
              className="mt-3 w-full rounded-md border border-hairline bg-card p-3 text-sm"
              rows={2}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => save(nc, false)} className="rounded-md border border-hairline px-3 py-1.5 text-sm text-graphite-700 hover:bg-inset">
                Enregistrer
              </button>
              {nc.statut !== "resolue" && (
                <button onClick={() => save(nc, true)} className="rounded-md bg-teal px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
                  Enregistrer et resoudre
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
