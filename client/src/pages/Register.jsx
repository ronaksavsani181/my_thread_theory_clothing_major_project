import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 🟢 VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});
  
  // 🟢 PREMIUM TOAST ALERT STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Clear toast on input change
  useEffect(() => {
    if (toast.show) setToast({ ...toast, show: false });
  }, [name, email, password]);

  // 🟢 STRICT INLINE VALIDATION LOGIC
  const validateForm = () => {
    let newErrors = {};
    const textOnlyRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name Validation
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (!textOnlyRegex.test(name)) {
      newErrors.name = "Name cannot contain numbers or symbols.";
    }

    // Email Validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password Validation
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run validation first
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      showToast("Welcome to Thread Theory. Redirecting...", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* 🟢 PREMIUM CUSTOM TOAST ALERT */}
      <div 
        className={`fixed left-1/2 top-6 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-2.5 rounded-sm p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/95 border-l-3 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"
        }`}
      >
        {toast.type === "error" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className={`text-[10px] font-medium tracking-wide ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
        <button onClick={() => setToast({ ...toast, show: false })} className={`ml-auto transition-colors ${toast.type === "error" ? "text-neutral-400 hover:text-neutral-900" : "text-neutral-400 hover:text-white"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 🟢 LEFT COLUMN - FORM AREA (Perfectly scaled to fit 100% screens) */}
      <div className="flex w-full flex-col justify-center px-6 py-4 sm:px-10 lg:w-[45%] lg:px-12 xl:px-16 relative z-10 bg-white min-h-[100dvh] overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-[340px] flex flex-col my-auto">
          
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-[9px] mt-15 font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors mb-5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>

          {/* Thread Theory Brand Logo Area */}
          <div className="mb-5 flex items-center gap-3 group cursor-default">
            <div className="flex h-8 w-8 items-center justify-center bg-neutral-950 text-white transition-transform duration-500 group-hover:scale-105">
              <span className="font-serif text-lg font-bold tracking-tighter">TT</span>
            </div>
            <span className="text-xl font-bold tracking-[0.25em] text-neutral-900 uppercase">
              Thread <span className="font-light opacity-60">Theory</span>
            </span>
          </div>

          <h2 className="text-2xl font-light tracking-wide text-neutral-900">
            Join the Theory
          </h2>
          <p className="mt-1.5 text-[11px] font-light text-neutral-500 tracking-wide">
            Create an account to curate your wardrobe and manage orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            
            {/* 🟢 NAME INPUT WITH VALIDATION */}
            <div className="relative group">
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ""}); }}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 text-xs font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="name" 
                className={`absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.name ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Full Name
              </label>
              {errors.name && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1">{errors.name}</span>}
            </div>

            {/* 🟢 EMAIL INPUT WITH VALIDATION */}
            <div className="relative group">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ""}); }}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 text-xs font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="email" 
                className={`absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.email ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Email Address
              </label>
              {errors.email && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1">{errors.email}</span>}
            </div>

            {/* 🟢 PASSWORD INPUT WITH VALIDATION */}
            <div className="relative group pt-1">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ""}); }}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 text-xs font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="password" 
                className={`absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.password ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Create Password
              </label>
              
              {!errors.password ? (
                <p className="absolute -bottom-4 right-0 text-[7px] text-neutral-400 uppercase tracking-widest">
                  Min. 8 Characters
                </p>
              ) : (
                <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1">{errors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 relative w-full flex items-center justify-center bg-neutral-950 px-4 py-3 text-[9px] font-bold tracking-[0.25em] uppercase text-white transition-all hover:bg-neutral-800 focus:outline-none disabled:bg-neutral-400 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-[9px] font-bold uppercase tracking-wider text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="text-neutral-900 transition-colors hover:text-neutral-500 underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* 🟢 RIGHT COLUMN - BRAND IMAGE (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-[55%] relative bg-neutral-100">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"
          alt="Thread Theory Fashion Details"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/10 to-transparent"></div>
        
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <blockquote className="space-y-3 max-w-lg">
            <p className="text-3xl xl:text-4xl font-light tracking-wide leading-[1.2]">
              Crafted for the modern aesthetic.
            </p>
            <div className="h-px w-10 bg-white/50"></div>
            <footer className="text-[9px] font-bold tracking-[0.3em] text-neutral-300 uppercase">
              Join the Thread Theory Community
            </footer>
          </blockquote>
        </div>
      </div>
      
      {/* GLOBAL CSS FOR SCROLLBAR */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}