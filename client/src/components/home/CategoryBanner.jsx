import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function CategoryBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // SCROLL DETECTION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 } // Triggers when 15% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 lg:py-32 px-5 sm:px-8 lg:px-12 max-w-[100rem] mx-auto bg-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className={`text-center mb-16 sm:mb-20 flex flex-col items-center transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4">
          Curated For You
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900">
          Trending Collections
        </h2>
        {/* Expanding Line Animation */}
        <div className={`h-[1px] bg-neutral-900 mt-6 sm:mt-8 transition-all duration-1000 ease-out delay-300 ${isVisible ? "w-12 sm:w-16" : "w-0"}`}></div>
      </div>

      {/* BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[
          { title: "The Men's Edit", desc: "Classic • Premium", link: "/products?category=Men", img: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop" },
          { title: "The Women's Edit", desc: "Elegant • Luxury", link: "/products?category=Women", img: "https://i.pinimg.com/736x/63/bd/a7/63bda7312b1883cdd12b3c2b81a894de.jpg?q=80&w=800&auto=format&fit=crop" },
          { title: "The New Arrivals", desc: "Fresh • Latest", link: "/products?newArrival=true", img: "https://i.pinimg.com/736x/1c/e9/12/1ce9126118f3158f6e2ca84e3c5cc18d.jpg?" }
        ].map((item, i) => (
          <Link 
            key={i} 
            to={item.link} 
            className={`relative group overflow-hidden block w-full bg-neutral-950 ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''} aspect-[3/4] sm:aspect-square lg:aspect-[3/4] transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
            style={{ transitionDelay: `${i * 200}ms` }} // Staggered entry delay
          >
            <img 
              src={item.img} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover transition-all duration-[2s] ease-[0.25,1,0.5,1] grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
            />
            
            <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-neutral-950/50 transition-colors duration-700"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end items-center text-white pb-12 sm:pb-16 px-4 text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-widest uppercase mb-2 sm:mb-3 transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-6">{item.title}</h3>
              <p className="mb-6 sm:mb-8 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-neutral-300 uppercase transform transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:-translate-y-6">{item.desc}</p>
              
              {/* Ghost button slides up from the bottom */}
              <span className="absolute bottom-10 sm:bottom-14 border border-white/80 backdrop-blur-sm text-white px-8 sm:px-10 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:bg-white group-hover:text-neutral-950 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}