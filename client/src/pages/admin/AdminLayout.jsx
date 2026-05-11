import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  ReceiptText,
  Settings,
  Star,
  Tag,
  TicketPercent,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
      isActive
        ? "bg-[#c8b89d] text-black"
        : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f7f2ea]">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-[#080808] p-5 lg:block">
        <Link to="/admin" className="block text-3xl font-black tracking-tight">
          AKM
        </Link>

        <p className="mt-2 text-sm text-zinc-500">Admin Dashboard</p>

        <nav className="mt-10 grid gap-2">
          <NavLink to="/" className={navClass}>
            <Home size={18} />
            Home
          </NavLink>

          <NavLink to="/admin" end className={navClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/orders" className={navClass}>
            <ReceiptText size={18} />
            Orders
          </NavLink>

          <NavLink to="/admin/products" className={navClass}>
            <Package size={18} />
            Products
          </NavLink>

          <NavLink to="/admin/offers" className={navClass}>
            <Tag size={18} />
            Offers
          </NavLink>

          <NavLink to="/admin/reviews" className={navClass}>
            <Star size={18} />
            Reviews
          </NavLink>

          <NavLink to="/admin/coupons" className={navClass}>
            <TicketPercent size={18} />
            Coupons
          </NavLink>

          <NavLink to="/admin/email-campaigns" className={navClass}>
            <Mail size={18} />
            Emails
          </NavLink>

          <NavLink to="/admin/settings" className={navClass}>
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold">{admin?.fullName}</p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {admin?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-red-200 hover:border-red-300/40"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="text-2xl font-black">
              AKM
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-red-200"
            >
              Logout
            </button>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2">
            <NavLink to="/" className={navClass}>
              <Home size={16} />
              Home
            </NavLink>

            <NavLink to="/admin" end className={navClass}>
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>

            <NavLink to="/admin/orders" className={navClass}>
              <ReceiptText size={16} />
              Orders
            </NavLink>

            <NavLink to="/admin/products" className={navClass}>
              <Package size={16} />
              Products
            </NavLink>

            <NavLink to="/admin/offers" className={navClass}>
              <Tag size={16} />
              Offers
            </NavLink>

            <NavLink to="/admin/reviews" className={navClass}>
              <Star size={16} />
              Reviews
            </NavLink>

            <NavLink to="/admin/coupons" className={navClass}>
              <TicketPercent size={16} />
              Coupons
            </NavLink>

            <NavLink to="/admin/email-campaigns" className={navClass}>
              <Mail size={16} />
              Emails
            </NavLink>

            <NavLink to="/admin/settings" className={navClass}>
              <Settings size={16} />
              Settings
            </NavLink>
          </nav>
        </header>

        <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}