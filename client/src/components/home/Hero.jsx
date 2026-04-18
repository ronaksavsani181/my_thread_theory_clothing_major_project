import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Spring / Summer 2026";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
      }
    }, 100); 
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      /* 🌟 BULLETPROOF HEIGHT FIX
       * Removed max-h-[100%] which was breaking the desktop view.
       * min-h-[100dvh]: Fills mobile screens perfectly (ignoring address bars).
       * lg:min-h-screen: Forces exact 100% monitor height on laptops & desktops.
       */
      className="relative w-full min-h-[100dvh] md:min-h-screen lg:min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950"
    >
      
      {/* PERFECTLY SCALED BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full">
         <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Thread Theory Luxury Fashion"
          className="w-full h-full object-cover object-center scale-110 animate-[slow-pan_30s_ease-in-out_infinite_alternate] will-change-transform"
        />
      </div>

      {/* EDITORIAL GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-900/40 to-neutral-950/90 z-0"></div>

      {/* SAFE-AREA CONTENT WRAPPER 
          pt-[84px] on desktop pushes the exact center down slightly so the text 
          doesn't hide under your black Navigation bar.
      */}
      <div className="relative my-30 z-10 flex flex-col justify-center items-center text-center text-white px-5 sm:px-8 md:px-12 w-full max-w-[120rem] mx-auto pt-[70px] lg:pt-[84px] pb-[env(safe-area-inset-bottom)]">
        
        {/* TYPEWRITER TEXT */}
        <div className="h-[20px] sm:h-[24px] mb-6 sm:mb-8 flex items-center justify-center mt-12 sm:mt-0">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.4em] text-neutral-300 uppercase flex items-center">
            {typedText}
            <span className="animate-[blink_1s_infinite] w-[2px] h-[1em] bg-white ml-2 inline-block"></span>
          </p>
        </div>

        {/* FLUID RESPONSIVE HEADING */}
        <h1 className="text-[12vw] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8rem] font-light tracking-tighter mb-4 sm:mb-6 leading-[1.05] sm:leading-[1.05] uppercase drop-shadow-2xl px-2 opacity-0 animate-[fade-in-up_1s_ease-out_0.4s_forwards] w-full break-words">
          Elevate Your <br className="hidden sm:block" />
          <span className="font-serif font-bold italic tracking-normal pr-2 sm:pr-4 block sm:inline mt-1 sm:mt-0">Everyday</span>
        </h1>

        {/* DESCRIPTION */}
        <p className="text-neutral-300 max-w-[18rem] sm:max-w-md md:max-w-lg mb-10 sm:mb-12 text-[11px] sm:text-sm md:text-base font-light tracking-wide leading-relaxed px-2 opacity-0 animate-[fade-in-up_1s_ease-out_0.7s_forwards]">
          Discover premium collections curated for the modern aesthetic. Where unparalleled craftsmanship meets timeless style.
        </p>

        {/* CTA BUTTON */}
        <div className="opacity-0 animate-[fade-in-up_1s_ease-out_1s_forwards]">
          <Link
            to="/products"
            className="group relative overflow-hidden bg-white text-neutral-950 px-10 sm:px-14 py-4 sm:py-5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white inline-flex justify-center items-center active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] rounded-sm"
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Explore Collection</span>
            <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
          </Link>
        </div>
      </div>

      {/* CUSTOM KEYFRAMES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes slow-pan {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-1.5%, 2%); }
        }
      `}} />
    </section>
  );
}