import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All"); 
  
  // 🟢 NEW: Search State for the Client Directory
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [userToDelete, setUserToDelete] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchUsers = async () => {
    try { setLoading(true); const res = await api.get("/users/admin/all"); setUsers(res.data); } 
    catch (error) { showToast("Failed to retrieve directory.", "error"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 🟢 DYNAMIC COUNTS, STATUS FILTER, AND SEARCH FILTER
  const { filteredUsers, metrics } = useMemo(() => {
    let active = 0, suspended = 0, admins = 0;
    users.forEach(u => { if (u.isBlocked) suspended++; else active++; if (u.role === 'admin') admins++; });
    
    // 1. Filter by Status
    let filtered = users;
    if (statusFilter === "Active") filtered = users.filter(u => !u.isBlocked);
    else if (statusFilter === "Suspended") filtered = users.filter(u => u.isBlocked);
    else if (statusFilter === "Admin") filtered = users.filter(u => u.role === 'admin');
    
    // 2. 🟢 Filter by Search Term (Name or Email)
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
    try { await api.delete(`/users/${userToDelete}`); showToast("Client record removed."); fetchUsers(); } 
    catch (error) { showToast("Failed to remove.", "error"); } 
    finally { setUserToDelete(null); }
  };

  const toggleBlock = async (id) => {
    try { const res = await api.put(`/users/block/${id}`); showToast(res.data.message || "Status updated."); fetchUsers(); } 
    catch (error) { showToast(error.response?.data?.message || "Update failed.", "error"); }
  };

  const updateRole = async (id, newRole) => {
    try { await api.put(`/users/role/${id}`, { role: newRole }); showToast(`Role updated.`); fetchUsers(); } 
    catch (error) { showToast("Update failed.", "error"); }
  };

  return (
    <AdminLayout>
      <div className="bg-neutral-50 min-h-screen font-sans pb-20 pt-6 lg:pt-10 relative selection:bg-neutral-200">
        <div className="m-20"></div>
        <div className={`fixed left-1/2 top-20 z-[100] flex w-[90%] max-w-sm -translate-x-1/2 transform items-center justify-center p-4 shadow-2xl transition-all duration-500 pointer-events-none ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"} ${toast.type === "error" ? "bg-white border-l-4 border-red-500 text-neutral-800" : "bg-neutral-950 text-white"}`}>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-center">{toast.message}</p>
        </div>

        <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="mb-8 lg:mb-12 border-b border-neutral-200 pb-6 lg:pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase text-neutral-900 mb-2 lg:mb-4">Client Directory</h1>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Thread Theory • Access & Privileges</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[{ label: "Total Clients", count: metrics.total, value: "All" }, { label: "Active", count: metrics.active, value: "Active" }, { label: "Suspended", count: metrics.suspended, value: "Suspended" }, { label: "Administrators", count: metrics.admins, value: "Admin" }].map((stat) => (
              <div key={stat.value} onClick={() => setStatusFilter(stat.value)} className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 border ${statusFilter === stat.value ? "bg-neutral-950 border-neutral-950 text-white shadow-xl" : "bg-white border-neutral-200 hover:border-neutral-900 text-neutral-900"}`}>
                <span className={`text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase mb-4 sm:mb-6 ${statusFilter === stat.value ? "text-neutral-400" : "text-neutral-400"}`}>{stat.label}</span>
                <p className="text-3xl lg:text-5xl font-light tracking-tighter">{stat.count}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 shadow-sm p-4 sm:p-6 lg:p-12">
            
            {/* 🟢 NEW: Header with Search Bar included */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6 lg:mb-10">
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-900">
                  {statusFilter === "All" ? "All Records" : `${statusFilter} Records`}
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-300 py-2 pl-7 pr-2 text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 lg:py-32 flex justify-center"><p className="text-[9px] lg:text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">Retrieving Records...</p></div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center border-t border-neutral-100">
                <p className="text-xs lg:text-sm text-neutral-400 font-light tracking-wide">
                  {searchTerm ? `No clients found matching "${searchTerm}"` : "No records found in this category."}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-hidden block">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-neutral-900">
                      <th className="py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] lg:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 w-[25%] lg:w-[20%]">Client Info</th>
                      <th className="py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] lg:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 w-[30%] lg:w-[25%]">Contact</th>
                      <th className="py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] lg:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 w-[20%] lg:w-[20%]">Role</th>
                      <th className="py-3 lg:py-5 pr-2 lg:pr-6 text-[7px] lg:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 w-[15%]">Status</th>
                      <th className="py-3 lg:py-5 pl-1 lg:pl-6 text-[7px] lg:text-[9px] font-bold tracking-[0.1em] lg:tracking-[0.25em] uppercase text-neutral-400 text-right w-[10%] lg:w-[20%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-50 transition-colors duration-300 group">
                        
                        <td className="py-3 lg:py-6 pr-2 lg:pr-6 align-middle overflow-hidden">
                          <div className="flex items-center gap-2 lg:gap-4">
                            <div className="hidden sm:flex w-6 h-6 lg:w-8 lg:h-8 bg-neutral-900 text-white items-center justify-center rounded-full text-[9px] font-light tracking-widest shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="text-[10px] lg:text-sm font-medium text-neutral-900 truncate block w-full">{u.name}</span>
                          </div>
                        </td>
                        
                        <td className="py-3 lg:py-6 pr-2 lg:pr-6 align-middle overflow-hidden">
                          <span className="text-[9px] lg:text-sm text-neutral-500 font-light truncate block w-full">{u.email}</span>
                        </td>
                        
                        <td className="py-3 lg:py-6 pr-2 lg:pr-6 align-middle">
                          <div className="relative inline-block w-full max-w-[60px] lg:max-w-[128px] border border-neutral-300 hover:border-neutral-900 transition-colors">
                            <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="appearance-none w-full bg-transparent py-1.5 lg:py-2.5 pl-1 lg:pl-4 pr-3 lg:pr-8 text-[7px] lg:text-[9px] font-bold uppercase tracking-wider lg:tracking-[0.2em] focus:outline-none cursor-pointer">
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-1 lg:right-2 flex items-center text-neutral-900">
                              <svg className="h-2 w-2 lg:h-3 lg:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 lg:py-6 pr-2 lg:pr-6 align-middle">
                          <div className="flex items-center gap-1 lg:gap-2">
                            <span className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0 ${u.isBlocked ? 'bg-red-500' : 'bg-neutral-900'}`}></span>
                            <span className={`text-[7px] lg:text-[9px] font-bold tracking-wider lg:tracking-[0.2em] uppercase truncate ${u.isBlocked ? 'text-red-600' : 'text-neutral-900'}`}>
                              {u.isBlocked ? "Suspended" : "Active"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 lg:py-6 pl-1 lg:pl-6 align-middle text-right">
                          <div className="flex flex-col lg:flex-row items-end lg:items-center justify-end gap-2 lg:gap-6 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleBlock(u._id)} className="text-[7px] lg:text-[9px] font-bold tracking-wider lg:tracking-[0.2em] uppercase hover:text-neutral-900 pb-0.5 text-neutral-400">
                              {u.isBlocked ? "Restore" : "Suspend"}
                            </button>
                            <button onClick={() => setUserToDelete(u._id)} className="text-[7px] lg:text-[9px] font-bold tracking-wider lg:tracking-[0.2em] uppercase text-neutral-400 hover:text-red-600 pb-0.5">
                              Remove
                            </button>
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
      </div>

      {userToDelete && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-lg font-light tracking-wide uppercase mb-3">Remove Client?</h3>
            <p className="text-xs sm:text-sm font-light text-neutral-500 mb-6">This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-3.5 text-[9px] font-bold uppercase tracking-[0.25em]">Yes, Remove</button>
              <button onClick={() => setUserToDelete(null)} className="w-full border border-neutral-300 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}