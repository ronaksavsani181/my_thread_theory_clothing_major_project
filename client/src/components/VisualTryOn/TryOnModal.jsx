/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  VIRTUAL TRY-ON MODAL  ·  FINAL v8.0 (LUXURY TOGGLE UI)           ║
 * ║  ─────────────────────────────────────────────────────────────    ║
 * ║  · Full 33-landmark MediaPipe tracking pipeline                   ║
 * ║  · Toggleable "Smart Fit" HUD for unobstructed AR viewing         ║
 * ║  · Cinematic entry/exit fade animations                           ║
 * ║  · AI size recommendation with full measurement breakdown         ║
 * ║  · Photo capture with AR overlay compositing                      ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  X, Camera, SwitchCamera, Scan, ShieldCheck,
  Download, Ruler, AlertCircle, Activity, MoveHorizontal,
  ChevronRight, Maximize2, Minimize2, Sparkles
} from 'lucide-react';
import {
  initializePoseLandmarker, detectPose, PoseSmoother,
  extractLandmarks, checkVisibility, measureDistanceCm, getDistanceGuidance,
} from '../../services/arService';
import { estimateSize, resolveClothingType, resolveGender } from '../../services/sizeEstimator';
import ARCanvas from './ARCanvas';

// ─── CONSTANTS ──────────────────────────────────────────────────────
const STABLE_FRAMES_NEEDED = 18;
const SIZE_UPDATE_EVERY    = 20;
const DIST_UPDATE_EVERY    = 6;
const CAMERA_Z             = 5;
const CAMERA_FOV           = 42;

const vpWidth = (aspect) => {
  const h = 2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);
  return h * aspect;
};

export default function TryOnModal({ isOpen, onClose, product }) {
  // Refs
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const rafRef       = useRef(0);
  const frameRef     = useRef(0);
  const stabRef      = useRef(0);
  const smootherRef  = useRef(new PoseSmoother(1.2, 0.007));

  // Device & Animation state
  const [isMobile, setIsMobile] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Cinematic exit

  // AR & Tracking state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pose, setPose] = useState(null);
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [isStable, setIsStable] = useState(false);
  const [trackQuality, setTrackQuality] = useState(0);

  // Analytics & Measurement state
  const [distanceCm, setDistanceCm] = useState(null);
  const [distGuide, setDistGuide] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  // UI Toggle states
  const [showHUD, setShowHUD] = useState(true); // Toggle for clear view
  const [capturedImage, setCapturedImage] = useState(null);
  const [userHeight, setUserHeight] = useState(175);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const clothingType = useMemo(() => resolveClothingType(product), [product]);
  const gender       = useMemo(() => resolveGender(product), [product]);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // ── Main AR tracking lifecycle ──────────────────────────────
  useEffect(() => {
    if (!isOpen || isClosing) return;

    let landmarker = null;
    let stream     = null;

    const startAR = async () => {
      try {
        setLoading(true); setError(null); setPose(null); setIsStable(false);
        setDistanceCm(null); setRecommendation(null);
        stabRef.current = 0; frameRef.current = 0;

        landmarker = await initializePoseLandmarker();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isMobile ? facingMode : 'user', width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        });

        const vid = videoRef.current;
        if (!vid) return;

        vid.srcObject = stream;
        await new Promise((resolve) => {
          vid.onloadedmetadata = () => {
            vid.play().catch(() => {});
            if (vid.videoWidth && vid.videoHeight) setVideoAspect(vid.videoWidth / vid.videoHeight);
            setPermissionGranted(true);
            resolve();
          };
        });

        setLoading(false);

        const loop = () => {
          rafRef.current = requestAnimationFrame(loop);
          const v = videoRef.current;
          if (!v || v.paused || v.ended || v.readyState < 2) return;

          frameRef.current++;
          const result = detectPose(v, landmarker);

          if (result?.landmarks?.length > 0) {
            const lm = result.landmarks[0];
            const keyIdx = [0, 7, 8, 11, 12, 23, 24];
            const avgVis = keyIdx.reduce((s, i) => s + (lm[i]?.visibility ?? 0), 0) / keyIdx.length;
            setTrackQuality(avgVis);

            if ((lm[11]?.visibility ?? 0) > 0.45 && (lm[12]?.visibility ?? 0) > 0.45) {
              stabRef.current = Math.min(stabRef.current + 1, STABLE_FRAMES_NEEDED + 15);
              if (stabRef.current >= STABLE_FRAMES_NEEDED) setIsStable(true);

              const raw = extractLandmarks(lm);
              const smoothed = smootherRef.current.smooth(raw);
              setPose(smoothed);

              if (frameRef.current % DIST_UPDATE_EVERY === 0 && smoothed) {
                const dxNorm = Math.abs((smoothed.rightShoulder?.x ?? 0) - (smoothed.leftShoulder?.x ?? 0));
                const realShCm = userHeight * 0.236;
                const D = measureDistanceCm(dxNorm, realShCm, vpWidth(videoAspect), CAMERA_Z);
                if (D) {
                  setDistanceCm(Math.round(D));
                  setDistGuide(getDistanceGuidance(dxNorm, clothingType));
                }
              }

              if (frameRef.current % SIZE_UPDATE_EVERY === 0 && smoothed) {
                const rec = estimateSize(smoothed, userHeight, gender, clothingType, vpWidth(videoAspect), CAMERA_Z);
                if (rec) setRecommendation(rec);
              }
            } else {
              stabRef.current = Math.max(stabRef.current - 2, 0);
              if (stabRef.current < STABLE_FRAMES_NEEDED / 2) { setIsStable(false); setPose(null); }
            }
          } else {
            stabRef.current = Math.max(stabRef.current - 3, 0);
            if (stabRef.current === 0) { setIsStable(false); setPose(null); }
          }
        };
        rafRef.current = requestAnimationFrame(loop);

      } catch (err) {
        setLoading(false);
        if (err.name === 'NotAllowedError') setError('Camera access denied. Please allow camera permissions.');
        else if (err.name === 'NotFoundError') setError('No camera found on this device.');
        else setError(`Could not start camera: ${err.message}`);
      }
    };

    startAR();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isOpen, isClosing, facingMode, isMobile, userHeight]);

  const handleCapture = useCallback(() => {
    const vid = videoRef.current;
    const con = containerRef.current;
    if (!vid || !con) return;

    const canvas = document.createElement('canvas');
    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(vid, 0, 0);
    ctx.restore();

    const arCanvas = con.querySelector('canvas');
    if (arCanvas) ctx.drawImage(arCanvas, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL('image/png'));
  }, [facingMode]);

  // Cinematic Close Function
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500); // 500ms fade out
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[200] bg-black overflow-hidden flex flex-col font-sans touch-none select-none transition-opacity duration-500 ease-[0.25,1,0.5,1] ${isClosing || !isOpen ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TOP MINIMAL BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="absolute top-0 left-0 right-0 z-[60] px-5 sm:px-8 pt-6 sm:pt-8 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent pb-10">
        
        {/* Product Title & Close */}
        <div className="pointer-events-auto flex items-start gap-4">
          <button onClick={handleCloseModal} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg">
            <X className="w-5 h-5" />
          </button>
          <div className="mt-1">
            <h2 className="text-white font-serif text-xl md:text-2xl drop-shadow-xl uppercase tracking-wider leading-snug max-w-[240px]">
              {product?.title}
            </h2>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
              ₹ {product?.price?.toLocaleString?.() ?? product?.price}
            </p>
          </div>
        </div>

        {/* Right Controls (Camera / Calibrate) */}
        <div className="flex flex-col gap-3 pointer-events-auto items-end">
          {isMobile && (
            <button onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))} className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg">
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowCalibration((v) => !v)} className="flex items-center gap-2 px-4 py-3 bg-black/40 hover:bg-black/60 rounded-full text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg">
            <Ruler className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{userHeight} cm</span>
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CALIBRATION DROPDOWN
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showCalibration && (
        <div className="absolute top-[80px] right-5 sm:right-8 z-[70] w-64 bg-black/95 backdrop-blur-3xl border border-white/20 p-5 rounded-2xl shadow-2xl animate-[fade-in-up_0.3s_ease-out_forwards]">
          <p className="text-white/40 text-[8px] font-bold tracking-[0.25em] uppercase mb-0.5">Your Height</p>
          <p className="text-white/25 text-[7px] tracking-wide uppercase mb-4">Improves size accuracy</p>
          <input type="range" min="100" max="220" value={userHeight} onChange={(e) => setUserHeight(+e.target.value)} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white mb-5" />
          <div className="flex justify-between items-center">
            <span className="text-white text-3xl font-light">{userHeight}<span className="text-xs text-white/35 ml-1">cm</span></span>
            <button onClick={() => setShowCalibration(false)} className="px-5 py-2.5 border border-white/30 text-[9px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-full">Done</button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CAMERA VIEWPORT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#070707]">
        {/* Loading / Error States */}
        {loading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5">
            <div className="w-10 h-10 border-2 border-white/10 border-t-white/70 rounded-full animate-spin" />
            <p className="text-white/60 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Initialising Engine…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-10 text-center gap-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-white/90 text-sm leading-relaxed max-w-xs">{error}</p>
            <button onClick={handleCloseModal} className="px-10 py-4 bg-white text-black font-bold text-[10px] uppercase tracking-[0.22em] hover:bg-gray-200 transition-colors">Exit Try-On</button>
          </div>
        )}

        <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} playsInline muted autoPlay />

        {!loading && !error && permissionGranted && product?.model3Durl && (
          <ARCanvas pose={pose} product={product} videoAspect={videoAspect} isMirrored={facingMode === 'user'} userHeightCm={userHeight} />
        )}

        {/* Floating Guide Prompt (When no stable body) */}
        {!isStable && !loading && !error && permissionGranted && (
          <div className="absolute bottom-36 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full shadow-xl">
              <p className="text-white text-[10px] font-bold tracking-[0.22em] uppercase">{clothingType === 'bottom' ? 'Show waist and legs clearly' : clothingType === 'full' ? 'Step back — show your full body' : 'Show both shoulders in frame'}</p>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TOGGLEABLE "SMART FIT" ANALYTICS HUD
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className={`absolute left-4 sm:left-8 bottom-32 sm:bottom-8 z-40 w-[280px] transition-all duration-500 ease-[0.25,1,0.5,1] ${showHUD && isStable && recommendation ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className="bg-black/85 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
            
            {/* Status Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Scan className={`w-4 h-4 ${isStable ? 'text-emerald-400' : 'text-orange-300'}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">Body Locked</span>
              </div>
              <button onClick={() => setShowHUD(false)} className="text-white/40 hover:text-white p-1 transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* AI Recommendation Core */}
            {recommendation && (
              <div className="px-5 pt-5 pb-4">
                <p className="text-white/30 text-[8px] font-bold tracking-[0.25em] uppercase mb-2">AI Recommended Fit</p>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-light text-white uppercase leading-none tracking-tight">{recommendation.size}</span>
                  <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-1">
                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wide">{Math.round(recommendation.confidence * 100)}% Match</span>
                  </div>
                </div>
                <p className="text-white/60 text-[11px] leading-relaxed italic border-l-2 border-white/20 pl-3 mb-5">"{recommendation.fitNotes}"</p>

                {/* Distance & Tracking Quality */}
                <div className="flex flex-col gap-2 mb-4">
                  {distanceCm && (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${!distGuide ? 'bg-white/5 border-white/10' : distGuide.status === 'good' ? 'bg-emerald-500/10 border-emerald-500/20' : distGuide.status === 'tooClose' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-sky-500/10 border-sky-500/20'}`}>
                      <div className="flex items-center gap-2">
                        <MoveHorizontal className={`w-3.5 h-3.5 ${distGuide?.status === 'good' ? 'text-emerald-400' : 'text-white/50'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Distance</span>
                      </div>
                      <span className="text-[11px] font-bold text-white tabular-nums">{distanceCm} cm</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-white/50" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Quality</span>
                    </div>
                    <span className="text-[11px] font-bold text-white tabular-nums">{Math.round(trackQuality * 100)}%</span>
                  </div>
                </div>

                {/* Measurements Toggle */}
                <button onClick={() => setShowMeasurements((v) => !v)} className="flex items-center justify-between w-full px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors mb-1">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">View Measurements</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${showMeasurements ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}

            {/* Expandable Measurement Grid */}
            {showMeasurements && recommendation?.measurements && (
              <div className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-2">
                  {[['Shoulder', recommendation.measurements.shoulderWidthCm], ['Chest', recommendation.measurements.chestCircCm], ['Hip', recommendation.measurements.hipWidthCm], ['Waist', recommendation.measurements.waistCircCm]].map(([label, val]) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                      <p className="text-white/30 text-[7px] uppercase tracking-widest font-bold mb-1">{label}</p>
                      <p className="text-white text-[12px] font-semibold tabular-nums">{val} cm</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CAPTURED PHOTO PREVIEW OVERLAY
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {capturedImage && (
          <div className="absolute inset-0 z-[300] bg-black/96 flex flex-col items-center justify-center p-6 animate-[fade-in-up_0.3s_ease-out_forwards]">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img src={capturedImage} className="w-full h-auto block" alt="Virtual try-on snapshot" />
              <button onClick={() => setCapturedImage(null)} className="absolute top-4 right-4 p-2.5 bg-black/55 rounded-full text-white border border-white/20 backdrop-blur-md hover:bg-black/80 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 mt-6 w-full max-w-sm">
              <button onClick={() => setCapturedImage(null)} className="flex-1 py-4 bg-transparent border border-white text-white text-[10px] font-bold uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-colors rounded-sm">
                Retake
              </button>
              <a href={capturedImage} download={`${(product?.title ?? 'tryon').replace(/\s+/g, '-').toLowerCase()}.png`} className="flex-1 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors rounded-sm">
                <Download className="w-4 h-4" /> Save Photo
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM ACTION BAR (Shutter & HUD Toggle)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-8 sm:pb-10 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
        <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 flex justify-between items-center pointer-events-auto">
          
          {/* Left: HUD Toggle */}
          <div className="w-1/3 flex justify-start">
            {isStable && recommendation && (
              <button 
                onClick={() => setShowHUD(!showHUD)} 
                className={`flex items-center gap-2 px-4 py-3 rounded-full border backdrop-blur-md transition-all active:scale-95 shadow-lg ${showHUD ? 'bg-white/10 border-white/20 text-white/80' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'}`}
              >
                {showHUD ? <Minimize2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">
                  {showHUD ? 'Hide Fit Data' : 'View Fit Data'}
                </span>
              </button>
            )}
          </div>

          {/* Center: Shutter */}
          <div className="w-1/3 flex justify-center">
            <button onClick={handleCapture} className="relative group">
              <div className="absolute inset-0 rounded-full border-2 border-white/70 scale-[1.3] group-hover:scale-[1.35] group-active:scale-[1.1] transition-transform duration-200" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
              </div>
            </button>
          </div>

          {/* Right: Spacer for balance */}
          <div className="w-1/3"></div>
        </div>
      </div>
      
    </div>
  );
}