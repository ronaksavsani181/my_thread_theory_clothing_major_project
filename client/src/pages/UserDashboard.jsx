import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

export default function UserDashboard() {
  // 🟢 ALWAYS SCROLL TO TOP ON LOAD
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const { user, logout } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "" }
  });
  
  // 🟢 VALIDATION ERRORS STATE
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
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

    // Name: Text only, min 2 chars
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

    // City: Text only
    if (formData.address.city && !textOnlyRegex.test(formData.address.city)) {
      newErrors.city = "City cannot contain numbers.";
    }

    // State: Text only
    if (formData.address.state && !textOnlyRegex.test(formData.address.state)) {
      newErrors.state = "State cannot contain numbers.";
    }

    // Country: Text only
    if (formData.address.country && !textOnlyRegex.test(formData.address.country)) {
      newErrors.country = "Country cannot contain numbers.";
    }

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
      showToast(res.data.message);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Premium logged-out state
  if (!user) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-white font-sans px-6 text-center">
        <svg className="w-12 h-12 text-neutral-200 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
        <h1 className="text-2xl font-light tracking-wide uppercase text-neutral-900 mb-4">Authentication Required</h1>
        <p className="text-sm text-neutral-500 font-light mb-10 max-w-sm mx-auto leading-relaxed">Please log in to your Thread Theory account to access your personal dashboard.</p>
        <Link to="/login" className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"><span className="relative z-10">Sign In</span><div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div></Link>
      </div>
    );
  }

  const monogram = profileData?.name ? profileData.name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase();

  return (
    <div className="bg-white min-h-screen font-sans pb-32 selection:bg-neutral-200">
      
      {/* LUXURY TOAST NOTIFICATION */}
      <div className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white/95 border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"}`}>
        <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>{toast.message}</p>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-28 lg:pt-36">
        
        {/* EDITORIAL HEADER (Sign out moved to profile panel) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-200 pb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide uppercase text-neutral-900 mb-4">
              My Profile
            </h1>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
              Welcome back, {profileData?.name || user.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
          
          {/* LEFT PANEL: USER PROFILE SUMMARY & EDIT FORM */}
          <div className="w-full lg:w-[35%] xl:w-[30%] flex-shrink-0">
            <div className="bg-neutral-50/50 border border-neutral-100 p-8 sm:p-10 lg:p-12 relative transition-all duration-500">
              
              {!isEditing ? (
                <div className="flex flex-col items-center text-center animate-fade-in">
                  <div className="w-24 h-24 bg-neutral-950 text-white flex items-center justify-center rounded-full mb-6 shadow-md">
                    <span className="text-3xl font-light tracking-widest">{monogram}</span>
                  </div>
                  
                  <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-900 mb-2">{profileData?.name}</h2>
                  <p className="text-xs text-neutral-500 font-light tracking-wider mb-2 break-all">{profileData?.email}</p>
                  {profileData?.phone && <p className="text-xs text-neutral-500 font-light tracking-wider mb-8">+91 {profileData.phone}</p>}
                  {!profileData?.phone && <div className="mb-8"></div>}

                  {profileData?.address?.street && (
                    <div className="text-xs text-neutral-500 font-light tracking-wide leading-relaxed mb-8 border-t border-neutral-200 pt-6 w-full">
                      <p>{profileData.address.street}</p>
                      <p>{profileData.address.city}, {profileData.address.state} {profileData.address.postalCode}</p>
                      <p>{profileData.address.country}</p>
                    </div>
                  )}

                  <div className="w-full space-y-4 border-t border-neutral-200 pt-8 mt-2">
                    <button onClick={() => setIsEditing(true)} className="w-full border border-neutral-900 bg-white text-neutral-900 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-all duration-300">
                      Edit Details
                    </button>
                    {/* 🟢 SIGN OUT MOVED HERE */}
                    <button onClick={logout} className="w-full text-neutral-400 hover:text-red-500 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col text-left animate-fade-in">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-3">Update Profile</h3>
                  
                  {/* PERSONAL DETAILS */}
                  <div className="space-y-5 mb-8">
                    <div>
                      <input 
                        type="text" placeholder="Full Name" value={formData.name} 
                        onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ""}); }} 
                        className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.name ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      {errors.name && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.name}</span>}
                    </div>
                    <div>
                      <input 
                        type="email" placeholder="Email Address" value={formData.email} 
                        onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ""}); }} 
                        className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      {errors.email && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.email}</span>}
                    </div>
                    <div>
                      {/* 🟢 REAL-TIME PHONE VALIDATION: Prevents letters entirely */}
                      <input 
                        type="text" placeholder="Mobile Number" maxLength="10" value={formData.phone} 
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setFormData({...formData, phone: onlyNums});
                          setErrors({...errors, phone: ""});
                        }} 
                        className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.phone ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                      />
                      {errors.phone && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.phone}</span>}
                    </div>
                  </div>

                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900 mb-5 border-b border-neutral-200 pb-3">Delivery Address</h3>
                  
                  {/* ADDRESS DETAILS */}
                  <div className="space-y-5 mb-10">
                    <input 
                      type="text" placeholder="Street Address" value={formData.address.street} 
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} 
                      className="w-full border-b border-neutral-300 py-2 text-sm font-light text-neutral-900 bg-transparent focus:border-neutral-900 focus:outline-none" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="text" placeholder="City" value={formData.address.city} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, city: e.target.value}}); setErrors({...errors, city: ""}); }} 
                          className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.city ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        {errors.city && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.city}</span>}
                      </div>
                      <div>
                        <input 
                          type="text" placeholder="State" value={formData.address.state} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, state: e.target.value}}); setErrors({...errors, state: ""}); }} 
                          className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.state ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        {errors.state && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.state}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        {/* 🟢 REAL-TIME PINCODE VALIDATION: Prevents letters entirely */}
                        <input 
                          type="text" placeholder="Pincode" maxLength="6" value={formData.address.postalCode} 
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, address: {...formData.address, postalCode: onlyNums}});
                            setErrors({...errors, postalCode: ""});
                          }} 
                          className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.postalCode ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        {errors.postalCode && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.postalCode}</span>}
                      </div>
                      <div>
                        <input 
                          type="text" placeholder="Country" value={formData.address.country} 
                          onChange={(e) => { setFormData({...formData, address: {...formData.address, country: e.target.value}}); setErrors({...errors, country: ""}); }} 
                          className={`w-full border-b py-2 text-sm font-light text-neutral-900 bg-transparent focus:outline-none ${errors.country ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-900'}`} 
                        />
                        {errors.country && <span className="text-red-500 text-[9px] uppercase tracking-wider block mt-1.5">{errors.country}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-neutral-950 text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors disabled:opacity-70">
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setErrors({}); }} className="w-full text-neutral-500 hover:text-neutral-900 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: DASHBOARD NAVIGATION GRID (ALL 5 MODULES) */}
          <div className="w-full lg:w-[65%] xl:w-[70%]">
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 mb-8">
              Account Directory
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              
              {/* 1. MODULE: ORDERS */}
              <Link to="/orders" className="group block p-8 sm:p-10 border border-neutral-200 bg-white hover:bg-neutral-950 hover:border-neutral-950 transition-colors duration-500">
                <svg className="w-8 h-8 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">Order History</h4>
                <p className="text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                  Track your recent purchases and view invoices.
                </p>
              </Link>

              {/* 2. MODULE: RETURNS & EXCHANGES */}
              <Link to="/my-returns" className="group block p-8 sm:p-10 border border-neutral-200 bg-white hover:bg-neutral-950 hover:border-neutral-950 transition-colors duration-500">
                <svg className="w-8 h-8 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">Returns & Refunds</h4>
                <p className="text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                  Track your return requests, view admin notes, and monitor refunds.
                </p>
              </Link>

              {/* 3. MODULE: WISHLIST */}
              <Link to="/wishlist" className="group block p-8 sm:p-10 border border-neutral-200 bg-white hover:bg-neutral-950 hover:border-neutral-950 transition-colors duration-500">
                <svg className="w-8 h-8 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">Saved Pieces</h4>
                <p className="text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                  View and manage the exclusive items you've curated for later.
                </p>
              </Link>

              {/* 4. MODULE: CART */}
              <Link to="/cart" className="group block p-8 sm:p-10 border border-neutral-200 bg-white hover:bg-neutral-950 hover:border-neutral-950 transition-colors duration-500">
                <svg className="w-8 h-8 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">Shopping Bag</h4>
                <p className="text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                  Review your current selections and proceed to secure checkout.
                </p>
              </Link>

              {/* 5. MODULE: PAYMENTS */}
              <Link to="/payments" className="group block p-8 sm:p-10 border border-neutral-200 bg-white hover:bg-neutral-950 hover:border-neutral-950 transition-colors duration-500 sm:col-span-2 xl:col-span-1">
                <svg className="w-8 h-8 text-neutral-900 mb-6 sm:mb-8 transform group-hover:-translate-y-2 transition-all duration-500 ease-[0.25,1,0.5,1] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3 group-hover:text-white transition-colors duration-500">Payment Methods</h4>
                <p className="text-sm text-neutral-500 font-light tracking-wide leading-relaxed group-hover:text-neutral-400 transition-colors duration-500">
                  Manage your secure payment options and view transaction history.
                </p>
              </Link>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}