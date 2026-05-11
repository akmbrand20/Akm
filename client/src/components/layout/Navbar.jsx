import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { announcementEnabled, announcementText } = useSettings();

  const {
    customer,
    isCustomerLoggedIn,
    logout: logoutCustomer,
  } = useCustomerAuth();

  const {
    admin,
    isAuthenticated: isAdminLoggedIn,
    logout: logoutAdmin,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const linkClass = ({ isActive }) =>
    `block rounded-2xl px-4 py-3 text-sm transition ${
      isActive
        ? "bg-[#c8b89d]/10 text-[#c8b89d]"
        : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
    }`;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    if (isAdminLoggedIn) {
      logoutAdmin();
    }

    if (isCustomerLoggedIn) {
      logoutCustomer();
    }

    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const isLoggedIn = isAdminLoggedIn || isCustomerLoggedIn;

  const cleanAnnouncementText =
    announcementText?.trim() || "Wear comfort. Move different.";

  const showAnnouncement =
    announcementEnabled && cleanAnnouncementText.length > 0;

  return (
    <>
      <header className="fixed left-0 top-0 z-[9998] w-full border-b border-white/10 bg-black backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-12">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center"
            aria-label="AKM Home"
          >
            <img
              src="/images/akm-logo.webp"
              alt="AKM"
              className="h-12 w-12 rounded-full object-cover md:h-14 md:w-14"
            />
          </Link>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              onClick={closeMenu}
              className="relative flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white transition hover:border-[#c8b89d]/60 sm:px-4"
            >
              <ShoppingBag size={17} />
              <span className="hidden sm:inline">Cart</span>

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8b89d] px-1 text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>

            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white transition hover:border-[#c8b89d]/60 sm:px-4"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={17} /> : <Menu size={17} />}
                <span className="hidden sm:inline">Menu</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-[9999] w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-3xl border border-white/10 bg-[#080808]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                  {isAdminLoggedIn && (
                    <div className="mb-3 rounded-2xl border border-[#c8b89d]/20 bg-[#c8b89d]/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c8b89d] text-black">
                          <LayoutDashboard size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {admin?.fullName || "AKM Admin"}
                          </p>
                          <p className="truncate text-xs text-[#c8b89d]">
                            Admin account
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isAdminLoggedIn && isCustomerLoggedIn && (
                    <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c8b89d]/10 text-[#c8b89d]">
                          <User size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {customer?.fullName || "AKM Customer"}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {customer?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-1">
                    <NavLink to="/" onClick={closeMenu} className={linkClass}>
                      Home
                    </NavLink>

                    <NavLink
                      to="/shop"
                      onClick={closeMenu}
                      className={linkClass}
                    >
                      Shop
                    </NavLink>

                    {isAdminLoggedIn && (
                      <NavLink
                        to="/admin"
                        onClick={closeMenu}
                        className={linkClass}
                      >
                        Admin Dashboard
                      </NavLink>
                    )}

                    {!isAdminLoggedIn && isCustomerLoggedIn && (
                      <NavLink
                        to="/my-orders"
                        onClick={closeMenu}
                        className={linkClass}
                      >
                        My Orders
                      </NavLink>
                    )}
                  </div>

                  <div className="mt-3 border-t border-white/10 pt-3">
                    {!isLoggedIn ? (
                      <div className="grid gap-2">
                        <Link
                          to="/signin"
                          onClick={closeMenu}
                          className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm text-white transition hover:border-[#c8b89d]/60"
                        >
                          Sign In
                        </Link>

                        <Link
                          to="/signup"
                          onClick={closeMenu}
                          className="rounded-2xl bg-[#f7f2ea] px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-white"
                        >
                          Sign Up
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 px-4 py-3 text-sm text-red-200 transition hover:bg-red-500/10"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {showAnnouncement && (
          <div className="akm-announcement-bar">
            <div className="akm-announcement-track">
              <span>{cleanAnnouncementText}</span>
            </div>
          </div>
        )}
      </header>

      <div
        aria-hidden="true"
        className={
          showAnnouncement
            ? "h-[102px] md:h-[110px]"
            : "h-[68px] md:h-[78px]"
        }
      />
    </>
  );
}