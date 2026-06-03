"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "@/components/ui/Wordmark";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function IconPin({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 4v6l-2 4h10l-2-4V4" />
      <path d="M12 14v6" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <IconDashboard /> },
  { name: "Projets", href: "/projects", icon: <IconProjects /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [defenseMode, setDefenseMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("defenseMode") === "true";
    setDefenseMode(saved);
  }, []);

  const toggleDefense = () => {
    const next = !defenseMode;
    setDefenseMode(next);
    localStorage.setItem("defenseMode", String(next));
  };

  const isCollapsed = collapsed && !defenseMode;
  const width = isCollapsed ? 72 : 240;
  const itemFont = defenseMode ? "text-[15px]" : "text-sm";

  return (
    <aside
      className="flex min-h-screen flex-col transition-[width] duration-200"
      style={{ width, minWidth: width, background: "var(--color-ink)" }}
    >
      <div
        className="flex h-[60px] items-center px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {isCollapsed ? (
          <Wordmark size={16} compact onDark />
        ) : (
          <Wordmark size={17} onDark />
        )}
      </div>

      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative mb-1 flex items-center gap-3 rounded-md px-3.5 py-2.5 ${itemFont} transition-colors`}
              style={{
                color: active ? "#FFFFFF" : "var(--color-graphite-400)",
                background: active ? "var(--color-steel)" : "transparent",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                  style={{ background: "var(--color-teal)" }}
                  aria-hidden="true"
                />
              )}
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={toggleDefense}
          className={`flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 ${itemFont} transition-colors`}
          style={{ color: defenseMode ? "var(--color-teal)" : "var(--color-graphite-400)" }}
          aria-pressed={defenseMode}
          aria-label="Mode présentation"
        >
          <span className="shrink-0">
            <IconPin filled={defenseMode} />
          </span>
          {!isCollapsed && <span>Mode présentation</span>}
        </button>

        {!defenseMode && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`mt-1 flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 ${itemFont} transition-colors`}
            style={{ color: "var(--color-graphite-400)" }}
            aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
          >
            <span className="shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {isCollapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
              </svg>
            </span>
            {!isCollapsed && <span>Replier</span>}
          </button>
        )}

        <div
          className={`mt-1 flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 ${itemFont}`}
          style={{ color: "var(--color-graphite-500)", cursor: "default" }}
          aria-disabled="true"
          title="Paramètres — bientôt disponible"
        >
          <span className="shrink-0">
            <IconSettings />
          </span>
          {!isCollapsed && (
            <span className="flex items-center gap-2">
              Paramètres
              <span className="text-[11px]" style={{ color: "var(--color-graphite-400)" }}>
                bientôt
              </span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}