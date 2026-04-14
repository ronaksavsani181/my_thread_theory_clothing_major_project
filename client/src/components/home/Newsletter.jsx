import { useState, useEffect } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  // Upgraded to the custom Toast logic
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Clear toast on input change
  useEffect(() => {
    if (toast.show) setToast({ ...toast, show: false });
  }, [email]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email format.", "error");
      return;
    }
    
    // Success scenario
    showToast("Welcome to the club. Check your inbox.", "success");
    setEmail("");
  };

  return (
    <section className="relative py-32 bg-neutral-950 text-white border-y border-neutral-900 overflow-hidden">
      
      {/* CUSTOM TOAST ALERT (Dark Mode optimized for Newsletter) */}
      <div 
        className={`absolute top-8 left-1/2 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-3 rounded-sm p-4 shadow-2xl backdrop-blur-md transition-all duration-500 ease-[0.25,1,0.5,1] ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-red-950/90 border-l-2 border-red-500" : "bg-white/10 border-l-2 border-white"
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white w-full text-center">
          {toast.message}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        
        <h2 className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 mb-8 uppercase">
          The Thread Theory Insider
        </h2>

        <h3 className="text-4xl md:text-6xl font-light tracking-wide uppercase mb-8">
          Join Our Fashion Club
        </h3>

        <p className="text-neutral-400 mb-14 text-sm tracking-wide font-light max-w-md mx-auto leading-relaxed">
          Sign up to receive exclusive access to new arrivals, private sales, and editorial stories directly to your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-end justify-center gap-6 max-w-xl mx-auto">
          <div className="w-full flex-1 relative group">
            <input
              id="newsletter-email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full bg-transparent border-0 border-b border-neutral-700 px-0 py-3 text-white transition-colors focus:ring-0 focus:border-white"
            />
            {/* Floating Label */}
            <label 
              htmlFor="newsletter-email" 
              className="absolute left-0 top-3 text-sm font-light tracking-wide text-neutral-500 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-white peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-white"
            >
              Email Address
            </label>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold uppercase tracking-[0.25em] border border-white hover:bg-white hover:text-neutral-950 transition-all duration-500 active:scale-[0.98]"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}