import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="group flex flex-col w-full relative font-sans relative overflow-hidden">
      
      {/* =========================================
          IMAGE AREA GHOST
          ========================================= */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100/80 border border-neutral-100 overflow-hidden rounded-sm">
        
        {/* Fake Top-Left Badge */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 h-[18px] sm:h-[22px] w-14 sm:w-16 bg-neutral-200/80 rounded-sm z-10"></div>
        
        {/* Fake Wishlist Button (Top-Right Circle) */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 h-[32px] w-[32px] sm:h-[36px] sm:w-[36px] bg-neutral-200/80 rounded-full z-10"></div>

        {/* 🌟 LUXURY SHIMMER SWEEP ANIMATION */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-0"></div>
      </div>

      {/* =========================================
          TEXT DETAILS GHOST
          ========================================= */}
      <div className="pt-4 sm:pt-5 flex flex-col gap-2 sm:gap-2.5 px-1 relative overflow-hidden">
        
        {/* Category Line */}
        <div className="h-2 sm:h-2.5 bg-neutral-200 w-1/4 rounded-sm relative overflow-hidden">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>
        
        <div className="flex justify-between items-start mt-0.5 sm:mt-1 gap-3 sm:gap-4">
          
          {/* Title Lines (2 lines for realism) */}
          <div className="flex flex-col gap-1.5 sm:gap-2 w-2/3">
            <div className="h-2.5 sm:h-3.5 bg-neutral-200 w-full rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="h-2.5 sm:h-3.5 bg-neutral-200 w-4/5 rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
          
          {/* Price Line (Right Aligned) */}
          <div className="h-2.5 sm:h-3.5 bg-neutral-200 w-1/4 rounded-sm relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          
        </div>
      </div>

      {/* 🌟 INJECTED CUSTOM KEYFRAME FOR SHIMMER 
          This makes the light sweep across the grey blocks continuously.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}