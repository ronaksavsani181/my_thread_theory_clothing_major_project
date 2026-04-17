import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
// 🌟 FIX: Added 'User' to the lucide-react imports
import { Search, ChevronDown, CheckCircle2, AlertTriangle, X, Package, RotateCcw, ArrowRight, User } from "lucide-react";

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 🟢 CINEMATIC ROUTING STATE
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timerRef = useRef(null);

  // 🟢 CUSTOM MODAL STATE FOR ADMIN NOTES
  const [noteModal, setNoteModal] = useState({
    isOpen: false,
    returnId: null,
    newStatus: "",
    note: "",
  });
  
  const [noteError, setNoteError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const fetchReturns = async () => {
    try { 
      setLoading(true); 
      const res = await api.get('/returns/admin/all'); 
      setReturns(res.data); 
    } 
    catch (error) { 
      showToast("Failed to fetch returns database.", "error"); 
    } 
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
    fetchReturns(); 
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (noteModal.isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [noteModal.isOpen]);

  // 🟢 SMART AUTO-GENERATING NOTE LOGIC
  const handleStatusChangeClick = (returnItem, newStatus) => {
    if (newStatus === "Rejected" || newStatus === "Approved" || newStatus === "Refunded") {
      setNoteError("");

      // Extract details for the template
      const orderRef = returnItem.orderId?._id?.slice(-6).toUpperCase() || "N/A";
      const productTitle = returnItem.productId?.title || "Item";
      const reason = returnItem.reason || "your specified reason";

      // Generate professional templates based on action
      let autoNote = "";
      if (newStatus === "Approved") {
        autoNote = `Regarding Order #${orderRef}: Your return request for '${productTitle}' has been approved. Please follow the packaging instructions sent to your email to complete the return process.`;
      } else if (newStatus === "Rejected") {
        autoNote = `Regarding Order #${orderRef}: Your return request for '${productTitle}' (Reason: ${reason}) has been declined after review by our quality team.`;
      } else if (newStatus === "Refunded") {
        autoNote = `Regarding Order #${orderRef}: Your return for '${productTitle}' has been successfully processed. A refund has been issued to your original payment method.`;
      }

      // Open modal with pre-filled context
      setNoteModal({ isOpen: true, returnId: returnItem._id, newStatus, note: autoNote });
    } else {
      // If setting back to 'Pending', execute immediately without a note
      executeStatusUpdate(returnItem._id, newStatus, "");
    }
  };

  // 🟢 EXECUTE THE API UPDATE
  const executeStatusUpdate = async (id, status, adminNote) => {
    try { 
      setIsUpdating(true);
      await api.put(`/returns/admin/${id}/status`, { status, adminNote }); 
      showToast(`Return status updated to ${status}`); 
      
      setNoteModal({ isOpen: false, returnId: null, newStatus: "", note: "" });
      fetchReturns(); 
    } 
    catch (error) { 
      showToast(error.response?.data?.message || "Status update failed.", "error"); 
    } finally {
      setIsUpdating(false);
    }
  };

  // 🟢 MODAL FORM SUBMIT HANDLER (WITH VALIDATION)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!noteModal.note.trim()) {
      setNoteError("An administrative note is required to update this status.");
      return;
    }
    executeStatusUpdate(noteModal.returnId, noteModal.newStatus, noteModal.note);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();

  // 🟢 DYNAMIC COUNTS, STATUS FILTER, AND SEARCH FILTER
  const { filteredReturns, metrics } = useMemo(() => {
    const calc = { Pending: 0, Approved: 0, Rejected: 0, Refunded: 0 };
    returns.forEach(r => { if (calc[r.status] !== undefined) calc[r.status]++; });

    let finalFiltered = returns;
    if (statusFilter !== "All") finalFiltered = returns.filter(r => r.status === statusFilter);
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      finalFiltered = finalFiltered.filter(r => 
        r.orderId?._id?.toLowerCase().includes(searchLower) ||
        r.userId?.name?.toLowerCase().includes(searchLower) ||
        r.userId?.email?.toLowerCase().includes(searchLower) ||
        r.productId?.title?.toLowerCase().includes(searchLower) ||
        r.reason?.toLowerCase().includes(searchLower)
      );
    }
    
    return { filteredReturns: finalFiltered, metrics: calc };
  }, [returns, statusFilter, searchTerm]);

  return (
    <AdminLayout>
      <div className={`w-full max-w-[100rem] mx-auto font-sans relative pb-10 px-5 sm:px-6 lg:px-12 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isPageLoaded ? 'opacity-100' : 'opacity-0'} ${isRedirecting ? 'opacity-50' : ''}`}>
        
        <div className="m-8 lg:m-16"></div>

        {/* =========================================
            🌟 PREMIUM CENTERED NOTIFICATION POPUP
            ========================================= */}
        <div 
          className={`fixed top-24 left-1/2 z-[150] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${
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
            HEADER SECTION
            ========================================= */}
        <div className="mb-8 lg:mb-12 border-b border-neutral-200 pb-6 lg:pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2 flex items-center gap-3 sm:gap-4">
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 stroke-[1.5]" /> Return Requests
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Dispute Management</p>
        </div>

        {/* =========================================
            STATUS METRICS (INTERACTIVE FILTERS)
            ========================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
          {[
            { label: "Pending", count: metrics.Pending }, 
            { label: "Approved", count: metrics.Approved }, 
            { label: "Refunded", count: metrics.Refunded }, 
            { label: "Rejected", count: metrics.Rejected }
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
              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-6 text-left ${statusFilter === stat.label ? "text-neutral-400" : "text-neutral-500"}`}>{stat.label}</span>
              <p className="text-3xl sm:text-4xl font-light tracking-tighter text-left">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* =========================================
            LEDGER SECTION
            ========================================= */}
        <div className="bg-white border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-12 rounded-sm opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 lg:mb-10 text-left">
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">
                {statusFilter === "All" ? "All Requests" : `${statusFilter} Requests`}
              </h2>
              {statusFilter !== "All" && (
                <button onClick={() => setStatusFilter("All")} className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 transition-colors">
                  Clear Filter
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search by Ref, Client, or Item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 lg:py-32 flex flex-col items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Synchronizing...</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="py-16 lg:py-24 text-center border-t border-neutral-100 bg-neutral-50/50">
              <p className="text-xs lg:text-sm text-neutral-500 font-light tracking-wide">
                {searchTerm ? `No return requests matching "${searchTerm}"` : "No return requests found."}
              </p>
            </div>
          ) : (
            <>
              {/* =========================================
                  📱 MOBILE VIEW (Cards - < 768px)
                  ========================================= */}
              <div className="md:hidden flex flex-col gap-5 border-t border-neutral-100 pt-6">
                {filteredReturns.map((r) => (
                  <div key={r._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col shadow-sm relative">
                    
                    {/* Header: Order & Date */}
                    <div className="flex justify-between items-start mb-4 border-b border-neutral-100 pb-4">
                      <div className="text-left">
                        <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Order Ref</p>
                        <button 
                          onClick={(e) => handleRedirect(e, `/orders/${r.orderId?._id}`, `view-${r._id}`)}
                          className="text-xs font-bold tracking-widest text-neutral-900 uppercase border-b border-neutral-900 pb-0.5 hover:text-neutral-500 transition-colors"
                        >
                          #{r.orderId?._id?.slice(-6).toUpperCase() || "N/A"}
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold tracking-[0.25em] text-neutral-400 uppercase mb-1">Requested On</p>
                        <span className="text-[10px] font-medium tracking-widest text-neutral-900 uppercase">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>

                    {/* Product & Client Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-24 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                        {r.productId?.mainimage1 ? <img src={r.productId.mainimage1} className="w-full h-full object-cover" alt="item" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package className="w-5 h-5 stroke-[1.5]" /></div>}
                      </div>
                      <div className="flex-1 text-left flex flex-col justify-center">
                        <h4 className="text-xs font-medium text-neutral-900 line-clamp-2 leading-[1.4] mb-2">{r.productId?.title || "Item Deleted"}</h4>
                        <span className="text-[8px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Qty: {r.quantity}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <User className="w-3 h-3 text-neutral-400 stroke-[1.5]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">{r.userId?.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reason Block */}
                    <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm mb-4 text-left">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-1">Dispute Reason</span>
                      <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-1.5">{r.reason}</p>
                      {r.comments && <p className="text-[10px] font-light text-neutral-500 italic leading-relaxed">"{r.comments}"</p>}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative w-full border border-neutral-300 hover:border-neutral-900 transition-colors rounded-sm mt-auto">
                      <select 
                        value={r.status} 
                        onChange={(e) => handleStatusChangeClick(r, e.target.value)} 
                        className={`appearance-none w-full bg-transparent py-3.5 pl-3 pr-8 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer ${r.status === 'Approved' || r.status === 'Refunded' ? 'text-emerald-700' : r.status === 'Rejected' ? 'text-red-600' : 'text-neutral-900'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-900">
                        <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                      </div>
                    </div>
                    
                    {/* Inline Loader if navigating to order */}
                    {isRedirecting && redirectTarget === `view-${r._id}` && (
                       <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                         <svg className="animate-spin h-5 w-5 text-neutral-900" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       </div>
                    )}

                  </div>
                ))}
              </div>

              {/* =========================================
                  💻 DESKTOP VIEW (Table - >= 768px)
                  ========================================= */}
              <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] bg-white rounded-sm">
                <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                  <thead className="bg-neutral-50/80 border-b border-neutral-200">
                    <tr>
                      <th className="py-5 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[15%]">Order</th>
                      <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[30%]">Item & Client</th>
                      <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[35%]">Reason</th>
                      <th className="py-5 pr-8 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right w-[20%]">Status Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredReturns.map((r) => (
                      <tr key={r._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                        
                        <td className="py-6 pl-8 pr-6 align-middle text-left">
                          <button 
                            onClick={(e) => handleRedirect(e, `/orders/${r.orderId?._id}`, `view-${r._id}`)}
                            disabled={isRedirecting}
                            className="text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase hover:text-neutral-500 border-b border-transparent hover:border-neutral-500 pb-0.5 transition-colors"
                          >
                            {isRedirecting && redirectTarget === `view-${r._id}` ? "Loading..." : `#${r.orderId?._id?.slice(-6).toUpperCase() || "N/A"}`}
                          </button>
                          <span className="block text-[8px] tracking-[0.2em] font-bold uppercase text-neutral-400 mt-2">{formatDate(r.createdAt)}</span>
                        </td>
                        
                        <td className="py-6 pr-6 align-middle text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              {r.productId?.mainimage1 ? <img src={r.productId.mainimage1} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="item" /> : <div className="w-full h-full bg-neutral-200"></div>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm font-medium tracking-wide text-neutral-900 line-clamp-2 max-w-[200px] leading-[1.3] whitespace-normal">{r.productId?.title || "Item Deleted"}</span>
                              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Qty: {r.quantity} • {r.userId?.name}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-6 pr-6 align-middle text-left whitespace-normal max-w-[250px]">
                          <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">{r.reason}</p>
                          {r.comments && <p className="text-[10px] font-light text-neutral-500 italic line-clamp-2 leading-relaxed">"{r.comments}"</p>}
                        </td>
                        
                        <td className="py-6 pr-8 pl-6 align-middle text-right">
                          <div className="flex flex-col items-end gap-2 w-full">
                            <div className="relative inline-block w-full max-w-[160px] border border-neutral-300 hover:border-neutral-900 transition-colors bg-white rounded-sm">
                              <select 
                                value={r.status} 
                                onChange={(e) => handleStatusChangeClick(r, e.target.value)} 
                                className={`appearance-none w-full bg-transparent py-2.5 pl-4 pr-10 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer ${r.status === 'Approved' || r.status === 'Refunded' ? 'text-emerald-700' : r.status === 'Rejected' ? 'text-red-600' : 'text-neutral-900'}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Refunded">Refunded</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-900">
                                <ChevronDown className="h-3 w-3 stroke-[2]" />
                              </div>
                            </div>
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

      {/* ========================================================
          🌟 CUSTOM ADMIN NOTE MODAL (WITH AUTO-FILLING TEMPLATE)
          ======================================================== */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${noteModal.isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        
        {/* Backdrop Blur */}
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => !isUpdating && setNoteModal({ ...noteModal, isOpen: false })}></div>
        
        <div className={`bg-white w-full max-w-lg shadow-2xl relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] rounded-sm text-left ${noteModal.isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Configure Dispute Resolution</h3>
            <button onClick={() => !isUpdating && setNoteModal({ ...noteModal, isOpen: false })} className="text-neutral-400 hover:text-neutral-900 p-1 active:scale-95 rounded-full hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </button>
          </div>

          <form onSubmit={handleModalSubmit} className="p-6 sm:p-8 space-y-8" noValidate>
            
            <div className="flex items-center gap-4 bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
               <RotateCcw className="w-6 h-6 text-neutral-400 stroke-[1.5]" />
               <div>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Changing return status to</p>
                 <p className={`text-sm sm:text-base font-bold tracking-[0.2em] uppercase ${noteModal.newStatus === "Rejected" ? "text-red-600" : "text-emerald-600"}`}>
                   {noteModal.newStatus}
                 </p>
               </div>
            </div>

            <div>
              <label className="block text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-900 mb-3">
                Message to Client <span className="text-red-500">*</span>
              </label>
              
              <textarea 
                value={noteModal.note}
                onChange={(e) => {
                  setNoteModal({ ...noteModal, note: e.target.value });
                  setNoteError(""); 
                }}
                rows="5"
                required
                className={`w-full bg-white border p-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none resize-none transition-colors shadow-sm rounded-sm ${
                  noteError ? 'border-red-500 focus:border-red-500' : 'border-neutral-300 focus:border-neutral-900'
                }`}
              />
              
              {noteError && (
                <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest block mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 stroke-[2]" /> {noteError}
                </span>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 border-t border-neutral-100 mt-6 pt-6">
              <button 
                type="button" 
                onClick={() => {
                  if (!isUpdating) {
                    setNoteModal({ ...noteModal, isOpen: false });
                    setNoteError("");
                  }
                }} 
                className="w-full sm:w-1/3 border border-neutral-300 bg-white text-neutral-900 py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-50 active:scale-[0.98] transition-all rounded-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="group/btn relative overflow-hidden w-full sm:w-2/3 bg-neutral-950 border border-neutral-950 text-white py-3.5 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-sm active:scale-[0.98]"
              >
                <span className="relative z-10 transition-colors duration-500 group-hover/btn:text-white">
                  {isUpdating ? "Processing..." : "Confirm Resolution"}
                </span>
                {!isUpdating && <div className="absolute inset-0 h-full w-full scale-x-0 bg-neutral-800 transition-transform duration-500 ease-[0.25,1,0.5,1] group-hover/btn:scale-x-100 origin-left"></div>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </AdminLayout>
  );
}