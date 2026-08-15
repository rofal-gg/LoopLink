"use client";

import { useEffect, useRef, useState } from "react";


/* ─── Hooks ─── */
export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function useCountUp(target, decimals = 0, trigger) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Saat user pilih reduce-motion, langsung tampilkan nilai akhir tanpa animasi.
  const [count, setCount] = useState(prefersReduced ? target : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (!trigger) return;
    if (prefersReduced) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(parseFloat((ease * target).toFixed(decimals)));
      if (p < 1) raf.current = requestAnimationFrame(animate);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, decimals, prefersReduced]);
  return count;
}

/* ─── TiltCard wrapper ─── */
export function TiltCard({
  children,
  style,
  className = "",
  intensity = 12,
  onMouseEnter: externalEnter,
  onMouseLeave: externalLeave,
}) {
  const ref = useRef(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e) => {
    if (prefersReduced) return;
    const el = ref.current;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * intensity}deg) rotateX(${
      -y * intensity
    }deg) translateZ(10px)`;
    el.style.transition = "transform 0.08s ease";
  };
  const onLeave = () => {
    const el = ref.current;
    el.style.transform =
      "perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    el.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
    externalLeave?.();
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform", ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={externalEnter}
    >
      {children}
    </div>
  );
}

/* ─── Shared ─── */
export const P = {
  base: {
    backgroundColor: "#3C7A5C",
    color: "#F6F3EA",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    transition: "background-color 0.18s, box-shadow 0.18s, transform 0.12s",
  },
  on: (el) => {
    el.style.backgroundColor = "#2d5e46";
    el.style.boxShadow = "0 8px 24px rgba(60,122,92,0.4)";
    el.style.transform = "translateY(-2px)";
  },
  off: (el) => {
    el.style.backgroundColor = "#3C7A5C";
    el.style.boxShadow = "none";
    el.style.transform = "translateY(0)";
  },
};

export function Eyebrow({ children, light = false }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: light ? "#6bba91" : "#3C7A5C",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 20,
          height: 1.5,
          backgroundColor: light ? "#6bba91" : "#3C7A5C",
          borderRadius: 2,
        }}
      />
      {children}
    </span>
  );
}

/* Mark logo (src=/logo.svg 1:1) — dipakai navbar, tabel, footer */
export function Mark({ size = 40 }) {
  return (
    <img
      src="/logo.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ flexShrink: 0, display: "block" }}
    />
  );
}

/* ─── Wave dividers ─── */
const WAVES = {
  a: "M0,32 C240,72 480,4 720,36 C960,68 1200,8 1440,40 L1440,80 L0,80 Z",
  b: "M0,16 C320,72 640,0 960,48 C1120,66 1300,24 1440,44 L1440,80 L0,80 Z",
  c: "M0,50 C180,20 360,68 540,44 C720,20 900,64 1080,44 C1260,24 1380,56 1440,48 L1440,80 L0,80 Z",
  d: "M0,60 C480,8 960,72 1440,28 L1440,80 L0,80 Z",
  e: "M0,68 C360,44 720,76 1080,56 C1260,46 1380,66 1440,62 L1440,80 L0,80 Z",
  f: "M0,44 C200,4 500,72 800,32 C1050,2 1280,60 1440,36 L1440,80 L0,80 Z",
  g: "M0,24 C400,72 700,10 1000,52 C1200,76 1360,28 1440,48 L1440,80 L0,80 Z",
  h: "M0,72 C240,48 480,78 720,60 C960,42 1200,72 1440,56 L1440,80 L0,80 Z",
};

export function Wave({ from, to, path }) {
  return (
    <div
      style={{ backgroundColor: from, lineHeight: 0, display: "block", marginBottom: -1 }}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 80 }}
      >
        <path d={WAVES[path]} fill={to} />
      </svg>
    </div>
  );
}
