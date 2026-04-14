import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  // Always scroll to top when opening
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
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
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
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
    <div className="bg-white min-h-[100dvh] font-sans pb-32 selection:bg-neutral-200">
      
      {/* 🟢 PREMIUM CUSTOM TOAST ALERT */}
      <div 
        className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-2.5 rounded-sm p-3 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        } ${toast.type === "error" ? "bg-white/95 border-l-3 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"}`}
      >
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
          {toast.message}
        </p>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-28 lg:pt-36">
        
        <div className="flex flex-col mb-12 border-b border-neutral-200 pb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-3">
            Concierge
          </h1>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Thread Theory • Client Services
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          <aside className="w-full lg:w-[40%] flex-shrink-0 flex flex-col justify-between">
            <div>
              <p className="text-sm font-light text-neutral-500 leading-relaxed tracking-wide mb-12 max-w-md">
                Whether you require assistance with an existing order, sizing advice, or wish to inquire about our latest collections, our dedicated concierge team is at your complete disposal.
              </p>

              <div className="space-y-10">
                <div>
                  <h3 className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Design Studio</h3>
                  <address className="not-italic text-sm font-light text-neutral-900 leading-loose tracking-wide">
                    Thread Theory Headquarters<br />
                    VIP Road, Vesu<br />
                    Surat, Gujarat 395007<br />
                    India
                  </address>
                </div>

                <div className="space-y-5 border-t border-neutral-200 pt-8">
                  <div>
                    <h3 className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">Email Inquiries</h3>
                    <a href="mailto:concierge@threadtheory.com" className="text-sm font-medium text-neutral-900 hover:text-neutral-500 transition-colors tracking-wide">
                      concierge@threadtheory.com
                    </a>
                  </div>
                  <div>
                    <h3 className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">Telephone</h3>
                    <a href="tel:+919876543210" className="text-sm font-medium text-neutral-900 hover:text-neutral-500 transition-colors tracking-wide">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-[60%]">
            <div className="bg-neutral-50/50 border border-neutral-100 p-8 sm:p-12 h-full shadow-sm">
              <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-8 border-b border-neutral-200 pb-3">
                Send a Message
              </h2>

              {/* 🟢 noValidate disables browser popups */}
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* NAME */}
                  <div className="relative group pt-2">
                    <input 
                      type="text" id="name" placeholder=" " value={formData.name} onChange={handleChange} required 
                      className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.name ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                    />
                    <label htmlFor="name" className={`absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.name ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                      Full Name *
                    </label>
                    {errors.name && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">{errors.name}</span>}
                  </div>

                  {/* EMAIL */}
                  <div className="relative group pt-2">
                    <input 
                      type="email" id="email" placeholder=" " value={formData.email} onChange={handleChange} required 
                      className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                    />
                    <label htmlFor="email" className={`absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.email ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                      Email Address *
                    </label>
                    {errors.email && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">{errors.email}</span>}
                  </div>
                </div>

                {/* ORDER REFERENCE */}
                <div className="relative group pt-2">
                  <input 
                    type="text" id="orderRef" placeholder=" " value={formData.orderRef} onChange={handleChange}
                    className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.orderRef ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                  />
                  <label htmlFor="orderRef" className={`absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.orderRef ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                    Order Reference (Optional)
                  </label>
                  {errors.orderRef && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">{errors.orderRef}</span>}
                </div>

                {/* MESSAGE */}
                <div className="relative group pt-2">
                  <textarea 
                    id="message" placeholder=" " value={formData.message} onChange={handleChange} required rows="4"
                    className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none resize-none rounded-none transition-colors ${errors.message ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                  />
                  <label htmlFor="message" className={`absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[7.5px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[7.5px] ${errors.message ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>
                    Your Message *
                  </label>
                  {errors.message && <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">{errors.message}</span>}
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="group/btn relative overflow-hidden w-full border border-neutral-950 bg-neutral-950 text-white py-4 text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">{isSubmitting ? "Transmitting..." : "Send Inquiry"}</span>
                    <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                  </button>
                </div>

              </form>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}