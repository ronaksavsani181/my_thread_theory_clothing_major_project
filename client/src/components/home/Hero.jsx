import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* BACKGROUND IMAGE - Cinematic Fashion Placeholder */}
      <img
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
        alt="Thread Theory Luxury Fashion"
        className="absolute inset-0 w-full h-full object-cover object-top scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
      />

      {/* SUBTLE EDITORIAL GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-neutral-900/20 to-neutral-950/70"></div>

      {/* CONTENT */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6 z-10">
        <br></br>
        <br></br>
        <br></br>

        <p className="text-[10px] sm:text-xs font-bold tracking-[0.4em] text-neutral-300 mb-8 uppercase animate-fade-in-up">
          Spring / Summer 2026
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-6 leading-[1.1] uppercase drop-shadow-lg">
          Elevate Your <br />
          <span className="font-serif font-bold italic tracking-normal pr-4">Everyday</span>
        </h1>

        <p className="text-neutral-200 max-w-lg mb-12 text-sm md:text-base font-light tracking-wide leading-relaxed">
          Discover premium collections curated for the modern aesthetic. Where unparalleled craftsmanship meets timeless style.
        </p>

        <Link
          to="/products"
          className="group relative overflow-hidden bg-white text-neutral-950 px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:text-white"
        >
          <span className="relative z-10">Explore Collection</span>
          {/* Hover Fill Effect */}
          <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
        </Link>
      </div>
    </section>
  );
}