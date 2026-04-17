import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { AlertTriangle, CheckCircle2, X, Ticket, Calendar, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [couponToDelete, setCouponToDelete] = useState(null);
  
  const [form, setForm] = useState({ code: "", discountPercent: "", expiryDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const fetchCoupons = async () => {
    try { 
      setLoading(true); 
      const res = await api.get("/coupons/admin/all"); 
      setCoupons(res.data); 
    } catch (error) { 
      showToast("Failed to load promotions registry.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
    fetchCoupons(); 
  }, []);

  // Lock body scroll when deletion modal is open
  useEffect(() => {
    if (couponToDelete) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [couponToDelete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountPercent || !form.expiryDate) {
      return showToast("Please fill all fields.", "error");
    }
    
    setIsSubmitting(true);
    try { 
      await api.post("/coupons/create", form); 
      showToast("Promotion code generated successfully."); 
      setForm({ code: "", discountPercent: "", expiryDate: "" }); 
      fetchCoupons(); 
    } catch (error) { 
      showToast(error.response?.data?.message || "Code generation failed.", "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try { 
      await api.delete(`/coupons/${couponToDelete}`); 
      showToast("Code successfully retired."); 
      fetchCoupons(); 
    } catch (error) { 
      showToast("Failed to retire code.", "error"); 
    } finally { 
      setCouponToDelete(null); 
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  const isExpired = (date) => new Date(date) < new Date();

  return (
    <AdminLayout>
      <div className={`bg-neutral-50 min-h-screen font-sans pb-32 pt-6 lg:pt-10 relative selection:bg-neutral-200 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="m-8 lg:m-20"></div>

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

        <div className="w-full max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-12">
          
          {/* HEADER SECTION */}
          <div className="mb-10 lg:mb-12 border-b border-neutral-200 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards] text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 lg:mb-4">Promotions Archive</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Incentive Management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* =========================================
                LEFT: CODE GENERATION FORM
                ========================================= */}
            <div className="lg:col-span-4 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
              <div className="bg-white border border-neutral-200 p-6 sm:p-8 lg:p-10 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] rounded-sm lg:sticky lg:top-32">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900 mb-8 border-b border-neutral-100 pb-4 text-left flex items-center gap-2">
                  <Ticket className="w-4 h-4 stroke-[1.5]" /> Generate Code
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Floating Label: Code Name */}
                  <div className="relative group text-left">
                    <input 
                      name="code" id="f-code" placeholder=" " 
                      value={form.code} 
                      onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} 
                      required 
                      className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors uppercase rounded-none" 
                    />
                    <label htmlFor="f-code" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900 cursor-text">
                      Code Name (e.g., SUMMER26)
                    </label>
                  </div>
                  
                  {/* Floating Label: Discount */}
                  <div className="relative group text-left">
                    <input 
                      name="discountPercent" id="f-discount" type="number" placeholder=" " min="1" max="100"
                      value={form.discountPercent} 
                      onChange={(e) => setForm({...form, discountPercent: e.target.value})} 
                      required 
                      className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors rounded-none" 
                    />
                    <label htmlFor="f-discount" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900 cursor-text">
                      Discount Percentage (%)
                    </label>
                  </div>
                  
                  {/* Fixed Label: Expiry */}
                  <div className="relative group pt-2 text-left">
                    <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-2">Expiration Date</label>
                    <div className="relative border-b border-neutral-300 focus-within:border-neutral-900 transition-colors">
                      <input 
                        type="date" 
                        value={form.expiryDate} 
                        onChange={(e) => setForm({...form, expiryDate: e.target.value})} 
                        required 
                        className="w-full bg-transparent py-2.5 text-sm font-medium text-neutral-900 focus:outline-none cursor-pointer appearance-none uppercase tracking-widest" 
                        style={{ colorScheme: 'light' }}
                      />
                      <Calendar className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none stroke-[1.5]" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="group/btn relative overflow-hidden w-full bg-neutral-950 border border-neutral-950 text-white py-4.5 text-[10px] font-bold uppercase tracking-[0.3em] active:scale-[0.98] transition-all rounded-sm disabled:opacity-70"
                    >
                      <span className="relative z-10 transition-colors duration-500">{isSubmitting ? "Activating..." : "Activate Code"}</span>
                      {!isSubmitting && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* =========================================
                RIGHT: REGISTRY (CARDS / TABLE)
                ========================================= */}
            <div className="lg:col-span-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
              <div className="bg-white border border-neutral-200 p-5 sm:p-8 lg:p-10 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] rounded-sm">
                
                <div className="flex justify-between items-center mb-8 border-b border-neutral-100 pb-4">
                  <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900 text-left">Active & Past Registry</h2>
                  <span className="text-[9px] font-bold text-neutral-400 tracking-[0.2em] uppercase">{coupons.length} Active</span>
                </div>

                {loading ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Syncing Registry...</p>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="py-20 text-center border-t border-neutral-100 bg-neutral-50/50">
                    <Ticket className="w-10 h-10 text-neutral-300 mx-auto mb-4 stroke-[1.5]" />
                    <p className="text-xs text-neutral-500 font-light tracking-wide">No active promotions in the ledger.</p>
                  </div>
                ) : (
                  <>
                    {/* 📱 MOBILE VIEW (CARDS - < 768px) */}
                    <div className="md:hidden flex flex-col gap-4">
                      {coupons.map((c) => {
                        const expired = isExpired(c.expiryDate);
                        return (
                          <div key={c._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col shadow-sm">
                            
                            <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-4">
                              <div className="text-left">
                                <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Code Name</p>
                                <p className={`text-base font-bold tracking-widest uppercase ${expired ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-900'}`}>{c.code}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Value</p>
                                <span className={`text-sm font-medium tracking-wide ${expired ? 'text-neutral-400' : 'text-emerald-600'}`}>{c.discountPercent}% OFF</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-sm border border-neutral-100">
                              <div className="text-left">
                                <span className={`text-[8px] font-bold uppercase tracking-[0.2em] block mb-1 ${expired ? 'text-neutral-400' : 'text-neutral-500'}`}>Expires</span>
                                <span className={`text-[9px] font-bold tracking-widest uppercase ${expired ? 'text-neutral-400' : 'text-neutral-900'}`}>{formatDate(c.expiryDate)}</span>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                  <span className={`text-[8px] font-bold tracking-[0.25em] uppercase ${expired ? 'text-red-500' : 'text-emerald-700'}`}>{expired ? "Expired" : "Active"}</span>
                                </div>
                                <button onClick={() => setCouponToDelete(c._id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-sm ml-2">
                                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* 💻 DESKTOP VIEW (TABLE - >= 768px) */}
                    <div className="hidden md:block w-full overflow-hidden border border-neutral-200 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                        <thead className="bg-neutral-50/80 border-b border-neutral-200">
                          <tr>
                            <th className="py-4 lg:py-5 pl-6 pr-4 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Code</th>
                            <th className="py-4 lg:py-5 pr-4 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-center">Value</th>
                            <th className="py-4 lg:py-5 pr-4 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                            <th className="py-4 lg:py-5 pr-4 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Expires</th>
                            <th className="py-4 lg:py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {coupons.map((c) => {
                            const expired = isExpired(c.expiryDate);
                            return (
                              <tr key={c._id} className="hover:bg-neutral-50 transition-colors group">
                                <td className="py-5 lg:py-6 pl-6 pr-4">
                                  <span className={`text-xs sm:text-sm font-bold tracking-widest uppercase ${expired ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-900'}`}>{c.code}</span>
                                </td>
                                <td className="py-5 lg:py-6 pr-4 text-center">
                                  <span className={`text-xs sm:text-sm font-medium tracking-wide ${expired ? 'text-neutral-400' : 'text-emerald-600'}`}>{c.discountPercent}% OFF</span>
                                </td>
                                <td className="py-5 lg:py-6 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${expired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                    <span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.25em] uppercase ${expired ? 'text-red-500' : 'text-emerald-700'}`}>{expired ? "Expired" : "Active"}</span>
                                  </div>
                                </td>
                                <td className="py-5 lg:py-6 pr-4">
                                  <span className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${expired ? 'text-neutral-400' : 'text-neutral-900'}`}>{formatDate(c.expiryDate)}</span>
                                </td>
                                <td className="py-5 lg:py-6 pr-6 text-right">
                                  <button 
                                    onClick={() => setCouponToDelete(c._id)} 
                                    className="text-[8px] lg:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-red-600 border-b border-transparent hover:border-red-600 pb-0.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    Retire
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================
          🌟 RETIRE CONFIRMATION MODAL
          ========================================= */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${couponToDelete ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setCouponToDelete(null)}></div>
        <div className={`bg-white p-8 max-w-sm w-full shadow-2xl relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] rounded-sm text-center ${couponToDelete ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-xl font-light tracking-wide uppercase mb-3 text-neutral-900">Retire Code?</h3>
          <p className="text-sm font-light text-neutral-500 mb-8 leading-relaxed">This promotion will be permanently deactivated and removed from the ledger.</p>
          <div className="flex flex-col gap-3">
            <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-red-700 transition-colors active:scale-[0.98] rounded-sm">Yes, Retire</button>
            <button onClick={() => setCouponToDelete(null)} className="w-full border border-neutral-300 text-neutral-900 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:border-neutral-900 transition-colors active:scale-[0.98] rounded-sm">Cancel</button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </AdminLayout>
  );
}