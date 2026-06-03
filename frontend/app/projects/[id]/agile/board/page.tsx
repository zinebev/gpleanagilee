"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { authAPI, tasksAPI, usersAPI } from "@/lib/api";

type Tache = {
  id: number;
  projet: number;
  titre: string;
  description?: string;
  statut: "todo" | "en_cours" | "done";
  priorite?: number;
  assignee?: number | null;
  assignee_nom?: string | null;
  date_creation?: string | null;
};

type UserMini = { id: number; username: string };

const COLUMNS: { key: Tache["statut"]; label: string }[] = [
  { key: "todo", label: "À faire" },
  { key: "en_cours", label: "En cours" },
  { key: "done", label: "Terminé" },
];

const statutDot: Record<Tache["statut"], string> = {
  todo: "var(--color-risk)",
  en_cours: "var(--color-amber)",
  done: "var(--color-ok)",
};

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function Card({
  tache,
  users,
  onAssign,
}: {
  tache: Tache;
  users: UserMini[];
  onAssign: (taskId: number, userId: number | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tache.id });
  const created = formatDate(tache.date_creation);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="rounded-md border border-hairline bg-card p-3 shadow-sm"
    >
      {/* drag handle area */}
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: statutDot[tache.statut] }} aria-hidden="true" />
          <p className="text-sm font-medium text-graphite-700">{tache.titre}</p>
        </div>
        {tache.description && <p className="mt-1 text-xs text-graphite-500">{tache.description}</p>}
        {created && <p className="mt-2 text-[11px] text-graphite-400">Ajoutée le {created}</p>}
      </div>

      {/* assignee selector — not draggable */}
      <div className="mt-2" onPointerDown={(e) => e.stopPropagation()}>
        <select
          value={tache.assignee ?? ""}
          onChange={(e) => onAssign(tache.id, e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-md border border-hairline bg-inset px-2 py-1 text-xs text-graphite-700"
        >
          <option value="">Non assignée</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Column({ col, taches, users, onAssign }: {
  col: { key: Tache["statut"]; label: string };
  taches: Tache[];
  users: UserMini[];
  onAssign: (taskId: number, userId: number | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[320px] flex-col rounded-lg border p-3 transition-colors"
      style={{ background: isOver ? "var(--color-teal-soft)" : "var(--color-inset)", borderColor: "var(--color-hairline)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-[0.04em] text-graphite-500">{col.label}</span>
        <span className="tnum text-xs text-graphite-400">{taches.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {taches.map((t) => (
          <Card key={t.id} tache={t} users={users} onAssign={onAssign} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoardPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.id);

  const [taches, setTaches] = useState<Tache[]>([]);
  const [users, setUsers] = useState<UserMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login");
      return;
    }
    Promise.all([tasksAPI.getAll(), usersAPI.getAll()])
      .then(([tdata, udata]: [Tache[], UserMini[]]) => {
        setTaches((Array.isArray(tdata) ? tdata : []).filter((t) => t.projet === projectId));
        setUsers(Array.isArray(udata) ? udata : []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const byColumn = useMemo(() => {
    const map: Record<Tache["statut"], Tache[]> = { todo: [], en_cours: [], done: [] };
    taches.forEach((t) => map[t.statut]?.push(t));
    return map;
  }, [taches]);

  const activeTache = taches.find((t) => t.id === activeId) || null;

  const onDragStart = (e: DragStartEvent) => setActiveId(Number(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = Number(active.id);
    const newStatut = over.id as Tache["statut"];
    const task = taches.find((t) => t.id === taskId);
    if (!task || task.statut === newStatut) return;
    setTaches((prev) => prev.map((t) => (t.id === taskId ? { ...t, statut: newStatut } : t)));
    tasksAPI.update(taskId, { statut: newStatut }).catch(() => {
      setTaches((prev) => prev.map((t) => (t.id === taskId ? { ...t, statut: task.statut } : t)));
      setError("La mise à jour a échoué");
    });
  };

  const onAssign = (taskId: number, userId: number | null) => {
    const prev = taches.find((t) => t.id === taskId);
    const newName = userId ? users.find((u) => u.id === userId)?.username ?? null : null;
    setTaches((list) => list.map((t) => (t.id === taskId ? { ...t, assignee: userId, assignee_nom: newName } : t)));
    tasksAPI.update(taskId, { assignee: userId }).catch(() => {
      if (prev) setTaches((list) => list.map((t) => (t.id === taskId ? prev : t)));
      setError("Assignation impossible");
    });
  };

  const addTask = async () => {
    const titre = prompt("Titre de la tâche ?");
    if (!titre) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const created: Tache = await tasksAPI.create({
        projet: projectId,
        titre,
        statut: "todo",
        date_debut: today,
        date_fin: today,
        priorite: 1,
      });
      setTaches((prev) => [...prev, created]);
    } catch {
      setError("Création de la tâche impossible");
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <Link href={`/projects/${projectId}`} className="text-sm text-teal-700 hover:underline">
        ← Retour au projet
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-graphite-700">Tableau Kanban</h1>
        <button onClick={addTask} className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          Nouvelle tâche
        </button>
      </div>

      {/* legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-graphite-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-risk)" }} /> À faire</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-amber)" }} /> En cours</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-ok)" }} /> Terminé</span>
      </div>

      {error && <p className="mt-4 text-sm text-risk">{error}</p>}
      {loading && <p className="mt-6 text-sm text-graphite-500">Chargement...</p>}

      {!loading && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {COLUMNS.map((col) => (
              <Column key={col.key} col={col} taches={byColumn[col.key]} users={users} onAssign={onAssign} />
            ))}
          </div>
          <DragOverlay>
            {activeTache ? (
              <div className="rounded-md border border-hairline bg-card p-3 shadow-drag">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: statutDot[activeTache.statut] }} />
                  <p className="text-sm font-medium text-graphite-700">{activeTache.titre}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}