import React from 'react';
import { Camera } from 'lucide-react';

const VisualTryOnButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative w-full overflow-hidden border border-black bg-white px-8 py-5 transition-all duration-300 hover:bg-black active:scale-[0.98]"
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Camera className="h-5 w-5 text-black transition-colors duration-300 group-hover:text-white" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black transition-colors duration-300 group-hover:text-white">
          Visual Try-On Experience
        </span>
      </div>
      
      {/* Subtle shine sweep effect on hover */}
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:animate-shine group-hover:opacity-100 transition-opacity duration-700" />
    </button>
  );
};

export default VisualTryOnButton;