import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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
          name:
            item.product.title.length > 15
              ? item.product.title.substring(0, 15) + "..."
              : item.product.title,
          fullName: item.product.title,
          totalSold: item.totalSold,
        })),
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
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        formattedTrend = trendRes.data.map((item) => ({
          label: monthNames[item._id - 1],
          sales: item.totalSales,
        }));
      }
      setMonthlyTrend(formattedTrend);

      setOrderStatus(
        statusRes.data.map((item) => ({ name: item._id, value: item.count })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

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
    borderRadius: "0px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    padding: "12px",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#171717",
  };

  const getActiveFilterLabel = () =>
    FILTERS.find((f) => f.value === timeFilter)?.label || "Daily";

  return (
    <AdminLayout>
      <div className="w-full max-w-[100rem] mx-auto font-sans text-neutral-900 pb-10">
        {/* HEADER & FILTERS */}
        <div className="m-20"></div>
        <div className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-neutral-200 pb-6 lg:pb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase mb-2">
              Analytics & Reporting
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
              Thread Theory • Performance Insights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-white p-1 w-full sm:w-max rounded-sm border border-neutral-200">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300 ${
                  timeFilter === filter.value
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`transition-opacity duration-500 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          {/* ================= BUSINESS INSIGHTS ================= */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h2 className="text-lg lg:text-xl font-light tracking-widest uppercase">
                Revenue Timeline
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* MONOCHROME AREA CHART */}
              <div className="lg:col-span-3 border border-neutral-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
                <p className="text-center text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6">
                  {getActiveFilterLabel()} Performance
                </p>

                {monthlyTrend.length === 0 ? (
                  <div className="h-[250px] sm:h-[350px] flex items-center justify-center">
                    <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-widest">
                      No Data Available
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-[250px] sm:h-[350px] -ml-2 sm:-ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyTrend}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorSales"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#171717"
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor="#171717"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f5f5f5"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 9,
                            fill: "#737373",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: "#737373",
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                          dx={-5}
                          tickFormatter={(val) =>
                            val >= 1000 ? `${val / 1000}k` : val
                          }
                        />
                        <Tooltip
                          contentStyle={customTooltipStyle}
                          formatter={(value) => [
                            `₹${value.toLocaleString()}`,
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#171717"
                          strokeWidth={2}
                          fill="url(#colorSales)"
                          dot={{
                            r: 4,
                            fill: "#171717",
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#171717",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* SIDE METRICS */}
              {stats && (
                <div className="flex flex-col gap-4 lg:gap-5">
                  <div className="bg-white border border-neutral-200 p-5 lg:p-8 shadow-sm flex flex-col justify-center">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">
                      Revenue{" "}
                      <span className="text-neutral-300 ml-1">
                        ({getActiveFilterLabel()})
                      </span>
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-light tracking-tighter text-neutral-900">
                      ₹{stats.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-white border border-neutral-200 p-5 lg:p-8 shadow-sm flex flex-col justify-center">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">
                      Orders{" "}
                      <span className="text-neutral-300 ml-1">
                        ({getActiveFilterLabel()})
                      </span>
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-light tracking-tighter text-neutral-900">
                      {stats.totalOrders}
                    </h3>
                  </div>
                  <div className="bg-white border border-neutral-200 p-5 lg:p-8 shadow-sm flex flex-col justify-center">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">
                      Units Sold{" "}
                      <span className="text-neutral-300 ml-1">
                        ({getActiveFilterLabel()})
                      </span>
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-light tracking-tighter text-neutral-900">
                      {stats.itemsSold}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= SECONDARY CHARTS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pt-6 border-t border-neutral-200">
            {/* TOP PRODUCTS BAR */}
            <div className="bg-white border border-neutral-200 shadow-sm p-5 sm:p-8">
              <h2 className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase mb-6 border-b border-neutral-100 pb-4">
                Top Volume Pieces
              </h2>
              {topProducts.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center bg-neutral-50 border border-dashed border-neutral-200">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">
                    No Data
                  </span>
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[300px] -ml-2 sm:-ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f5f5f5"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 9,
                          fill: "#737373",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "#737373",
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={customTooltipStyle}
                        cursor={{ fill: "#fafafa" }}
                      />
                      <Bar
                        dataKey="totalSold"
                        name="Units Sold"
                        fill="#171717"
                        radius={[0, 0, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* ================= SECONDARY CHARTS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 pt-6 border-t border-neutral-200">
            {/* LOGISTICS PIE */}
            <div className="bg-white border border-neutral-200 shadow-sm p-5 sm:p-8 flex flex-col">
              <h2 className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase mb-6 border-b border-neutral-100 pb-4">
                Logistics Status
              </h2>
              {orderStatus.length === 0 ? (
                <div className="flex-1 min-h-[250px] flex items-center justify-center bg-neutral-50 border border-dashed border-neutral-200">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">
                    No Data
                  </span>
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 lg:gap-8 h-full pt-2">
                  <div className="w-full xl:w-1/2 h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {orderStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_INFO[entry.name]?.color || "#94a3b8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={customTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full xl:w-1/2 grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
                    {orderStatus.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 border border-neutral-100 hover:border-neutral-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                            style={{
                              background:
                                STATUS_INFO[item.name]?.color || "#94a3b8",
                            }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-neutral-800">
                              {item.name}
                            </span>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-wider hidden sm:block">
                              {STATUS_INFO[item.name]?.desc || "Status"}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm sm:text-base font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
