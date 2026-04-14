import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  // 🟢 Always scroll to top when opening this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🟢 VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});
  
  // 🟢 PREMIUM TOAST ALERT STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

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
  }, [password, confirmPassword]);

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
    
    // Run custom validation first (bypassing browser default)
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      
      showToast(res.data.message, "success");
      setTimeout(() => navigate("/login"), 2500); 
      
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid or expired token.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-[100dvh] flex flex-col items-center justify-center font-sans px-6 relative selection:bg-neutral-200 overflow-hidden">
      
      {/* 🟢 PREMIUM CUSTOM TOAST ALERT */}
      <div 
        className={`fixed left-1/2 top-8 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center gap-2.5 rounded-sm p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] ${
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

      {/* 🟢 CENTRALLY ALIGNED CARD */}
      <div className="w-full max-w-[340px] bg-white p-8 shadow-xl border border-neutral-100 my-auto">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors mb-6">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-light tracking-wide uppercase text-neutral-900 mb-1.5">
            New Password
          </h1>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 leading-relaxed">
            Please enter your new security credentials.
          </p>
        </div>

        {/* 🟢 noValidate disables native browser tooltips */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {/* 🟢 PASSWORD INPUT WITH CUSTOM VALIDATION */}
          <div className="relative group pt-1">
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
              className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 text-xs font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
            />
            <label 
              htmlFor="password" 
              className={`absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.password ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
            >
              New Password
            </label>
            
            {!errors.password ? (
              <p className="absolute -bottom-4 right-0 text-[7px] text-neutral-400 uppercase tracking-widest">
                8+ chars • A-Z • a-z • 0-9 • symbol
              </p>
            ) : (
              <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5 leading-snug">
                {errors.password}
              </span>
            )}
          </div>

          {/* 🟢 CONFIRM PASSWORD INPUT WITH CUSTOM VALIDATION */}
          <div className="relative group pt-5">
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder=" " 
              value={confirmPassword} 
              onChange={(e) => { 
                setConfirmPassword(e.target.value); 
                // Only clear the error if they match or if empty, otherwise real-time effect handles it
              }} 
              required 
              className={`peer block w-full rounded-none border-b bg-transparent px-0 py-2 text-xs font-light text-neutral-900 transition-all focus:outline-none focus:ring-0 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`}
            />
            <label 
              htmlFor="confirmPassword" 
              className={`absolute left-0 top-6 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.confirmPassword ? 'text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}
            >
              Confirm Password
            </label>
            
            {errors.confirmPassword && (
              <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* 🟢 SUBMIT BUTTON WITH mt-[60px] */}
          <button 
            type="submit" 
            disabled={loading}
            className={`mt-[60px] relative w-full flex items-center justify-center px-4 py-3.5 text-[9px] font-bold tracking-[0.25em] uppercase text-white transition-all hover:bg-neutral-800 focus:outline-none active:scale-[0.98] ${
              loading ? "bg-neutral-400 cursor-not-allowed" : "bg-neutral-950"
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Secure Account"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}