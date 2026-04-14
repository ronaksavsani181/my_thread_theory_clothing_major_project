import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

export default function AdminStockOut() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // 🟢 NEW: Search State for the Alerts Table
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [restockItem, setRestockItem] = useState(null);
  const [newStock, setNewStock] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
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
    fetchStockOut();
  }, []);

  // 🟢 DYNAMIC COUNTS, STATUS FILTER, AND SEARCH FILTER
  const { menCount, womenCount, kidsCount, accessoriesCount, displayedProducts } = useMemo(() => {
    let men = 0, women = 0, kids = 0, acc = 0;
    products.forEach(p => {
      if (p.category === "Men") men++;
      else if (p.category === "Women") women++;
      else if (p.category === "Kids") kids++;
      else if (p.category === "Accessories") acc++;
    });

    // Step 1: Filter by Category
    let filtered = categoryFilter === "All" ? products : products.filter(p => p.category === categoryFilter);

    // Step 2: 🟢 NEW Filter by Search Term (Title or Brand)
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
      <div className="bg-neutral-50 min-h-screen font-sans pb-32 pt-28 lg:pt-36 relative selection:bg-neutral-200 overflow-x-hidden">
        
        <div className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 pointer-events-none rounded-sm ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
        </div>

        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="mb-8 lg:mb-12 border-b border-neutral-200 pb-6 lg:pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-red-600 mb-2">Depleted Stock</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Inventory Alerts ({products.length} Items)</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
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
                className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer border transition-all duration-500 rounded-sm ${
                  categoryFilter === stat.value 
                    ? "bg-red-600 text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] border-red-600" 
                    : "bg-white border-neutral-200 hover:border-red-400"
                }`}
              >
                <span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.2em] uppercase mb-3 sm:mb-6 ${categoryFilter === stat.value ? "text-white/90" : "text-neutral-400"}`}>
                  {stat.label}
                </span>
                <p className="text-2xl sm:text-3xl lg:text-5xl font-light tracking-tighter">
                  {stat.count}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-12 w-full overflow-hidden rounded-sm">
            
            {/* 🟢 NEW: Header with Search Bar included */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6 lg:mb-10 px-2">
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {categoryFilter === "All" ? "Full Alert List" : `${categoryFilter} Alerts`}
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Title or Brand"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-300 py-2 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="py-20 lg:py-32 flex justify-center"><p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Scanning Inventory...</p></div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-16 lg:py-24 flex flex-col items-center justify-center text-center border-t border-neutral-100">
                {searchTerm ? (
                  <p className="text-sm lg:text-lg text-neutral-400 font-light tracking-wide">No alerts matching "{searchTerm}"</p>
                ) : (
                  <>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 lg:mb-6 shadow-sm">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm lg:text-lg text-neutral-900 font-light tracking-wide">Inventory is perfectly stocked!</p>
                    <p className="text-[8px] lg:text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2 lg:mt-3">No depleted items in this category.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full overflow-hidden block">
                <table className="w-full text-left table-fixed sm:table-auto whitespace-normal break-words">
                  <thead>
                    <tr className="border-b border-neutral-900">
                      <th className="w-[25%] sm:w-auto p-2 sm:p-4 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Item</th>
                      <th className="w-[40%] sm:w-auto p-2 sm:p-4 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Details</th>
                      <th className="w-[20%] sm:w-auto p-2 sm:p-4 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Status</th>
                      <th className="w-[15%] sm:w-auto p-2 sm:p-4 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {displayedProducts.map((p) => {
                      const imgUrl = p.mainimage1 || p.image2 || p.image || null;
                      return (
                        <tr key={p._id} className="hover:bg-red-50/40 transition-colors duration-300">
                          
                          <td className="p-2 sm:p-4 align-middle">
                            <div className="w-12 h-16 sm:w-16 sm:h-24 bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                              {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" alt={p.title} /> : <div className="w-full h-full bg-neutral-200"></div>}
                            </div>
                          </td>
                          
                          <td className="p-2 sm:p-4 align-middle">
                            <p className="text-[10px] sm:text-sm font-medium text-neutral-900 mb-1 break-words line-clamp-2">{p.title}</p>
                            <span className="text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-neutral-400 block mt-1">{p.category} {p.season && p.season !== "All" && `• ${p.season}`}</span>
                          </td>
                          
                          <td className="p-2 sm:p-4 align-middle">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500 animate-pulse"></span>
                              <p className="text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-red-600">Out of Stock</p>
                            </div>
                          </td>
                          
                          <td className="p-2 sm:p-4 align-middle text-right">
                            <div className="flex flex-col items-end sm:flex-row sm:items-center justify-end gap-2 sm:gap-4">
                              <button 
                                onClick={() => { setRestockItem(p); setNewStock(""); }} 
                                className="bg-neutral-950 text-white px-3 sm:px-6 py-2 sm:py-3 text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98] rounded-sm whitespace-nowrap"
                              >
                                Restock
                              </button>
                            </div>
                          </td>

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

      {/* RESTOCK MODAL (Popup) */}
      {restockItem && (
        <div className="fixed inset-0 bg-neutral-950/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden transform transition-all rounded-sm">
            
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Restock Item</h3>
              <button onClick={() => setRestockItem(null)} className="text-neutral-400 hover:text-red-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center gap-5 mb-2 bg-neutral-50/50 p-4 border border-neutral-100 rounded-sm">
                  <div className="w-16 h-20 sm:w-20 sm:h-28 bg-neutral-100 border border-neutral-200 shrink-0 shadow-sm">
                    <img src={restockItem.mainimage1 || restockItem.image2} alt={restockItem.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-3 leading-snug">{restockItem.title}</p>
                    <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400">{restockItem.category} • {restockItem.season}</p>
                  </div>
                </div>

                <div className="relative group pt-4">
                  <input 
                    type="number" 
                    id="newStock" 
                    placeholder=" " 
                    value={newStock} 
                    onChange={(e) => setNewStock(e.target.value)} 
                    required 
                    min="1"
                    className="peer w-full border-b-2 border-neutral-200 py-3 text-xl font-light text-neutral-900 focus:border-red-600 outline-none bg-transparent transition-colors" 
                  />
                  <label htmlFor="newStock" className="absolute left-0 top-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[8px] peer-focus:text-red-600 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-red-600">
                    Enter New Stock Quantity
                  </label>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-neutral-50 border-t border-neutral-100 flex gap-3">
                <button type="button" onClick={() => setRestockItem(null)} className="w-full border border-neutral-300 bg-white text-neutral-900 py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-100 active:scale-[0.98] transition-all rounded-sm">
                  Cancel
                </button>
                <button type="submit" className="w-full bg-red-600 text-white py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-red-700 active:scale-[0.98] transition-all shadow-md rounded-sm">
                  Confirm Restock
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </AdminLayout>
  );
}