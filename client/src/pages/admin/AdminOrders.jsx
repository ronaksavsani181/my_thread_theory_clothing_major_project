import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, CheckCircle2, AlertTriangle, X, Package, ArrowRight } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // 🟢 CINEMATIC ROUTING STATE
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const handleRedirect = (e, path, id = "global") => {
    if (e) e.preventDefault();
    setRedirectTarget(id);
    setIsRedirecting(true);
    setTimeout(() => navigate(path), 800);
  };

  const fetchOrders = async () => {
    try { 
      setLoading(true); 
      const res = await api.get('/orders/admin/all'); 
      setOrders(res.data); 
    } 
    catch (error) { 
      showToast("Failed to sync database.", "error"); 
    } 
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLoaded(true), 100);
    fetchOrders(); 
  }, []);

  // 🟢 SMART UPDATE FUNCTION
  const updateStatus = async (id, status) => {
    try { 
      const res = await api.put(`/orders/${id}/status`, { status }); 
      showToast(res.data.message || `Order updated to ${status}`); 
      fetchOrders(); 
    } 
    catch (error) { 
      if (error.response?.status === 404) {
        try {
          const res2 = await api.put(`/orders/status/${id}`, { status });
          showToast(res2.data.message || `Order updated to ${status}`); 
          fetchOrders(); 
        } catch (err2) {
          showToast(err2.response?.data?.message || "Status update failed", "error");
        }
      } else {
        showToast(error.response?.data?.message || "Status update failed", "error"); 
      }
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();

  const { filteredOrders, metrics } = useMemo(() => {
    const now = new Date();
    
    // Step 1: Filter by Time
    let timeFiltered = orders;
    if (timeFilter === 'daily') { const today = new Date(now.setHours(0, 0, 0, 0)); timeFiltered = orders.filter(o => new Date(o.createdAt) >= today); } 
    else if (timeFilter === 'weekly') { const lw = new Date(); lw.setDate(now.getDate() - 7); timeFiltered = orders.filter(o => new Date(o.createdAt) >= lw); } 
    else if (timeFilter === 'monthly') { const lm = new Date(); lm.setDate(now.getDate() - 30); timeFiltered = orders.filter(o => new Date(o.createdAt) >= lm); }

    // Step 2: Calculate Metrics for the Cards
    const calc = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Returned: 0 };
    timeFiltered.forEach(o => { 
      if (calc[o.orderStatus] !== undefined) calc[o.orderStatus]++; 
      else if (o.orderStatus === 'Cancelled') calc.Returned++; 
    });

    // Step 3: Filter by Status Panel Selection
    let finalFiltered = timeFiltered;
    if (statusFilter !== "All") {
      finalFiltered = timeFiltered.filter(o => o.orderStatus === statusFilter || (statusFilter === 'Returned' && o.orderStatus === 'Cancelled'));
    }
    
    // Step 4: Filter by Search Term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      finalFiltered = finalFiltered.filter(o => {
        const orderIdMatch = o._id.toLowerCase().includes(searchLower);
        const clientNameMatch = o.userId?.name?.toLowerCase().includes(searchLower);
        const clientEmailMatch = o.userId?.email?.toLowerCase().includes(searchLower);
        return orderIdMatch || clientNameMatch || clientEmailMatch;
      });
    }

    return { filteredOrders: finalFiltered, metrics: calc };
  }, [orders, timeFilter, statusFilter, searchTerm]);

  return (
    <AdminLayout>
      <div className={`w-full max-w-[100rem] mx-auto font-sans relative pb-10 px-5 sm:px-6 lg:px-12 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isRedirecting ? 'opacity-50' : ''}`}>
        
        <div className="m-8 lg:m-16"></div>

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
          <button onClick={() => { setToast({ ...toast, show: false }); if (timerRef.current) clearTimeout(timerRef.current); }} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95">
            <X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} />
          </button>
        </div>

        {/* =========================================
            HEADER & TIME FILTER
            ========================================= */}
        <div className="mb-8 lg:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-6 lg:pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2 lg:mb-4">Logistics</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Fulfillment Control</p>
          </div>
          <div className="relative w-full md:w-48 group border-b border-neutral-300 hover:border-neutral-900 transition-colors bg-white">
            <select 
              className="appearance-none w-full bg-transparent py-3 sm:py-3.5 pl-3 pr-8 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 focus:outline-none cursor-pointer" 
              value={timeFilter} 
              onChange={(e) => { setTimeFilter(e.target.value); setStatusFilter("All"); }}
            >
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400 group-hover:text-neutral-900 transition-colors">
              <ChevronDown className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* =========================================
            STATUS METRICS (INTERACTIVE FILTERS)
            ========================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-10 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
          {[
            { label: "Pending", count: metrics.Pending }, 
            { label: "Processing", count: metrics.Processing }, 
            { label: "Shipped", count: metrics.Shipped }, 
            { label: "Delivered", count: metrics.Delivered }, 
            { label: "Returned", count: metrics.Returned }
          ].map((stat) => (
            <div 
              key={stat.label} 
              onClick={() => setStatusFilter(statusFilter === stat.label ? "All" : stat.label)} 
              className={`p-5 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 border rounded-sm active:scale-[0.98] ${
                statusFilter === stat.label 
                ? "bg-neutral-950 border-neutral-950 text-white shadow-xl translate-y-0 md:-translate-y-1" 
                : "bg-white border-neutral-200 hover:border-neutral-900 hover:shadow-md translate-y-0"
              }`}
            >
              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-6 ${statusFilter === stat.label ? "text-neutral-400" : "text-neutral-500"}`}>{stat.label}</span>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* =========================================
            LEDGER SECTION
            ========================================= */}
        <div className="bg-white border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-12 rounded-sm opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10">
            <div className="text-left">
              <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">
                {statusFilter === "All" ? "All Shipments" : `${statusFilter} Shipments`}
              </h2>
              {statusFilter !== "All" && (
                <button onClick={() => setStatusFilter("All")} className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 transition-colors">
                  Clear Filter
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search by Ref or Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 lg:py-32 flex flex-col items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Synchronizing...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 lg:py-24 text-center border-t border-neutral-100 bg-neutral-50/50">
              <p className="text-xs lg:text-sm text-neutral-500 font-light tracking-wide">
                {searchTerm ? `No shipments found matching "${searchTerm}"` : "No records match."}
              </p>
            </div>
          ) : (
            <>
              {/* =========================================
                  📱 MOBILE VIEW (Cards - < 768px)
                  ========================================= */}
              <div className="md:hidden flex flex-col gap-5 border-t border-neutral-100 pt-6">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    
                    {/* Header: ID & Total */}
                    <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-4">
                      <div className="text-left">
                        <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Order Ref</p>
                        <p className="text-xs font-bold tracking-widest text-neutral-900 uppercase">#{order._id.slice(-6)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Total</p>
                        <span className="text-sm font-medium tracking-wide text-neutral-900">₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-sm border border-neutral-100 mb-4">
                      <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-full text-[10px] font-light shadow-sm shrink-0">
                        {order.userId?.name ? order.userId.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-xs font-medium tracking-wide text-neutral-900 truncate">{order.userId?.name || "Guest Checkout"}</span>
                        <span className="text-[9px] font-light text-neutral-500 truncate mt-0.5">{order.userId?.email || "No email"}</span>
                      </div>
                    </div>

                    {/* Products & Date */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex -space-x-2 overflow-hidden pl-2">
                        {order.products.slice(0, 3).map((item, i) => {
                          const imgUrl = item.productId?.mainimage1 || item.productId?.image2 || null;
                          return (
                            <div key={i} className="w-8 h-12 bg-neutral-100 border-2 border-white overflow-hidden relative z-10 shadow-sm">
                              {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200 flex items-center justify-center"><Package className="w-3 h-3 text-neutral-400" /></div>}
                            </div>
                          );
                        })}
                        {order.products.length > 3 && (
                          <div className="w-8 h-12 bg-neutral-100 border-2 border-white relative z-10 flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-bold text-neutral-500">+{order.products.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] tracking-[0.15em] font-bold uppercase text-neutral-400">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions: Status Dropdown & View */}
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-neutral-100">
                      
                      <div className="relative w-full border border-neutral-300 hover:border-neutral-900 transition-colors rounded-sm">
                        <select 
                          value={order.orderStatus} 
                          onChange={(e) => updateStatus(order._id, e.target.value)} 
                          className={`appearance-none w-full bg-transparent py-3 pl-3 pr-8 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer ${order.orderStatus === 'Delivered' ? 'text-emerald-700' : order.orderStatus === 'Returned' || order.orderStatus === 'Cancelled' ? 'text-red-600' : 'text-neutral-900'}`}
                        >
                          <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Returned</option><option>Cancelled</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-900">
                          <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                        </div>
                      </div>

                      {/* <button 
                        onClick={(e) => handleRedirect(e, `/orders/${order._id}`, `view-${order._id}`)}
                        disabled={isRedirecting}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-transform rounded-sm disabled:opacity-80"
                      >
                        {isRedirecting && redirectTarget === `view-${order._id}` ? "Loading..." : "View Order"}
                        {!isRedirecting && <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />}
                      </button> */}

                    </div>
                  </div>
                ))}
              </div>

              {/* =========================================
                  💻 DESKTOP VIEW (Table - >= 768px)
                  ========================================= */}
              <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-sm rounded-sm">
                <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                  <thead className="bg-neutral-50/80">
                    <tr className="border-b border-neutral-200">
                      <th className="py-5 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Order Ref</th>
                      <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Client</th>
                      <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Manifest</th>
                      <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Total</th>
                      <th className="py-5 pr-8 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Status Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                        
                        <td className="py-6 pl-8 pr-6 align-middle text-left">
                          <button 
                            onClick={(e) => handleRedirect(e, `/orders/${order._id}`)}
                            className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase hover:text-neutral-500 border-b border-transparent hover:border-neutral-500 pb-0.5 transition-colors"
                          >
                            #{order._id.slice(-6)}
                          </button>
                        </td>
                        
                        <td className="py-6 pr-6 align-middle text-left">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium tracking-wide text-neutral-900 truncate max-w-[150px] lg:max-w-[200px]">{order.userId?.name || "Guest"}</span>
                            <span className="text-[10px] text-neutral-500 font-light truncate max-w-[150px] lg:max-w-[200px]">{order.userId?.email}</span>
                          </div>
                        </td>
                        
                        <td className="py-6 pr-6 align-middle text-left">
                          <div className="flex -space-x-3 overflow-hidden pl-2 py-1">
                            {order.products.slice(0, 3).map((item, i) => {
                              const imgUrl = item.productId?.mainimage1 || item.productId?.image2 || null;
                              return (
                                <div key={i} className="w-10 h-14 lg:w-12 lg:h-16 bg-neutral-100 border-2 border-white overflow-hidden relative z-10 shadow-[0_2px_5px_rgba(0,0,0,0.1)] hover:z-20 transition-transform hover:scale-110 cursor-pointer">
                                  {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200 flex items-center justify-center"><Package className="w-4 h-4 text-neutral-400 stroke-[1.5]" /></div>}
                                </div>
                              );
                            })}
                            {order.products.length > 3 && (
                              <div className="w-10 h-14 lg:w-12 lg:h-16 bg-neutral-100 border-2 border-white relative z-10 flex items-center justify-center shadow-sm">
                                <span className="text-[9px] font-bold text-neutral-500">+{order.products.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-6 pr-6 align-middle text-left">
                          <span className="text-sm font-medium tracking-wide text-neutral-900">₹{order.totalAmount?.toLocaleString()}</span>
                        </td>
                        
                        <td className="py-6 pr-8 pl-6 align-middle text-right">
                          <div className="flex flex-col items-end gap-3 w-full">
                            <div className="relative inline-block w-full max-w-[160px] border border-neutral-300 hover:border-neutral-900 transition-colors bg-white rounded-sm">
                              <select 
                                value={order.orderStatus} 
                                onChange={(e) => updateStatus(order._id, e.target.value)} 
                                className={`appearance-none w-full bg-transparent py-2.5 pl-4 pr-10 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer ${order.orderStatus === 'Delivered' ? 'text-emerald-700' : order.orderStatus === 'Returned' || order.orderStatus === 'Cancelled' ? 'text-red-600' : 'text-neutral-900'}`}
                              >
                                <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Returned</option><option>Cancelled</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-900">
                                <ChevronDown className="h-3 w-3 stroke-[2]" />
                              </div>
                            </div>
                            <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-400">{formatDate(order.createdAt)}</span>
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
      
      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </AdminLayout>
  );
}