import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { AlertTriangle, CheckCircle2, X, Search, Package, Plus } from "lucide-react";

export default function AdminStockOut() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [restockItem, setRestockItem] = useState(null);
  const [newStock, setNewStock] = useState("");
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const fetchStockOut = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      const depleted = res.data.filter((p) => p.stock <= 0);
      setProducts(depleted);
    } catch (err) {
      showToast("Failed to load inventory data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
    fetchStockOut();
  }, []);

  // Prevent background scroll when modal open
  useEffect(() => {
    if (restockItem) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [restockItem]);

  const { menCount, womenCount, kidsCount, accessoriesCount, displayedProducts } = useMemo(() => {
    let men = 0, women = 0, kids = 0, acc = 0;
    products.forEach(p => {
      if (p.category === "Men") men++;
      else if (p.category === "Women") women++;
      else if (p.category === "Kids") kids++;
      else if (p.category === "Accessories") acc++;
    });

    let filtered = categoryFilter === "All" ? products : products.filter(p => p.category === categoryFilter);

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) || 
        p.brand?.toLowerCase().includes(searchLower)
      );
    }

    return { menCount: men, womenCount: women, kidsCount: kids, accessoriesCount: acc, displayedProducts: filtered };
  }, [products, categoryFilter, searchTerm]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockItem || !newStock || Number(newStock) < 1) {
      showToast("Please enter a valid stock amount.", "error");
      return;
    }
    try {
      const payload = { stock: Number(newStock) };
      await api.put(`/admin/stock/${restockItem._id}`, payload);
      
      showToast(`Inventory updated for ${restockItem.title}`);
      setRestockItem(null);
      setNewStock("");
      fetchStockOut(); 
    } catch (error) {
      showToast("Failed to update inventory.", "error");
    }
  };

  return (
    <AdminLayout>
      <div className={`bg-neutral-50 min-h-screen font-sans pb-32 pt-6 lg:pt-10 relative selection:bg-neutral-200 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="m-8 lg:m-20"></div>

        {/* =========================================
            🌟 PREMIUM CENTERED NOTIFICATION POPUP
            ========================================= */}
        <div 
          className={`fixed top-24 left-1/2 z-[150] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
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

        <div className="max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-12">
          
          {/* HEADER SECTION */}
          <div className="mb-10 lg:mb-12 border-b border-neutral-200 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards] text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-red-600 mb-3 lg:mb-4 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 stroke-[1.5]" /> Depleted Stock
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Inventory Alerts ({products.length} Items)</p>
          </div>

          {/* STATS / FILTERS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-6 mb-10 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            {[
              { label: "All Depleted", count: products.length, value: "All" }, 
              { label: "Women", count: womenCount, value: "Women" }, 
              { label: "Men", count: menCount, value: "Men" }, 
              { label: "Kids", count: kidsCount, value: "Kids" }, 
              { label: "Accessories", count: accessoriesCount, value: "Accessories" }
            ].map((stat) => (
              <div 
                key={stat.value} 
                onClick={() => setCategoryFilter(stat.value)} 
                className={`p-5 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer border transition-all duration-500 rounded-sm active:scale-[0.98] ${
                  categoryFilter === stat.value 
                    ? "bg-red-600 text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] border-red-600 md:-translate-y-1" 
                    : "bg-white border-neutral-200 hover:border-red-300 text-neutral-900 translate-y-0"
                }`}
              >
                <span className={`text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase mb-4 sm:mb-6 text-left ${categoryFilter === stat.value ? "text-white/80" : "text-neutral-500"}`}>
                  {stat.label}
                </span>
                <p className="text-3xl lg:text-4xl font-light tracking-tighter text-left">
                  {stat.count}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] p-5 lg:p-12 w-full overflow-hidden rounded-sm opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10 text-left">
              <div>
                <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {categoryFilter === "All" ? "Full Alert List" : `${categoryFilter} Alerts`}
                </h2>
                {categoryFilter !== "All" && (
                  <button onClick={() => setCategoryFilter("All")} className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 transition-colors">
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
                <input
                  type="text"
                  placeholder="Search by Title or Brand"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="py-20 lg:py-32 flex flex-col items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Scanning Inventory...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-16 lg:py-24 flex flex-col items-center justify-center text-center border-t border-neutral-100 bg-neutral-50/50">
                {searchTerm ? (
                  <p className="text-sm lg:text-lg text-neutral-400 font-light tracking-wide">No alerts matching "{searchTerm}"</p>
                ) : (
                  <>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 lg:mb-6 shadow-sm border border-emerald-100">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm lg:text-lg text-neutral-900 font-light tracking-wide">Inventory is perfectly stocked!</p>
                    <p className="text-[8px] lg:text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2 lg:mt-3">No depleted items in this category.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* =========================================
                    📱 MOBILE VIEW (CARDS - < 768px)
                    ========================================= */}
                <div className="md:hidden flex flex-col gap-5 border-t border-neutral-100 pt-6">
                  {displayedProducts.map((p) => {
                    const imgUrl = p.mainimage1 || p.image2 || p.image || null;
                    return (
                      <div key={p._id} className="bg-white border border-red-100 p-5 rounded-sm flex flex-col shadow-sm relative overflow-hidden">
                        {/* Red warning border top */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>

                        <div className="flex gap-4">
                          <div className="w-16 h-24 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                            {imgUrl ? (
                              <img src={imgUrl} className="w-full h-full object-cover" alt={p.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package className="w-5 h-5 stroke-[1.5]" /></div>
                            )}
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-[1.4] mb-2">{p.title}</h4>
                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-neutral-400 block mb-2">{p.brand}</span>
                            <div className="flex flex-wrap gap-1.5">
                               <span className="text-[8px] font-bold tracking-widest uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">{p.category}</span>
                               {p.season && p.season !== "All" && <span className="text-[8px] font-bold tracking-widest uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm">{p.season}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-100">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 animate-pulse"></span>
                            <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-red-600">Out of Stock</p>
                          </div>
                          <button 
                            onClick={() => { setRestockItem(p); setNewStock(""); }} 
                            className="bg-neutral-950 text-white px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98] rounded-sm flex items-center gap-1.5"
                          >
                            <Plus className="w-3 h-3 stroke-[2]" /> Restock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* =========================================
                    💻 DESKTOP VIEW (TABLE - >= 768px)
                    ========================================= */}
                <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] bg-white rounded-sm">
                  <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                    <thead className="bg-neutral-50/80 border-b border-neutral-200">
                      <tr>
                        <th className="w-[35%] p-5 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Item</th>
                        <th className="w-[25%] p-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Details</th>
                        <th className="w-[20%] p-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                        <th className="w-[20%] p-5 pr-8 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {displayedProducts.map((p) => {
                        const imgUrl = p.mainimage1 || p.image2 || p.image || null;
                        return (
                          <tr key={p._id} className="hover:bg-red-50/40 transition-colors duration-300 group">
                            
                            <td className="py-6 pl-8 pr-6 align-middle text-left">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-20 bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0">
                                  {imgUrl ? (
                                    <img src={imgUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={p.title} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package className="w-5 h-5 stroke-[1.5]" /></div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-sm font-medium text-neutral-900 break-words leading-[1.4] max-w-[250px] whitespace-normal line-clamp-2">{p.title}</p>
                                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">{p.brand}</span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-6 pr-6 align-middle text-left">
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-sm">{p.category}</span>
                                {p.season && p.season !== "All" && <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-sm">{p.season}</span>}
                              </div>
                            </td>
                            
                            <td className="py-6 pr-6 align-middle text-left">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 animate-pulse"></span>
                                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-red-600">Out of Stock</p>
                              </div>
                            </td>
                            
                            <td className="py-6 pr-8 pl-6 align-middle text-right">
                              <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => { setRestockItem(p); setNewStock(""); }} 
                                  className="bg-neutral-950 text-white px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98] rounded-sm flex items-center gap-2 ml-auto"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2]" /> Restock
                                </button>
                              </div>
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

        {/* =========================================
            🌟 RESTOCK MODAL (CENTERED FULLSCREEN)
            ========================================= */}
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${restockItem ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setRestockItem(null)}></div>
          <div className={`bg-white w-full max-w-md shadow-2xl relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] rounded-sm text-left ${restockItem ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
            
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Restock Item</h3>
              <button onClick={() => setRestockItem(null)} className="text-neutral-400 hover:text-red-600 transition-colors p-1 active:scale-95 rounded-full hover:bg-red-50">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div className="p-6 sm:p-8 space-y-8">
                
                <div className="flex items-center gap-5 bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
                  <div className="w-16 h-20 sm:w-20 sm:h-28 bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                    {restockItem?.mainimage1 || restockItem?.image2 ? (
                      <img src={restockItem.mainimage1 || restockItem.image2} alt={restockItem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-3 leading-snug">{restockItem?.title}</p>
                    <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mt-1">{restockItem?.category} {restockItem?.season && restockItem.season !== "All" && `• ${restockItem.season}`}</p>
                  </div>
                </div>

                {/* Floating Label for Number Input */}
                <div className="relative group pt-2">
                  <input 
                    type="number" 
                    id="f-newStock" 
                    placeholder=" " 
                    value={newStock} 
                    onChange={(e) => setNewStock(e.target.value)} 
                    required 
                    min="1"
                    className="peer w-full bg-transparent border-b-2 border-neutral-300 py-3 text-2xl font-light text-neutral-900 focus:outline-none focus:border-red-600 rounded-none transition-colors" 
                  />
                  <label htmlFor="f-newStock" className="absolute left-0 top-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-red-600 peer-[:not(:placeholder-shown)]:text-red-600 cursor-text">
                    Enter New Stock Quantity
                  </label>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-neutral-50/50">
                <button type="button" onClick={() => setRestockItem(null)} className="w-full sm:w-auto border border-neutral-300 bg-white text-neutral-900 px-8 py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-50 active:scale-[0.98] transition-all rounded-sm flex justify-center items-center">
                  Cancel
                </button>
                <button type="submit" className="group/btn relative overflow-hidden w-full sm:w-auto flex-1 bg-red-600 border border-red-600 text-white px-8 py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all rounded-sm active:scale-[0.98]">
                  <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">Confirm Restock</span>
                  <div className="absolute inset-0 h-full w-full scale-x-0 bg-red-700 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
      
      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </AdminLayout>
  );
}