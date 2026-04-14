import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  
  // 🟢 Search State for the Returns Table
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
    setToast({ show: true, message, type }); 
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000); 
  };

  const fetchReturns = async () => {
    try { setLoading(true); const res = await api.get('/returns/admin/all'); setReturns(res.data); } 
    catch (error) { showToast("Failed to fetch returns database.", "error"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReturns(); }, []);

  // 🟢 SMART AUTO-GENERATING NOTE LOGIC
  const handleStatusChangeClick = (returnItem, newStatus) => {
    if (newStatus === "Rejected" || newStatus === "Approved" || newStatus === "Refunded") {
      setNoteError("");

      // Extract details for the template
      const orderRef = returnItem.orderId?._id?.slice(-6) || "N/A";
      const productTitle = returnItem.productId?.title || "Item";
      const reason = returnItem.reason || "your specified reason";

      // 🟢 Generate professional templates based on action
      let autoNote = "";
      if (newStatus === "Approved") {
        autoNote = `Regarding Order #${orderRef}: Your return request for '${productTitle}' has been approved. Please follow the packaging instructions sent to your email to complete the return.`;
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
      
      // Close Modal and Refresh
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
    
    // Strict Validation: Note is required
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

    // Step 1: Filter by Status
    let finalFiltered = returns;
    if (statusFilter !== "All") finalFiltered = returns.filter(r => r.status === statusFilter);
    
    // Step 2: Filter by Search Term
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
      <div className="w-full max-w-[100rem] mx-auto font-sans relative pb-10">
        
        <div className="m-20"></div>

        {/* TOAST NOTIFICATION */}
        <div className={`fixed left-1/2 top-20 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center p-4 shadow-2xl transition-all duration-500 pointer-events-none rounded-sm ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
        </div>

        <div className="mb-8 lg:mb-12 border-b border-neutral-200 pb-6 lg:pb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2">Return Requests</h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Dispute Management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
          {[{ label: "Pending", count: metrics.Pending }, { label: "Approved", count: metrics.Approved }, { label: "Refunded", count: metrics.Refunded }, { label: "Rejected", count: metrics.Rejected }].map((stat) => (
            <div key={stat.label} onClick={() => setStatusFilter(statusFilter === stat.label ? "All" : stat.label)} className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all border rounded-sm ${statusFilter === stat.label ? "bg-neutral-950 text-white shadow-xl" : "bg-white border-neutral-200 hover:border-neutral-900"}`}>
              <span className={`text-[8px] lg:text-[9px] font-bold tracking-[0.2em] uppercase mb-4 lg:mb-6 ${statusFilter === stat.label ? "text-neutral-400" : "text-neutral-400"}`}>{stat.label}</span>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tighter">{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-10 rounded-sm">
          
          {/* Header with Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6 lg:mb-8 px-2">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">{statusFilter === "All" ? "All Requests" : `${statusFilter} Requests`}</h2>
              {statusFilter !== "All" && <button onClick={() => setStatusFilter("All")} className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 block">Clear Filter</button>}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 group">
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Ref, Client, or Item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-300 py-2 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">Synchronizing...</p></div>
          ) : filteredReturns.length === 0 ? (
            <div className="py-16 text-center border-t border-neutral-100">
              <p className="text-xs text-neutral-400 font-light">
                {searchTerm ? `No return requests matching "${searchTerm}"` : "No return requests found."}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-hidden block">
              <table className="w-full text-left table-fixed sm:table-auto whitespace-normal break-words">
                <thead>
                  <tr className="border-b border-neutral-900">
                    <th className="w-[15%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Order</th>
                    <th className="w-[30%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Item & Client</th>
                    <th className="w-[35%] sm:w-auto py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400">Reason</th>
                    <th className="w-[20%] sm:w-auto py-3 lg:py-5 pl-2 lg:pl-6 text-[7px] sm:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredReturns.map((r) => (
                    <tr key={r._id} className="hover:bg-neutral-50 transition-colors group">
                      
                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <Link to={`/orders/${r.orderId?._id}`} className="text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.2em] text-neutral-900 uppercase hover:underline inline-block">
                          #{r.orderId?._id?.slice(-6) || "N/A"}
                        </Link>
                        <span className="block text-[7px] tracking-[0.1em] font-bold uppercase text-neutral-400 mt-2">{formatDate(r.createdAt)}</span>
                      </td>
                      
                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-neutral-100 border-2 border-white overflow-hidden shrink-0 shadow-sm">
                            {r.productId?.mainimage1 ? <img src={r.productId.mainimage1} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-200"></div>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-sm font-medium tracking-wide text-neutral-900 line-clamp-2">{r.productId?.title || "Item Deleted"}</span>
                            <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Qty: {r.quantity} • {r.userId?.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 lg:py-6 pr-2 lg:pr-6 align-middle">
                        <p className="text-[9px] sm:text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">{r.reason}</p>
                        {r.comments && <p className="text-[9px] sm:text-xs font-light text-neutral-500 italic line-clamp-2">"{r.comments}"</p>}
                      </td>
                      
                      <td className="py-4 lg:py-6 pl-2 lg:pl-6 align-middle text-right">
                        <div className="relative inline-block w-full min-w-[70px] sm:w-32 lg:w-40 border border-neutral-300 hover:border-neutral-900 transition-colors">
                          <select 
                            value={r.status} 
                            onChange={(e) => handleStatusChangeClick(r, e.target.value)} // 🟢 Passing the full object 'r' now
                            className={`appearance-none w-full bg-transparent py-2 sm:py-2.5 pl-1 sm:pl-3 lg:pl-4 pr-4 sm:pr-8 text-[7px] sm:text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.1em] lg:tracking-[0.2em] focus:outline-none cursor-pointer ${r.status === 'Approved' || r.status === 'Refunded' ? 'text-emerald-700' : r.status === 'Rejected' ? 'text-red-600' : 'text-neutral-900'}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Refunded">Refunded</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-1 sm:right-2 lg:right-4 flex items-center text-neutral-900"><svg className="h-2 w-2 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          🟢 CUSTOM ADMIN NOTE MODAL (WITH AUTO-FILLING TEMPLATE)
          ======================================================== */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${noteModal.isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => !isUpdating && setNoteModal({ ...noteModal, isOpen: false })}></div>
        
        <div className={`bg-white w-full max-w-md shadow-2xl relative transform transition-transform duration-500 rounded-sm ${noteModal.isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Update Status</h3>
            <button onClick={() => !isUpdating && setNoteModal({ ...noteModal, isOpen: false })} className="text-neutral-400 hover:text-neutral-900 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleModalSubmit} className="p-6 sm:p-8 space-y-6" noValidate>
            
            <div className="text-center mb-6">
              <p className="text-xs text-neutral-500 mb-1">Changing return status to</p>
              <p className={`text-lg font-bold tracking-widest uppercase ${noteModal.newStatus === "Rejected" ? "text-red-600" : "text-emerald-600"}`}>
                {noteModal.newStatus}
              </p>
            </div>

            <div>
              <label className="block text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">Admin Note for Customer *</label>
              
              <textarea 
                value={noteModal.note}
                onChange={(e) => {
                  setNoteModal({ ...noteModal, note: e.target.value });
                  setNoteError(""); // Clear error instantly on typing
                }}
                rows="5"
                required
                className={`w-full bg-neutral-50/50 border p-4 text-xs sm:text-sm font-light text-neutral-900 focus:outline-none resize-none transition-colors ${
                  noteError ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
              
              {noteError && (
                <span className="text-red-500 text-[8px] font-bold uppercase tracking-wider block mt-1.5">
                  {noteError}
                </span>
              )}
            </div>

            <div className="pt-2 flex gap-3 sm:gap-4">
              <button 
                type="button" 
                onClick={() => {
                  if (!isUpdating) {
                    setNoteModal({ ...noteModal, isOpen: false });
                    setNoteError("");
                  }
                }} 
                className="w-full border border-neutral-300 bg-white text-neutral-900 py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 active:scale-[0.98] transition-all rounded-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-neutral-950 text-white py-3.5 sm:py-4 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
              >
                {isUpdating ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </AdminLayout>
  );
}