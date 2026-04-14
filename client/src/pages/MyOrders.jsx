import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/my-orders");
        setOrders(res.data);
      } catch (error) {
        showToast("Failed to load your orders.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <div className="bg-white min-h-[85vh] font-sans pb-32 relative selection:bg-neutral-200">
      <div className={`fixed left-1/2 top-24 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center gap-3 rounded-sm p-4 shadow-2xl transition-all duration-500 pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-20 lg:pt-28">
        <nav className="mb-12 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link> <span className="mx-3">/</span>
          <Link to="/dashboard" className="hover:text-neutral-900 transition-colors">Account</Link> <span className="mx-3">/</span>
          <span className="text-neutral-900">Order History</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-200 pb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-4">Order History</h1>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Your Complete Purchasing Ledger</p>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex justify-center"><p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">Retrieving Records...</p></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center bg-neutral-50/50 border border-neutral-100 min-h-[40vh] justify-center">
            <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">No orders on record</h2>
            <Link to="/products" className="border border-neutral-900 bg-white text-neutral-900 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white transition-colors">Explore Collection</Link>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-900">
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-32">Order</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Date</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Total</th>
                  <th className="py-5 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => {
                  const firstProduct = order.products?.[0]?.productId || {};
                  const firstProductImage = firstProduct.image || firstProduct.mainimage1 || firstProduct.image2 || null;

                  return (
                    <tr key={order._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                      <td className="py-8 pr-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-24 sm:h-20 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                            {firstProductImage && <img src={firstProductImage} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">#{order._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 pr-6 align-middle"><span className="text-sm font-light tracking-wide text-neutral-600">{formatDate(order.createdAt)}</span></td>
                      
                      <td className="py-8 pr-6 align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${order.orderStatus === 'Delivered' ? 'bg-emerald-500' : order.orderStatus === 'Return Requested' ? 'bg-amber-500 animate-pulse' : order.orderStatus === 'Returned' ? 'bg-purple-500' : 'bg-neutral-900'}`}></span>
                          <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-900">{order.orderStatus}</span>
                        </div>
                      </td>

                      <td className="py-8 pr-6 align-middle text-right"><span className="text-sm font-medium tracking-wide text-neutral-900">₹{order.totalAmount?.toLocaleString()}</span></td>
                      
                      <td className="py-8 pl-6 align-middle text-right">
                        <div className="flex flex-col items-end gap-3">
                          <Link to={`/orders/${order._id}`} className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 hover:underline">View Details</Link>
                          
                          {/* 🟢 SHOW TRACK RETURN IF APPLICABLE */}
                          {(order.orderStatus === "Return Requested" || order.orderStatus === "Returned") && (
                            <Link to="/my-returns" className="text-[9px] font-bold tracking-[0.2em] uppercase text-red-600 hover:underline">Track Return</Link>
                          )}
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
      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </div>
  );
}