import { useEffect, useState, useMemo, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import { Search, ChevronDown, CheckCircle2, AlertTriangle, X, ShieldAlert } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [userToDelete, setUserToDelete] = useState(null);
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, type });
    timerRef.current = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const fetchUsers = async () => {
    try { 
      setLoading(true); 
      const res = await api.get("/users/admin/all"); 
      setUsers(res.data); 
    } catch (error) { 
      showToast("Failed to retrieve directory.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsPageLoaded(true), 100);
    fetchUsers(); 
  }, []);

  // Prevent background scroll when deletion modal is open
  useEffect(() => {
    if (userToDelete) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [userToDelete]);

  // 🟢 DYNAMIC COUNTS, STATUS FILTER, AND SEARCH FILTER
  const { filteredUsers, metrics } = useMemo(() => {
    let active = 0, suspended = 0, admins = 0;
    users.forEach(u => { 
      if (u.isBlocked) suspended++; 
      else active++; 
      if (u.role === 'admin') admins++; 
    });
    
    // 1. Filter by Status
    let filtered = users;
    if (statusFilter === "Active") filtered = users.filter(u => !u.isBlocked);
    else if (statusFilter === "Suspended") filtered = users.filter(u => u.isBlocked);
    else if (statusFilter === "Admin") filtered = users.filter(u => u.role === 'admin');
    
    // 2. Filter by Search Term (Name or Email)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(searchLower) || 
        u.email?.toLowerCase().includes(searchLower)
      );
    }

    return { filteredUsers: filtered, metrics: { total: users.length, active, suspended, admins } };
  }, [users, statusFilter, searchTerm]);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try { 
      await api.delete(`/users/${userToDelete}`); 
      showToast("Client record permanently removed.", "success"); 
      fetchUsers(); 
    } catch (error) { 
      showToast("Failed to remove client.", "error"); 
    } finally { 
      setUserToDelete(null); 
    }
  };

  const toggleBlock = async (id) => {
    try { 
      const res = await api.put(`/users/block/${id}`); 
      showToast(res.data.message || "Account status updated.", "success"); 
      fetchUsers(); 
    } catch (error) { 
      showToast(error.response?.data?.message || "Status update failed.", "error"); 
    }
  };

  const updateRole = async (id, newRole) => {
    try { 
      await api.put(`/users/role/${id}`, { role: newRole }); 
      showToast("Privileges updated successfully.", "success"); 
      fetchUsers(); 
    } catch (error) { 
      showToast("Failed to update privileges.", "error"); 
    }
  };

  return (
    <AdminLayout>
      <div className={`bg-neutral-50 min-h-screen font-sans pb-32 pt-6 lg:pt-10 relative selection:bg-neutral-200 transition-opacity duration-1000 ease-[0.25,1,0.5,1] ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="m-8 lg:m-20"></div>

        {/* =========================================
            🌟 PREMIUM CENTERED NOTIFICATION POPUP
            ========================================= */}
        <div className={`fixed top-24 left-1/2 z-[100] flex w-[90%] sm:w-auto min-w-[320px] max-w-md -translate-x-1/2 transform items-center gap-3.5 rounded-2xl p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all duration-500 ease-[0.25,1,0.5,1] border ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"} ${toast.type === "error" ? "bg-white/90 border-red-100 text-neutral-900" : "bg-neutral-950/95 border-neutral-800 text-white"}`}>
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

        <div className="max-w-[100rem] mx-auto px-5 sm:px-6 lg:px-12">
          
          {/* HEADER SECTION */}
          <div className="mb-10 lg:mb-12 border-b border-neutral-200 pb-8 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards] text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-3 lg:mb-4">Client Directory</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Access & Privileges</p>
          </div>

          {/* STATS / FILTERS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-10 lg:mb-12 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
            {[
              { label: "Total Clients", count: metrics.total, value: "All" }, 
              { label: "Active", count: metrics.active, value: "Active" }, 
              { label: "Suspended", count: metrics.suspended, value: "Suspended" }, 
              { label: "Administrators", count: metrics.admins, value: "Admin" }
            ].map((stat) => (
              <div 
                key={stat.value} 
                onClick={() => setStatusFilter(stat.value)} 
                className={`p-5 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 border rounded-sm active:scale-[0.98] ${statusFilter === stat.value ? "bg-neutral-950 border-neutral-950 text-white shadow-xl md:-translate-y-1" : "bg-white border-neutral-200 hover:border-neutral-900 hover:shadow-md text-neutral-900 translate-y-0"}`}
              >
                <span className={`text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase mb-4 sm:mb-6 text-left ${statusFilter === stat.value ? "text-neutral-400" : "text-neutral-500"}`}>{stat.label}</span>
                <p className="text-3xl lg:text-4xl font-light tracking-tighter text-left">{stat.count}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-12 rounded-sm opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10 text-left">
              <div>
                <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {statusFilter === "All" ? "All Records" : `${statusFilter} Records`}
                </h2>
                {statusFilter !== "All" && (
                  <button onClick={() => setStatusFilter("All")} className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 pb-0.5 mt-2 transition-colors">
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors stroke-[1.5]" />
                <input
                  type="text"
                  placeholder="Search by Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-300 py-2.5 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 lg:py-32 flex flex-col items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-neutral-300 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400 animate-pulse">Retrieving Directory...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 lg:py-24 text-center border-t border-neutral-100 bg-neutral-50/50">
                <p className="text-xs lg:text-sm text-neutral-500 font-light tracking-wide">
                  {searchTerm ? `No clients found matching "${searchTerm}"` : "No records found in this category."}
                </p>
              </div>
            ) : (
              <>
                {/* =========================================
                    📱 MOBILE VIEW (CARDS - < 768px)
                    ========================================= */}
                <div className="md:hidden flex flex-col gap-5 border-t border-neutral-100 pt-6">
                  {filteredUsers.map((u) => (
                    <div key={u._id} className="bg-white border border-neutral-200 p-5 rounded-sm flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      
                      <div className="flex items-center gap-4 mb-5 border-b border-neutral-100 pb-4">
                        <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center rounded-full text-xs font-light tracking-widest shrink-0 shadow-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="text-sm font-medium text-neutral-900 truncate">{u.name || "Unknown"}</span>
                          <span className="text-[10px] font-light text-neutral-500 truncate mt-0.5">{u.email}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-5">
                        <div className="flex flex-col text-left">
                           <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-1">Status</span>
                           <div className="flex items-center gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                             <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${u.isBlocked ? 'text-red-600' : 'text-emerald-700'}`}>
                               {u.isBlocked ? "Suspended" : "Active"}
                             </span>
                           </div>
                        </div>
                        <div className="w-[120px]">
                           <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-1 block text-left">Privileges</span>
                           <div className="relative inline-block w-full border border-neutral-300 hover:border-neutral-900 transition-colors rounded-sm">
                             <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="appearance-none w-full bg-transparent py-2 pl-3 pr-8 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer">
                               <option value="user">User</option>
                               <option value="admin">Admin</option>
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-900"><ChevronDown className="h-3 w-3 stroke-[2]" /></div>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto pt-4 border-t border-neutral-100">
                         <button 
                           onClick={() => toggleBlock(u._id)} 
                           className={`w-1/2 flex items-center justify-center py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-all rounded-sm ${u.isBlocked ? 'bg-neutral-950 text-white' : 'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50'}`}
                         >
                           {u.isBlocked ? "Restore Access" : "Suspend Account"}
                         </button>
                         <button 
                           onClick={() => setUserToDelete(u._id)} 
                           className="w-1/2 flex items-center justify-center border border-red-200 text-red-600 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-colors hover:bg-red-50 rounded-sm"
                         >
                           Purge Client
                         </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* =========================================
                    💻 DESKTOP VIEW (TABLE - >= 768px)
                    ========================================= */}
                <div className="hidden md:block w-full overflow-hidden border border-neutral-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] bg-white rounded-sm">
                  <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                    <thead className="bg-neutral-50/80 border-b border-neutral-200">
                      <tr>
                        <th className="py-5 pl-8 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[25%]">Client Info</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[25%]">Contact</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[15%]">Role</th>
                        <th className="py-5 pr-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 w-[15%]">Status</th>
                        <th className="py-5 pr-8 pl-6 text-[9px] font-bold tracking-[0.25em] uppercase text-neutral-400 text-right w-[20%]">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-neutral-50 transition-colors duration-500 group">
                          
                          <td className="py-6 pl-8 pr-6 align-middle text-left">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-full text-[10px] font-light tracking-widest shrink-0 shadow-sm">
                                {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="text-sm font-medium text-neutral-900 truncate max-w-[150px] lg:max-w-[200px]">{u.name}</span>
                            </div>
                          </td>
                          
                          <td className="py-6 pr-6 align-middle text-left overflow-hidden">
                            <span className="text-xs font-light text-neutral-500 truncate max-w-[200px] block">{u.email}</span>
                          </td>
                          
                          <td className="py-6 pr-6 align-middle text-left">
                            <div className="relative inline-block w-full max-w-[140px] border border-neutral-300 hover:border-neutral-900 transition-colors rounded-sm bg-white">
                              <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="appearance-none w-full bg-transparent py-2.5 pl-4 pr-10 text-[9px] font-bold uppercase tracking-[0.2em] focus:outline-none cursor-pointer">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-900"><ChevronDown className="h-3 w-3 stroke-[2]" /></div>
                            </div>
                          </td>

                          <td className="py-6 pr-6 align-middle text-left">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase truncate ${u.isBlocked ? 'text-red-600' : 'text-emerald-700'}`}>
                                {u.isBlocked ? "Suspended" : "Active"}
                              </span>
                            </div>
                          </td>

                          <td className="py-6 pr-8 pl-6 align-middle text-right">
                            <div className="flex items-center justify-end gap-5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleBlock(u._id)} className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-900 pb-0.5">
                                {u.isBlocked ? "Restore" : "Suspend"}
                              </button>
                              <button onClick={() => setUserToDelete(u._id)} className="text-[9px] font-bold tracking-[0.2em] uppercase text-red-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5">
                                Purge
                              </button>
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

        {/* =========================================
            🌟 DELETE CONFIRMATION MODAL
            ========================================= */}
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${userToDelete ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setUserToDelete(null)}></div>
          <div className={`bg-white p-8 sm:p-12 max-w-sm w-full rounded-sm text-center relative transform transition-transform duration-500 ease-[0.25,1,0.5,1] shadow-2xl ${userToDelete ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
             <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
               <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
             </div>
             <h3 className="text-2xl font-light uppercase tracking-widest mb-4 text-neutral-900">Purge Client?</h3>
             <p className="text-sm font-light text-neutral-500 mb-10 leading-relaxed px-2">This will permanently erase all data associated with this account. This action cannot be undone.</p>
             <div className="flex flex-col gap-3 sm:gap-4">
               <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-red-700 transition-colors active:scale-[0.98] rounded-sm">Confirm Purge</button>
               <button onClick={() => setUserToDelete(null)} className="w-full border border-neutral-300 text-neutral-900 py-4 sm:py-4.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:border-neutral-900 transition-colors active:scale-[0.98] rounded-sm">Cancel Request</button>
             </div>
          </div>
        </div>

      </div>

      {/* GLOBAL CSS FOR SCROLLBAR & ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; } 
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </AdminLayout>
  );
}