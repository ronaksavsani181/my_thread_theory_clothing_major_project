import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

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
  
  // 🟢 NEW: Search State for the Table
  const [searchTerm, setSearchTerm] = useState("");

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
    fetchStats();
  }, [timeFilter]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options).toUpperCase();
  };

  // 🟢 NEW: Filter the recent orders based on the search term (Order ID or Client Name)
  const filteredOrders = stats?.recentOrders?.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdMatch = order._id.toLowerCase().includes(searchLower);
    const clientNameMatch = (order.userId?.name || "Guest Checkout").toLowerCase().includes(searchLower);
    return orderIdMatch || clientNameMatch;
  }) || [];

  if (!stats && loading) {
    return (
      <AdminLayout>
        <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">
            Synchronizing Ledger...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      
      <div className="bg-neutral-50 min-h-screen font-sans pb-20 pt-6 lg:pt-10 selection:bg-neutral-200">
        <div className="m-20"></div>
        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12">
          
          {/* HEADER & FILTERS */}
          <div className="mb-8 lg:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-neutral-200 pb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3">
                Command Center
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
                Thread Theory • Performance Metrics
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-white border border-neutral-200 p-1 w-full sm:w-max rounded-md shadow-sm">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`flex-1 sm:flex-none px-2 sm:px-6 py-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-sm ${
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
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-12">
              <div className="border border-neutral-950 bg-neutral-950 p-6 md:p-8 flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Gross Revenue</span>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-white">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>

              <div className="border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Total Orders</span>
                  <svg className="w-4 h-4 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.totalOrders?.toLocaleString() || 0}</p>
              </div>

              <div className="border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Units Sold</span>
                  <svg className="w-4 h-4 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.itemsSold?.toLocaleString() || 0}</p>
              </div>

              <div className="border border-neutral-200 bg-white p-6 md:p-8 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">New Clients</span>
                  <svg className="w-4 h-4 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-3xl md:text-4xl font-light tracking-tighter text-neutral-900">{stats?.activeUsers?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* RECENT ORDERS TABLE */}
            <div className="bg-white border border-neutral-200 p-5 sm:p-8 lg:p-12 shadow-sm">
              
              {/* 🟢 NEW: Header with Search Bar included */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">Filtered Transactions</h2>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mt-1 block">{timeFilter.replace("-", " ")}</span>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64 group">
                  <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by Order ID or Client"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 py-2 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center border-t border-neutral-100">
                  <p className="text-sm text-neutral-400 font-light tracking-wide">
                    {searchTerm ? `No results found for "${searchTerm}"` : "No transactions found for this period."}
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto no-scrollbar block">
                  <table className="w-full text-left whitespace-nowrap min-w-[700px]">
                    <thead>
                      <tr className="border-b border-neutral-900">
                        <th className="py-4 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Order Ref</th>
                        <th className="py-4 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Client</th>
                        <th className="py-4 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Date & Time</th>
                        <th className="py-4 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-neutral-50 transition-colors duration-500">
                          <td className="py-5 pr-6 align-middle">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">#{o._id.slice(-6)}</span>
                          </td>
                          <td className="py-5 pr-6 align-middle">
                            <div className="flex items-center gap-3 lg:gap-4">
                              <div className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center rounded-full text-[9px] font-light shadow-sm shrink-0">
                                {o.userId?.name ? o.userId.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="text-xs lg:text-sm font-light tracking-wide text-neutral-900 truncate">
                                {o.userId?.name || "Guest Checkout"}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 pr-6 align-middle">
                            <span className="text-[10px] lg:text-xs font-light tracking-wide text-neutral-500 uppercase">{formatDate(o.createdAt)}</span>
                          </td>
                          <td className="py-5 pl-6 align-middle text-right">
                            <span className="text-xs lg:text-sm font-medium tracking-wide text-neutral-900">₹{o.totalAmount?.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}