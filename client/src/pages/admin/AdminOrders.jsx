import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");

  // 🟢 NEW: Search State for the Orders Table
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000); };

  const fetchOrders = async () => {
    try { setLoading(true); const res = await api.get('/orders/admin/all'); setOrders(res.data); } 
    catch (error) { showToast("Failed to sync database.", "error"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 🟢 SMART UPDATE FUNCTION (Fixes Route Mismatches)
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
    timeFiltered.forEach(o => { if (calc[o.orderStatus] !== undefined) calc[o.orderStatus]++; else if (o.orderStatus === 'Cancelled') calc.Returned++; });

    // Step 3: Filter by Status Panel Selection
    let finalFiltered = timeFiltered;
    if (statusFilter !== "All") finalFiltered = timeFiltered.filter(o => o.orderStatus === statusFilter || (statusFilter === 'Returned' && o.orderStatus === 'Cancelled'));
    
    // Step 4: 🟢 NEW Filter by Search Term (Order Ref, Client Name, Client Email)
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
      <div className="w-full max-w-[100rem] mx-auto font-sans relative pb-10">
        
        <div className="m-20"></div>

        <div className={`fixed left-1/2 top-20 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center p-4 shadow-2xl transition-all duration-500 pointer-events-none rounded-sm ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
        </div>

        <div className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-neutral-200 pb-6 lg:pb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2 lg:mb-4">Logistics</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Fulfillment Control</p>
          </div>
          <div className="relative w-full sm:w-48 group border-b border-neutral-300 hover:border-neutral-900 transition-colors">
            <select className="appearance-none w-full bg-transparent py-3 pl-0 pr-8 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900 focus:outline-none cursor-pointer" value={timeFilter} onChange={(e) => { setTimeFilter(e.target.value); setStatusFilter("All"); }}>
              <option value="all">All Time</option><option value="daily">Today</option><option value="weekly">Last 7 Days</option><option value="monthly">Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-neutral-400"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-10 lg:mb-12">
          {[{ label: "Pending", count: metrics.Pending }, { label: "Processing", count: metrics.Processing }, { label: "Shipped", count: metrics.Shipped }, { label: "Delivered", count: metrics.Delivered }, { label: "Returned", count: metrics.Returned }].map((stat) => (
            <div key={stat.label} onClick={() => setStatusFilter(statusFilter === stat.label ? "All" : stat.label)} className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all border rounded-sm ${statusFilter === stat.label ? "bg-neutral-950 text-white shadow-xl" : "bg-white border-neutral-200 hover:border-neutral-900"}`}>
              <span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-6 ${statusFilter === stat.label ? "text-neutral-400" : "text-neutral-400"}`}>{stat.label}</span>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tighter">{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-12 rounded-sm">
          
          {/* 🟢 NEW: Header with Search Bar included */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 lg:mb-10 px-2">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">{statusFilter === "All" ? "All Shipments" : `${statusFilter} Shipments`}</h2>
              {statusFilter !== "All" && <button onClick={() => setStatusFilter("All")} className="text-[8px] lg:text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 block">Clear Filter</button>}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 group">
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Ref or Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-300 py-2 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 lg:py-32 flex justify-center"><p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Synchronizing...</p></div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 lg:py-24 text-center border-t border-neutral-100">
              <p className="text-xs lg:text-sm text-neutral-400 font-light tracking-wide">
                {searchTerm ? `No shipments found matching "${searchTerm}"` : "No records match."}
              </p>
            </div>
          ) : (
            // 🟢 FLUID TABLE (No horizontal scroll, fully responsive)
            <div className="w-full overflow-hidden block">
              <table className="w-full text-left table-fixed sm:table-auto whitespace-normal break-words">
                <thead>
                  <tr className="border-b border-neutral-900">
                    <th className="w-[20%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Order Ref</th>
                    <th className="w-[30%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Client</th>
                    <th className="hidden sm:table-cell w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Manifest</th>
                    <th className="w-[20%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Total</th>
                    <th className="w-[30%] sm:w-auto py-3 lg:py-5 pl-2 lg:pl-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-50 transition-colors group">
                      
                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <Link to={`/orders/${order._id}`} className="text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.2em] text-neutral-900 uppercase hover:underline inline-block">#{order._id.slice(-6)}</Link>
                        <span className="block sm:hidden text-[7px] tracking-[0.1em] font-bold uppercase text-neutral-400 mt-1">{formatDate(order.createdAt)}</span>
                      </td>
                      
                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <span className="text-[10px] sm:text-sm font-medium tracking-wide text-neutral-900 line-clamp-1">{order.userId?.name || "Guest"}</span>
                          <span className="text-[7px] sm:text-[10px] text-neutral-400 font-light truncate">{order.userId?.email}</span>
                        </div>
                      </td>
                      
                      <td className="hidden sm:table-cell py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <div className="flex -space-x-2 lg:-space-x-3 overflow-hidden pl-2 py-1">
                          {order.products.map((item, i) => {
                            const imgUrl = item.productId?.mainimage1 || item.productId?.image2 || null;
                            return (
                              <div key={i} className="w-8 h-12 lg:w-12 lg:h-16 bg-neutral-100 border-2 border-white overflow-hidden relative z-10 shadow-sm hover:z-20">
                                {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200"></div>}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      
                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <span className="text-[10px] sm:text-sm font-medium tracking-wide text-neutral-900">₹{order.totalAmount?.toLocaleString()}</span>
                      </td>
                      
                      <td className="py-4 lg:py-6 pl-2 lg:pl-6 align-middle text-right">
                        <div className="relative inline-block w-full min-w-[70px] sm:w-28 lg:w-40 border border-neutral-300 hover:border-neutral-900 transition-colors">
                          <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)} className={`appearance-none w-full bg-transparent py-1.5 sm:py-2.5 pl-1 sm:pl-3 lg:pl-4 pr-4 sm:pr-8 lg:pr-10 text-[7px] sm:text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.1em] lg:tracking-[0.2em] focus:outline-none cursor-pointer ${order.orderStatus === 'Delivered' ? 'text-green-700' : order.orderStatus === 'Returned' || order.orderStatus === 'Cancelled' ? 'text-red-600' : 'text-neutral-900'}`}>
                            <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Returned</option><option>Cancelled</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-1 sm:right-2 lg:right-4 flex items-center text-neutral-900"><svg className="h-2 w-2 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                        </div>
                        <span className="hidden sm:block text-[7px] sm:text-[8px] lg:text-[10px] tracking-[0.2em] font-bold uppercase text-neutral-400 mt-2">{formatDate(order.createdAt)}</span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </AdminLayout>
  );
}