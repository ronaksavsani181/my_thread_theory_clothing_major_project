import { Link } from "react-router-dom";

export default function CategoryBanner() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-[90rem] mx-auto bg-white">
      <div className="text-center mb-20 flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-4">Curated For You</span>
        <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase text-neutral-900">Trending Collections</h2>
        <div className="w-16 h-[1px] bg-neutral-900 mt-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          { title: "The Men's Edit", desc: "Classic • Premium", link: "/products?category=Men", img: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop" },
          { title: "The Women's Edit", desc: "Elegant • Luxury", link: "/products?category=Women", img: "https://i.pinimg.com/736x/63/bd/a7/63bda7312b1883cdd12b3c2b81a894de.jpg?q=80&w=800&auto=format&fit=crop" },
          { title: "The New Arrivals", desc: "Fresh • Latest", link: "/products?newArrival=true", img: "https://i.pinimg.com/736x/1c/e9/12/1ce9126118f3158f6e2ca84e3c5cc18d.jpg?" }
        ].map((item, i) => (
          <Link key={i} to={item.link} className="relative group overflow-hidden block h-[550px] lg:h-[700px] bg-neutral-100">
            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-[2s] ease-[0.25,1,0.5,1] group-hover:scale-105" />
            <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-neutral-950/40 transition-colors duration-700"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end items-center text-white pb-16">
              <h3 className="text-3xl font-light tracking-widest uppercase mb-3 transform transition-transform duration-500 group-hover:-translate-y-4">{item.title}</h3>
              <p className="mb-8 text-[10px] font-bold tracking-[0.25em] text-neutral-300 uppercase transform transition-transform duration-500 group-hover:-translate-y-4">{item.desc}</p>
              
              {/* Ghost button hover effect */}
              <span className="border border-white/50 backdrop-blur-sm text-white px-10 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:border-white group-hover:bg-white group-hover:text-neutral-950 transition-all duration-500 transform translate-y-4 group-hover:-translate-y-4">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}