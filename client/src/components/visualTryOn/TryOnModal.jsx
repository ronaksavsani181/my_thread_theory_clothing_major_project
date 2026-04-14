/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  VIRTUAL TRY-ON MODAL  ·  FINAL v7.0                              ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  · Full 33-landmark MediaPipe tracking pipeline                   ║
 * ║  · Live emaraic pinhole distance meter (cm, real-time)            ║
 * ║  · Distance guidance (step closer / step back)                    ║
 * ║  · AI size recommendation with full measurement breakdown          ║
 * ║  · Men / Women / Kids  ×  Tops / Bottoms / Full garments          ║
 * ║  · Photo capture with AR overlay compositing                      ║
 * ║  · Height calibration slider                                      ║
 * ║  · Front + rear camera switching on mobile                        ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  X, Camera, SwitchCamera, Scan, ShieldCheck,
  Download, Ruler, AlertCircle, Activity, MoveHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  initializePoseLandmarker,
  detectPose,
  PoseSmoother,
  extractLandmarks,
  checkVisibility,
  measureDistanceCm,
  getDistanceGuidance,
} from '../../services/arService';
import {
  estimateSize,
  resolveClothingType,
  resolveGender,
} from '../../services/sizeEstimator';
import ARCanvas from './ARCanvas';

// ─── CONSTANTS ──────────────────────────────────────────────────────
const STABLE_FRAMES_NEEDED = 18;    // must see body N frames before "locked"
const SIZE_UPDATE_EVERY    = 20;    // re-estimate every N frames
const DIST_UPDATE_EVERY    = 6;     // re-measure distance every N frames
const CAMERA_Z             = 5;     // must match ARCanvas camera position
const CAMERA_FOV           = 42;    // must match ARCanvas camera FOV

/** Three.js viewport world width at the given video aspect */
const vpWidth = (aspect) => {
  const h = 2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);
  return h * aspect;
};

// ─── COMPONENT ──────────────────────────────────────────────────────
const TryOnModal = ({ isOpen, onClose, product }) => {
  // Refs (don't trigger re-render)
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const rafRef       = useRef(0);
  const frameRef     = useRef(0);
  const stabRef      = useRef(0);
  const smootherRef  = useRef(new PoseSmoother(1.2, 0.007));

  // Device state
  const [isMobile,          setIsMobile]          = useState(false);
  const [facingMode,        setFacingMode]         = useState('user');
  const [permissionGranted, setPermissionGranted]  = useState(false);

  // AR state
  const [loading,           setLoading]            = useState(true);
  const [error,             setError]              = useState(null);
  const [pose,              setPose]               = useState(null);
  const [videoAspect,       setVideoAspect]        = useState(16 / 9);
  const [isStable,          setIsStable]           = useState(false);
  const [trackQuality,      setTrackQuality]       = useState(0);

  // Measurements
  const [distanceCm,        setDistanceCm]         = useState(null);
  const [distGuide,         setDistGuide]          = useState(null);
  const [recommendation,    setRecommendation]     = useState(null);

  // UI state
  const [capturedImage,     setCapturedImage]      = useState(null);
  const [userHeight,        setUserHeight]         = useState(175);
  const [showCalibration,   setShowCalibration]    = useState(false);
  const [showMeasurements,  setShowMeasurements]   = useState(false);

  // Derived product metadata
  const clothingType = useMemo(() => resolveClothingType(product), [product]);
  const gender       = useMemo(() => resolveGender(product),       [product]);

  // ── Detect mobile device ────────────────────────────────────
  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent)
    );
  }, []);

  // ── Main AR camera + tracking lifecycle ─────────────────────
  useEffect(() => {
    if (!isOpen) return;

    let landmarker = null;
    let stream     = null;

    const startAR = async () => {
      try {
        setLoading(true);
        setError(null);
        setPose(null);
        setIsStable(false);
        setDistanceCm(null);
        setRecommendation(null);
        stabRef.current  = 0;
        frameRef.current = 0;

        // ── Init MediaPipe ──────────────────────────────────
        landmarker = await initializePoseLandmarker();

        // ── Request camera ──────────────────────────────────
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode:  isMobile ? facingMode : 'user',
            width:       { ideal: 1920 },
            height:      { ideal: 1080 },
            frameRate:   { ideal: 30 },
          },
        });

        const vid = videoRef.current;
        if (!vid) return;

        vid.srcObject = stream;

        await new Promise((resolve) => {
          vid.onloadedmetadata = () => {
            vid.play().catch(() => {});
            if (vid.videoWidth && vid.videoHeight) {
              setVideoAspect(vid.videoWidth / vid.videoHeight);
            }
            setPermissionGranted(true);
            resolve();
          };
        });

        setLoading(false);

        // ── TRACKING LOOP ───────────────────────────────────
        const loop = () => {
          rafRef.current = requestAnimationFrame(loop);

          const v = videoRef.current;
          if (!v || v.paused || v.ended || v.readyState < 2) return;

          frameRef.current++;
          const result = detectPose(v, landmarker);

          if (result?.landmarks?.length > 0) {
            const lm = result.landmarks[0];

            // Tracking quality: avg visibility of 7 key joints
            const keyIdx = [0, 7, 8, 11, 12, 23, 24];
            const avgVis = keyIdx.reduce((s, i) => s + (lm[i]?.visibility ?? 0), 0) / keyIdx.length;
            setTrackQuality(avgVis);

            const lsVis = (lm[11]?.visibility ?? 0) > 0.45;
            const rsVis = (lm[12]?.visibility ?? 0) > 0.45;

            if (lsVis && rsVis) {
              // Build up stability counter
              stabRef.current = Math.min(stabRef.current + 1, STABLE_FRAMES_NEEDED + 15);
              if (stabRef.current >= STABLE_FRAMES_NEEDED) setIsStable(true);

              // Extract + smooth all landmarks
              const raw      = extractLandmarks(lm);
              const smoothed = smootherRef.current.smooth(raw);
              setPose(smoothed);

              // ── LIVE DISTANCE MEASUREMENT ─────────────────
              // emaraic pinhole formula: D = (W × F) / P
              if (frameRef.current % DIST_UPDATE_EVERY === 0 && smoothed) {
                const dxNorm = Math.abs(
                  (smoothed.rightShoulder?.x ?? 0) - (smoothed.leftShoulder?.x ?? 0)
                );
                const realShCm = userHeight * 0.236;
                const vpW      = vpWidth(videoAspect);
                const D        = measureDistanceCm(dxNorm, realShCm, vpW, CAMERA_Z);

                if (D) {
                  setDistanceCm(Math.round(D));
                  setDistGuide(getDistanceGuidance(dxNorm, clothingType));
                }
              }

              // ── SIZE ESTIMATION ───────────────────────────
              if (frameRef.current % SIZE_UPDATE_EVERY === 0 && smoothed) {
                const vpW = vpWidth(videoAspect);
                const rec = estimateSize(smoothed, userHeight, gender, clothingType, vpW, CAMERA_Z);
                if (rec) setRecommendation(rec);
              }

            } else {
              // Gradual decay — brief occlusion doesn't reset
              stabRef.current = Math.max(stabRef.current - 2, 0);
              if (stabRef.current < STABLE_FRAMES_NEEDED / 2) {
                setIsStable(false);
                setPose(null);
              }
            }

          } else {
            stabRef.current = Math.max(stabRef.current - 3, 0);
            if (stabRef.current === 0) {
              setIsStable(false);
              setPose(null);
            }
          }
        };

        rafRef.current = requestAnimationFrame(loop);

      } catch (err) {
        console.error('AR start error:', err);
        setLoading(false);
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Could not start camera: ${err.message}. Please try again.`);
        }
      }
    };

    startAR();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isOpen, facingMode, isMobile, userHeight]);

  // ── Photo capture with AR overlay compositing ────────────────
  const handleCapture = useCallback(() => {
    const vid = videoRef.current;
    const con = containerRef.current;
    if (!vid || !con) return;

    const canvas = document.createElement('canvas');
    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror video for front camera
    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(vid, 0, 0);
    ctx.restore();

    // Composite the AR WebGL canvas on top
    const arCanvas = con.querySelector('canvas');
    if (arCanvas) ctx.drawImage(arCanvas, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL('image/png'));
  }, [facingMode]);

  // ── Guide text based on clothing type ────────────────────────
  const guideMessage =
    clothingType === 'bottom' ? 'Show waist and legs clearly in frame' :
    clothingType === 'full'   ? 'Step back — show your full body'      :
                                'Show both shoulders in frame';

  // ── Distance pill colour ─────────────────────────────────────
  const distPillClass =
    !distGuide             ? 'bg-white/5 border-white/15'         :
    distGuide.status === 'good'     ? 'bg-emerald-500/15 border-emerald-500/30'  :
    distGuide.status === 'tooClose' ? 'bg-amber-500/15  border-amber-500/30'     :
                                      'bg-sky-500/15    border-sky-500/30';
  const distTextClass =
    !distGuide             ? 'text-white/60'    :
    distGuide.status === 'good'     ? 'text-emerald-300' :
    distGuide.status === 'tooClose' ? 'text-amber-300'   :
                                      'text-sky-300';

  if (!isOpen) return null;

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col font-sans touch-none select-none"
    >

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP HUD
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="absolute top-0 left-0 right-0 z-[60] px-5 pt-5 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/90 via-black/45 to-transparent">

        {/* Left column */}
        <div className="pointer-events-auto flex flex-col gap-2.5 pb-4">

          {/* Tracking status badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-500 ${
            isStable
              ? 'bg-emerald-500/20 border-emerald-500/40'
              : 'bg-orange-400/10 border-orange-400/20'
          }`}>
            <Scan className={`w-4 h-4 ${isStable ? 'text-emerald-400' : 'text-orange-300 animate-pulse'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isStable ? 'text-emerald-100' : 'text-orange-100'}`}>
              {isStable ? 'Body Locked' : 'Detecting…'}
            </span>
            {isStable && (
              <span className="text-[9px] text-emerald-300/55 font-medium ml-1 uppercase tracking-wide">
                {gender} · {clothingType}
              </span>
            )}
          </div>

          {/* Tracking quality bar */}
          {!loading && !error && (
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-white/20" />
              <div className="w-20 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/50 rounded-full transition-all duration-100"
                  style={{ width: `${trackQuality * 100}%` }}
                />
              </div>
              <span className="text-[8px] text-white/25 font-bold uppercase tracking-widest">
                {Math.round(trackQuality * 100)}%
              </span>
            </div>
          )}

          {/* ── LIVE DISTANCE METER (emaraic pinhole formula) ── */}
          {distanceCm && isStable && (
            <div className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border backdrop-blur-md transition-all ${distPillClass}`}>
              <MoveHorizontal className={`w-3.5 h-3.5 ${distTextClass}`} />
              <div className="flex flex-col">
                <span className={`text-[13px] font-bold tabular-nums leading-none ${distTextClass}`}>
                  {distanceCm} cm
                </span>
                {distGuide && distGuide.status !== 'good' ? (
                  <span className="text-[8px] font-bold text-white/45 uppercase tracking-widest mt-0.5">
                    {distGuide.msg}
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">
                    ✓ Ideal distance
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Product info */}
          <div className="mt-1">
            <h2 className="text-white font-serif text-xl md:text-2xl drop-shadow-xl uppercase tracking-wider leading-snug max-w-[240px]">
              {product?.title}
            </h2>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
              ₹ {product?.price?.toLocaleString?.() ?? product?.price}
            </p>
          </div>
        </div>

        {/* Right column: controls */}
        <div className="flex flex-col gap-3 pointer-events-auto items-end">
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCalibration((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <Ruler className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{userHeight} cm</span>
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEIGHT CALIBRATION PANEL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showCalibration && (
        <div className="absolute top-[145px] right-5 z-[70] w-64 bg-black/94 backdrop-blur-3xl border border-white/20 p-5 rounded-2xl shadow-2xl">
          <p className="text-white/35 text-[8px] font-bold tracking-[0.25em] uppercase mb-0.5">
            Your Height
          </p>
          <p className="text-white/20 text-[7px] tracking-wide uppercase mb-4">
            Improves size accuracy
          </p>
          <input
            type="range"
            min="100"
            max="220"
            value={userHeight}
            onChange={(e) => setUserHeight(+e.target.value)}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white mb-5"
          />
          <div className="flex justify-between items-center">
            <span className="text-white text-3xl font-light">
              {userHeight}
              <span className="text-xs text-white/35 ml-1">cm</span>
            </span>
            <button
              onClick={() => setShowCalibration(false)}
              className="px-4 py-2 border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-full"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CAMERA VIEWPORT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#070707]">

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 z-40 bg-[#070707] flex flex-col items-center justify-center gap-5">
            <div className="w-10 h-10 border-2 border-white/10 border-t-white/70 rounded-full animate-spin" />
            <p className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
              Initialising Vision Engine…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 z-40 bg-[#070707] flex flex-col items-center justify-center p-10 text-center gap-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-white/90 text-sm leading-relaxed max-w-xs">{error}</p>
            <button
              onClick={onClose}
              className="px-10 py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.22em] hover:bg-gray-200 transition-colors"
            >
              Exit Try-On
            </button>
          </div>
        )}

        {/* Live camera feed */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          playsInline
          muted
          autoPlay
        />

        {/* AR overlay */}
        {!loading && !error && permissionGranted && product?.model3Durl && (
          <ARCanvas
            pose={pose}
            product={product}
            videoAspect={videoAspect}
            isMirrored={facingMode === 'user'}
            userHeightCm={userHeight}
          />
        )}

        {/* Body guide prompt */}
        {!isStable && !loading && !error && permissionGranted && (
          <div className="absolute bottom-36 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full shadow-xl">
              <p className="text-white text-[10px] font-bold tracking-[0.22em] uppercase">
                {guideMessage}
              </p>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            AI SIZE RECOMMENDATION CARD
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {recommendation && isStable && (
          <div className="absolute left-4 bottom-28 z-40 w-[264px]">
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <p className="text-white/30 text-[8px] font-bold tracking-[0.25em] uppercase mb-2">
                  AI Recommended Size
                </p>

                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-light text-white uppercase leading-none tracking-tight">
                    {recommendation.size}
                  </span>
                  <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-1">
                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wide">
                      {Math.round(recommendation.confidence * 100)}% match
                    </span>
                  </div>
                </div>

                <p className="text-white/50 text-[11px] leading-relaxed italic border-l-2 border-white/15 pl-3 mb-4">
                  "{recommendation.fitNotes}"
                </p>

                {/* Distance used for this measurement */}
                {recommendation.distanceCm && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/5 rounded-xl">
                    <MoveHorizontal className="w-3 h-3 text-white/25" />
                    <span className="text-[8px] text-white/35 uppercase tracking-widest font-bold">
                      Measured at
                    </span>
                    <span className="text-[11px] text-white/65 font-bold tabular-nums">
                      {recommendation.distanceCm} cm
                    </span>
                    <span className="text-[8px] text-white/35 uppercase tracking-widest font-bold">
                      from camera
                    </span>
                  </div>
                )}

                {/* Measurements toggle */}
                <button
                  onClick={() => setShowMeasurements((v) => !v)}
                  className="flex items-center justify-between w-full px-3 py-2 bg-white/5 hover:bg-white/8 rounded-xl transition-colors mb-1"
                >
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                    Body Measurements
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${showMeasurements ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Expandable measurement grid */}
              {showMeasurements && recommendation.measurements && (
                <div className="px-5 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Shoulder', `${recommendation.measurements.shoulderWidthCm} cm`],
                      ['Chest',    `${recommendation.measurements.chestCircCm} cm`],
                      ['Hip',      `${recommendation.measurements.hipWidthCm} cm`],
                      ['Waist',    `${recommendation.measurements.waistCircCm} cm`],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5">
                        <p className="text-white/25 text-[7px] uppercase tracking-widest font-bold mb-0.5">
                          {label}
                        </p>
                        <p className="text-white/85 text-[12px] font-semibold tabular-nums">
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 px-5 py-3 border-t border-white/8">
                <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
                <span className="text-[7px] text-white/28 uppercase tracking-[0.22em] font-bold">
                  Pinhole Distance · 6-DoF · 33-Point Skeleton
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CAPTURED PHOTO PREVIEW
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {capturedImage && (
          <div className="absolute inset-0 z-[100] bg-black/96 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img
                src={capturedImage}
                className="w-full h-auto block"
                alt="Virtual try-on snapshot"
              />
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/55 rounded-full text-white border border-white/20 backdrop-blur-md hover:bg-black/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 mt-6 w-full max-w-sm">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-4 bg-transparent border border-white text-white text-[10px] font-bold uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-colors"
              >
                Retake
              </button>
              <a
                href={capturedImage}
                download={`${(product?.title ?? 'tryon').replace(/\s+/g, '-').toLowerCase()}.png`}
                className="flex-1 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" /> Save
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM SHUTTER CONTROLS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-10 pt-6 bg-gradient-to-t from-black via-black/82 to-transparent flex justify-center items-center gap-14">

        {/* Camera flip (mobile only) */}
        {isMobile && (
          <button
            onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
            className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <SwitchCamera className="w-6 h-6" />
          </button>
        )}

        {/* Shutter button */}
        <button onClick={handleCapture} className="relative group">
          <div className="absolute inset-0 rounded-full border-2 border-white/72 scale-[1.3] group-active:scale-[1.1] transition-transform duration-200" />
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl">
            <Camera className="w-8 h-8 text-black" />
          </div>
        </button>

        {/* Spacer when mobile so shutter is centred */}
        {isMobile && <div className="w-14 h-14" />}
      </div>

    </div>
  );
};

export default TryOnModal;