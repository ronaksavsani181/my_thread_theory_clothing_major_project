import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-24 pb-10 border-t border-neutral-900 font-sans">
      <div className="max-w-[85rem] mx-auto px-6 sm:px-8">
        
        {/* TOP GRID - Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-neutral-800/60 pb-16">
          
          {/* BRAND & NEWSLETTER (Takes up more space) */}
          <div className="lg:col-span-4 lg:pr-12">
            <Link to="/" className="flex items-center gap-4 mb-8 group inline-flex">
              <div className="flex h-9 w-9 items-center justify-center bg-white text-neutral-950 transition-transform duration-500 group-hover:scale-105">
                <span className="font-serif text-lg font-bold tracking-tighter">TT</span>
              </div>
              <span className="text-lg font-bold tracking-[0.25em] uppercase text-white">
                Thread <span className="font-light opacity-60">Theory</span>
              </span>
            </Link>

            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-10 tracking-wide">
              Discover premium fashion collections curated for the modern aesthetic. Elevate your wardrobe with unparalleled craftsmanship and timeless style.
            </p>

            {/* Premium Newsletter Input */}
            <form className="mb-6 relative group">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="flex items-end border-b border-neutral-700 pb-2 transition-colors duration-500 focus-within:border-white">
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent border-none px-0 py-1 text-sm text-white placeholder-neutral-500 font-light tracking-wide focus:outline-none focus:ring-0"
                  placeholder="Join the Theory (Newsletter)"
                />
                <button 
                  type="submit" 
                  className="ml-4 flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white mb-8">Explore</h3>
            <ul className="space-y-4 text-sm font-light tracking-wide text-neutral-400">
              <li><Link to="/" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Home</Link></li>
              <li><Link to="/products" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Shop All</Link></li>
              <li><Link to="/collections" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Collections</Link></li>
              <li><Link to="/wishlist" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Wishlist</Link></li>
              <li><Link to="/cart" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Shopping Cart</Link></li>
              <li><Link to="/orders" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Order History</Link></li>
            </ul>
          </div>

          {/* CATEGORIES */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white mb-8">Categories</h3>
            <ul className="space-y-4 text-sm font-light tracking-wide text-neutral-400">
              <li>
                <Link to="/products?category=Men" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=Women" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?newArrival=true" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT & SOCIAL */}
          <div className="lg:col-span-4 lg:pl-10">
            <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-white mb-8">Contact Us</h3>
            <ul className="space-y-5 text-sm font-light tracking-wide text-neutral-400 mb-10">
              <li className="flex items-start gap-4 group cursor-default">
                <svg className="h-5 w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="group-hover:text-neutral-200 transition-colors duration-300">Surat, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-4 group">
                <svg className="h-5 w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.273-3.973-6.869-6.869l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+919876543210" className="group-hover:text-white transition-colors duration-300">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-4 group">
                <svg className="h-5 w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:support@threadtheory.com" className="group-hover:text-white transition-colors duration-300">support@threadtheory.com</a>
              </li>
            </ul>

            {/* SOCIAL ICONS */}
            <div className="flex gap-7 text-neutral-500">
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Facebook</span>
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Instagram</span>
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Twitter</span>
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
            </div>
          </div>
          
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em]">
          <p>
            © {new Date().getFullYear()} Thread Theory. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}