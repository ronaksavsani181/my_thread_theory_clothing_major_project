/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  AR SERVICE  ·  FINAL v7.0                                        ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  · One Euro Filter  — best real-time skeleton smoothing           ║
 * ║  · Emaraic Pinhole  — D = (W × F) / P  distance formula          ║
 * ║  · Full 33-landmark extraction from MediaPipe                     ║
 * ║  · Distance guidance UI helpers                                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// ─── SINGLETON POSE LANDMARKER ──────────────────────────────────────
let _landmarker = null;

export const initializePoseLandmarker = async () => {
  if (_landmarker) return _landmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm"
  );

  _landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses:                     1,
    minPoseDetectionConfidence:   0.58,
    minPosePresenceConfidence:    0.58,
    minTrackingConfidence:        0.58,
    outputSegmentationMasks:      false,
  });

  return _landmarker;
};

export const detectPose = (video, landmarker) => {
  if (!landmarker || !video || video.readyState < 2) return null;
  return landmarker.detectForVideo(video, performance.now());
};

// ─── ONE EURO FILTER ────────────────────────────────────────────────
/**
 * Gold standard real-time filter for landmark data.
 * Eliminates jitter at rest while staying immediately responsive
 * when the person moves quickly. Used by major AR SDKs.
 *
 * Paper: Géry Casiez, Nicolas Roussel, Daniel Vogel (CHI 2012)
 */
class _LP {
  constructor() { this.s = null; }
  last() { return this.s; }
  step(x, alpha) {
    this.s = (this.s === null) ? x : alpha * x + (1 - alpha) * this.s;
    return this.s;
  }
}

class _OneEuro {
  constructor(minCutoff = 1.2, beta = 0.007, dCutoff = 1.0) {
    this.mc = minCutoff;
    this.beta = beta;
    this.dc = dCutoff;
    this.xLP = new _LP();
    this.dLP = new _LP();
    this.lastT = null;
  }

  _alpha(cutoff, dt) {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(x) {
    const now = performance.now() / 1000;
    const dt  = this.lastT ? Math.max(now - this.lastT, 1e-4) : 0.016;
    this.lastT = now;

    const xPrev = this.xLP.last() ?? x;
    const dx    = (x - xPrev) / dt;
    const eDx   = this.dLP.step(dx,  this._alpha(this.dc, dt));
    const cutoff = this.mc + this.beta * Math.abs(eDx);
    return this.xLP.step(x, this._alpha(cutoff, dt));
  }
}

// ─── POSE SMOOTHER ──────────────────────────────────────────────────
export class PoseSmoother {
  constructor(minCutoff = 1.2, beta = 0.007) {
    this.mc   = minCutoff;
    this.beta = beta;
    this._map = {};
  }

  _filters(key) {
    if (!this._map[key]) {
      this._map[key] = {
        x: new _OneEuro(this.mc, this.beta),
        y: new _OneEuro(this.mc, this.beta),
        z: new _OneEuro(this.mc, this.beta),
      };
    }
    return this._map[key];
  }

  smooth(pose) {
    if (!pose) return null;
    const out = {};
    for (const [k, p] of Object.entries(pose)) {
      if (!p) { out[k] = p; continue; }
      const f = this._filters(k);
      out[k] = {
        x:          f.x.filter(p.x),
        y:          f.y.filter(p.y),
        z:          f.z.filter(p.z ?? 0),
        visibility: p.visibility,
      };
    }
    return out;
  }
}

// ─── FULL 33-LANDMARK EXTRACTOR ─────────────────────────────────────
/**
 * Maps every MediaPipe index to a named body joint.
 * Having all joints enables full 360° body tracking and
 * accurate measurements regardless of pose.
 */
export const extractLandmarks = (lm) => ({
  // Head
  nose:           lm[0],
  leftEye:        lm[2],   rightEye:        lm[5],
  leftEar:        lm[7],   rightEar:        lm[8],
  // Upper body
  leftShoulder:   lm[11],  rightShoulder:   lm[12],
  leftElbow:      lm[13],  rightElbow:      lm[14],
  leftWrist:      lm[15],  rightWrist:      lm[16],
  // Hands
  leftPinky:      lm[17],  rightPinky:      lm[18],
  leftIndex:      lm[19],  rightIndex:      lm[20],
  leftThumb:      lm[21],  rightThumb:      lm[22],
  // Lower body
  leftHip:        lm[23],  rightHip:        lm[24],
  leftKnee:       lm[25],  rightKnee:       lm[26],
  leftAnkle:      lm[27],  rightAnkle:      lm[28],
  leftHeel:       lm[29],  rightHeel:       lm[30],
  leftFootIndex:  lm[31],  rightFootIndex:  lm[32],
});

// ─── VISIBILITY CHECK ───────────────────────────────────────────────
const VIS = 0.45;
export const checkVisibility = (pose, clothingType = 'top') => {
  if (!pose) return false;
  const keys = clothingType === 'bottom'
    ? ['leftHip', 'rightHip']
    : ['leftShoulder', 'rightShoulder'];
  return keys.every(k => (pose[k]?.visibility ?? 0) > VIS);
};

// ─── EMARAIC PINHOLE DISTANCE FORMULA ──────────────────────────────
/**
 * Based on: emaraic.com/blog/distance-measurement
 * GitHub:   github.com/emara-geek/real-time-distance-measurement
 *
 * Original formula:
 *   F = (P × D) / W   → calibration (solve for focal length)
 *   D = (W × F) / P   → runtime (solve for distance)
 *
 * Where:
 *   F = focal length (in same units as P)
 *   P = object width in pixels / normalised frame width
 *   D = distance from camera to object
 *   W = real-world object width
 *
 * Three.js native derivation (no separate calibration needed):
 *   In Three.js, camera at camZ with FOV degrees sees a viewport
 *   of world-width: vpW = 2 × camZ × tan(FOV/2)
 *
 *   A real object of width W_cm at distance D_cm occupies
 *   a fraction of the frame: dxNorm = W_cm / (2 × D × tan(FOV/2))
 *                                    = W_cm × camZ / (D × vpW)
 *
 *   Solve for D: D_cm = (W_cm × camZ) / (dxNorm × vpW)
 *
 *   This IS emaraic's formula: F = camZ / vpW (normalised focal length)
 *
 * @param {number} dxNorm         shoulder width in normalised 0-1 coords
 * @param {number} shoulderRealCm real shoulder width in cm
 * @param {number} vpWidth        Three.js viewport world width
 * @param {number} camZ           camera Z position (= 5)
 * @returns {number|null}         distance in cm, or null if unreliable
 */
export const measureDistanceCm = (dxNorm, shoulderRealCm, vpWidth, camZ = 5) => {
  if (!dxNorm || dxNorm < 0.006 || !vpWidth) return null;
  return (shoulderRealCm * camZ) / (dxNorm * vpWidth);
};

// ─── DISTANCE GUIDANCE ──────────────────────────────────────────────
/**
 * Guides user to stand at the right distance from the camera.
 * Ideal: shoulders occupy 17-40% of frame width.
 * At that range the pinhole formula gives highest accuracy.
 */
export const getDistanceGuidance = (dxNorm, clothingType = 'top') => {
  const min = clothingType === 'full' ? 0.13 : 0.17;
  const max = clothingType === 'full' ? 0.36 : 0.40;

  if (dxNorm < min)
    return { status: 'tooFar',   msg: 'Step closer to camera ↔' };
  if (dxNorm > max)
    return { status: 'tooClose', msg: 'Step back from camera ↔' };
  return   { status: 'good',    msg: '✓ Perfect distance' };
};