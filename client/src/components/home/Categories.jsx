import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";

export default function Categories() {
  const [counts, setCounts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // FETCH COUNTS
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get("/products/category-counts");
        setCounts(res.data);
      } catch (error) {
        console.error("Count fetch error:", error);
      }
    };
    fetchCounts();
  }, []);

  // SCROLL DETECTION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Ensures it only animates once
        }
      },
      { threshold: 0.15 } // Triggers when 15% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getCount = (category) => {
    const found = counts.find((c) => c._id === category);
    return found ? found.count : 0;
  };

  const categories = [
    { name: "Men", key: "Men", image: "https://i.pinimg.com/736x/d0/ef/e8/d0efe846f70c0dd01fb22d79f9956a7d.jpg", link: "/products?category=Men" },
    { name: "Women", key: "Women", image: "https://i.pinimg.com/1200x/25/84/b2/2584b27065f9dc85d3b41e5ad5dcba39.jpg", link: "/products?category=Women" },
    { name: "Kids", key: "Kids", image: "https://i.pinimg.com/736x/fe/95/aa/fe95aa83e6ecdfd910fc1ca2f0b0acc2.jpg", link: "/products?category=Kids" },
    { name: "New Arrivals", key: "New", image: "https://i.pinimg.com/1200x/ce/f2/85/cef28581435a8064ffe9dc30ea9698b5.jpg", link: "/products?newArrival=true" },
  ];

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 lg:py-32 px-5 sm:px-8 lg:px-12 max-w-[100rem] mx-auto bg-white font-sans border-t border-neutral-100 overflow-hidden">

      {/* HEADER */}
      <div className={`flex justify-between items-end mb-10 sm:mb-12 border-b border-neutral-200 pb-5 sm:pb-6 transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-1.5 sm:mb-2">Departments</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900">
            Shop by Category
          </h2>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {categories.map((cat, index) => (
          <Link
            key={index}
            to={cat.link}
            className={`relative group overflow-hidden block aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] bg-neutral-950 transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
            style={{ transitionDelay: `${index * 150}ms` }} // Staggered entry delay
          >
            {/* Grayscale to Color hover effect */}
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-[0.25,1,0.5,1] grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700"></div>

            <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-6 transform transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:-translate-y-4">
              <h3 className="text-white text-lg sm:text-2xl font-light tracking-widest uppercase mb-1 sm:mb-2">
                {cat.name}
              </h3>

              {cat.key !== "New" && (
                <p className="text-neutral-300 text-[8px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {getCount(cat.key)} Products
                </p>
              )}
              
              {/* Animated underline on hover */}
              <div className="h-[1px] bg-white w-0 group-hover:w-8 transition-all duration-500 delay-200 mt-3"></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}