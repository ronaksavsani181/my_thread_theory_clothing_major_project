import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import { AlertTriangle, CheckCircle2, X, Package, RotateCcw, Heart, ShoppingBag, CreditCard, LogOut, Edit2 } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🟢 ROUTING ANIMATION STATE
  const [redirectingTo, setRedirectingTo] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "" }
  });
  
  const [errors, setErrors] = useState({});

  // 🟢 ALWAYS SCROLL TO TOP ON LOAD
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // 🟢 FETCH FRESH PROFILE DATA
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await api.get("/users/profile");
          setProfileData(res.data);
          setFormData({
            name: res.data.name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            address: {
              street: res.data.address?.street || "",
              city: res.data.address?.city || "",
              state: res.data.address?.state || "",
              postalCode: res.data.address?.postalCode || "",
              country: res.data.address?.country || ""
            }
          });
        } catch (error) {
          console.error("Failed to fetch profile");
        }
      };
      fetchProfile();
    }
  }, [user]);

  // 🟢 STRICT VALIDATION LOGIC
  const validateForm = () => {
    let newErrors = {};
    const textOnlyRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    } else if (!textOnlyRegex.test(formData.name)) {
      newErrors.name = "Name cannot contain numbers or special characters.";
    }

    // Email
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone: Exactly 10 digits
    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Mobile number must be exactly 10 digits.";
    }

    // Address fields (Text Only)
    if (formData.address.city && !textOnlyRegex.test(formData.address.city)) newErrors.city = "City cannot contain numbers.";
    if (formData.address.state && !textOnlyRegex.test(formData.address.state)) newErrors.state = "State cannot contain numbers.";
    if (formData.address.country && !textOnlyRegex.test(formData.address.country)) newErrors.country = "Country cannot contain numbers.";

    // Postal Code: Exactly 6 digits
    if (formData.address.postalCode && formData.address.postalCode.length !== 6) {
      newErrors.postalCode = "Pincode must be exactly 6 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🟢 HANDLE FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await api.put("/users/profile", formData);
      setProfileData(res.data.user);
      showToast(res.data.message, "success");
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 CINEMATIC ROUTING HANDLER
  const handleRedirect = (e, path, id) => {
    e.preventDefault();
    setRedirectingTo(id);
    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  // Premium logged-out state
  if (!user) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-white font-sans px-6 text-center animate-[fade-in-up_0.8s_ease-out_forwards]">
        <ShieldCheck className="w-12 h-12 text-neutral-200 mb-8 stroke-[1.5]" />
        <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-neutral-900 mb-4">Authentication Required</h1>
        <p className="text-sm text-neutral-500 font-light mb-10 max-w-sm mx-auto leading-relaxed">Please log in to your Thread Theory account to access your personal dashboard.</p>
        <Link to="/login" className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white active:scale-95">
          <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Sign In</span>
          <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
        </Link>
      </div>
    );
  }

  const monogram = profileData?.name ? profileData.name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || "U";

  const DASHBOARD_MODULES = [
    { id: "orders", title: "Order History", desc: "Track your recent purchases and view invoices.", icon: Package, link: "/orders" },
    { id: "returns", title: "Returns & Refunds", desc: "Track your return requests and monitor refunds.", icon: RotateCcw, link: "/my-returns" },
    { id: "wishlist", title: "Saved Pieces", desc: "View and manage the items you've curated for later.", icon: Heart, link: "/wishlist" },
    { id: "cart", title: "Shopping Bag", desc: "Review your current selections and checkout.", icon: ShoppingBag, link: "/cart" },
    { id: "payments", title: "Payment Methods", desc: "Manage your secure payment options.", icon: CreditCard, link: "/payments" },
  ];

  return (
    <div className={`bg-white min-h-[100dvh] font-sans pb-32 selection:bg-neutral-200 overflow-hidden transition-opacity duration-700 ease-[0.25,1,0.5,1] ${redirectingTo ? 'opacity-50' : 'opacity-100'}`}>
      
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
        <div className="flex-1 text-left">
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-emerald-400"} mb-0.5`}>
            {toast.type === "error" ? "Notice" : "Success"}
          </p>
          <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>
        <button onClick={() => { setToast({ ...toast, show: false }); if (timerRef.current) clearTimeout(timerRef.current); }} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
          <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
        </button>
      </div>

      <div className="max-w-[100rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 lg:pt-36">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">
            My Profile
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
            Welcome back, {profileData?.name || user.name}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* =========================================
              LEFT PANEL: USER PROFILE SUMMARY & EDIT
              ========================================= */}
          <div className="w-full lg:w-[35%] xl:w-[30%] flex-shrink-0 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <div className="bg-neutral-50/50 border border-neutral-100 p-8 sm:p-10 relative transition-all duration-500 shadow-sm">
              
              {!isEditing ? (
                <div className="flex flex-col items-center text-center animate-[fade-in-up_0.4s_ease-out_forwards]">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-950 text-white flex items-center justify-center rounded-full mb-6 sm:mb-8 shadow-md">
                    <span className="text-2xl sm:text-3xl font-light tracking-widest ml-1">{monogram}</span>
                  </div>
                  
                  <h2 className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-neutral-900 mb-2">{profileData?.name}</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 font-light tracking-wider mb-2 break-all">{profileData?.email}</p>
                  {profileData?.phone && <p className="text-xs sm:text-sm text-neutral-500 font-light tracking-wider mb-8">+91 {profileData.phone}</p>}
                  {!profileData?.phone && <div className="mb-8"></div>}

                  {profileData?.address?.street && (
                    <div className="text-xs sm:text-sm text-neutral-500 font-light tracking-wide leading-relaxed mb-8 border-t border-neutral-200 pt-6 w-full text-center">
                      <p>{profileData.address.street}</p>
                      <p>{profileData.address.city}, {profileData.address.state} {profileData.address.postalCode}</p>
                      <p>{profileData.address.country}</p>
                    </div>
                  )}

                  <div className="w-full space-y-4 border-t border-neutral-200 pt-8 mt-2">
                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 border border-neutral-900 bg-white text-neutral-900 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-all duration-300 active:scale-95">
                      <Edit2 className="w-3 h-3 stroke-[2]" /> Edit Details
                    </button>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-neutral-400 hover:text-red-500 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors active:scale-95">
                      <LogOut className="w-3 h-3 stroke-[2]" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col text-left animate-[fade-in-up_0.4s_ease-out_forwards]" noValidate>
                  <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-3">Update Profile</h3>
                  
                  {/* PERSONAL DETAILS (FLOATING LABELS) */}
                  <div className="space-y-6 sm:space-y-8 mb-10">
                    <div className="relative group pt-2">
                      <input 
                        type="text" id="name" placeholder=" " value={formData.name} 
                        onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ""}); }} 
                        className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.name ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      <label htmlFor="name" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.name ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>Full Name</label>
                      {errors.name && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.name}</span>}
                    </div>

                    <div className="relative group pt-2">
                      <input 
                        type="email" id="email" placeholder=" " value={formData.email} 
                        onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ""}); }} 
                        className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      <label htmlFor="email" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.email ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>Email Address</label>
                      {errors.email && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.email}</span>}
                    </div>

                    <div className="relative group pt-2">
                      <input 
                        type="text" id="phone" placeholder=" " maxLength="10" value={formData.phone} 
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setFormData({...formData, phone: onlyNums});
                          setErrors({...errors, phone: ""});
                        }} 
                        className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.phone ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      <label htmlFor="phone" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.phone ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>Mobile Number</label>
                      {errors.phone && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.phone}</span>}
                    </div>
                  </div>

                  <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-3">Delivery Address</h3>
                  
                  {/* ADDRESS DETAILS */}
                  <div className="space-y-6 sm:space-y-8 mb-10">
                    <div className="relative group pt-2">
                      <input 
                        type="text" id="street" placeholder=" " value={formData.address.street} 
                        onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
                        className="peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors border-neutral-300 focus:border-neutral-900" 
                      />
                      <label htmlFor="street" className="absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Street Address</label>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:gap-8">
                      <div className="relative group pt-2">
                        <input 
                          type="text" id="city" placeholder=" " value={formData.address.city} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, city: e.target.value}}); setErrors({...errors, city: ""}); }} 
                          className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.city ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        <label htmlFor="city" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.city ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>City</label>
                        {errors.city && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.city}</span>}
                      </div>
                      <div className="relative group pt-2">
                        <input 
                          type="text" id="state" placeholder=" " value={formData.address.state} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, state: e.target.value}}); setErrors({...errors, state: ""}); }} 
                          className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.state ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        <label htmlFor="state" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.state ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>State</label>
                        {errors.state && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.state}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:gap-8">
                      <div className="relative group pt-2">
                        <input 
                          type="text" id="pincode" placeholder=" " maxLength="6" value={formData.address.postalCode} 
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, address: {...formData.address, postalCode: onlyNums}});
                            setErrors({...errors, postalCode: ""});
                          }} 
                          className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.postalCode ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        <label htmlFor="pincode" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.postalCode ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>Pincode</label>
                        {errors.postalCode && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.postalCode}</span>}
                      </div>
                      <div className="relative group pt-2">
                        <input 
                          type="text" id="country" placeholder=" " value={formData.address.country} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, country: e.target.value}}); setErrors({...errors, country: ""}); }} 
                          className={`peer w-full bg-transparent border-b py-2 text-sm font-light text-neutral-900 focus:outline-none rounded-none transition-colors ${errors.country ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        <label htmlFor="country" className={`absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] ${errors.country ? 'text-red-500' : 'text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900'}`}>Country</label>
                        {errors.country && <span className="text-red-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest block mt-1.5">{errors.country}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:gap-5 mt-auto">
                    <button type="submit" disabled={isSubmitting} className="group/btn relative overflow-hidden w-full bg-neutral-950 border border-neutral-950 text-white py-4.5 sm:py-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-all duration-300 disabled:opacity-70">
                      <span className="relative z-10 transition-colors duration-500">{isSubmitting ? "Saving..." : "Save Changes"}</span>
                      {!isSubmitting && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setErrors({}); }} className="w-full text-neutral-400 hover:text-neutral-900 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5 w-max mx-auto">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* =========================================
              RIGHT PANEL: DASHBOARD NAVIGATION GRID
              ========================================= */}
          <div className="flex-1 w-full opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-400 mb-8 sm:mb-10 text-left">
              Account Directory
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {DASHBOARD_MODULES.map((module, index) => (
                <button 
                  key={module.id}
                  onClick={(e) => handleRedirect(e, module.link, module.id)}
                  disabled={redirectingTo !== null}
                  className={`group block p-8 sm:p-10 border bg-white hover:bg-neutral-950 transition-colors duration-500 text-left ${module.id === 'payments' ? 'sm:col-span-2 xl:col-span-1' : ''} ${redirectingTo && redirectingTo !== module.id ? 'opacity-50 cursor-not-allowed' : 'border-neutral-200'}`}
                >
                  {redirectingTo === module.id ? (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-900 animate-spin mb-6 sm:mb-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <module.icon className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white stroke-[1.5]" />
                  )}
                  <h4 className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">{module.title}</h4>
                  <p className="text-xs sm:text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500 max-w-[250px]">
                    {module.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}