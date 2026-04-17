import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Hero() {
  // Custom Typewriter Effect Logic
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
    }, 120); // Typing speed
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <img
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
        alt="Thread Theory Luxury Fashion"
        className="absolute inset-0 w-full h-full object-cover object-top scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
      />

      {/* EDITORIAL GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-neutral-900/20 to-neutral-950/90"></div>

      {/* CONTENT */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-5 sm:px-8 z-10 pt-20">
        
        {/* TYPEWRITER TEXT */}
        <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.4em] text-neutral-300 mb-6 sm:mb-8 uppercase min-h-[20px]">
          {typedText}
          <span className="animate-[blink_1s_infinite] border-r-2 border-white ml-1"></span>
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-tighter mb-4 sm:mb-6 leading-[1.05] uppercase drop-shadow-2xl px-2 opacity-0 animate-[fade-in-up_1s_ease-out_0.5s_forwards]">
          Elevate Your <br />
          <span className="font-serif font-bold italic tracking-normal pr-2 sm:pr-4">Everyday</span>
        </h1>

        <p className="text-neutral-300 max-w-sm sm:max-w-lg mb-10 sm:mb-12 text-xs sm:text-sm md:text-base font-light tracking-wide leading-relaxed px-4 opacity-0 animate-[fade-in-up_1s_ease-out_0.8s_forwards]">
          Discover premium collections curated for the modern aesthetic. Where unparalleled craftsmanship meets timeless style.
        </p>

        <div className="opacity-0 animate-[fade-in-up_1s_ease-out_1.1s_forwards]">
          <Link
            to="/products"
            className="group relative overflow-hidden bg-white text-neutral-950 px-10 sm:px-12 py-3.5 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:text-white inline-block shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Explore Collection</span>
            <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />
    </section>
  );
}