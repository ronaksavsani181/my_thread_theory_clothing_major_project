import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // 🌟 ADDED: isNewArrival and isBestSeller to initial state
  const initialFormState = {
    title: "", brand: "", description: "", price: "", category: "", sizesAvailable: "", stock: "", season: "",
    mainimage1: "", image2: "", image3: "", image4: "", model3Durl: "",
    isNewArrival: false,
    isBestSeller: false,
  };
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load inventory catalog.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const { menCount, womenCount, kidsCount, accessoriesCount, displayedProducts } = useMemo(() => {
    let men = 0, women = 0, kids = 0, acc = 0;
    
    products.forEach(p => {
      if (p.category === "Men") men++;
      else if (p.category === "Women") women++;
      else if (p.category === "Kids") kids++;
      else if (p.category === "Accessories") acc++;
    });

    let filtered = categoryFilter === "All" 
      ? products 
      : products.filter(p => p.category === categoryFilter);

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) || 
        p.brand?.toLowerCase().includes(searchLower)
      );
    }

    return { menCount: men, womenCount: women, kidsCount: kids, accessoriesCount: acc, displayedProducts: filtered };
  }, [products, categoryFilter, searchTerm]);

  // 🌟 UPDATED: Handle both text inputs and checkboxes dynamically
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "checkbox" ? checked : value 
    });
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
      // 🌟 POPULATE EXISTING TAGS
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
    }, 500); 
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
      showToast(error.response?.data?.message || "Action failed to complete.", "error");
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
      <div className="bg-neutral-50 min-h-screen font-sans pb-32 pt-28 lg:pt-36 relative selection:bg-neutral-200 overflow-x-hidden">
        
        {/* LUXURY TOAST NOTIFICATION */}
        <div 
          className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 ease-[0.25,1,0.5,1] pointer-events-none ${
            toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          } ${toast.type === "error" ? "bg-white/95 border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950/95 text-white"}`}
        >
          <p className={`text-[10px] font-bold tracking-[0.25em] uppercase text-center ${toast.type === "error" ? "text-neutral-700" : "text-neutral-200"}`}>
            {toast.message}
          </p>
        </div>

        <div className="max-w-[100rem] mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* HEADER SECTION */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-4">
                Inventory Archive
              </h1>
              <p className="text-[10px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
                Catalog Management ({products.length} Pieces)
              </p>
            </div>
            <button 
              onClick={openAddForm}
              className="group relative overflow-hidden border border-neutral-950 bg-neutral-950 text-white px-10 py-4.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white w-full sm:w-max flex justify-center items-center"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add New Piece
              </span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[
              { label: "All Pieces", count: products.length, value: "All" },
              { label: "Women's Edit", count: womenCount, value: "Women" },
              { label: "Men's Edit", count: menCount, value: "Men" },
              { label: "Kids Edit", count: kidsCount, value: "Kids" },
              { label: "Accessories", count: accessoriesCount, value: "Accessories" },
            ].map((stat) => (
              <div 
                key={stat.value}
                onClick={() => setCategoryFilter(stat.value)}
                className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 border ${
                  categoryFilter === stat.value 
                    ? "bg-neutral-950 border-neutral-950 text-white shadow-xl" 
                    : "bg-white border-neutral-200 hover:border-neutral-900 text-neutral-900"
                }`}
              >
                <span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.25em] uppercase mb-4 sm:mb-6 ${categoryFilter === stat.value ? "text-neutral-400" : "text-neutral-400"}`}>
                  {stat.label}
                </span>
                <p className="text-3xl lg:text-4xl font-light tracking-tighter">
                  {stat.count}
                </p>
              </div>
            ))}
          </div>

          {/* FULL WIDTH FLUID TABLE */}
          <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-8 lg:p-12 w-full overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 lg:mb-10">
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {categoryFilter === "All" ? "Full Catalog" : `${categoryFilter} Collection`}
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
              <div className="py-20 lg:py-32 flex justify-center">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">
                  Retrieving Catalog...
                </p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-16 lg:py-24 text-center border-t border-neutral-100">
                <p className="text-sm text-neutral-400 font-light tracking-wide">
                  {searchTerm ? `No pieces found matching "${searchTerm}"` : "No pieces found in this category."}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-hidden block">
                <table className="w-full text-left table-fixed sm:table-auto whitespace-normal break-words">
                  <thead>
                    <tr className="border-b border-neutral-900">
                      <th className="w-16 sm:w-20 py-4 pr-2 sm:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Item</th>
                      <th className="py-4 pr-2 sm:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Details</th>
                      <th className="w-1/4 py-4 pr-2 sm:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400">Inventory</th>
                      <th className="w-1/6 py-4 pl-2 sm:pl-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {displayedProducts.map((p) => {
                      const imgUrl = p.mainimage1 || p.image2 || p.image || null;

                      return (
                        <tr key={p._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                          
                          <td className="py-4 sm:py-6 pr-2 sm:pr-6 align-middle">
                            <div className="w-10 h-14 sm:w-16 sm:h-24 bg-neutral-100 overflow-hidden border border-neutral-200 relative shrink-0">
                              {imgUrl ? (
                                <img src={imgUrl} alt={p.title} className="w-full h-full object-cover object-center transition-transform duration-[1.5s] group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-4 sm:py-6 pr-2 sm:pr-6 align-middle">
                            <p className="text-[10px] sm:text-sm font-medium text-neutral-900 mb-1 sm:mb-2 flex items-center gap-2">
                              {p.title} 
                              {p.isBestSeller && <span className="bg-yellow-100 text-yellow-800 text-[6px] sm:text-[8px] px-1.5 py-0.5 uppercase tracking-widest font-bold rounded-sm">Best Seller</span>}
                              {p.isNewArrival && <span className="bg-emerald-100 text-emerald-800 text-[6px] sm:text-[8px] px-1.5 py-0.5 uppercase tracking-widest font-bold rounded-sm">New</span>}
                            </p>
                            <p className="text-neutral-400 font-light text-xs mb-2">by {p.brand}</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-neutral-400">
                              <span>{p.category}</span>
                              {p.season && p.season !== "All" && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{p.season}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-4 sm:py-6 pr-2 sm:pr-6 align-middle">
                            <p className="text-[10px] sm:text-sm text-neutral-900 font-medium mb-1 sm:mb-2">₹{p.price.toLocaleString()}</p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.stock > 10 ? 'bg-neutral-900' : p.stock > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                              <p className={`text-[7px] sm:text-[9px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase ${p.stock > 0 ? 'text-neutral-900' : 'text-red-500'}`}>
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 sm:py-6 pl-2 sm:pl-6 align-middle text-right">
                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => openEditForm(p)}
                                className="text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setProductToDelete(p._id)}
                                className="text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.25em] uppercase text-red-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
                              >
                                Remove
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

        {/* CUSTOM SIDE DRAWER FOR ADD / EDIT FORM */}
        <div 
          className={`fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[70] transition-opacity duration-500 ${isFormOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={closeForm}
        ></div>

        <div className={`fixed top-0 right-0 h-full w-[95%] sm:w-full sm:max-w-lg bg-white shadow-2xl z-[80] transform transition-transform duration-700 ease-[0.25,1,0.5,1] flex flex-col ${isFormOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-100 shrink-0">
            <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">
              {editingId ? "Edit Existing Piece" : "Curate New Piece"}
            </h2>
            <button onClick={closeForm} className="text-neutral-400 hover:text-neutral-900 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
              
              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {/* TITLE */}
                <div className="relative group">
                  <input name="title" id="title" placeholder=" " value={form.title} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                  <label htmlFor="title" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900">Title</label>
                </div>
                {/* BRAND */}
                <div className="relative group">
                  <input name="brand" id="brand" placeholder=" " value={form.brand} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                  <label htmlFor="brand" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900">Brand *</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {/* PRICE */}
                <div className="relative group">
                  <input name="price" id="price" type="number" placeholder=" " value={form.price} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                  <label htmlFor="price" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900">Price (₹)</label>
                </div>
                {/* STOCK */}
                <div className="relative group">
                  <input name="stock" id="stock" type="number" placeholder=" " value={form.stock} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                  <label htmlFor="stock" className="absolute left-0 top-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900">Stock Qty</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {/* CATEGORY */}
                <div className="relative group">
                  <label className="block text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">Category</label>
                  <div className="relative">
                    <select name="category" value={form.category} onChange={handleChange} required className="appearance-none w-full bg-transparent border-b border-neutral-300 py-2 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors cursor-pointer">
                      <option value="" disabled>Select Category</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-400"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
                {/* SEASON */}
                <div className="relative group">
                  <label className="block text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">Season</label>
                  <div className="relative">
                    <select name="season" value={form.season} onChange={handleChange} className="appearance-none w-full bg-transparent border-b border-neutral-300 py-2 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors cursor-pointer">
                      <option value="" disabled>Select Season</option>
                      <option value="All">All</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-400"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
              </div>

              {/* 🌟 NEW: PRODUCT TAGS (CHECKBOXES) */}
              <div className="border-t border-neutral-100 pt-6 mt-6 space-y-4">
                <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-4">Product Tags</h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${form.isNewArrival ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
                      {form.isNewArrival && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={handleChange} className="hidden" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-900 transition-colors">Mark as New Arrival</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${form.isBestSeller ? "bg-neutral-900 border-neutral-900" : "border-neutral-300 group-hover:border-neutral-500"}`}>
                      {form.isBestSeller && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} className="hidden" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-900 transition-colors">Mark as Best Seller</span>
                  </label>

                </div>
              </div>

              {/* SIZES */}
              <div className="relative group pt-4">
                <input name="sizesAvailable" id="sizesAvailable" placeholder=" " value={form.sizesAvailable} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                <label htmlFor="sizesAvailable" className="absolute left-0 top-7 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-neutral-900">Sizes (S, M, L...)</label>
              </div>

              {/* DESCRIPTION */}
              <div className="pt-2">
                <label className="block text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">Description</label>
                <textarea name="description" placeholder="Product details..." value={form.description} onChange={handleChange} rows="3" className="w-full bg-neutral-50/50 border border-neutral-200 p-4 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors resize-none" />
              </div>

              {/* MEDIA ASSETS */}
              <div className="border-t border-neutral-100 pt-6 mt-6 space-y-6 pb-6">
                <h3 className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-4">Media Assets</h3>
                
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative group">
                    <input name="mainimage1" id="mainimage1" placeholder=" " value={form.mainimage1} onChange={handleChange} required className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="mainimage1" className="absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-neutral-900">Main Image 1 *</label>
                  </div>
                  <div className="relative group">
                    <input name="image2" id="image2" placeholder=" " value={form.image2} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="image2" className="absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-neutral-900">Image 2 (Hover)</label>
                  </div>
                  <div className="relative group">
                    <input name="image3" id="image3" placeholder=" " value={form.image3} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="image3" className="absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-neutral-900">Image 3</label>
                  </div>
                  <div className="relative group">
                    <input name="image4" id="image4" placeholder=" " value={form.image4} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                    <label htmlFor="image4" className="absolute left-0 top-3 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-neutral-900">Image 4</label>
                  </div>
                </div>

                <div className="relative group pt-4">
                  <input name="model3Durl" id="model3Durl" placeholder=" " value={form.model3Durl} onChange={handleChange} className="peer w-full bg-transparent border-b border-neutral-300 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 rounded-none transition-colors" />
                  <label htmlFor="model3Durl" className="absolute left-0 top-6 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition-all duration-300 peer-focus:-translate-y-5 peer-focus:text-[8px] peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[8px] peer-[:not(:placeholder-shown)]:text-neutral-900">3D Model URL (GLTF/GLB)</label>
                </div>
              </div>

            </div>

            <div className="p-6 sm:p-8 border-t border-neutral-100 bg-neutral-50/50 shrink-0">
              <button type="submit" className="w-full bg-neutral-950 text-white py-4.5 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-neutral-800 transition-colors active:scale-[0.98]">
                {editingId ? "Update Piece" : "Publish Piece"}
              </button>
            </div>

          </form>
        </div>

        {/* CUSTOM DELETE CONFIRMATION MODAL */}
        <div 
          className={`fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[90] transition-opacity duration-300 flex items-center justify-center ${productToDelete ? "opacity-100 visible" : "opacity-0 invisible"}`}
          onClick={() => setProductToDelete(null)}
        >
          <div 
            className={`bg-white p-8 sm:p-10 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-500 ease-[0.25,1,0.5,1] ${productToDelete ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-xl font-light tracking-wide text-neutral-900 uppercase mb-3">Remove Piece?</h3>
              <p className="text-sm font-light text-neutral-500 mb-8 leading-relaxed">
                This action cannot be undone. This piece will be permanently deleted from the archive.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-red-700 transition-colors active:scale-[0.98]">
                  Yes, Remove
                </button>
                <button onClick={() => setProductToDelete(null)} className="w-full bg-transparent text-neutral-900 border border-neutral-300 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:border-neutral-900 transition-colors active:scale-[0.98]">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLBAR UTILITY */}
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        
      </div>
    </AdminLayout>
  );
}