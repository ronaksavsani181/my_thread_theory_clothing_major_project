import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Plus, Search, Edit3, Trash2, X, Package, ChevronDown, ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const initialFormState = {
    title: "", brand: "", description: "", price: "", category: "", sizesAvailable: "", stock: "", season: "All",
    mainimage1: "", image2: "", image3: "", image4: "", model3Durl: "",
    isNewArrival: false,
    isBestSeller: false,
  };
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      showToast("Failed to load inventory catalog.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
    fetchProducts();
  }, []);

  // Prevent background scroll when modal forms are open
  useEffect(() => {
    if (isFormOpen || productToDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isFormOpen, productToDelete]);

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
      filtered = filtered.filter(p => p.title?.toLowerCase().includes(searchLower) || p.brand?.toLowerCase().includes(searchLower));
    }
    return { menCount: men, womenCount: women, kidsCount: kids, accessoriesCount: acc, displayedProducts: filtered };
  }, [products, categoryFilter, searchTerm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openAddForm = () => {
    setForm(initialFormState);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setForm({
      ...product,
      brand: product.brand || "",
      sizesAvailable: product.sizesAvailable ? product.sizesAvailable.join(", ") : "",
      mainimage1: product.mainimage1 || "",
      image2: product.image2 || "",
      image3: product.image3 || "",
      image4: product.image4 || "",
      model3Durl: product.model3Durl || "",
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
    });
    setEditingId(product._id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setForm(initialFormState);
      setEditingId(null);
    }, 400); // Wait for closing animation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      sizesAvailable: Array.isArray(form.sizesAvailable)
        ? form.sizesAvailable
        : String(form.sizesAvailable || "").split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast("Piece successfully updated.");
      } else {
        await api.post("/products/add-product", payload);
        showToast("New piece added to collection.");
      }
      fetchProducts();
      closeForm();
    } catch (error) {
      showToast(error.response?.data?.message || "Action failed.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      showToast("Piece removed from catalog.");
      fetchProducts();
    } catch (error) {
      showToast("Failed to remove piece.", "error");
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className={`bg-neutral-50 min-h-screen font-sans pb-32 pt-6 lg:pt-10 selection:bg-neutral-200 transition-opacity duration-1000 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="m-8 lg:m-20"></div>

        {/* =========================================
            🌟 LUXURY TOAST NOTIFICATION
            ========================================= */}
        <div className={`fixed left-1/2 top-24 z-[200] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-2xl p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none border ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"}`}>
          <div className="shrink-0">
            {toast.type === "error" ? <AlertTriangle className="h-5 w-5 text-red-500 stroke-[2]" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[2]" />}
          </div>
          <div className="flex-1 text-left">
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-emerald-400"} mb-0.5`}>
              {toast.type === "error" ? "Notice" : "Success"}
            </p>
            <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>
              {toast.message}
            </p>
          </div>
        </div>

        <div className="max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-12">
          
          {/* =========================================
              HEADER SECTION
              ========================================= */}
          <div className="mb-10 lg:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-200 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">Inventory Archive</h1>
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Catalog Management ({products.length} Pieces)</p>
            </div>
            <button onClick={openAddForm} className="group relative overflow-hidden bg-neutral-950 text-white px-10 py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:shadow-xl flex justify-center items-center active:scale-[0.98] rounded-sm w-full md:w-auto">
              <span className="relative z-10 flex items-center gap-3"><Plus className="w-4 h-4 stroke-[2]" /> Add New Piece</span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </button>
          </div>

          {/* =========================================
              STATS / FILTERS
              ========================================= */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-6 mb-10 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            {[
              { label: "All Pieces", count: products.length, value: "All" },
              { label: "Women", count: womenCount, value: "Women" },
              { label: "Men", count: menCount, value: "Men" },
              { label: "Kids", count: kidsCount, value: "Kids" },
              { label: "Accessory", count: accessoriesCount, value: "Accessories" },
            ].map((stat) => (
              <div key={stat.value} onClick={() => setCategoryFilter(stat.value)} className={`p-5 lg:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 border rounded-sm active:scale-[0.98] ${categoryFilter === stat.value ? "bg-neutral-950 border-neutral-950 text-white shadow-xl md:-translate-y-1" : "bg-white border-neutral-200 hover:border-neutral-900 hover:shadow-md text-neutral-900"}`}>
                <span className={`text-[9px] font-bold tracking-[0.25em] uppercase mb-4 sm:mb-6 text-left ${categoryFilter === stat.value ? "text-neutral-400" : "text-neutral-500"}`}>{stat.label}</span>
                <p className="text-3xl lg:text-4xl font-light tracking-tighter text-left">{stat.count}</p>
              </div>
            ))}
          </div>

          {/* =========================================
              LEDGER SECTION (CARDS ON MOBILE, TABLE ON DESKTOP)
              ========================================= */}
          <div className="bg-white border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] p-5 lg:p-12 rounded-sm opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10 text-left">
              <div>
                <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {categoryFilter === "All" ? "Full Catalog" : `${categoryFilter} Collection`}
                </h2>
              </div>
              <div className="relative w-full md:w-72 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
                <input type="text" placeholder="Search by Title or Brand..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400" />
              </div>
            </div>

            {loading ? (
              <div className="py-20 lg:py-32 flex flex-col items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Synchronizing Catalog...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-16 lg:py-24 text-center border-t border-neutral-100 bg-neutral-50/50">
                <p className="text-xs sm:text-sm text-neutral-400 font-light tracking-wide">
                  {searchTerm ? `No pieces found matching "${searchTerm}"` : "No pieces found in this category."}
                </p>
              </div>
            ) : (
              <>
                {/* 📱 MOBILE VIEW (CARDS) */}
                <div className="md:hidden flex flex-col gap-5 border-t border-neutral-100 pt-6">
                  {displayedProducts.map((p) => (
                    <div key={p._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0">
                          {p.mainimage1 || p.image ? (
                            <img src={p.mainimage1 || p.image} className="w-full h-full object-cover" alt="item" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package className="w-5 h-5" /></div>
                          )}
                        </div>
                        <div className="flex-1 text-left flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-2">
                             {p.isBestSeller && <span className="bg-yellow-950 text-yellow-200 text-[8px] px-2 py-0.5 uppercase tracking-widest font-bold rounded-sm">Bestseller</span>}
                             {p.isNewArrival && <span className="bg-neutral-900 text-white text-[8px] px-2 py-0.5 uppercase tracking-widest font-bold rounded-sm">New</span>}
                          </div>
                          <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-[1.3] mb-1">{p.title}</h4>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.2em] font-bold">{p.brand}</p>
                          <p className="text-sm font-light tracking-wide text-neutral-900 mt-2">₹{p.price.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-neutral-50 p-3 mt-4 border border-neutral-100 rounded-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-neutral-900' : p.stock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${p.stock > 0 ? 'text-neutral-900' : 'text-red-500'}`}>{p.stock} Units</span>
                        </div>
                        <div className="flex items-center gap-5">
                           <button onClick={() => openEditForm(p)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5">
                             <Edit3 className="w-3.5 h-3.5 stroke-[2]" /> Edit
                           </button>
                           <button onClick={() => setProductToDelete(p._id)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5">
                             <Trash2 className="w-3.5 h-3.5 stroke-[2]" /> Drop
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💻 DESKTOP VIEW (TABLE) */}
                <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] bg-white rounded-sm">
                  <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                    <thead className="bg-neutral-50/80 border-b border-neutral-200">
                      <tr>
                        <th className="py-5 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Item</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Attributes</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Pricing</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Inventory</th>
                        <th className="py-5 pr-8 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {displayedProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                          <td className="py-6 pl-8 pr-6 align-middle">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-20 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                                {p.mainimage1 || p.image ? (
                                  <img src={p.mainimage1 || p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="item" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-neutral-300" /></div>
                                )}
                              </div>
                              <div className="text-left flex flex-col">
                                <span className="text-sm font-medium text-neutral-900 leading-tight mb-1">{p.title}</span>
                                <span className="text-[10px] text-neutral-400 tracking-[0.2em] font-bold uppercase">{p.brand}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-6 pr-6 align-middle text-left">
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[9px] px-2 py-0.5 bg-neutral-100 text-neutral-600 uppercase tracking-widest font-bold rounded-sm">{p.category}</span>
                              {p.isBestSeller && <span className="text-[9px] px-2 py-0.5 bg-yellow-950 text-yellow-200 uppercase tracking-widest font-bold rounded-sm">Bestseller</span>}
                            </div>
                          </td>
                          
                          <td className="py-6 pr-6 align-middle text-left">
                            <span className="text-sm font-medium tracking-wide text-neutral-900">₹{p.price.toLocaleString()}</span>
                          </td>
                          
                          <td className="py-6 pr-6 align-middle text-left">
                             <div className="flex items-center gap-2">
                               <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.stock > 10 ? 'bg-neutral-900' : p.stock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
                               <span className={`text-[10px] font-bold uppercase tracking-widest ${p.stock > 0 ? 'text-neutral-900' : 'text-red-500'}`}>{p.stock} Units</span>
                             </div>
                          </td>
                          
                          <td className="py-6 pr-8 pl-6 align-middle text-right">
                            <div className="flex items-center justify-end gap-5">
                              <button onClick={() => openEditForm(p)} className="text-neutral-400 hover:text-neutral-950 transition-colors group/edit" title="Edit Piece">
                                <Edit3 className="w-4 h-4 stroke-[2] group-hover/edit:scale-110 transition-transform" />
                              </button>
                              <button onClick={() => setProductToDelete(p._id)} className="text-neutral-400 hover:text-red-500 transition-colors group/del" title="Delete Piece">
                                <Trash2 className="w-4 h-4 stroke-[2] group-hover/del:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =========================================
            🌟 ADD / EDIT PRODUCT MODAL (CENTERED FULL SCREEN)
            ========================================= */}
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${isFormOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          
          {/* Backdrop */}
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeForm}></div>
          
          {/* Modal Container */}
          <div className={`bg-white w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh] shadow-2xl relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] flex flex-col rounded-sm ${isFormOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-100 shrink-0 bg-neutral-50/50">
              <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">
                {editingId ? "Modify Piece Configuration" : "Curate New Piece"}
              </h2>
              <button onClick={closeForm} className="text-neutral-400 hover:text-neutral-900 transition-colors active:scale-95 p-1">
                <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 sm:space-y-10 no-scrollbar text-left">
                
                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="relative group pt-2">
                    <input name="title" id="f-title" placeholder=" " value={form.title} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-title" className="absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Item Title *</label>
                  </div>
                  <div className="relative group pt-2">
                    <input name="brand" id="f-brand" placeholder=" " value={form.brand} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-brand" className="absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Brand *</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="relative group pt-2">
                    <input name="price" id="f-price" type="number" placeholder=" " value={form.price} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-price" className="absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Price (₹) *</label>
                  </div>
                  <div className="relative group pt-2">
                    <input name="stock" id="f-stock" type="number" placeholder=" " value={form.stock} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-stock" className="absolute left-0 top-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Stock Quantity *</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Category *</label>
                    <div className="relative">
                      <select name="category" value={form.category} onChange={handleChange} required className="appearance-none w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors cursor-pointer">
                        <option value="" disabled>Select Category</option>
                        <option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option><option value="Accessories">Accessories</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-900"><ChevronDown className="h-4 w-4 stroke-[1.5]" /></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Season</label>
                    <div className="relative">
                      <select name="season" value={form.season} onChange={handleChange} className="appearance-none w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors cursor-pointer">
                        <option value="All">All Season</option><option value="Summer">Summer</option><option value="Winter">Winter</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-900"><ChevronDown className="h-4 w-4 stroke-[1.5]" /></div>
                    </div>
                  </div>
                </div>

                {/* Tags & Sizes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-neutral-100 pt-8">
                  <div className="flex flex-col justify-center gap-5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Product Badges</label>
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
                      <label className="flex items-center gap-3 cursor-pointer group w-max">
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors rounded-sm ${form.isNewArrival ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500 bg-white"}`}>
                          {form.isNewArrival && <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={handleChange} className="hidden" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-900 transition-colors">New Arrival</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group w-max">
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors rounded-sm ${form.isBestSeller ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500 bg-white"}`}>
                          {form.isBestSeller && <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} className="hidden" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-900 transition-colors">Best Seller</span>
                      </label>
                    </div>
                  </div>
                  <div className="relative group pt-6 sm:pt-2">
                    <input name="sizesAvailable" id="f-sizes" placeholder=" " value={form.sizesAvailable} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-sizes" className="absolute left-0 top-9 sm:top-5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-7 sm:peer-focus:-translate-y-5 peer-focus:text-[8px] sm:peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-translate-y-7 sm:peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] sm:peer-[:not(:placeholder-shown)]:text-[9px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Sizes (S, M, L...)</label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Editorial Description</label>
                  <textarea name="description" placeholder="Describe the materials, fit, and aesthetic..." value={form.description} onChange={handleChange} rows="4" className="w-full bg-white border border-neutral-200 p-5 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-sm transition-colors resize-none shadow-sm placeholder:text-neutral-300" />
                </div>

                {/* Media Links */}
                <div className="border-t border-neutral-100 pt-8 space-y-6">
                  <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 stroke-[1.5]" /> Media Asset URLs</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="relative group pt-2">
                      <input name="mainimage1" id="f-img1" placeholder=" " value={form.mainimage1} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                      <label htmlFor="f-img1" className="absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Main Image URL *</label>
                    </div>
                    <div className="relative group pt-2">
                      <input name="image2" id="f-img2" placeholder=" " value={form.image2} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                      <label htmlFor="f-img2" className="absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Image 2 (Hover/Gallery)</label>
                    </div>
                    <div className="relative group pt-2">
                      <input name="image3" id="f-img3" placeholder=" " value={form.image3} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                      <label htmlFor="f-img3" className="absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Image 3 (Gallery)</label>
                    </div>
                    <div className="relative group pt-2">
                      <input name="image4" id="f-img4" placeholder=" " value={form.image4} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                      <label htmlFor="f-img4" className="absolute left-0 top-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">Image 4 (Gallery)</label>
                    </div>
                  </div>
                  
                  <div className="relative group pt-4">
                    <input name="model3Durl" id="f-3d" placeholder=" " value={form.model3Durl} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="f-3d" className="absolute left-0 top-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] text-neutral-400 peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:text-neutral-900">3D Model URL (.glb / .gltf) - Try On Feature</label>
                  </div>
                </div>

              </div>

              {/* Modal Sticky Footer */}
              <div className="p-6 sm:p-8 border-t border-neutral-100 bg-neutral-50/80 shrink-0 flex flex-col sm:flex-row gap-4 justify-end">
                <button type="button" onClick={closeForm} className="w-full sm:w-auto px-10 border border-neutral-300 bg-white text-neutral-900 py-4 text-[9px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-50 transition-colors active:scale-[0.98] rounded-sm">
                  Cancel
                </button>
                <button type="submit" className="group/btn relative overflow-hidden w-full sm:w-auto px-12 bg-neutral-950 border border-neutral-950 text-white py-4 text-[9px] font-bold tracking-[0.25em] uppercase transition-all active:scale-[0.98] rounded-sm">
                  <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">
                    {editingId ? "Sync Changes" : "Publish to Catalog"}
                  </span>
                  <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =========================================
            🌟 DELETE CONFIRMATION MODAL
            ========================================= */}
        <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${productToDelete ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setProductToDelete(null)}></div>
          <div className={`bg-white p-8 sm:p-12 max-w-sm w-full rounded-sm text-center relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] shadow-2xl ${productToDelete ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
             <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
               <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
             </div>
             <h3 className="text-2xl font-light uppercase tracking-widest mb-4 text-neutral-900">Purge Item?</h3>
             <p className="text-sm font-light text-neutral-500 mb-10 leading-relaxed px-2">This will permanently remove the piece from the store database. This action cannot be undone.</p>
             <div className="flex flex-col gap-3 sm:gap-4">
               <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-red-700 transition-colors active:scale-[0.98] rounded-sm">Confirm Purge</button>
               <button onClick={() => setProductToDelete(null)} className="w-full border border-neutral-300 text-neutral-900 py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:border-neutral-900 transition-colors active:scale-[0.98] rounded-sm">Cancel Request</button>
             </div>
          </div>
        </div>

      </div>

      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </AdminLayout>
  );
}