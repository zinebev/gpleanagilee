"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import Wordmark from "@/components/ui/Wordmark";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(authAPI.isAuthenticated());
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav
      className="flex h-[60px] items-center justify-between px-8"
      style={{
        background: "var(--color-card)",
        borderBottom: "1px solid var(--color-hairline)",
      }}
    >
      <Link href={isLoggedIn ? "/dashboard" : "/login"} aria-label="Accueil GPLeanAgile">
        <Wordmark size={17} />
      </Link>

      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-graphite-700 hover:text-teal">
              Dashboard
            </Link>
            <Link href="/projects" className="text-sm font-medium text-graphite-700 hover:text-teal">
              Projets
            </Link>
            <Button variant="danger" onClick={handleLogout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-graphite-700 hover:text-teal">
              Connexion
            </Link>
            <Link href="/register" className="text-sm font-medium text-teal">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}