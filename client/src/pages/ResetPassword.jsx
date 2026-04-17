import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X, ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function ResetPassword() {
  // Always scroll to top when opening this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Used for redirect animation
  
  // 🟢 VALIDATION ERRORS & TOAST STATE
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const timerRef = useRef(null);

  const showToast = (message, type = "error") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // 🔥 REAL-TIME CONFIRM PASSWORD CHECK
  useEffect(() => {
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  }, [password, confirmPassword]);

  // 🔥 STRICT INLINE CUSTOM VALIDATION LOGIC
  const validateForm = () => {
    let newErrors = {};

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    // Password Validation
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!strongPasswordRegex.test(password)) {
      newErrors.password = "Min 8 chars, include uppercase, lowercase, number & symbol.";
    }

    // Confirm Password Validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      
      showToast(res.data.message, "success");
      setIsSuccess(true);
      
      // Delay navigation to allow the user to read the success toast and see animation
      setTimeout(() => navigate("/login"), 2500); 
      
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid or expired token.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-[100dvh] flex flex-col items-center justify-center font-sans px-5 sm:px-6 relative selection:bg-neutral-200 overflow-hidden">
      
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
          MAIN AUTH CARD
          ========================================= */}
      <div className={`w-full max-w-md bg-white p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-neutral-100 my-auto transition-opacity duration-1000 ${isSuccess ? 'opacity-50' : 'opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]'}`}>
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors mb-8 sm:mb-10 group w-max border-b border-transparent hover:border-neutral-900 pb-0.5">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[1.5] transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-neutral-900 mb-2 sm:mb-3">
            New Password
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 leading-relaxed">
            Please enter your new security credentials.
          </p>
        </div>

        {/* 🟢 noValidate disables native browser tooltips */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
          
          {/* 🟢 PASSWORD INPUT WITH FLOATING LABEL & VALIDATION */}
          <div className="relative group pt-2">
            <input 
              type="password" 
              id="password" 
              placeholder=" " 
              value={password} 
              onChange={(e) => { 
                setPassword(e.target.value); 
                setErrors((prev) => ({ ...prev, password: "" })); 
              }} 
              required 
              disabled={isSuccess}
              className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 sm:py-2.5 text-sm sm:text-base font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 disabled:bg-transparent ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
            />
            <label 
              htmlFor="password" 
              className={`absolute left-0 top-3 sm:top-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.password ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
            >
              New Password *
            </label>
            
            {!errors.password ? (
              <p className="absolute -bottom-5 sm:-bottom-6 right-0 text-[7px] sm:text-[8px] text-neutral-400 uppercase tracking-widest">
                8+ chars • A-Z • a-z • 0-9 • symbol
              </p>
            ) : (
              <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-2 leading-snug">
                {errors.password}
              </span>
            )}
          </div>

          {/* 🟢 CONFIRM PASSWORD INPUT WITH FLOATING LABEL & VALIDATION */}
          <div className="relative group pt-4 sm:pt-6">
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder=" " 
              value={confirmPassword} 
              onChange={(e) => { 
                setConfirmPassword(e.target.value); 
              }} 
              required 
              disabled={isSuccess}
              className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 sm:py-2.5 text-sm sm:text-base font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 disabled:bg-transparent ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
            />
            <label 
              htmlFor="confirmPassword" 
              className={`absolute left-0 top-5 sm:top-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.confirmPassword ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
            >
              Confirm Password *
            </label>
            
            {errors.confirmPassword && (
              <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-2">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* PREMIUM SUBMIT BUTTON */}
          <div className="pt-8 sm:pt-10">
            <button 
              type="submit" 
              disabled={loading || isSuccess}
              className={`group/btn relative overflow-hidden w-full border border-neutral-950 bg-neutral-950 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${isSuccess ? 'bg-emerald-950 border-emerald-950' : 'hover:text-white'}`}
            >
              <span className="relative z-10 transition-colors duration-500 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transmitting...
                  </>
                ) : isSuccess ? (
                  "Redirecting..."
                ) : (
                  "Secure Account"
                )}
              </span>
              {/* Only show hover fill if not successful/loading */}
              {!loading && !isSuccess && (
                <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
              )}
            </button>
          </div>
        </form>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}