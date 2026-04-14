import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 🟢 VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});

  // 🟢 PREMIUM TOAST ALERT STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  
  const navigate = useNavigate();
  const { login } = useAuth();

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

  // Clear toast on typing
  useEffect(() => {
    if (toast.show) setToast({ ...toast, show: false });
  }, [email, password]);

  // 🟢 STRICT INLINE VALIDATION LOGIC
  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
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
      const res = await api.post("/auth/login", { email, password });
      
      showToast("Welcome back to Thread Theory.", "success");
      
      setTimeout(() => {
        login(res.data.user, res.data.token);
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (error) {
      // 🟢 CUSTOM BRANDED SUSPENSION ALERT
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message?.toLowerCase() || "";
      
      // If the backend throws a 403 Forbidden OR mentions suspension
      if (status === 403 || backendMsg.includes("suspended") || backendMsg.includes("blocked")) {
        showToast("Account suspended. Contact support@threadtheory.com", "error");
      } else {
        // Standard invalid credentials error
        showToast(error.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* 🟢 PREMIUM CUSTOM TOAST ALERT */}
      <div 
        className={`fixed left-1/2 top-8 z-[100] flex w-[90%] max-w-md -translate-x-1/2 transform items-center gap-3 rounded-sm p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        } ${
          toast.type === "error" ? "bg-white/95 border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"
        }`}
      >
        {toast.type === "error" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className={`text-xs font-medium tracking-wide ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
        <button onClick={() => setToast({ ...toast, show: false })} className={`ml-auto transition-colors ${toast.type === "error" ? "text-neutral-400 hover:text-neutral-900" : "text-neutral-400 hover:text-white"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 🟢 LEFT COLUMN - FORM AREA (Perfectly scaled to fit 100% screens) */}
      <div className="flex w-full flex-col justify-center px-6 py-6 sm:px-12 lg:w-[45%] lg:px-16 xl:px-24 relative z-10 bg-white min-h-[100dvh] overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-[380px] flex flex-col my-auto">
          
          {/* Back to Home Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase mt-15 tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>

          {/* Thread Theory Brand Logo Area */}
          <div className="mb-6 flex items-center gap-4 group cursor-default">
            <div className="flex h-10 w-10 items-center justify-center bg-neutral-950 text-white transition-transform duration-500 group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tighter">TT</span>
            </div>
            <span className="text-2xl font-bold tracking-[0.25em] text-neutral-900 uppercase">
              Thread <span className="font-light opacity-60">Theory</span>
            </span>
          </div>

          <h2 className="text-3xl font-light tracking-wide text-neutral-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm font-light text-neutral-500 tracking-wide">
            Sign in to access your exclusive collections and orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            
            {/* 🟢 EMAIL INPUT WITH VALIDATION */}
            <div className="relative group">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ""}); }}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-3 text-sm font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="email" 
                className={`absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] ${errors.email ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Email Address
              </label>
              {errors.email && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider block mt-1.5">{errors.email}</span>}
            </div>

            {/* 🟢 PASSWORD INPUT WITH VALIDATION */}
            <div className="relative group pt-2">
              <div className="absolute right-0 -top-2 z-10">
                <Link to="/forgot-password" className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 transition-colors hover:text-neutral-900">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ""}); }}
                placeholder=" "
                className={`peer block w-full rounded-none border-b bg-transparent px-0 py-3 text-sm font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
              />
              <label 
                htmlFor="password" 
                className={`absolute left-0 top-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-8 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-8 peer-[:not(:placeholder-shown)]:text-[8px] ${errors.password ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
              >
                Password
              </label>
              {errors.password && <span className="text-red-500 text-[9px] font-bold uppercase tracking-wider block mt-1.5">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 relative w-full flex items-center justify-center bg-neutral-950 px-4 py-4.5 text-[10px] font-bold tracking-[0.25em] uppercase text-white transition-all hover:bg-neutral-800 focus:outline-none disabled:bg-neutral-400 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            New to Thread Theory?{" "}
            <Link to="/register" className="text-neutral-900 transition-colors hover:text-neutral-500 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-500">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* 🟢 RIGHT COLUMN - BRAND IMAGE (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-[55%] relative bg-neutral-100">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop"
          alt="Thread Theory Fashion Collection"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent"></div>
        
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <blockquote className="space-y-5 max-w-lg">
            <p className="text-4xl xl:text-5xl font-light tracking-wide leading-[1.2]">
              Elevate your everyday aesthetic.
            </p>
            <div className="h-px w-12 bg-white/50"></div>
            <footer className="text-[10px] font-bold tracking-[0.3em] text-neutral-300 uppercase">
              Thread Theory • Fall/Winter Collection
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