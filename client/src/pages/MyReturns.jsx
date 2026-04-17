import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
// 🌟 FIX: Added ArrowRight to the import list!
import { AlertTriangle, CheckCircle2, X, Package, ArrowLeft, ArrowRight, MessageSquareText } from "lucide-react";

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 CINEMATIC ROUTING STATE
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);

  // 🟢 STATE FOR THE NOTE MODAL
  const [selectedNote, setSelectedNote] = useState(null);

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
    const fetchReturns = async () => {
      try {
        setIsRedirecting(false);
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        const res = await api.get("/returns/my-returns");
        setReturns(res.data);
      } catch (error) {
        showToast("Failed to load your return records.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();

  // 🟢 MODAL HANDLERS
  const openNoteModal = (note) => setSelectedNote(note);
  const closeNoteModal = () => setSelectedNote(null);

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedNote) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedNote]);

  const getStatusColor = (status) => {
    if (status === 'Approved' || status === 'Refunded') return 'bg-emerald-500 text-emerald-700';
    if (status === 'Rejected') return 'bg-red-500 text-red-600';
    return 'bg-amber-500 text-amber-600'; // Return Requested
  };

  const getDotColor = (status) => {
    if (status === 'Approved' || status === 'Refunded') return 'bg-emerald-500';
    if (status === 'Rejected') return 'bg-red-500';
    return 'bg-amber-500 animate-pulse';
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
          <span className="text-neutral-900">Returns & Exchanges</span>
        </nav>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 border-b border-neutral-200 pb-8 sm:pb-10 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards] text-left">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 sm:mb-4">Returns Ledger</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Track your disputes and refunds</p>
          </div>
          <button 
            onClick={(e) => handleRedirect(e, '/orders', 'history')}
            disabled={isRedirecting}
            className="group flex items-center gap-2 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-6 md:mt-0 transition-all w-max disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2] transition-transform group-hover:-translate-x-1" />
            {isRedirecting && redirectTarget === 'history' ? "Loading..." : "View Order History"}
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
        ) : returns.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 sm:py-20 flex flex-col items-center bg-neutral-50/50 border border-neutral-100 min-h-[40vh] justify-center opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            <Package className="w-12 h-12 text-neutral-300 mb-6 stroke-[1.5]" />
            <h2 className="text-xl sm:text-2xl font-light tracking-wide text-neutral-900 mb-3 uppercase">No returns requested</h2>
            <p className="text-xs sm:text-sm font-light text-neutral-500 mb-8 max-w-sm mx-auto">You do not have any active or past return requests.</p>
          </div>
        ) : (
          <div className="opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            
            {/* =========================================
                📱 MOBILE VIEW (Cards - < 768px)
                ========================================= */}
            <div className="md:hidden flex flex-col gap-6">
              {returns.map((r) => {
                const productData = r.productId || {};
                const image = productData.mainimage1 || productData.image || productData.image2;

                return (
                  <div key={r._id} className="bg-white border border-neutral-200 p-5 shadow-[0_5px_15px_-10px_rgba(0,0,0,0.05)] rounded-sm flex flex-col">
                    
                    {/* Header: Date & Status */}
                    <div className="flex justify-between items-start mb-5 border-b border-neutral-100 pb-4">
                      <div className="text-left">
                        <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Requested On</p>
                        <p className="text-xs font-medium text-neutral-900 uppercase">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(r.status)}`}></span>
                          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${getStatusColor(r.status)}`}>{r.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Detail */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-24 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                        {image ? (
                          <img src={image} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-neutral-300 stroke-[1.5]" /></div>
                        )}
                      </div>
                      <div className="flex-1 text-left flex flex-col justify-center">
                        <span className="text-xs font-medium text-neutral-900 line-clamp-2 leading-[1.4] mb-2">{productData.title || "Archived Item"}</span>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1.5">Qty: {r.quantity}</span>
                        <button 
                          onClick={(e) => handleRedirect(e, `/orders/${r.orderId?._id}`, `order-${r.orderId?._id}`)}
                          className="text-[9px] text-neutral-900 font-bold uppercase tracking-[0.1em] border-b border-neutral-900 pb-0.5 w-max hover:text-neutral-500 transition-colors"
                        >
                          Order #{r.orderId?._id?.slice(-6).toUpperCase()}
                        </button>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-6 text-left">
                      <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1.5">Reason</p>
                      <p className="text-xs font-medium text-neutral-800 bg-neutral-50 p-3 border border-neutral-100">{r.reason}</p>
                    </div>

                    {/* Admin Note Action */}
                    <div className="mt-auto border-t border-neutral-100 pt-4">
                      {r.adminNote ? (
                        <button 
                          onClick={() => openNoteModal(r.adminNote)}
                          className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 p-3 sm:p-4 hover:border-neutral-900 transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageSquareText className="w-4 h-4 text-neutral-900 stroke-[1.5]" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-900">Message from Support</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      ) : r.status === 'Approved' ? (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 text-center py-2 bg-emerald-50">Courier will arrive soon.</p>
                      ) : r.status === 'Refunded' ? (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 text-center py-2 bg-emerald-50">Refund Processed.</p>
                      ) : (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 text-center py-2 bg-neutral-50">Awaiting review...</p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* =========================================
                💻 DESKTOP VIEW (Table - >= 768px)
                ========================================= */}
            <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] bg-white">
              <table className="w-full text-left whitespace-normal break-words">
                <thead className="bg-neutral-50/80">
                  <tr className="border-b border-neutral-200">
                    <th className="w-[35%] py-6 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Product</th>
                    <th className="w-[25%] py-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Reason</th>
                    <th className="w-[20%] py-6 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                    <th className="w-[20%] py-6 pr-8 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Updates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {returns.map((r) => {
                    const productData = r.productId || {};
                    const image = productData.mainimage1 || productData.image || productData.image2;

                    return (
                      <tr key={r._id} className="hover:bg-neutral-50/50 transition-colors duration-500 group">
                        
                        {/* Product Column */}
                        <td className="py-6 pl-8 pr-6 align-middle">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-20 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
                              {image ? (
                                <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="product" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-neutral-300 stroke-[1.5]" /></div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 text-left">
                              <span className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-2 max-w-[250px] leading-[1.4]">{productData.title || "Archived Item"}</span>
                              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Qty: <span className="text-neutral-900">{r.quantity}</span></span>
                              <button 
                                onClick={(e) => handleRedirect(e, `/orders/${r.orderId?._id}`)}
                                className="text-[8px] sm:text-[9px] font-bold text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 uppercase mt-1 transition-colors w-max pb-0.5"
                              >
                                Order #{r.orderId?._id?.slice(-6).toUpperCase()}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Reason Column */}
                        <td className="py-6 pr-6 align-middle">
                          <p className="text-xs font-medium text-neutral-800 leading-[1.6]">{r.reason}</p>
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-2">{formatDate(r.createdAt)}</p>
                        </td>

                        {/* Status Column */}
                        <td className="py-6 pr-6 align-middle">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(r.status)}`}></span>
                            <span className={`text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase ${getStatusColor(r.status)}`}>{r.status}</span>
                          </div>
                        </td>

                        {/* Updates / Admin Note Column */}
                        <td className="py-6 pr-8 align-middle text-right">
                          {r.adminNote ? (
                            <button 
                              onClick={() => openNoteModal(r.adminNote)}
                              className="bg-white p-4 border border-neutral-200 inline-flex flex-col text-left max-w-[220px] hover:border-neutral-900 transition-all cursor-pointer group/note shadow-sm hover:shadow-md"
                            >
                              <div className="flex justify-between items-center w-full mb-2 gap-3 border-b border-neutral-100 pb-2">
                                <span className="block text-[8px] font-bold uppercase tracking-widest text-neutral-400 group-hover/note:text-neutral-900 transition-colors">Note from Support</span>
                                <MessageSquareText className="w-3.5 h-3.5 text-neutral-400 group-hover/note:text-neutral-900 transition-colors stroke-[1.5]" />
                              </div>
                              <p className="text-xs font-light text-neutral-800 italic line-clamp-2 w-full leading-[1.6]">"{r.adminNote}"</p>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-900 mt-3 block w-full text-right opacity-0 group-hover/note:opacity-100 transition-opacity">Read Full</span>
                            </button>
                          ) : r.status === 'Approved' ? (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 inline-block px-4 py-2 border border-emerald-100">Courier will arrive soon</p>
                          ) : r.status === 'Refunded' ? (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 inline-block px-4 py-2 border border-emerald-100">Refund Processed</p>
                          ) : (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50 inline-block px-4 py-2 border border-neutral-100">Awaiting review...</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          🟢 SUPPORT NOTE MODAL
          ======================================================== */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${selectedNote ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeNoteModal}></div>
        
        {/* Modal Box */}
        <div className={`bg-white w-full max-w-md shadow-2xl relative transform transition-transform duration-500 rounded-sm text-left ${selectedNote ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Message from Support</h3>
            <button onClick={closeNoteModal} className="text-neutral-400 hover:text-neutral-900 p-1 transition-colors bg-white hover:bg-neutral-100 rounded-full">
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm sm:text-base font-light leading-[1.8] text-neutral-800 whitespace-pre-wrap">
              {selectedNote}
            </p>
          </div>

          <div className="p-5 sm:p-6 border-t border-neutral-100 flex justify-end bg-neutral-50/50">
            <button 
              onClick={closeNoteModal} 
              className="w-full sm:w-auto border border-neutral-900 bg-white text-neutral-900 px-10 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 hover:text-white active:scale-[0.98] transition-all rounded-sm"
            >
              Close Message
            </button>
          </div>

        </div>
      </div>

      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}