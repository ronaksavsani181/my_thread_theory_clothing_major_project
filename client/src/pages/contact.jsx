import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X, MapPin, Phone, Mail } from "lucide-react";

export default function Contact() {
  // Always scroll to top when opening
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderRef: "",
    message: ""
  });

  // 🟢 VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    // Clear specific error as user types
    if (errors[id]) setErrors({ ...errors, [id]: "" });
  };

  // 🟢 STRICT INLINE VALIDATION LOGIC
  const validateForm = () => {
    let newErrors = {};
    const textOnlyRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!textOnlyRegex.test(formData.name)) {
      newErrors.name = "Name cannot contain numbers or symbols.";
    }

    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Order Reference Validation (Optional, but strict if provided)
    if (formData.orderRef && !alphanumericRegex.test(formData.orderRef)) {
      newErrors.orderRef = "Reference must be letters and numbers only.";
    }

    // Message Validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run validation first
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate an API call delay for the luxury feel
    setTimeout(() => {
      showToast("Message received. Our concierge will contact you shortly.", "success");
      setFormData({ name: "", email: "", orderRef: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-white min-h-[100dvh] font-sans pb-32 selection:bg-neutral-200 overflow-hidden relative">
      
      {/* =========================================
          🌟 PREMIUM CENTERED NOTIFICATION POPUP
          ========================================= */}
      <div 
        className={`fixed top-24 left-1/2 z-[100] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
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
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-neutral-400"} mb-0.5`}>
            {toast.type === "error" ? "Alert" : "Success"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => setToast({ ...toast, show: false })} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-24 lg:pt-36">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
            Concierge
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Client Services
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 lg:gap-24">
          
          {/* LEFT COLUMN: CONTACT INFO */}
          <aside className="w-full lg:w-[40%] flex-shrink-0 flex flex-col justify-between opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <div>
              <p className="text-sm sm:text-base font-light text-neutral-500 leading-relaxed tracking-wide mb-10 sm:mb-12 max-w-md">
                Whether you require assistance with an existing order, sizing advice, or wish to inquire about our latest collections, our dedicated concierge team is at your complete disposal.
              </p>

              <div className="space-y-10">
                
                {/* STUDIO ADDRESS */}
                <div>
                  <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-4 flex items-center gap-3">
                    <MapPin className="w-4 h-4 stroke-[1.5]" /> Design Studio
                  </h3>
                  <address className="not-italic text-sm sm:text-base font-light text-neutral-900 leading-loose tracking-wide pl-7">
                    Thread Theory Headquarters<br />
                    VIP Road, Vesu<br />
                    Surat, Gujarat 395007<br />
                    India
                  </address>
                </div>

                <div className="space-y-6 sm:space-y-8 border-t border-neutral-200 pt-8 sm:pt-10">
                  
                  {/* EMAIL */}
                  <div>
                    <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3 flex items-center gap-3">
                      <Mail className="w-4 h-4 stroke-[1.5]" /> Email Inquiries
                    </h3>
                    <a href="mailto:concierge@threadtheory.com" className="text-sm sm:text-base font-medium text-neutral-900 hover:text-neutral-500 transition-colors tracking-wide pl-7 block">
                      concierge@threadtheory.com
                    </a>
                  </div>
                  
                  {/* TELEPHONE */}
                  <div>
                    <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3 flex items-center gap-3">
                      <Phone className="w-4 h-4 stroke-[1.5]" /> Telephone
                    </h3>
                    <a href="tel:+919876543210" className="text-sm sm:text-base font-medium text-neutral-900 hover:text-neutral-500 transition-colors tracking-wide pl-7 block">
                      +91 98765 43210
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <main className="w-full lg:w-[60%] opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            <div className="bg-neutral-50/50 border border-neutral-200 p-6 sm:p-10 lg:p-12 h-full shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
              <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 sm:mb-10 border-b border-neutral-200 pb-4">
                Send a Message
              </h2>

              {/* 🟢 noValidate disables browser popups so our custom errors show */}
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10" noValidate>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                  {/* NAME */}
                  <div className="relative group pt-2">
                    <input 
                      type="text" id="name" placeholder=" " value={formData.name} onChange={handleChange} required 
                      className={`peer w-full bg-transparent border-b py-2 text-sm sm:text-base font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.name ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                    />
                    <label htmlFor="name" className={`absolute left-0 top-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.name ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                      Full Name *
                    </label>
                    {errors.name && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-2">{errors.name}</span>}
                  </div>

                  {/* EMAIL */}
                  <div className="relative group pt-2">
                    <input 
                      type="email" id="email" placeholder=" " value={formData.email} onChange={handleChange} required 
                      className={`peer w-full bg-transparent border-b py-2 text-sm sm:text-base font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                    />
                    <label htmlFor="email" className={`absolute left-0 top-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.email ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                      Email Address *
                    </label>
                    {errors.email && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-2">{errors.email}</span>}
                  </div>
                </div>

                {/* ORDER REFERENCE */}
                <div className="relative group pt-2">
                  <input 
                    type="text" id="orderRef" placeholder=" " value={formData.orderRef} onChange={handleChange}
                    className={`peer w-full bg-transparent border-b py-2 text-sm sm:text-base font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.orderRef ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                  />
                  <label htmlFor="orderRef" className={`absolute left-0 top-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.orderRef ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                    Order Reference (Optional)
                  </label>
                  {errors.orderRef && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-2">{errors.orderRef}</span>}
                </div>

                {/* MESSAGE */}
                <div className="relative group pt-2">
                  <textarea 
                    id="message" placeholder=" " value={formData.message} onChange={handleChange} required rows="4"
                    className={`peer w-full bg-transparent border-b py-2 text-sm sm:text-base font-light text-neutral-900 focus:outline-none resize-none rounded-none transition-colors ${errors.message ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                  />
                  <label htmlFor="message" className={`absolute left-0 top-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.message ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                    Your Message *
                  </label>
                  {errors.message && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-2">{errors.message}</span>}
                </div>

                <div className="pt-4 sm:pt-6">
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="group/btn relative overflow-hidden w-full border border-neutral-950 bg-neutral-950 text-white py-4.5 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 transition-colors duration-500">{isSubmitting ? "Transmitting..." : "Send Inquiry"}</span>
                    <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                  </button>
                </div>

              </form>
            </div>
          </main>

        </div>
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