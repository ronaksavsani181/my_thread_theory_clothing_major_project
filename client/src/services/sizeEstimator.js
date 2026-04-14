/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  BIOMETRIC FITTING ENGINE  ·  FINAL v7.0                          ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  · Pinhole distance-compensated measurements                      ║
 * ║  · Multi-ruler blending (torso + leg + fallback)                  ║
 * ║  · Men / Women / Kids  ×  Top / Bottom / Full                     ║
 * ║  · Auto clothing-type and gender detection                        ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import { measureDistanceCm } from './arService';

// ─── SIZING TABLES (cm, industry standard) ──────────────────────────
const SIZES = {
  men: {
    top: [
      { s: 'XS',  sh: [0,   39],  ch: [0,   86]  },
      { s: 'S',   sh: [39,  42],  ch: [86,  92]  },
      { s: 'M',   sh: [42,  45],  ch: [92,  98]  },
      { s: 'L',   sh: [45,  48],  ch: [98,  105] },
      { s: 'XL',  sh: [48,  52],  ch: [105, 113] },
      { s: 'XXL', sh: [52,  999], ch: [113, 999] },
    ],
    bottom: [
      { s: '28', w: [0,   72]  }, { s: '30', w: [72,  77]  },
      { s: '32', w: [77,  82]  }, { s: '34', w: [82,  87]  },
      { s: '36', w: [87,  93]  }, { s: '38', w: [93,  99]  },
      { s: '40', w: [99,  999] },
    ],
  },
  women: {
    top: [
      { s: 'XS',  sh: [0,   36],  ch: [0,   80]  },
      { s: 'S',   sh: [36,  38],  ch: [80,  86]  },
      { s: 'M',   sh: [38,  41],  ch: [86,  92]  },
      { s: 'L',   sh: [41,  44],  ch: [92,  99]  },
      { s: 'XL',  sh: [44,  47],  ch: [99,  107] },
      { s: 'XXL', sh: [47,  999], ch: [107, 999] },
    ],
    bottom: [
      { s: 'XS / 24', w: [0,   62]  }, { s: 'S / 26',   w: [62,  67]  },
      { s: 'M / 28',  w: [67,  73]  }, { s: 'L / 30',   w: [73,  79]  },
      { s: 'XL / 32', w: [79,  86]  }, { s: 'XXL / 34', w: [86,  999] },
    ],
  },
  kids: {
    top: [
      { s: '2–3Y',   sh: [0,   24]  }, { s: '4–5Y',   sh: [24,  27]  },
      { s: '6–7Y',   sh: [27,  30]  }, { s: '8–9Y',   sh: [30,  33]  },
      { s: '10–11Y', sh: [33,  36]  }, { s: '12–13Y', sh: [36,  999] },
    ],
    bottom: [
      { s: '2–3Y',   w: [0,   52]  }, { s: '4–5Y',   w: [52,  55]  },
      { s: '6–7Y',   w: [55,  58]  }, { s: '8–9Y',   w: [58,  62]  },
      { s: '10–11Y', w: [62,  66]  }, { s: '12–13Y', w: [66,  999] },
    ],
  },
};

// ─── PIXEL DISTANCE (normalised coords) ─────────────────────────────
const pd = (a, b) => {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

// ─── MIDPOINT ───────────────────────────────────────────────────────
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// ─── MAIN ESTIMATOR ─────────────────────────────────────────────────
/**
 * Computes real-world measurements and size recommendation.
 *
 * ACCURACY SYSTEM — three independent rulers, blended:
 *   1. Pinhole distance ruler (most accurate when user stands correctly)
 *      → converts normalised px coords to real cm via D_cm
 *   2. Torso ruler (shoulder-mid to hip-mid, known proportion)
 *   3. Leg ruler  (hip-mid to ankle-mid, known proportion)
 *
 * @param {object} pose          smoothed MediaPipe pose
 * @param {number} userHeightCm  user-provided height
 * @param {string} gender        'men' | 'women' | 'kids'
 * @param {string} clothingType  'top' | 'bottom' | 'full'
 * @param {number} vpWidth       Three.js viewport world width
 * @param {number} camZ          camera Z position (= 5)
 */
export const estimateSize = (
  pose,
  userHeightCm  = 175,
  gender        = 'men',
  clothingType  = 'top',
  vpWidth       = 6.8,
  camZ          = 5,
) => {
  if (!pose?.leftShoulder || !pose?.rightShoulder) return null;

  const shoulderRealCm = userHeightCm * 0.236;  // industry ratio

  // ── SHOULDER WIDTH (normalised) ──────────────────────────────
  // Use ONLY X component to avoid errors when user turns sideways.
  // When turning 90°, dxNorm still gives the correct horizontal projection.
  const dxNorm = Math.abs(pose.rightShoulder.x - pose.leftShoulder.x);
  if (dxNorm < 0.008) return null;

  // ── RULER 1: PINHOLE DISTANCE (emaraic formula) ──────────────
  const D_cm = measureDistanceCm(dxNorm, shoulderRealCm, vpWidth, camZ);

  // Frame real width at this distance (world units)
  // frameRealW_cm = 2 × D × tan(FOV/2) = D × vpWidth / camZ
  const frameRealW = D_cm ? (D_cm * vpWidth / camZ) : null;

  // cm per normalised pixel = frameRealW_cm (since frame = 1.0 wide normalised)
  let cmPP = frameRealW ?? (shoulderRealCm / dxNorm);
  let conf = D_cm ? 0.86 : 0.68;

  const hasHips   = pose.leftHip   && pose.rightHip;
  const hasAnkles = pose.leftAnkle && pose.rightAnkle;

  // ── RULER 2: TORSO (shoulder_mid → hip_mid) ─────────────────
  if (hasHips) {
    const torsoPx  = pd(mid(pose.leftShoulder, pose.rightShoulder), mid(pose.leftHip, pose.rightHip));
    if (torsoPx > 0.02) {
      const torsoCmPP = (userHeightCm * 0.295) / torsoPx;
      cmPP = cmPP * 0.65 + torsoCmPP * 0.35;
      conf = Math.min(conf + 0.06, 0.96);
    }
  }

  // ── RULER 3: LEG (hip_mid → ankle_mid) ──────────────────────
  if (hasHips && hasAnkles) {
    const legPx    = pd(mid(pose.leftHip, pose.rightHip), mid(pose.leftAnkle, pose.rightAnkle));
    if (legPx > 0.02) {
      const legCmPP = (userHeightCm * 0.46) / legPx;
      cmPP = cmPP * 0.80 + legCmPP * 0.20;
      conf = Math.min(conf + 0.04, 0.97);
    }
  }

  // ── CONVERT TO REAL CM ───────────────────────────────────────
  const shoulderWidthCm = dxNorm * cmPP;
  const chestCircCm     = shoulderWidthCm * 2.05;

  const hipDxNorm   = hasHips ? Math.abs(pose.rightHip.x - pose.leftHip.x) : dxNorm / 1.05;
  const hipWidthCm  = hipDxNorm * cmPP;
  const waistCircCm = hipWidthCm * 1.78;

  // ── SIZE LOOKUP ──────────────────────────────────────────────
  const g = ['men', 'women', 'kids'].includes(gender) ? gender : 'men';
  let size = '?', note = '';

  if (clothingType === 'bottom') {
    const wc  = waistCircCm;
    const row = SIZES[g].bottom.find(r => wc >= r.w[0] && wc < r.w[1]) || SIZES[g].bottom.at(-1);
    size = row.s;
    const mid_w = (row.w[0] + row.w[1]) / 2;
    note = Math.abs(wc - mid_w) < 2.5 ? 'True waist fit. Sits perfectly at the hip.'
         : wc < mid_w                 ? 'Slim fit. Consider sizing up for relaxed feel.'
         :                              'Comfortable through hips. Easy movement.';
  } else {
    // Score every row by both shoulder AND chest proximity
    let best = SIZES[g].top[0], bestScore = Infinity;
    for (const r of SIZES[g].top) {
      const sm = (r.sh[0] + r.sh[1]) / 2;
      const cm = r.ch ? (r.ch[0] + r.ch[1]) / 2 : sm * 2.05;
      const sc = Math.abs(shoulderWidthCm - sm) * 0.60
               + Math.abs(chestCircCm     - cm) * 0.40;
      if (sc < bestScore) { bestScore = sc; best = r; }
    }
    size = best.s;
    const diff = shoulderWidthCm - (best.sh[0] + best.sh[1]) / 2;
    note = Math.abs(diff) < 1.5 ? 'Perfect shoulder alignment. True-to-size drape.'
         : diff < 0             ? 'Slim athletic fit. Structured shoulder seam.'
         :                        'Relaxed comfortable fit. Easy movement.';
  }

  return {
    size,
    confidence:  conf,
    fitNotes:    note,
    distanceCm:  D_cm ? Math.round(D_cm) : null,
    measurements: {
      shoulderWidthCm: +shoulderWidthCm.toFixed(1),
      chestCircCm:     +chestCircCm.toFixed(1),
      hipWidthCm:      +hipWidthCm.toFixed(1),
      waistCircCm:     +waistCircCm.toFixed(1),
    },
  };
};

// ─── PRODUCT META AUTO-DETECTION ────────────────────────────────────
const BOT_KW  = ['pant','jean','trouser','short','skirt','legging','chino','cargo','dhoti'];
const FULL_KW = ['dress','jumpsuit','romper','suit','overall','kurta','saree','sherwani','abaya'];

export const resolveClothingType = (p) => {
  if (p?.clothingType) return p.clothingType;
  const t = `${p?.title ?? ''} ${p?.category ?? ''}`.toLowerCase();
  if (FULL_KW.some(k => t.includes(k))) return 'full';
  if (BOT_KW.some(k => t.includes(k)))  return 'bottom';
  return 'top';
};

export const resolveGender = (p) => {
  if (p?.gender) return p.gender.toLowerCase();
  const t = `${p?.title ?? ''} ${p?.category ?? ''}`.toLowerCase();
  if (t.includes('women') || t.includes('girl') || t.includes('female')) return 'women';
  if (t.includes('kid') || t.includes('child') || t.includes('boy'))     return 'kids';
  return 'men';
};