"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI, coutsAPI } from "@/lib/api";

type Cout = {
  id: number;
  projet: number;
  libelle: string;
  montant_prevu: string;
  montant_reel: string;
  date: string;
  categorie?: string;
  ecart?: number;
};

function toNum(v: string | undefined) {
  const n = parseFloat(v || "0");
  return isNaN(n) ? 0 : n;
}

export default function BudgetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [couts, setCouts] = useState<Cout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    libelle: "",
    montant_prevu: "",
    montant_reel: "",
    categorie: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const load = () => {
    coutsAPI
      .getAll()
      .then((data: Cout[]) => setCouts((Array.isArray(data) ? data : []).filter((c) => c.projet === projectId)))
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
    const prevu = couts.reduce((s, c) => s + toNum(c.montant_prevu), 0);
    const reel = couts.reduce((s, c) => s + toNum(c.montant_reel), 0);
    return { prevu, reel, ecart: prevu - reel };
  }, [couts]);

  const addCout = async () => {
    if (!form.libelle.trim()) return;
    try {
      await coutsAPI.create({
        projet: projectId,
        libelle: form.libelle,
        montant_prevu: form.montant_prevu || "0",
        montant_reel: form.montant_reel || "0",
        categorie: form.categorie,
        date: form.date,
      });
      setForm({ libelle: "", montant_prevu: "", montant_reel: "", categorie: "", date: new Date().toISOString().slice(0, 10) });
      setShowForm(false);
      load();
    } catch {
      setError("Création impossible");
    }
  };

  const remove = async (id: number) => {
    setCouts((prev) => prev.filter((c) => c.id !== id));
    try {
      await coutsAPI.delete(id);
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
        <h1 className="text-2xl font-semibold text-graphite-700">Budget</h1>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          {showForm ? "Annuler" : "Nouvelle ligne"}
        </button>
      </div>

      {/* totals */}
      <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {[
          { l: "Total prévu", v: totals.prevu, tone: "text-graphite-700" },
          { l: "Total réel", v: totals.reel, tone: "text-graphite-700" },
          { l: "Écart", v: totals.ecart, tone: totals.ecart < 0 ? "text-risk" : "text-teal-700" },
        ].map((c) => (
          <div key={c.l} className="rounded-lg border border-hairline bg-card p-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-graphite-500">{c.l}</p>
            <p className={`tnum mt-2 text-xl font-semibold ${c.tone}`}>{c.v.toFixed(2)} MAD</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-hairline bg-card p-5">
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <input placeholder="Libellé" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} className="h-[38px] rounded-md border border-hairline bg-card px-3 text-sm" />
            <input placeholder="Catégorie" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="h-[38px] rounded-md border border-hairline bg-card px-3 text-sm" />
            <input type="number" placeholder="Montant prévu" value={form.montant_prevu} onChange={(e) => setForm({ ...form, montant_prevu: e.target.value })} className="h-[38px] rounded-md border border-hairline bg-card px-3 text-sm" />
            <input type="number" placeholder="Montant réel" value={form.montant_reel} onChange={(e) => setForm({ ...form, montant_reel: e.target.value })} className="h-[38px] rounded-md border border-hairline bg-card px-3 text-sm" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-[38px] rounded-md border border-hairline bg-card px-3 text-sm" />
          </div>
          <div className="mt-4">
            <button onClick={addCout} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}
      {!loading && couts.length === 0 && (
        <p className="mt-6 text-sm text-graphite-500">Aucune ligne de coût enregistrée.</p>
      )}

      {!loading && couts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-hairline bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[12px] uppercase tracking-[0.04em] text-graphite-500">
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium text-right">Prévu</th>
                <th className="px-4 py-3 font-medium text-right">Réel</th>
                <th className="px-4 py-3 font-medium text-right">Écart</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {couts.map((c) => {
                const ecart = toNum(c.montant_prevu) - toNum(c.montant_reel);
                return (
                  <tr key={c.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3 text-graphite-700">{c.libelle}</td>
                    <td className="px-4 py-3 text-graphite-500">{c.categorie || "—"}</td>
                    <td className="tnum px-4 py-3 text-right text-graphite-700">{toNum(c.montant_prevu).toFixed(2)}</td>
                    <td className="tnum px-4 py-3 text-right text-graphite-700">{toNum(c.montant_reel).toFixed(2)}</td>
                    <td className={`tnum px-4 py-3 text-right font-medium ${ecart < 0 ? "text-risk" : "text-teal-700"}`}>{ecart.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(c.id)} className="text-xs text-risk hover:underline">Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}