import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Categories() {

  const [counts, setCounts] = useState([]);

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

  const getCount = (category) => {
    const found = counts.find((c) => c._id === category);
    return found ? found.count : 0;
  };

  const categories = [
    {
      name: "Men",
      key: "Men",
      image:
        "https://i.pinimg.com/736x/d0/ef/e8/d0efe846f70c0dd01fb22d79f9956a7d.jpg",
      link: "/products?category=Men",
    },
    {
      name: "Women",
      key: "Women",
      image:
        "https://i.pinimg.com/1200x/25/84/b2/2584b27065f9dc85d3b41e5ad5dcba39.jpg",
      link: "/products?category=Women",
    },
    {
      name: "Kids",
      key: "Kids", // ✅ fixed
      image:
        "https://i.pinimg.com/736x/fe/95/aa/fe95aa83e6ecdfd910fc1ca2f0b0acc2.jpg",
      link: "/products?category=Kids",
    },
    {
      name: "New Arrivals",
      key: "New",
      image:
        "https://i.pinimg.com/1200x/ce/f2/85/cef28581435a8064ffe9dc30ea9698b5.jpg",
      link: "/products?newArrival=true",
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-[90rem] mx-auto bg-white">

      <div className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
        <h2 className="text-2xl md:text-3xl font-light tracking-wide uppercase text-neutral-900">
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {categories.map((cat, index) => (

          <Link
            key={index}
            to={cat.link}
            className="relative group overflow-hidden block h-[450px] bg-neutral-100"
          >

            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.25,1,0.5,1] group-hover:scale-110"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>

            <div className="absolute bottom-8 left-8 transform transition-transform duration-500 group-hover:-translate-y-2">

              <h3 className="text-white text-2xl font-light tracking-widest uppercase mb-1">
                {cat.name}
              </h3>

              {/* Product count */}
              {cat.key !== "New" && (
                <p className="text-neutral-300 text-[10px] font-bold tracking-[0.2em] uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {getCount(cat.key)} Products
                </p>
              )}

            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}