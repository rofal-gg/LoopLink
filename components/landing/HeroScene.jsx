"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Konstanta warna (versi terang untuk 3D — lebih cerah dari CSS palette) ─── */
const COL_MIST = new THREE.Color("#EEF2EA");      /* lebih terang dari #DCE3D3 */
const COL_PRIMARY = new THREE.Color("#7EC4A3");    /* emerald cerah, bukan #3C7A5C yang gelap */
const COL_SIGNAL = new THREE.Color("#F09050");     /* oranye lembut, bukan #E8752C yang pekat */
const COL_LINE = new THREE.Color("#A8ADA4");       /* abu-hijau terang, bukan #8C9184 */

/* ─── Utilitas ─── */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Hook: progress scroll section (0..1).
 * Dipakai untuk orbit kamera dan animasi scene.
 */
function useScrollProgress(sectionRef) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(Math.max(scrolled / scrollable, 0), 1));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionRef]);
  return progress;
}

/**
 * Hook: posisi mouse dinormalisasi -1..1, di-smooth (lerp) supaya
 * gerakannya halus. Disimpan di useRef supaya tidak trigger re-render.
 */
function useSmoothMouse() {
  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e) {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    smooth.current.x = lerp(smooth.current.x, target.current.x, 0.06);
    smooth.current.y = lerp(smooth.current.y, target.current.y, 0.06);
  });

  return smooth;
}

/**
 * Membuat TorusKnotGeometry dengan vertex colors gradasi.
 * Warna berubah berdasarkan sudut atan2(z,x) — gradien memutar mengikuti knot.
 */
function makeGradientKnotGeometry(radius, tube, colorA, colorB, radialSeg, tubularSeg, p, q) {
  const geo = new THREE.TorusKnotGeometry(radius, tube, tubularSeg, radialSeg, p, q);
  const posAttr = geo.attributes.position;
  const cols = new Float32Array(posAttr.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i);
    const angle = Math.atan2(v.z, v.x);
    const u = (angle + Math.PI) / (Math.PI * 2);
    const c = new THREE.Color().lerpColors(colorA, colorB, (Math.sin(u * Math.PI * 2) + 1) / 2);
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return geo;
}

/* ─── LoopCluster: knot besar + ring + bola orbit ─── */
function LoopCluster({ progress, mouse }) {
  const groupRef = useRef();
  const knotARef = useRef();
  const ringCRef = useRef();
  const ringDRef = useRef();
  const nodeRefs = useRef([]);

  const knotAGeo = useMemo(
    () => makeGradientKnotGeometry(1.5, 0.4, COL_MIST, COL_PRIMARY, 40, 220, 2, 3),
    []
  );

  const nodeData = useMemo(() => {
    const colors = [COL_SIGNAL, COL_PRIMARY, COL_MIST];
    return Array.from({ length: 5 }, (_, i) => ({
      size: 0.09 + Math.random() * 0.07,
      color: colors[i % colors.length],
      angle: (i / 5) * Math.PI * 2,
      r: 2.9 + Math.random() * 0.8,
      speed: 0.2 + Math.random() * 0.3,
      yOff: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mx = mouse.current.x;
    const my = mouse.current.y;

    if (knotARef.current) {
      knotARef.current.rotation.x = t * 0.06 + progress * 0.9 + my * 0.15;
      knotARef.current.rotation.y = t * 0.09 + progress * 1.6 + mx * 0.2;
      const breathe = 1 + Math.sin(t * 0.7) * 0.015;
      knotARef.current.scale.setScalar(breathe * lerp(0.92, 1.05, progress));
      /* Geser knot ke kanan saat scroll */
      knotARef.current.position.x = lerp(0, 2.8, progress);
    }
    if (ringCRef.current) ringCRef.current.rotation.z = t * 0.12;
    if (ringDRef.current) ringDRef.current.rotation.z = t * -0.18;

    nodeRefs.current.forEach((m, i) => {
      if (!m) return;
      const d = nodeData[i];
      const a = d.angle + t * d.speed;
      m.position.x = Math.cos(a) * d.r;
      m.position.z = Math.sin(a) * d.r * 0.6;
      m.position.y = Math.sin(t * 0.5 + d.yOff) * 1.2;
    });

    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mx * 0.3 - groupRef.current.rotation.y * 0.15) * 0.02;
      groupRef.current.position.x = lerp(groupRef.current.position.x, mx * 0.3, 0.05);
      groupRef.current.position.y = lerp(groupRef.current.position.y, -my * 0.2, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Knot utama: gradasi mist -> primary, geser ke kanan saat scroll */}
      <mesh ref={knotARef} geometry={knotAGeo}>
        <meshStandardMaterial vertexColors roughness={0.18} metalness={0.2} />
      </mesh>

      {/* Ring tipis 1: warna line */}
      <mesh ref={ringCRef} position={[-2.2, -0.6, 0.8]} rotation={[1.1, 0, 0]}>
        <torusGeometry args={[1.0, 0.06, 16, 100]} />
        <meshStandardMaterial
          color={COL_LINE}
          roughness={0.3}
          metalness={0.15}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Ring tipis 2: warna signal */}
      <mesh ref={ringDRef} position={[1.1, -1.5, 1.6]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.55, 0.045, 16, 80]} />
        <meshStandardMaterial
          color={COL_SIGNAL}
          roughness={0.25}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Bola-bola kecil orbiting (lebih glossy) */}
      {nodeData.map((d, i) => (
        <mesh key={i} ref={(el) => (nodeRefs.current[i] = el)}>
          <sphereGeometry args={[d.size, 20, 20]} />
          <meshStandardMaterial color={d.color} roughness={0.15} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── GlowParticles: partikel cahaya melayang ─── */
function GlowParticles({ progress }) {
  const pointsRef = useRef();
  const COUNT = 260;
  const palette = [COL_MIST, COL_PRIMARY, COL_SIGNAL, COL_LINE];

  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const seeds = [];
    for (let i = 0; i < COUNT; i++) {
      const r = 2.4 + Math.random() * 4.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      const z = r * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: 0.12 + Math.random() * 0.3,
        off: Math.random() * Math.PI * 2,
      });
    }
    return { positions, colors, seeds };
  }, []);

  /* Tekstur glow: lingkaran radial putih transparan via canvas */
  const glowTexture = useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.attributes.position;
    const spread = lerp(1, 1.2, progress);
    for (let i = 0; i < COUNT; i++) {
      const d = seeds[i];
      posAttr.setXYZ(
        i,
        d.baseX * spread + Math.sin(t * d.speed + d.off) * 0.18,
        d.baseY * spread + Math.cos(t * d.speed * 0.8 + d.off) * 0.18,
        d.baseZ * spread + Math.sin(t * d.speed * 0.6 + d.off) * 0.18
      );
    }
    posAttr.needsUpdate = true;
    pointsRef.current.material.opacity = lerp(0.55, 0.92, progress);
    pointsRef.current.material.size = 0.2 + Math.sin(t * 1.4) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        map={glowTexture}
        transparent
        vertexColors
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── PointerLight: titik cahaya yang mengikuti kursor ─── */
function PointerLight({ mouse }) {
  const lightRef = useRef();
  useFrame(() => {
    if (!lightRef.current) return;
    lightRef.current.position.x = lerp(
      lightRef.current.position.x,
      mouse.current.x * 4,
      0.08
    );
    lightRef.current.position.y = lerp(
      lightRef.current.position.y,
      -mouse.current.y * 3,
      0.08
    );
  });
  return (
    <pointLight
      ref={lightRef}
      color="#E8752C"
      intensity={1.4}
      distance={8}
      decay={2}
      position={[0, 0, 3]}
    />
  );
}

/* ─── CameraRig: orbit kamera berdasarkan scroll + mouse ─── */
function CameraRig({ progress, mouse }) {
  useFrame(({ camera }) => {
    const mx = mouse.current.x;
    const my = mouse.current.y;
    const orbit = progress * 0.7;
    camera.position.x = Math.sin(orbit) * 8.2 + mx * 0.6;
    camera.position.z = Math.cos(orbit) * 8.2 * lerp(1, 0.8, progress);
    camera.position.y = lerp(0.3, 0.7, progress) - my * 0.4;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── SceneContent: menggabungkan semua elemen 3D ─── */
function SceneContent({ sectionRef }) {
  const progress = useScrollProgress(sectionRef);
  const mouse = useSmoothMouse();

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight color="#fff8f0" position={[4, 5, 4]} intensity={1.2} />
      <directionalLight color="#e8ede3" position={[-4, -1, 2]} intensity={0.5} />
      <PointerLight mouse={mouse} />
      <LoopCluster progress={progress} mouse={mouse} />
      <GlowParticles progress={progress} />
      <CameraRig progress={progress} mouse={mouse} />
    </>
  );
}

/**
 * HeroScene — visual "loop cluster" interaktif untuk hero landing page.
 * - Knot/ring saling berkaitan (representasi sirkularitas)
 * - Partikel cahaya melayang dengan efek twinkle
 * - Bereaksi ke posisi mouse (parallax + titik cahaya mengikuti kursor)
 * - Bereaksi ke scroll (orbit kamera + rotasi tambahan)
 */
export default function HeroScene({ sectionRef }) {
  return (
    <Canvas
      camera={{ fov: 42, position: [0.4, 0.3, 8.5] }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.35;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <SceneContent sectionRef={sectionRef} />
    </Canvas>
  );
}
