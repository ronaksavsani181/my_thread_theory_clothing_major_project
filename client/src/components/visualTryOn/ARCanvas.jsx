/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  AR CANVAS  ·  FINAL v7.0                                         ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  · Camera FOV=42° matches typical front-facing phone camera       ║
 * ║  · ACES Filmic tone mapping — fabric looks physically real        ║
 * ║  · 5-light studio rig for natural cloth shading                   ║
 * ║  · DPR capped at 2× for mobile performance                        ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import ClothingModel from './ClothingModel';

// Camera: FOV=42 matches typical phone/webcam. camZ=5 → viewport~6.8 world units wide.
const CAMERA_CFG = {
  position: [0, 0, 5],
  fov:      42,
  near:     0.05,
  far:      120,
};

// ─── LOADING INDICATOR ──────────────────────────────────────────────
const GarmentLoader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        width: 210,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: '18px 22px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {/* Progress bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.10)', borderRadius: 2, marginBottom: 12 }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#ffffff',
            borderRadius: 2,
            transition: 'width 0.2s ease-out',
          }} />
        </div>
        <p style={{
          margin: 0,
          fontSize: 9,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.60)',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
        }}>
          Loading Garment &middot; {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
};

// ─── AR CANVAS ──────────────────────────────────────────────────────
const ARCanvas = ({ pose, product, videoAspect, isMirrored, userHeightCm }) => {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <Canvas
        shadows="soft"
        camera={CAMERA_CFG}
        gl={{
          alpha:                 true,
          antialias:             true,
          preserveDrawingBuffer: true,
          powerPreference:       'high-performance',
          // ACES Filmic tone mapping → fabric & clothing colours look physically accurate
          toneMapping:           4,   // THREE.ACESFilmicToneMapping
          toneMappingExposure:   1.04,
          outputColorSpace:      'srgb',
        }}
        dpr={[1, dpr]}
        className="w-full h-full"
      >
        <Suspense fallback={<GarmentLoader />}>

          {/* ════════════════════════════════════════════
              5-LIGHT STUDIO RIG
              Engineered for realistic cloth rendering.
              Mirrors a high-key fashion photography setup.
              ════════════════════════════════════════════ */}

          {/* 1 · KEY LIGHT — Primary overhead spot (main shadow caster) */}
          <spotLight
            position={[0, 9, 4]}
            angle={0.27}
            penumbra={0.85}
            intensity={3.0}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0003}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
          />

          {/* 2 · FILL LIGHT — Warm left side, softens key-light shadows */}
          <directionalLight position={[-6, 5, 3]}  intensity={1.10} color="#fff6e8" />

          {/* 3 · RIM LIGHT — Cool right edge highlight, defines fabric texture */}
          <directionalLight position={[ 7, 3, -3]} intensity={0.70} color="#c8e0ff" />

          {/* 4 · FRONT SOFT — Frontal fill, reduces harsh chest/torso shadows */}
          <directionalLight position={[0, 0, 8]}   intensity={0.38} color="#ffffff" />

          {/* 5 · AMBIENT — Base fill so no area goes pitch-black */}
          <ambientLight intensity={0.62} color="#f8f8f8" />

          {/* 6 · FLOOR BOUNCE — Subtle upward fill from virtual floor */}
          <pointLight position={[0, -4, 2]} intensity={0.28} color="#f0f0f0" />

          {/* ── GARMENT ── */}
          <ClothingModel
            pose={pose}
            product={product}
            videoAspect={videoAspect}
            isMirrored={isMirrored}
            userHeightCm={userHeightCm}
          />

          {/* Subtle contact shadow grounds garment in the scene */}
          <ContactShadows
            opacity={0.22}
            scale={14}
            blur={3.5}
            far={9}
            resolution={512}
            color="#000000"
          />

          {/* HDR environment map for realistic fabric material reflections */}
          <Environment preset="studio" blur={0.5} />

        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARCanvas;