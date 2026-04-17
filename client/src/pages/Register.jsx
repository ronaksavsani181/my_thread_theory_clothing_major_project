import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X, ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // 🟢 Controls the redirection animation
  
  // 🟢 VALIDATION ERRORS & TOAST STATE
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const timerRef = useRef(null);

  const navigate = useNavigate();

  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const showToast = (message, type = "error") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // Clear specific error as user types
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) setErrors({ ...errors, name: "" });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ ...errors, email: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

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

      showToast("Welcome to Thread Theory.", "success");
      
      // 🟢 TRIGGER REDIRECTION ANIMATION
      setIsLoading(false);
      setIsSuccess(true);
      
      // Delay to let the user see the success state and animation before routing
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setIsLoading(false);
      showToast(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] bg-white font-sans text-neutral-900 overflow-hidden selection:bg-neutral-200">
      
      {/* =========================================
          🌟 PREMIUM CENTERED NOTIFICATION POPUP
          ========================================= */}
      <div 
        className={`fixed top-16 sm:top-24 left-1/2 z-[100] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"
        }`}
      >
        <div className="shrink-0">
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-500 stroke-[2]" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[2]" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-emerald-400"} mb-0.5`}>
            {toast.type === "error" ? "Alert" : "Success"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => {
            setToast({ ...toast, show: false });
            if (timerRef.current) clearTimeout(timerRef.current);
          }} 
          className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95"
        >
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      {/* =========================================
          LEFT COLUMN - FORM AREA 
          ========================================= */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[45%] lg:px-16 xl:px-24 relative z-10 bg-white min-h-[100dvh] overflow-y-auto no-scrollbar">
        
        <div className={`mx-auto w-full max-w-[380px] flex flex-col my-auto transition-all duration-1000 ease-[0.25,1,0.5,1] ${isSuccess ? 'opacity-0 -translate-y-10' : 'opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]'}`}>
          
          {/* Back to Home Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors mb-8 sm:mb-10 w-max group border-b border-transparent hover:border-neutral-900 pb-0.5">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.5] transition-transform group-hover:-translate-x-1" />
            Back to Shop
          </Link>

          {/* Thread Theory Brand Logo Area */}
          <div className="mb-8 sm:mb-10 flex items-center gap-4 group cursor-default">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-neutral-950 text-white transition-transform duration-700 ease-[0.25,1,0.5,1] group-hover:scale-105 rounded-sm">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tighter">TT</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-neutral-900 uppercase">
              Thread <span className="font-light opacity-60">Theory</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-neutral-900 mb-2 sm:mb-3">
            Join the Theory
          </h2>
          <p className="text-xs sm:text-sm font-light text-neutral-500 tracking-wide leading-relaxed">
            Create an account to curate your wardrobe and manage your exclusive orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6 sm:space-y-8" noValidate>
            
            {/* 🟢 NAME INPUT */}
            <div className="relative group pt-2">
              <input
                id="name"
                type="text"
                required
                disabled={isLoading || isSuccess}
                value={name}
                onChange={handleNameChange}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 sm:py-2.5 text-sm sm:text-base font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 disabled:bg-transparent ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="name" 
                className={`absolute left-0 top-3 sm:top-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.name ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Full Name *
              </label>
              {errors.name && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-2">{errors.name}</span>}
            </div>

            {/* 🟢 EMAIL INPUT */}
            <div className="relative group pt-2">
              <input
                id="email"
                type="email"
                required
                disabled={isLoading || isSuccess}
                value={email}
                onChange={handleEmailChange}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 sm:py-2.5 text-sm sm:text-base font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 disabled:bg-transparent ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="email" 
                className={`absolute left-0 top-3 sm:top-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.email ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Email Address *
              </label>
              {errors.email && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-2">{errors.email}</span>}
            </div>

            {/* 🟢 PASSWORD INPUT */}
            <div className="relative group pt-2">
              <input
                id="password"
                type="password"
                required
                disabled={isLoading || isSuccess}
                value={password}
                onChange={handlePasswordChange}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 sm:py-2.5 text-sm sm:text-base font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 disabled:bg-transparent ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="password" 
                className={`absolute left-0 top-3 sm:top-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.password ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Create Password *
              </label>
              
              {!errors.password ? (
                <p className="absolute -bottom-5 sm:-bottom-6 right-0 text-[7px] sm:text-[8px] text-neutral-400 uppercase tracking-widest">
                  Min. 8 Characters
                </p>
              ) : (
                <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-2 leading-snug">
                  {errors.password}
                </span>
              )}
            </div>

            {/* PREMIUM SUBMIT BUTTON */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`group/btn relative overflow-hidden w-full border border-neutral-950 bg-neutral-950 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed ${isSuccess ? 'bg-emerald-950 border-emerald-950' : 'hover:text-white'}`}
              >
                <span className="relative z-10 transition-colors duration-500 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Redirecting...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
                {/* Cinematic Hover Fill - disabled during loading/success */}
                {!isLoading && !isSuccess && (
                  <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                )}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-10 sm:mt-12 text-center border-t border-neutral-100 pt-8 sm:pt-10">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex flex-col sm:block gap-2">
              <span>Already have an account?</span>{" "}
              <Link to="/login" className="text-neutral-900 transition-colors hover:text-neutral-500 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 ml-1">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* =========================================
          RIGHT COLUMN - BRAND IMAGE (Hidden on Mobile)
          ========================================= */}
      <div className={`hidden lg:block lg:w-[55%] relative bg-neutral-100 transition-transform duration-[2s] ease-[0.25,1,0.5,1] ${isSuccess ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}>
        <img
          className="absolute inset-0 h-full w-full object-cover animate-[image-fade_1.5s_ease-in-out_forwards]"
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"
          alt="Thread Theory Fashion Details"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/10 to-transparent"></div>
        
        <div className="absolute bottom-16 left-16 right-16 text-white opacity-0 animate-[fade-in-up_1s_ease-out_0.5s_forwards]">
          <blockquote className="space-y-6 max-w-lg">
            <p className="text-4xl xl:text-5xl font-light tracking-wide leading-[1.2] drop-shadow-lg">
              Crafted for the modern aesthetic.
            </p>
            <div className="h-[1px] w-16 bg-white/50"></div>
            <footer className="text-[9px] font-bold tracking-[0.3em] text-neutral-300 uppercase">
              Join the Thread Theory Community
            </footer>
          </blockquote>
        </div>
      </div>
      
      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes image-fade {
          from { opacity: 0; filter: blur(4px); transform: scale(1.05); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
      `}} />
    </div>
  );
}