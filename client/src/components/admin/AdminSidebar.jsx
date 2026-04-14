import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Coupons", path: "/admin/coupons" },
    { name: "Users", path: "/admin/users" },
    { name: "Analytics", path: "/admin/analytics" },
    { name: "Stockouts", path: "/admin/stockouts" },
    // Add this object inside the `menu` array in AdminSidebar.jsx:
    {
      name: "Returns",
      path: "/admin/returns",
    },
  ];

  return (
    <div
      className={`
        fixed lg:relative z-40
        w-64
        bg-neutral-950
        text-white
        min-h-screen
        border-r border-neutral-900
        flex flex-col
        transform
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="my-10"></div>
      {/* HEADER */}
      <div className="pt-10 pb-12 px-8 flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center bg-white text-neutral-950">
          <span className="font-serif text-base font-bold">TT</span>
        </div>

        <div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase">
            Admin
          </h2>
          <p className="text-[8px] text-neutral-500 uppercase">Thread Theory</p>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-4">
        <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em] mb-6 px-4">
          System Core
        </p>

        <ul className="space-y-1.5">
          {menu.map((item, i) => {
            const active = isActive(item.path);

            return (
              <li key={i}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] border-l-2 transition-all
                  ${
                    active
                      ? "bg-neutral-900 text-white border-white"
                      : "border-transparent text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="p-6 border-t border-neutral-900">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white"
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
}
