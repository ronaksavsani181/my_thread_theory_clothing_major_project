import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, X, CreditCard, ArrowLeft, ArrowRight } from "lucide-react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // 🟢 ROUTING HANDLER
  const handleRedirect = (e, path, id = "global") => {
    if (e) e.preventDefault();
    setRedirectTarget(id);
    setIsRedirecting(true);
    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsRedirecting(false);
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options).toUpperCase();
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || '';
    if (s === 'PAID' || s === 'SUCCESS') return 'bg-emerald-500 text-emerald-700';
    if (s === 'PENDING') return 'bg-amber-500 text-amber-600 animate-pulse';
    return 'bg-red-500 text-red-600'; 
  };

  const getDotColor = (status) => {
    const s = status?.toUpperCase() || '';
    if (s === 'PAID' || s === 'SUCCESS') return 'bg-emerald-500';
    if (s === 'PENDING') return 'bg-amber-500 animate-pulse';
    return 'bg-red-500'; 
  };

  return (
    <div className={`bg-white min-h-[100dvh] font-sans pb-32 relative selection:bg-neutral-200 transition-opacity duration-700 ease-[0.25,1,0.5,1] overflow-hidden ${isRedirecting ? 'opacity-50' : 'opacity-100'}`}>
      
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
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-500 stroke-[2]" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 stroke-[2]" />
          )}
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

      <div className="max-w-[85rem] mx-auto px-5 sm:px-8 lg:px-12 pt-20 lg:pt-32">
        
        {/* BREADCRUMBS */}
        <nav className="mb-10 sm:mb-12 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 animate-[fade-in-up_0.6s_ease-out_forwards] opacity-0 text-left">
          <button onClick={(e) => handleRedirect(e, '/')} className="hover:text-neutral-900 transition-colors">Home</button>
          <span className="mx-3">/</span>
          <button onClick={(e) => handleRedirect(e, '/dashboard')} className="hover:text-neutral-900 transition-colors">Account</button>
          <span className="mx-3">/</span>
          <span className="text-neutral-900">Payment Ledger</span>
        </nav>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards] text-left">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">Payment Ledger</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Your Secure Transaction History</p>
          </div>
          <button 
            onClick={(e) => handleRedirect(e, '/orders', 'orders')}
            disabled={isRedirecting}
            className="group flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-6 md:mt-0 transition-all w-max disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover:-translate-x-1" />
            {isRedirecting && redirectTarget === 'orders' ? "Loading..." : "View Order History"}
          </button>
        </div>

        {loading ? (
          /* LOADING STATE */
          <div className="py-32 flex flex-col items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Retrieving Records...</p>
          </div>
        ) : payments.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 sm:py-20 flex flex-col items-center bg-neutral-50/50 border border-neutral-100 min-h-[40vh] justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <CreditCard className="w-12 h-12 text-neutral-300 mb-6 stroke-[1.5]" />
            <h2 className="text-xl sm:text-2xl font-light tracking-wide text-neutral-900 mb-4 uppercase">No transactions found</h2>
            <p className="text-xs sm:text-sm font-light text-neutral-500 mb-8 max-w-sm mx-auto leading-relaxed px-4">You do not have any payment records associated with this account yet.</p>
            <button 
              onClick={(e) => handleRedirect(e, '/products', 'explore')}
              disabled={isRedirecting}
              className="group/btn relative overflow-hidden border border-neutral-900 bg-white text-neutral-900 px-10 sm:px-12 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 hover:text-white active:scale-95 disabled:opacity-80"
            >
              <span className="relative z-10 transition-colors duration-500 flex items-center justify-center gap-2">
                {isRedirecting && redirectTarget === 'explore' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : "Explore Collection"}
              </span>
              {!isRedirecting && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-950 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
            </button>
          </div>
        ) : (
          <div className="opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            
            {/* =========================================
                📱 MOBILE VIEW (Cards - < 768px)
                ========================================= */}
            <div className="md:hidden flex flex-col gap-6">
              {payments.map((payment) => (
                <div 
                  key={payment._id} 
                  className="bg-white border border-neutral-200 p-6 shadow-[0_5px_15px_-10px_rgba(0,0,0,0.05)] rounded-sm flex flex-col"
                >
                  <div className="flex justify-between items-start mb-5 border-b border-neutral-100 pb-4">
                    <div className="text-left">
                      <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Order Ref</p>
                      <p className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                        {payment.orderId?._id ? `#${payment.orderId._id.slice(-6)}` : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(payment.status)}`}></span>
                        <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${getStatusColor(payment.status)}`}>{payment.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                      <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Date</p>
                      <p className="text-xs font-light text-neutral-600 uppercase">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Amount</p>
                      <p className="text-sm font-medium tracking-wide text-neutral-900">₹{payment.amount?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-neutral-100 pt-4">
                    {payment.orderId?._id ? (
                      <button 
                        onClick={(e) => handleRedirect(e, `/orders/${payment.orderId._id}`, `view-${payment._id}`)}
                        disabled={isRedirecting}
                        className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 p-3.5 hover:border-neutral-900 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-70 group"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-900 group-hover:text-neutral-500 transition-colors">
                          {isRedirecting && redirectTarget === `view-${payment._id}` ? "Loading Details..." : "View Order"}
                        </span>
                        {!isRedirecting && <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />}
                      </button>
                    ) : (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 text-center py-3 bg-neutral-50 border border-neutral-100">Unavailable</p>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* =========================================
                💻 DESKTOP VIEW (Table - >= 768px)
                ========================================= */}
            <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] bg-white">
              <table className="w-full text-left whitespace-normal break-words">
                <thead className="bg-neutral-50/80">
                  <tr className="border-b border-neutral-200">
                    <th className="py-6 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-40">Order Ref</th>
                    <th className="py-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Date</th>
                    <th className="py-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                    <th className="py-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Amount</th>
                    <th className="py-6 pr-8 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-neutral-50/50 transition-colors duration-500 group">
                      
                      {/* Order Ref */}
                      <td className="py-6 pl-8 pr-6 align-middle">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
                          {payment.orderId?._id ? `#${payment.orderId._id.slice(-6)}` : "N/A"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-6 pr-6 align-middle">
                        <span className="text-xs sm:text-sm font-light tracking-wide text-neutral-600">
                          {formatDate(payment.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-6 pr-6 align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(payment.status)}`}></span>
                          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900">
                            {payment.status}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-6 pr-6 align-middle text-right">
                        <span className="text-sm font-medium tracking-wide text-neutral-900">
                          ₹{payment.amount?.toLocaleString()}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-6 pr-8 align-middle text-right">
                        {payment.orderId?._id ? (
                          <button 
                            onClick={(e) => handleRedirect(e, `/orders/${payment.orderId._id}`, `view-${payment._id}`)}
                            disabled={isRedirecting}
                            className="group/btn relative text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 hover:text-neutral-500 transition-colors flex items-center justify-end gap-1.5 ml-auto w-max disabled:opacity-50"
                          >
                            {isRedirecting && redirectTarget === `view-${payment._id}` ? "Loading..." : "View Order"}
                            {!isRedirecting && <ArrowRight className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover/btn:translate-x-1" />}
                          </button>
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
          </div>
        )}
      </div>

      {/* GLOBAL CSS FOR SCROLLBARS & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}