import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 LUXURY CUSTOM ALERT (TOAST) STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payments/my-payments");
        setPayments(res.data);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        showToast("Failed to load your payment ledger.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Helper for elegant date formatting
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  return (
    <div className="bg-white min-h-[85vh] font-sans pb-32 relative selection:bg-neutral-200">
      
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

      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-12 pt-20 lg:pt-28">
        
        {/* BREADCRUMBS */}
        <nav className="mb-12 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span className="mx-3">/</span>
          <Link to="/dashboard" className="hover:text-neutral-900 transition-colors">Account</Link>
          <span className="mx-3">/</span>
          <span className="text-neutral-900">Payment Ledger</span>
        </nav>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-200 pb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-4">
              Payment Ledger
            </h1>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">
              Your Secure Transaction History
            </p>
          </div>
          <Link 
            to="/orders" 
            className="hidden md:inline-block mt-4 md:mt-0 text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5"
          >
            View Order History
          </Link>
        </div>

        {/* DYNAMIC CONTENT */}
        {loading ? (
          <div className="py-32 flex justify-center">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">
              Retrieving Records...
            </p>
          </div>
        ) : payments.length === 0 ? (
          
          /* LUXURY EMPTY STATE */
          <div className="text-center py-20 flex flex-col items-center bg-neutral-50/50 border border-neutral-100 min-h-[40vh] justify-center">
            <svg className="w-12 h-12 text-neutral-200 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">No transactions found</h2>
            <p className="text-sm font-light tracking-wide text-neutral-500 mb-10 max-w-md mx-auto leading-relaxed">
              You do not have any payment records associated with this account yet.
            </p>
            <Link
              to="/products"
              className="group relative overflow-hidden border border-neutral-950 bg-white text-neutral-950 px-12 py-4 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover:scale-x-100 origin-left"></div>
            </Link>
          </div>

        ) : (
          
          /* EDITORIAL FINANCIAL LEDGER */
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-900">
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Order Ref</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Date</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                  <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Amount</th>
                  <th className="py-5 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                    
                    {/* ORDER ID */}
                    <td className="py-8 pr-6 align-middle">
                      <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
                        {payment.orderId?._id ? `#${payment.orderId._id.slice(-6)}` : "N/A"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="py-8 pr-6 align-middle">
                      <span className="text-sm font-light tracking-wide text-neutral-600">
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-8 pr-6 align-middle">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          payment.status === 'PAID' || payment.status === 'SUCCESS' ? 'bg-neutral-900' : 
                          'bg-red-500'
                        }`}></span>
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-900">
                          {payment.status}
                        </span>
                      </div>
                    </td>

                    {/* AMOUNT */}
                    <td className="py-8 pr-6 align-middle text-right">
                      <span className="text-sm font-medium tracking-wide text-neutral-900">
                        ₹{payment.amount?.toLocaleString()}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="py-8 pl-6 align-middle text-right">
                      {payment.orderId?._id ? (
                        <Link
                          to={`/orders/${payment.orderId._id}`}
                          className="relative text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 transition-colors duration-300 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-neutral-900 after:transition-all after:duration-300 hover:after:w-full inline-block"
                        >
                          View Order
                        </Link>
                      ) : (
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-300">
                          Unavailable
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GLOBAL CSS FOR SCROLLBARS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}