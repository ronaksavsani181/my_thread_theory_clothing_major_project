import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Search, DollarSign, ShoppingBag, Package, Users } from "lucide-react";

const FILTERS = [
  { label: "Today", value: "daily" },
  { label: "7 Days", value: "weekly" },
  { label: "30 Days", value: "monthly" },
  { label: "12 Months", value: "yearly" },
  { label: "All Time", value: "all" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("daily");
  
  // 🟢 Search State for the Table
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/stats?range=${timeFilter}`);
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options).toUpperCase();
  };

  // 🟢 Filter the recent orders based on the search term
  const filteredOrders = stats?.recentOrders?.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdMatch = order._id.toLowerCase().includes(searchLower);
    const clientNameMatch = (order.userId?.name || "Guest Checkout").toLowerCase().includes(searchLower);
    return orderIdMatch || clientNameMatch;
  }) || [];

  if (!stats && loading) {
    return (
      <AdminLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-50">
          <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
            Synchronizing Ledger...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`bg-neutral-50 min-h-screen font-sans pb-20 pt-6 lg:pt-10 selection:bg-neutral-200 transition-opacity duration-1000 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="m-8 lg:m-20"></div>
        <div className="w-full max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-12">
          
          {/* =========================================
              HEADER & FILTERS
              ========================================= */}
          <div className="mb-8 lg:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-neutral-200 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3">
                Command Center
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
                Thread Theory • Performance Metrics
              </p>
            </div>

            <div className="flex flex-wrap items-center bg-white border border-neutral-200 p-1 w-full xl:w-max rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`flex-1 sm:flex-none px-2 sm:px-6 py-3.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-sm active:scale-[0.98] ${
                    timeFilter === filter.value
                      ? "bg-neutral-950 text-white shadow-md"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`transition-opacity duration-500 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            
            {/* =========================================
                STATS GRID (STAGGERED ANIMATION)
                ========================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
              
              <div className="group border border-neutral-950 bg-neutral-950 p-6 md:p-8 flex flex-col justify-between shadow-xl transition-transform duration-500 hover:-translate-y-1 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Gross Revenue</span>
                  <DollarSign className="w-4 h-4 text-white stroke-[1.5]" />
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-white">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>

              <div className="group border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-neutral-900 stroke-[1.5]" />
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.totalOrders?.toLocaleString() || 0}</p>
              </div>

              <div className="group border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Units Sold</span>
                  <Package className="w-4 h-4 text-neutral-900 stroke-[1.5]" />
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.itemsSold?.toLocaleString() || 0}</p>
              </div>

              <div className="group border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]" style={{ animationDelay: '400ms' }}>
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">New Clients</span>
                  <Users className="w-4 h-4 text-neutral-900 stroke-[1.5]" />
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.activeUsers?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* =========================================
                RECENT ORDERS LEDGER
                ========================================= */}
            <div className="bg-white border border-neutral-200 p-5 sm:p-8 lg:p-12 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] opacity-0 animate-[fade-in-up_0.8s_ease-out_0.5s_forwards]">
              
              {/* Ledger Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 lg:mb-10 text-left">
                <div>
                  <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">Filtered Transactions</h2>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mt-1 block">{timeFilter.replace("-", " ")}</span>
                </div>

                {/* Sleek Search Bar */}
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
                  <input
                    type="text"
                    placeholder="Search by Order ID or Client"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center border-t border-neutral-100 bg-neutral-50/50">
                  <p className="text-sm text-neutral-400 font-light tracking-wide">
                    {searchTerm ? `No results found for "${searchTerm}"` : "No transactions found for this period."}
                  </p>
                </div>
              ) : (
                <>
                  {/* =========================================
                      📱 MOBILE VIEW (Cards - < 768px)
                      ========================================= */}
                  <div className="md:hidden flex flex-col gap-4 border-t border-neutral-100 pt-6">
                    {filteredOrders.map((o) => (
                      <div key={o._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col gap-4 shadow-sm">
                        
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Order Ref</p>
                            <p className="text-xs font-bold tracking-widest text-neutral-900 uppercase">#{o._id.slice(-6)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Amount</p>
                            <span className="text-sm font-medium tracking-wide text-neutral-900">₹{o.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-neutral-50 p-3 border border-neutral-100 rounded-sm">
                          <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-full text-[10px] font-light shadow-sm shrink-0">
                            {o.userId?.name ? o.userId.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="text-left flex-1 truncate">
                            <span className="text-xs font-medium tracking-wide text-neutral-900 block truncate">
                              {o.userId?.name || "Guest Checkout"}
                            </span>
                            <span className="text-[9px] font-light tracking-widest text-neutral-500 uppercase mt-0.5 block truncate">
                              {formatDate(o.createdAt)}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* =========================================
                      💻 DESKTOP VIEW (Table - >= 768px)
                      ========================================= */}
                  <div className="hidden md:block w-full overflow-hidden no-scrollbar bg-white border border-neutral-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                    <table className="w-full text-left whitespace-nowrap min-w-[700px]">
                      <thead className="bg-neutral-50/80">
                        <tr className="border-b border-neutral-200">
                          <th className="py-5 pl-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Order Ref</th>
                          <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Client</th>
                          <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Date & Time</th>
                          <th className="py-5 pr-6 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredOrders.map((o) => (
                          <tr key={o._id} className="hover:bg-neutral-50 transition-colors duration-500">
                            <td className="py-6 pl-6 pr-6 align-middle text-left">
                              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">#{o._id.slice(-6)}</span>
                            </td>
                            <td className="py-6 pr-6 align-middle text-left">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-full text-[10px] font-light shadow-sm shrink-0">
                                  {o.userId?.name ? o.userId.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <span className="text-xs lg:text-sm font-medium tracking-wide text-neutral-900 truncate">
                                  {o.userId?.name || "Guest Checkout"}
                                </span>
                              </div>
                            </td>
                            <td className="py-6 pr-6 align-middle text-left">
                              <span className="text-[10px] lg:text-xs font-light tracking-wide text-neutral-500 uppercase">{formatDate(o.createdAt)}</span>
                            </td>
                            <td className="py-6 pl-6 pr-6 align-middle text-right">
                              <span className="text-sm font-medium tracking-wide text-neutral-900">₹{o.totalAmount?.toLocaleString()}</span>
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
        </div>
      </div>
      
      {/* GLOBAL CSS FOR SCROLLBARS & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </AdminLayout>
  );
}