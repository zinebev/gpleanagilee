"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const VIDEO_SRC = "/PixVerse_V6_Image_Text_360P_Create_a_premium_c-ezremove.mp4";

const INK = "#0C0C0D";
const PAPER_WHITE = "#F4F2ED";
const GREEN = "#7C8B5A";

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  y = 22,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.18);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translateY(${y}px)`,
        transition: `opacity .8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main style={{ background: INK, color: PAPER_WHITE, overflowX: "hidden" }}>
      {/* HERO */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>
        {/* dominant background video */}
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(1.06) translateY(${scrollY * 0.15}px)`,
            filter: "brightness(0.62) saturate(1.05)",
          }}
        />
        {/* cinematic gradient veils for text legibility */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(12,12,13,0.55) 0%, rgba(12,12,13,0.15) 35%, rgba(12,12,13,0.55) 78%, rgba(12,12,13,1) 100%)",
          }}
        />

        {/* hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transition: "opacity 1s ease .15s, transform 1s cubic-bezier(.22,1,.36,1) .15s",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(244,242,237,0.7)",
              }}
            >
              Gestion de projet Lean et Agile
            </p>
          </div>

          <h1
            style={{
              margin: "20px 0 0",
              maxWidth: 760,
              fontSize: "clamp(40px, 6.5vw, 86px)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(28px)",
              transition: "opacity 1.1s ease .3s, transform 1.1s cubic-bezier(.22,1,.36,1) .3s",
            }}
          >
            Pilotez vos projets avec la rigueur du{" "}
            <span style={{ color: GREEN }}>Lean</span> {" "}et la souplesse de l&apos;
            <span style={{ fontWeight: 300 }}>Agile</span>.
          </h1>

          <p
            style={{
              margin: "26px 0 0",
              maxWidth: 480,
              fontSize: 18,
              lineHeight: 1.6,
              color: "rgba(244,242,237,0.75)",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(28px)",
              transition: "opacity 1.1s ease .45s, transform 1.1s cubic-bezier(.22,1,.36,1) .45s",
            }}
          >
            Vos délais, vos coûts et votre qualité au même endroit. Du premier
            ticket jusqu&apos;à la livraison, sans rien perdre en route.
          </p>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(28px)",
              transition: "opacity 1.1s ease .6s, transform 1.1s cubic-bezier(.22,1,.36,1) .6s",
            }}
          >
            <Link
              href="/login"
              style={{
                borderRadius: 8,
                background: PAPER_WHITE,
                color: INK,
                padding: "14px 26px",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              style={{
                borderRadius: 8,
                border: "1px solid rgba(244,242,237,0.3)",
                color: PAPER_WHITE,
                padding: "14px 26px",
                fontSize: 15,
                fontWeight: 500,
                textDecoration: "none",
                backdropFilter: "blur(4px)",
              }}
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* scroll cue */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(244,242,237,0.55)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 1s ease 1s",
          }}
        >
          Défiler
        </div>
      </section>

      {/* POSITIONING */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "120px 28px" }}>
        <div style={{ display: "grid", gap: 48, gridTemplateColumns: "1fr", alignItems: "end" }}>
          <Reveal>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GREEN }}>
              Pourquoi GPLeanAgile
            </p>
            <h2 style={{ margin: "18px 0 0", maxWidth: 820, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              La plupart des outils vous montrent des tâches. Le vôtre devrait
              vous montrer si le projet va bien.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{ maxWidth: 520, fontSize: 17, lineHeight: 1.7, color: "rgba(244,242,237,0.62)" }}>
              On a réuni le suivi du temps, des coûts et de la qualité dans une
              seule vue. Le Lean enlève ce qui ralentit, l&apos;Agile garde la
              liberté d&apos;ajuster en cours de route.
            </p>
          </Reveal>
        </div>
      </section>

      {/* METHODOLOGY — flowing, not boxed */}
      <section style={{ borderTop: "1px solid rgba(244,242,237,0.08)", borderBottom: "1px solid rgba(244,242,237,0.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "100px 28px" }}>
          <Reveal>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,242,237,0.5)" }}>
              Comment ça marche
            </p>
          </Reveal>

          {[
            { n: "01", t: "Le travail reste visible", d: "Un tableau Kanban montre où en est chaque tâche, qui s'en occupe et ce qui bloque. Plus besoin de demander pour savoir." },
            { n: "02", t: "La qualité se trace", d: "Chaque non-conformité reste suivie jusqu'à sa clôture, avec l'action corrective qui va avec. Rien ne se perd." },
            { n: "03", t: "On mesure pour décider", d: "Les indicateurs de délai et de coût se calculent tout seuls, pour voir venir les écarts au lieu de les subir." },
          ].map((row, i) => (
            <Reveal key={row.n} delay={i * 100}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 28,
                  alignItems: "baseline",
                  padding: "40px 0",
                  borderBottom: i < 2 ? "1px solid rgba(244,242,237,0.08)" : "none",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 300, color: GREEN, minWidth: 56, fontVariantNumeric: "tabular-nums" }}>{row.n}</span>
                <h3 style={{ flex: "1 1 240px", margin: 0, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 500, letterSpacing: "-0.02em" }}>{row.t}</h3>
                <p style={{ flex: "1 1 320px", margin: 0, maxWidth: 460, fontSize: 16, lineHeight: 1.7, color: "rgba(244,242,237,0.62)" }}>{row.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* METRICS */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "120px 28px" }}>
        <Reveal>
          <h2 style={{ margin: 0, maxWidth: 700, fontSize: "clamp(26px, 3.6vw, 42px)", fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Des résultats mesurés, pas promis.
          </h2>
        </Reveal>
        <div style={{ marginTop: 60, display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            { v: "84,2 %", l: "des équipes attendent d'abord de la flexibilité" },
            { v: "22 %", l: "de délais mieux tenus sur le cas étudié" },
            { v: "3 %", l: "de coûts économisés sur le même projet" },
          ].map((m, i) => (
            <Reveal key={m.l} delay={i * 110}>
              <div style={{ borderTop: `2px solid ${GREEN}`, paddingTop: 22 }}>
                <p style={{ margin: 0, fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 600, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{m.v}</p>
                <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.6, color: "rgba(244,242,237,0.6)" }}>{m.l}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* authored human note */}
        <Reveal delay={200}>
          <p style={{ marginTop: 64, maxWidth: 560, fontSize: 17, lineHeight: 1.7, fontStyle: "italic", color: "rgba(244,242,237,0.5)" }}>
            «&nbsp;Le cadre a tenu parce qu&apos;il s&apos;adapte au terrain, pas
            l&apos;inverse.&nbsp;» Une note retenue du projet pilote.
          </p>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: "relative", overflow: "hidden", borderTop: "1px solid rgba(244,242,237,0.08)" }}>
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.32) saturate(1)",
          }}
        />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(12,12,13,0.6)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "140px 28px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ margin: 0, fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              Reprenez la main sur vos projets.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{ margin: "20px auto 0", maxWidth: 440, fontSize: 17, color: "rgba(244,242,237,0.7)" }}>
              Connectez-vous et commencez à suivre le flux, la qualité et la
              livraison dès aujourd&apos;hui.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div style={{ marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{ borderRadius: 8, background: PAPER_WHITE, color: INK, padding: "14px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                Se connecter
              </Link>
              <Link href="/register" style={{ borderRadius: 8, border: "1px solid rgba(244,242,237,0.3)", color: PAPER_WHITE, padding: "14px 28px", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
                Créer un compte
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}