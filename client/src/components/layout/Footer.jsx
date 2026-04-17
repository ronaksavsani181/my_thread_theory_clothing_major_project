import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-20 sm:pt-24 pb-28 md:pb-10 border-t border-neutral-900 font-sans">
      {/* 🌟 MATCHES NAVBAR WIDTH & PADDING */}
      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* TOP GRID - Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-neutral-800/60 pb-16">
          
          {/* BRAND & NEWSLETTER (Takes up 4 columns on Desktop) */}
          <div className="lg:col-span-4 lg:pr-12">
            <Link to="/" className="flex items-center gap-3 sm:gap-4 mb-8 group inline-flex">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center bg-white text-neutral-950 transition-transform duration-500 group-hover:scale-105 rounded-sm">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tighter">TT</span>
              </div>
              <span className="text-sm sm:text-lg font-bold tracking-[0.25em] uppercase text-white">
                Thread <span className="font-light opacity-60">Theory</span>
              </span>
            </Link>

            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed mb-10 tracking-wide max-w-md">
              Discover premium fashion collections curated for the modern aesthetic. Elevate your wardrobe with unparalleled craftsmanship and timeless style.
            </p>

            {/* Premium Newsletter Input */}
            <form className="mb-6 relative group max-w-md">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="flex items-center border-b border-neutral-700 pb-3 transition-colors duration-500 focus-within:border-white">
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
                  className="ml-4 flex items-center gap-2 flex-shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            </form>
          </div>

          {/* QUICK LINKS (Takes up 2 columns) */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white mb-6 sm:mb-8">Explore</h3>
            <ul className="space-y-4 text-xs sm:text-sm font-light tracking-wide text-neutral-400">
              <li><Link to="/" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Home</Link></li>
              <li><Link to="/products" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Shop All</Link></li>
              <li><Link to="/collections" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Collections</Link></li>
              <li><Link to="/wishlist" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Wishlist</Link></li>
              <li><Link to="/cart" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Shopping Cart</Link></li>
              <li><Link to="/orders" className="inline-block hover:text-white hover:translate-x-1 transition-all duration-300">Order History</Link></li>
            </ul>
          </div>

          {/* CATEGORIES (Takes up 2 columns) */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white mb-6 sm:mb-8">Categories</h3>
            <ul className="space-y-4 text-xs sm:text-sm font-light tracking-wide text-neutral-400">
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

          {/* CONTACT & SOCIAL (Takes up 4 columns) */}
          <div className="lg:col-span-4 lg:pl-10">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white mb-6 sm:mb-8">Contact Us</h3>
            <ul className="space-y-5 text-xs sm:text-sm font-light tracking-wide text-neutral-400 mb-10">
              <li className="flex items-start gap-4 group cursor-default">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                <span className="group-hover:text-neutral-200 transition-colors duration-300">Surat, Gujarat, India</span>
              </li>
              <li className="flex items-center gap-4 group">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                <a href="tel:+919876543210" className="group-hover:text-white transition-colors duration-300">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-4 group">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500 shrink-0 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
                <a href="mailto:support@threadtheory.com" className="group-hover:text-white transition-colors duration-300">support@threadtheory.com</a>
              </li>
            </ul>

            {/* UNIFIED LUCIDE SOCIAL ICONS */}
            <div className="flex gap-6 text-neutral-500">
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Facebook</span>
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Instagram</span>
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:-translate-y-1">
                <span className="sr-only">Twitter</span>
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </a>
            </div>
          </div>
          
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-5 sm:gap-6 text-[9px] sm:text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] text-center md:text-left">
          <p>
            © {new Date().getFullYear()} Thread Theory. All Rights Reserved.
          </p>
          <div className="flex gap-6 sm:gap-8">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}