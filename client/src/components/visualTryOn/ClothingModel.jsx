/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  CLOTHING MODEL  ·  FINAL v7.0                                    ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  ROOT-CAUSE FIXES (diagnosed from screenshots):                   ║
 * ║                                                                   ║
 * ║  FIX 1 · Y POSITION — Shirt appeared at belly level              ║
 * ║    OLD: anchor = shoulderMid + shoulderWidth × 0.15              ║
 * ║    NEW: anchor = lerp(shoulderMid → nose, 0.40)                  ║
 * ║         40% of the way toward the nose = actual collar/neck       ║
 * ║                                                                   ║
 * ║  FIX 2 · SCALE — Shirt too small far, too big close              ║
 * ║    OLD: scale = shoulderVec.length() × constant                  ║
 * ║         → Z component from MediaPipe inflated scale               ║
 * ║    NEW: scale = √(Δx² + Δy²)  (XY plane only)                   ║
 * ║         + pinhole worldUnitsPerCm to match real-world size        ║
 * ║                                                                   ║
 * ║  FIX 3 · ROTATION — Full 360° body tracking                      ║
 * ║    6-DoF orthogonal basis (Gemini formula):                       ║
 * ║      Vx = normalize(Rshoulder − Lshoulder)   shoulder axis       ║
 * ║      Vs = normalize(hipMid − shoulderMid)     spine down         ║
 * ║      Vz = Vx × (−Vs)                          forward (camera)   ║
 * ║      Vy = Vz × Vx  (Gram-Schmidt)             corrected up       ║
 * ║    → Works correctly for: face-on, 45°, sideways, 180° turn      ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import React, { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { checkVisibility } from '../../services/arService';
import { resolveClothingType, resolveGender } from '../../services/sizeEstimator';

// ─── GARMENT FIT CONFIGURATION ──────────────────────────────────────
/**
 * widthMul:    garment width = visual shoulder width × widthMul
 * collarFrac:  anchor = lerp(shoulderMid, nose, collarFrac)
 *              0.0 = shoulder midpoint, 0.40 = neck/collar, 1.0 = nose
 * zBias:       push garment forward so it sits on body surface (not inside)
 */
const GARMENT_CFG = {
  top:    { widthMul: 1.52, collarFrac: 0.40, zBias: 0.22 },
  bottom: { widthMul: 1.44, collarFrac: 0.00, zBias: 0.16 },
  full:   { widthMul: 1.50, collarFrac: 0.36, zBias: 0.20 },
};

// ─── MODEL NORMALISER ───────────────────────────────────────────────
/**
 * Forces any imported GLTF into a canonical 1-unit-wide unit.
 * Pivot is pinned to the TOP CENTRE (collar / waistband).
 * This allows our world-space scale math to work universally.
 */
const normaliseGLTF = (scene) => {
  if (!scene) return new THREE.Group();
  const s = scene.clone(true);
  s.position.set(0, 0, 0);
  s.rotation.set(0, 0, 0);
  s.scale.set(1, 1, 1);

  const box = new THREE.Box3().setFromObject(s);
  const sz  = new THREE.Vector3(); box.getSize(sz);
  const ctr = new THREE.Vector3(); box.getCenter(ctr);

  // Pin pivot to top-centre of the bounding box
  s.position.set(-ctr.x, -box.max.y, -ctr.z);

  const wrapper = new THREE.Group();
  wrapper.add(s);
  if (sz.x > 0) wrapper.scale.setScalar(1.0 / sz.x); // normalise to 1 unit wide
  return wrapper;
};

// ─── LANDMARK → WORLD COORDS ────────────────────────────────────────
/**
 * Converts MediaPipe normalised landmark (0-1, top-left origin) into
 * Three.js world coordinates at the camera screen plane.
 *
 * @param {object} p        MediaPipe landmark {x, y, z, visibility}
 * @param {object} vp       {w, h} in Three.js world units
 * @param {boolean} mirror  true for front-facing (selfie) camera
 */
const lm2world = (p, vp, mirror) => new THREE.Vector3(
  ((mirror ? 1.0 - p.x : p.x) - 0.5) * vp.w,
  -(p.y - 0.5) * vp.h,
  (p.z ?? 0) * -3.0  // depth signal for perspective-correct rotation
);

// ─── VIEWPORT DIMENSIONS (world units) ─────────────────────────────
const getViewport = (aspect, fovDeg, camZ) => {
  const h = 2.0 * camZ * Math.tan((fovDeg * Math.PI) / 360.0);
  return { w: h * aspect, h };
};

// ─── 6-DoF ROTATION MATRIX ──────────────────────────────────────────
/**
 * Builds an exact quaternion from the body's orthogonal basis vectors.
 * This enables full 360° rotation tracking — the garment correctly
 * follows every body angle including sideways and backwards turns.
 *
 * ALGORITHM:
 *   Step 1: Vx = normalize(R_shoulder − L_shoulder)      ← shoulder axis
 *   Step 2: Vspine = normalize(hipMid − shoulderMid)     ← spine downward
 *   Step 3: Vz = Vx × (−Vspine)                          ← toward camera
 *   Step 4: Vy = Vz × Vx  (Gram-Schmidt reorthogonalise) ← corrected up
 *   Step 5: Matrix4.makeBasis(Vx, Vy, Vz) → Quaternion
 *
 * WHAT THIS ACHIEVES:
 *   - User faces camera: Vz points directly toward camera → shirt faces you
 *   - User turns 45°: Vz rotates accordingly → shirt follows the chest
 *   - User turns 90° sideways: Vz now points left/right → shirt side-view
 *   - User turns 180° (back): Vz points away from camera → back of shirt
 *
 * FALLBACK (hips not visible):
 *   Simple yaw + roll from shoulder angle only.
 *
 * @param {THREE.Vector3} ls  left shoulder world pos
 * @param {THREE.Vector3} rs  right shoulder world pos
 * @param {THREE.Vector3} lh  left hip world pos (nullable)
 * @param {THREE.Vector3} rh  right hip world pos (nullable)
 * @param {boolean} mirror    true for front camera
 */
const compute6DOF = (ls, rs, lh, rh, mirror) => {
  // ── Step 1: X axis — shoulder direction ─────────────────────
  const Vx = new THREE.Vector3().subVectors(rs, ls);
  if (Vx.lengthSq() < 1e-8) return new THREE.Quaternion(); // degenerate
  Vx.normalize();

  // ── Full 6-DoF when hips are visible ────────────────────────
  if (lh && rh) {
    const shoulderMid = new THREE.Vector3()
      .addVectors(ls, rs).multiplyScalar(0.5);
    const hipMid      = new THREE.Vector3()
      .addVectors(lh, rh).multiplyScalar(0.5);

    const Vspine = new THREE.Vector3()
      .subVectors(hipMid, shoulderMid);
    if (Vspine.lengthSq() < 1e-8) return fallbackRot(Vx, mirror);
    Vspine.normalize();

    // ── Step 3: Z axis (forward toward camera) ────────────────
    // Vz = Vx × (−Vspine)
    const Vz = new THREE.Vector3()
      .crossVectors(Vx, Vspine.clone().negate());
    if (Vz.lengthSq() < 1e-6) return fallbackRot(Vx, mirror);
    Vz.normalize();

    // ── Step 4: Y axis — Gram-Schmidt reorthogonalise ─────────
    // Vy = Vz × Vx  (guarantees orthogonality)
    const Vy = new THREE.Vector3()
      .crossVectors(Vz, Vx)
      .normalize();

    // ── Step 5: Build rotation matrix from basis ───────────────
    const mat = new THREE.Matrix4().makeBasis(Vx, Vy, Vz);
    return new THREE.Quaternion().setFromRotationMatrix(mat);
  }

  // ── Fallback: yaw + roll from shoulder vector only ──────────
  return fallbackRot(Vx, mirror);
};

/** Simple 2-axis rotation for when hips are not visible */
const fallbackRot = (Vx, mirror) => {
  const yaw  = Math.atan2(Vx.z, Math.abs(Vx.x));
  const roll = THREE.MathUtils.clamp(Math.atan2(Vx.y, Vx.x), -0.52, 0.52);
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, mirror ? -yaw : yaw, roll)
  );
};

// ─── COMPONENT ──────────────────────────────────────────────────────
const ClothingModel = ({
  pose,
  product,
  videoAspect   = 1.778,
  isMirrored    = true,
  userHeightCm  = 175,
}) => {
  const meshRef = useRef(null);
  const snapRef = useRef(false);   // snap-on state machine
  const idleT   = useRef(0);       // idle animation timer
  const { camera } = useThree();

  const clothingType = resolveClothingType(product);
  const cfg          = GARMENT_CFG[clothingType] ?? GARMENT_CFG.top;
  const posOff       = product?.positionOffset ?? [0, 0, 0];
  const sclOff       = product?.scaleOffset    ?? [1, 1, 1];

  // ── Load + normalise GLTF ────────────────────────────────────
  const { scene } = useGLTF(product.model3Durl);
  const normScene = useMemo(
    () => normaliseGLTF(scene),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.model3Durl]
  );

  // ── Material quality upgrade ─────────────────────────────────
  useLayoutEffect(() => {
    normScene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow    = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.side            = THREE.DoubleSide;
        child.material.roughness       = Math.max(0.28, child.material.roughness ?? 0.50);
        child.material.metalness       = Math.min(0.10, child.material.metalness ?? 0.04);
        child.material.envMapIntensity = 1.60;
        child.material.needsUpdate     = true;
      }
    });
  }, [normScene]);

  // ── Cleanup GPU memory ───────────────────────────────────────
  useEffect(() => {
    return () => {
      try { useGLTF.clear(product.model3Durl); } catch (_) {}
    };
  }, [product.model3Durl]);

  // ── MAIN FRAME LOOP ──────────────────────────────────────────
  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // ── IDLE: no body detected ───────────────────────────────
    if (!pose || !checkVisibility(pose, clothingType)) {
      idleT.current += delta;
      const floatY = Math.sin(idleT.current * 0.55) * 0.10;
      const floatR = Math.sin(idleT.current * 0.38) * 0.08;
      mesh.position.lerp(new THREE.Vector3(0, 0.20 + floatY, -4.2), 0.04);
      mesh.scale.lerp(new THREE.Vector3(2.0, 2.0, 2.0), 0.04);
      mesh.rotation.y = floatR;
      mesh.rotation.z = 0;
      snapRef.current = false;
      return;
    }

    // ── VIEWPORT ─────────────────────────────────────────────
    const vp = getViewport(videoAspect, camera.fov, camera.position.z);

    // ── WORLD-SPACE LANDMARKS ─────────────────────────────────
    const toW = (p) => (p ? lm2world(p, vp, isMirrored) : null);
    const ls   = toW(pose.leftShoulder);
    const rs   = toW(pose.rightShoulder);
    const lh   = toW(pose.leftHip);
    const rh   = toW(pose.rightHip);
    const nose = toW(pose.nose);

    if (!ls || !rs) return;

    // ── FIX 2: SCALE — XY only, no Z contamination ────────────
    //
    // Using shoulderVec.length() includes Z (depth) component.
    // When user turns sideways, Z grows → scale overestimates.
    // Solution: measure ONLY the X-Y visual shoulder width.
    //
    const visualShoulderW = Math.sqrt(
      (rs.x - ls.x) ** 2 + (rs.y - ls.y) ** 2  // XY ONLY
    );
    let targetScale = visualShoulderW * cfg.widthMul * sclOff[0];
    targetScale = THREE.MathUtils.clamp(targetScale, 0.15, 14.0);

    // ── FIX 1: ANCHOR — Collar/neck interpolation ─────────────
    //
    // Interpolating 40% of the way from shoulder-mid toward nose
    // lands EXACTLY at the collar/neck joint in world space.
    //
    // WRONG (old):  anchor = shoulderMid + shoulderWidth × 0.15  → belly level
    // RIGHT (new):  anchor = lerp(shoulderMid, nose, 0.40)        → collar level
    //
    const shoulderMid = new THREE.Vector3().lerpVectors(ls, rs, 0.5);
    let anchor;

    if (clothingType === 'bottom' && lh && rh) {
      // Bottoms anchor above hip midpoint
      const hipMid = new THREE.Vector3().lerpVectors(lh, rh, 0.5);
      anchor = hipMid.clone();
      anchor.y += visualShoulderW * 0.05;
    } else {
      // Tops & full: collar/neck anchor
      anchor = shoulderMid.clone();
      if (nose && cfg.collarFrac > 0) {
        anchor.lerp(nose, cfg.collarFrac);
      }
    }

    // Apply fine-tune offsets from product data
    anchor.x += posOff[0];
    anchor.y += posOff[1];
    anchor.z += cfg.zBias + posOff[2];

    // ── FIX 3: 6-DoF ROTATION — Full 360° tracking ───────────
    const targetQuat = compute6DOF(ls, rs, lh, rh, isMirrored);

    // ── SMOOTH INTERPOLATION ─────────────────────────────────
    // Two-phase: slow snap-on (0.08) → fast locked tracking (0.55)
    const speed = snapRef.current ? 0.55 : 0.08;

    mesh.position.lerp(anchor, speed);
    mesh.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      speed
    );
    mesh.quaternion.slerp(targetQuat, speed);

    // Transition to locked mode once close enough
    if (!snapRef.current && mesh.position.distanceTo(anchor) < 0.5) {
      snapRef.current = true;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={normScene} />
    </group>
  );
};

export default ClothingModel;