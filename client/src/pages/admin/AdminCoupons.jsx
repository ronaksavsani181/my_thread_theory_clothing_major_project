import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [form, setForm] = useState({ code: "", discountPercent: "", expiryDate: "" });

  const showToast = (message, type = "success") => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000); };

  const fetchCoupons = async () => {
    try { setLoading(true); const res = await api.get("/coupons/admin/all"); setCoupons(res.data); } 
    catch (error) { showToast("Failed to load.", "error"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post("/coupons/create", form); showToast("Code generated."); setForm({ code: "", discountPercent: "", expiryDate: "" }); fetchCoupons(); } 
    catch (error) { showToast("Creation failed.", "error"); }
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try { await api.delete(`/coupons/${couponToDelete}`); showToast("Code removed."); fetchCoupons(); } 
    catch (error) { showToast("Deletion failed.", "error"); } 
    finally { setCouponToDelete(null); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  const isExpired = (date) => new Date(date) < new Date();

  return (
    <AdminLayout>
      <div className="bg-neutral-50 min-h-screen font-sans pb-20 pt-6 lg:pt-10 relative selection:bg-neutral-200 overflow-x-hidden">
        <div className="m-20"></div>
        <div className={`fixed left-1/2 top-20 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center p-4 shadow-2xl transition-all duration-500 pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500" : "bg-neutral-950 text-white"}`}>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
        </div>

        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="mb-8 lg:mb-12 border-b border-neutral-200 pb-6 lg:pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2 lg:mb-4">Promotions Archive</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Incentive Management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            
            {/* FORM */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm lg:sticky lg:top-32">
                <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6 border-b border-neutral-100 pb-4">Generate Code</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <input name="code" id="code" placeholder=" " value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors uppercase" />
                    <label htmlFor="code" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px]">Code Name</label>
                  </div>
                  <div className="relative group">
                    <input name="discountPercent" id="discount" type="number" placeholder=" " value={form.discountPercent} onChange={(e) => setForm({...form, discountPercent: e.target.value})} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm focus:outline-none focus:border-neutral-900 transition-colors" />
                    <label htmlFor="discount" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px]">Discount (%)</label>
                  </div>
                  <div className="pt-2">
                    <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Expiration Date</label>
                    <input type="date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} required className="w-full bg-transparent border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900 cursor-pointer" />
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-neutral-950 text-white py-4 text-[10px] font-bold uppercase tracking-[0.25em] active:scale-[0.98]">Activate Code</button>
                  </div>
                </form>
              </div>
            </div>

            {/* TABLE */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-neutral-200 p-5 sm:p-8 shadow-sm">
                <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-6">Active & Past Registry</h2>
                {loading ? (
                  <div className="py-20 text-center"><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Syncing...</p></div>
                ) : coupons.length === 0 ? (
                  <div className="py-20 text-center border-t border-neutral-100"><p className="text-xs text-neutral-400">No active promotions.</p></div>
                ) : (
                  <div className="w-full overflow-x-auto no-scrollbar block">
                    <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                      <thead>
                        <tr className="border-b border-neutral-900">
                          <th className="py-4 lg:py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Code</th>
                          <th className="py-4 lg:py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-center">Value</th>
                          <th className="py-4 lg:py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                          <th className="py-4 lg:py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Expires</th>
                          <th className="py-4 lg:py-5 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {coupons.map((c) => {
                          const expired = isExpired(c.expiryDate);
                          return (
                            <tr key={c._id} className="hover:bg-neutral-50 transition-colors group">
                              <td className="py-5 lg:py-6 pr-6"><span className={`text-xs sm:text-sm font-bold tracking-widest uppercase ${expired ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>{c.code}</span></td>
                              <td className="py-5 lg:py-6 pr-6 text-center"><span className={`text-xs sm:text-sm font-medium tracking-wide ${expired ? 'text-neutral-400' : 'text-neutral-900'}`}>{c.discountPercent}% OFF</span></td>
                              <td className="py-5 lg:py-6 pr-6">
                                <div className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-500' : 'bg-neutral-900 animate-pulse'}`}></span><span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.25em] uppercase ${expired ? 'text-red-500' : 'text-neutral-900'}`}>{expired ? "Expired" : "Active"}</span></div>
                              </td>
                              <td className="py-5 lg:py-6 pr-6"><span className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${expired ? 'text-neutral-300' : 'text-neutral-500'}`}>{formatDate(c.expiryDate)}</span></td>
                              <td className="py-5 lg:py-6 pl-6 text-right"><button onClick={() => setCouponToDelete(c._id)} className="text-[8px] lg:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-red-600 pb-0.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">Retire</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {couponToDelete && (
        <div className="fixed inset-0 bg-neutral-950/60 z-[90] flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-lg font-light tracking-wide uppercase mb-4">Retire Code?</h3>
            <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Yes, Retire</button>
            <button onClick={() => setCouponToDelete(null)} className="w-full border border-neutral-300 py-3.5 text-[9px] font-bold uppercase tracking-[0.2em]">Cancel</button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </AdminLayout>
  );
}