import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* MOBILE TOP BAR */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-neutral-200 sticky top-0 z-20">

          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 border border-neutral-200 rounded"
          >
            <svg
              className="w-6 h-6 text-neutral-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="text-sm font-bold tracking-widest uppercase">
            Admin
          </span>

        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}