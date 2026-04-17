import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { 
  Download, BarChart3, TrendingUp, TrendingDown, 
  RefreshCcw, AlertTriangle, CheckCircle2, X 
} from "lucide-react";

import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

const FILTERS = [
  { label: "Today", value: "daily" },
  { label: "7 Days", value: "weekly" },
  { label: "30 Days", value: "monthly" },
  { label: "12 Months", value: "yearly" },
  { label: "All Time", value: "all" },
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);

  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("daily");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, topRes, trendRes, statusRes] = await Promise.all([
        api.get(`/admin/stats?range=${timeFilter}`),
        api.get(`/admin/top-selling?range=${timeFilter}`),
        api.get(`/admin/monthly-trend?range=${timeFilter}`),
        api.get(`/admin/order-status?range=${timeFilter}`),
      ]);

      setStats(statsRes.data);

      setTopProducts(
        topRes.data.map((item) => ({
          name: item.product.title.length > 15 ? item.product.title.substring(0, 15) + "..." : item.product.title,
          fullName: item.product.title,
          totalSold: item.totalSold,
        }))
      );

      let formattedTrend = [];
      if (timeFilter === "daily") {
        formattedTrend = trendRes.data.map((item) => ({
          label: `${item._id}:00`,
          sales: item.totalSales,
        }));
      } else if (timeFilter === "weekly" || timeFilter === "monthly") {
        formattedTrend = trendRes.data.map((item) => {
          const d = new Date(item._id);
          return {
            label: `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`,
            sales: item.totalSales,
          };
        });
      } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        formattedTrend = trendRes.data.map((item) => ({
          label: monthNames[item._id - 1] || item._id,
          sales: item.totalSales,
        }));
      }
      setMonthlyTrend(formattedTrend);

      setOrderStatus(
        statusRes.data.map((item) => ({ name: item._id, value: item.count }))
      );
    } catch (error) {
      showToast("Failed to compile analytics.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
  }, []);

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  // 🟢 ADVANCED DERIVED METRICS
  const { aov, returnRate, fulfillmentRate } = useMemo(() => {
    if (!stats || !orderStatus.length) return { aov: 0, returnRate: 0, fulfillmentRate: 0 };
    
    const totalOrders = stats.totalOrders || 0;
    const rev = stats.totalRevenue || 0;
    
    const returned = orderStatus.find(s => s.name === 'Returned')?.value || 0;
    const cancelled = orderStatus.find(s => s.name === 'Cancelled')?.value || 0;
    const delivered = orderStatus.find(s => s.name === 'Delivered')?.value || 0;
    const shipped = orderStatus.find(s => s.name === 'Shipped')?.value || 0;

    const calculatedAov = totalOrders > 0 ? (rev / totalOrders) : 0;
    const calculatedReturnRate = totalOrders > 0 ? ((returned + cancelled) / totalOrders) * 100 : 0;
    const calculatedFulfillment = totalOrders > 0 ? ((delivered + shipped) / totalOrders) * 100 : 0;

    return { 
      aov: calculatedAov.toFixed(2), 
      returnRate: calculatedReturnRate.toFixed(1),
      fulfillmentRate: calculatedFulfillment.toFixed(1)
    };
  }, [stats, orderStatus]);

  // 🟢 EXPORT REPORT TO CSV (EXCEL COMPATIBLE)
  const exportToExcel = () => {
    if (!stats) return;
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        let csv = "DATA TYPE, METRIC\n";
        csv += `Report Period, ${FILTERS.find((f) => f.value === timeFilter)?.label}\n`;
        csv += `Total Revenue, ${stats.totalRevenue}\n`;
        csv += `Total Orders, ${stats.totalOrders}\n`;
        csv += `Units Sold, ${stats.itemsSold}\n`;
        csv += `Average Order Value (AOV), ${aov}\n`;
        csv += `Return & Cancel Rate (%), ${returnRate}%\n\n`;

        csv += "ORDER STATUS, COUNT\n";
        orderStatus.forEach(s => { csv += `${s.name}, ${s.value}\n`; });
        csv += "\n";

        csv += "TOP PRODUCTS, UNITS SOLD\n";
        topProducts.forEach(p => { csv += `"${p.fullName}", ${p.totalSold}\n`; });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `ThreadTheory_Report_${timeFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Report exported successfully.");
      } catch (error) {
        showToast("Failed to export report.", "error");
      } finally {
        setIsExporting(false);
      }
    }, 800); // Cinematic delay
  };

  // 🟢 SEMANTIC STATUS COLORS
  const STATUS_INFO = {
    Delivered: { color: "#10b981", desc: "Completed Successfully" }, // Emerald
    Shipped: { color: "#3b82f6", desc: "In Transit" }, // Blue
    Processing: { color: "#f59e0b", desc: "Being Packed" }, // Amber
    Pending: { color: "#64748b", desc: "Awaiting Action" }, // Slate
    Cancelled: { color: "#ef4444", desc: "Order Stopped" }, // Red
    Returned: { color: "#8b5cf6", desc: "Sent Back / Refunded" }, // Purple
  };

  const customTooltipStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "2px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
    padding: "12px 16px",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#171717",
  };

  const getActiveFilterLabel = () => FILTERS.find((f) => f.value === timeFilter)?.label || "Daily";

  return (
    <AdminLayout>
      <div className={`w-full max-w-[100rem] mx-auto font-sans text-neutral-900 pb-10 px-5 sm:px-6 lg:px-12 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="m-8 lg:m-16"></div>

        {/* =========================================
            🌟 PREMIUM NOTIFICATION POPUP
            ========================================= */}
        <div className={`fixed top-24 left-1/2 z-[150] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"} ${toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"}`}>
          <div className="shrink-0">{toast.type === "error" ? <AlertTriangle className="h-5 w-5 text-red-500 stroke-[2]" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[2]" />}</div>
          <div className="flex-1 text-left">
            <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] ${toast.type === "error" ? "text-red-500" : "text-emerald-400"} mb-0.5`}>{toast.type === "error" ? "Notice" : "Success"}</p>
            <p className={`text-xs sm:text-sm font-medium tracking-wide ${toast.type === "error" ? "text-neutral-900" : "text-neutral-200"}`}>{toast.message}</p>
          </div>
          <button onClick={() => { setToast({ ...toast, show: false }); if (timerRef.current) clearTimeout(timerRef.current); }} className="shrink-0 p-2 -mr-2 hover:scale-110 transition-transform active:scale-95"><X className={`h-4 w-4 stroke-[2] ${toast.type === "error" ? "text-neutral-400" : "text-neutral-400"}`} /></button>
        </div>

        {/* =========================================
            HEADER & FILTERS
            ========================================= */}
        <div className="mb-8 lg:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-neutral-200 pb-6 lg:pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase mb-2 lg:mb-4 flex items-center gap-3 sm:gap-4">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 stroke-[1.5]" /> Analytics
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
              Thread Theory • Performance Insights
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Time Filters */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 w-full sm:w-max rounded-sm border border-neutral-200 shadow-sm">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTimeFilter(filter.value)}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-2.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300 active:scale-[0.98] ${
                    timeFilter === filter.value ? "bg-neutral-950 text-white shadow-md" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Export Report Button */}
            <button 
              onClick={exportToExcel}
              disabled={isExporting || loading || !stats}
              className="w-full sm:w-auto bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 px-6 py-3.5 sm:py-3 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] transition-all active:scale-[0.98] rounded-sm disabled:opacity-50"
            >
              {isExporting ? <svg className="animate-spin h-4 w-4 text-neutral-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <Download className="w-4 h-4 stroke-[2]" />}
              {isExporting ? "Compiling..." : "Export Report"}
            </button>
          </div>
        </div>

        <div className={`transition-opacity duration-700 ease-in-out ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          
          {/* =========================================
              ADVANCED KPI GRID
              ========================================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-neutral-950 text-white shadow-xl rounded-sm col-span-2 sm:col-span-1">
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase mb-4 lg:mb-6 text-neutral-400 text-left">Gross Revenue</span>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-white border border-neutral-200 text-neutral-900 shadow-sm rounded-sm">
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase mb-4 lg:mb-6 text-neutral-500 text-left">Total Orders</span>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">{stats?.totalOrders?.toLocaleString() || 0}</p>
            </div>
            <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-white border border-neutral-200 text-neutral-900 shadow-sm rounded-sm">
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase mb-4 lg:mb-6 text-neutral-500 text-left">Units Sold</span>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">{stats?.itemsSold?.toLocaleString() || 0}</p>
            </div>
            <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-white border border-neutral-200 text-neutral-900 shadow-sm rounded-sm">
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-500 text-left">Avg Order Val</span>
                <TrendingUp className="w-4 h-4 text-emerald-500 stroke-[2]" />
              </div>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">₹{aov}</p>
            </div>
            <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-white border border-neutral-200 text-neutral-900 shadow-sm rounded-sm">
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-500 text-left">Return Rate</span>
                {returnRate > 10 ? <TrendingDown className="w-4 h-4 text-red-500 stroke-[2]" /> : <RefreshCcw className="w-4 h-4 text-neutral-400 stroke-[2]" />}
              </div>
              <p className={`text-3xl sm:text-4xl font-light tracking-tighter text-left ${returnRate > 10 ? 'text-red-600' : 'text-neutral-900'}`}>{returnRate}%</p>
            </div>
          </div>

          {/* =========================================
              MAIN REVENUE TIMELINE
              ========================================= */}
          <div className="mb-8 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.3s_forwards]">
            <div className="border border-neutral-200 bg-white p-5 sm:p-8 lg:p-10 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] rounded-sm">
              <div className="flex justify-between items-end mb-8 border-b border-neutral-100 pb-6 text-left">
                <div>
                  <h2 className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-1">Financial Trajectory</h2>
                  <p className="text-[9px] font-medium uppercase tracking-widest text-neutral-400">{getActiveFilterLabel()} Performance</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-2xl font-light tracking-tighter text-neutral-900">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-emerald-500">Gross Volume</p>
                </div>
              </div>

              {monthlyTrend.length === 0 ? (
                <div className="h-[250px] sm:h-[350px] flex items-center justify-center bg-neutral-50/50">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-widest">No Data Available</span>
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[350px] -ml-2 sm:-ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#171717" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 9, fill: "#737373", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }} 
                        axisLine={false} tickLine={false} dy={15} 
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fill: "#737373", fontWeight: 600, letterSpacing: "0.05em" }} 
                        axisLine={false} tickLine={false} dx={-5} 
                        tickFormatter={(val) => val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`} 
                      />
                      <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                      <Area type="monotone" dataKey="sales" stroke="#171717" strokeWidth={3} fill="url(#colorSales)" activeDot={{ r: 6, fill: "#171717", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* =========================================
              SECONDARY CHARTS (BAR & PIE)
              ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            
            {/* TOP PRODUCTS BAR CHART */}
            <div className="bg-white border border-neutral-200 shadow-sm p-5 sm:p-8 rounded-sm flex flex-col">
              <h2 className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase mb-6 border-b border-neutral-100 pb-4 text-left">Top Volume Pieces</h2>
              {topProducts.length === 0 ? (
                <div className="flex-1 min-h-[250px] flex items-center justify-center bg-neutral-50/50">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">No Data</span>
                </div>
              ) : (
                <div className="w-full flex-1 min-h-[250px] sm:min-h-[300px] -ml-2 sm:-ml-4 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#737373", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }} axisLine={false} tickLine={false} dy={15} angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 9, fill: "#737373", fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: "#fafafa" }} />
                      <Bar dataKey="totalSold" name="Units Sold" fill="#171717" radius={[2, 2, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* LOGISTICS STATUS PIE CHART */}
            <div className="bg-white border border-neutral-200 shadow-sm p-5 sm:p-8 rounded-sm flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
                <h2 className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-left">Logistics Status</h2>
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">{fulfillmentRate}% Fulfilled</span>
              </div>
              
              {orderStatus.length === 0 ? (
                <div className="flex-1 min-h-[250px] flex items-center justify-center bg-neutral-50/50">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">No Data</span>
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 flex-1 mt-4">
                  <div className="w-full xl:w-1/2 h-[220px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={orderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} stroke="none">
                          {orderStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_INFO[entry.name]?.color || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={customTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full xl:w-1/2 grid grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
                    {orderStatus.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50/80 border border-neutral-100 hover:border-neutral-300 transition-colors rounded-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: STATUS_INFO[item.name]?.color || "#94a3b8" }}></div>
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-neutral-900">{item.name}</span>
                            <span className="text-[7px] text-neutral-500 uppercase tracking-wider hidden sm:block mt-0.5">{STATUS_INFO[item.name]?.desc || "Status"}</span>
                          </div>
                        </div>
                        <span className="text-sm sm:text-base font-medium text-neutral-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </AdminLayout>
  );
}