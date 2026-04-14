import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 STATE FOR THE NOTE MODAL
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const res = await api.get("/returns/my-returns");
        setReturns(res.data);
      } catch (error) {
        console.error(error);
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

  return (
    <div className="bg-white min-h-[85vh] font-sans pb-32 relative selection:bg-neutral-200">
      <div className="max-w-[85rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-36">
        
        <nav className="mb-12 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link> <span className="mx-3">/</span>
          <Link to="/dashboard" className="hover:text-neutral-900 transition-colors">Account</Link> <span className="mx-3">/</span>
          <span className="text-neutral-900">Returns & Exchanges</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-neutral-200 pb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-wide uppercase text-neutral-900 mb-3">Returns Ledger</h1>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400">Track your disputes and refunds</p>
          </div>
          <Link to="/orders" className="text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-4">View Order History</Link>
        </div>

        {loading ? (
          <div className="py-32 flex justify-center"><p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">Retrieving Records...</p></div>
        ) : returns.length === 0 ? (
          <div className="text-center py-20 border-t border-neutral-100 mt-10">
            <h2 className="text-xl font-light tracking-wide text-neutral-900 mb-3 uppercase">No returns requested</h2>
            <p className="text-xs font-light text-neutral-500">You do not have any active or past return requests.</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden block border border-neutral-200 shadow-sm bg-white p-4 sm:p-8">
            <table className="w-full text-left table-fixed sm:table-auto whitespace-normal break-words">
              <thead>
                <tr className="border-b border-neutral-900">
                  <th className="w-[30%] sm:w-auto py-5 pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Product</th>
                  <th className="w-[25%] sm:w-auto py-5 pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Reason</th>
                  <th className="w-[20%] sm:w-auto py-5 pr-6 text-[7px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400">Status</th>
                  <th className="w-[25%] sm:w-auto py-5 pl-6 text-[7px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right">Updates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {returns.map((r) => {
                  const productData = r.productId || {};
                  return (
                    <tr key={r._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                      <td className="py-6 pr-6 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-neutral-100 shrink-0 border border-neutral-200">
                            {productData.mainimage1 && <img src={productData.mainimage1} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] sm:text-sm font-medium text-neutral-900 line-clamp-2">{productData.title}</span>
                            <span className="text-[7px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Qty: {r.quantity}</span>
                            <Link to={`/orders/${r.orderId?._id}`} className="text-[7px] text-neutral-500 hover:text-neutral-900 hover:underline uppercase mt-1">Order #{r.orderId?._id?.slice(-6)}</Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-6 align-middle">
                        <p className="text-[9px] sm:text-xs font-medium text-neutral-900">{r.reason}</p>
                        <p className="text-[8px] text-neutral-400 uppercase tracking-widest mt-2">{formatDate(r.createdAt)}</p>
                      </td>
                      <td className="py-6 pr-6 align-middle">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Approved' || r.status === 'Refunded' ? 'bg-emerald-500' : r.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          <span className={`text-[7px] sm:text-[9px] font-bold tracking-[0.2em] uppercase ${r.status === 'Approved' || r.status === 'Refunded' ? 'text-emerald-700' : r.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>{r.status}</span>
                        </div>
                      </td>
                      <td className="py-6 pl-6 align-middle text-right">
                        {r.adminNote ? (
                          // 🟢 CLICKABLE BUTTON FOR SUPPORT NOTE
                          <button 
                            onClick={() => openNoteModal(r.adminNote)}
                            className="bg-neutral-50 p-3 border border-neutral-200 inline-block text-left max-w-[200px] hover:border-neutral-400 transition-all cursor-pointer group/note"
                          >
                            <div className="flex justify-between items-center mb-1.5 gap-2">
                              <span className="block text-[7px] font-bold uppercase tracking-widest text-neutral-400 group-hover/note:text-neutral-900 transition-colors">Note from Support</span>
                              <svg className="w-3 h-3 text-neutral-400 group-hover/note:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                            </div>
                            <p className="text-[9px] font-light text-neutral-800 italic line-clamp-2">"{r.adminNote}"</p>
                            <span className="text-[7px] font-bold uppercase tracking-widest text-neutral-500 mt-2 block underline decoration-neutral-300 underline-offset-2">Read Full</span>
                          </button>
                        ) : r.status === 'Approved' ? (
                          <p className="text-[9px] text-neutral-500 font-light">Courier will arrive soon.</p>
                        ) : r.status === 'Refunded' ? (
                          <p className="text-[9px] text-emerald-600 font-medium">Refund Processed.</p>
                        ) : (
                          <p className="text-[9px] text-neutral-400 font-light">Awaiting review...</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          🟢 SUPPORT NOTE MODAL
          ======================================================== */}
      <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-500 ${selectedNote ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeNoteModal}></div>
        
        {/* Modal Box */}
        <div className={`bg-white w-full max-w-md shadow-2xl relative transform transition-transform duration-500 rounded-sm ${selectedNote ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-neutral-900">Message from Support</h3>
            <button onClick={closeNoteModal} className="text-neutral-400 hover:text-neutral-900 p-1 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-sm font-light leading-relaxed text-neutral-800 whitespace-pre-wrap">
              {selectedNote}
            </p>
          </div>

          <div className="p-5 sm:p-6 border-t border-neutral-100 flex justify-end bg-neutral-50/50">
            <button 
              onClick={closeNoteModal} 
              className="border border-neutral-300 bg-white text-neutral-900 px-8 py-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 hover:text-white hover:border-neutral-900 active:scale-[0.98] transition-all rounded-sm"
            >
              Close Message
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}