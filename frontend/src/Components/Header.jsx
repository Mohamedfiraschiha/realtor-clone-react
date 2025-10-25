import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaHeart,
  FaHome,
  FaTags,
  FaMapMarkedAlt,
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaCalendarCheck,
  FaHandshake,
  FaFileContract,
  FaCog,
} from "react-icons/fa";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  function pathMatchRoute(Route) {
    if (Route === location.pathname) {
      return true;
    }
  }
  // Track login state with state and storage events
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    }
    return false;
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/notifications?unreadOnly=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsLoggedIn(payload.exp * 1000 > Date.now());
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/signin");
  }
  return (
    <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                {/* House Icon Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-700 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <span className="text-2xl filter drop-shadow-lg">🏠</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="font-bold text-2xl text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
                    Four
                  </span>
                  <span className="font-light text-2xl text-slate-600 group-hover:text-slate-500 transition-colors">
                    Walls
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium -mt-1">
                  Your Home Awaits
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home */}
            <NavLink
              icon={FaHome}
              label="Home"
              path="/"
              isActive={pathMatchRoute("/")}
              onClick={() => navigate("/")}
            />

            {/* Offers */}
            <NavLink
              icon={FaTags}
              label="Offers"
              path="/offers"
              isActive={pathMatchRoute("/offers")}
              onClick={() => navigate("/offers")}
            />

            {/* Map View */}
            <NavLink
              icon={FaMapMarkedAlt}
              label="Map"
              path="/map-view"
              isActive={pathMatchRoute("/map-view")}
              onClick={() => navigate("/map-view")}
            />

            {isLoggedIn ? (
              <>
                {/* Favorites */}
                <NavLink
                  icon={FaHeart}
                  label="Favorites"
                  path="/favorites"
                  isActive={pathMatchRoute("/favorites")}
                  onClick={() => navigate("/favorites")}
                  iconClassName="text-red-500"
                />

                {/* Notifications */}
                <div className="relative">
                  <NavLink
                    icon={FaBell}
                    label="Alerts"
                    path="/notifications"
                    isActive={pathMatchRoute("/notifications")}
                    onClick={() => navigate("/notifications")}
                    iconClassName="text-yellow-500"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* Manage Dropdown */}
                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      pathMatchRoute("/manage-visits") ||
                      pathMatchRoute("/manage-offers") ||
                      pathMatchRoute("/manage-applications")
                        ? "bg-slate-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaCog className="text-sm text-blue-500" />
                    <span>Manage</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3">
                        <p className="text-white text-xs font-semibold uppercase tracking-wider">
                          Property Management
                        </p>
                      </div>
                      <div className="py-2">
                        <DropdownItem
                          icon={FaCalendarCheck}
                          label="Visit Requests"
                          onClick={() => navigate("/manage-visits")}
                          iconColor="text-blue-500"
                        />
                        <DropdownItem
                          icon={FaHandshake}
                          label="Offers Received"
                          onClick={() => navigate("/manage-offers")}
                          iconColor="text-green-500"
                        />
                        <DropdownItem
                          icon={FaFileContract}
                          label="Applications"
                          onClick={() => navigate("/manage-applications")}
                          iconColor="text-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <NavLink
                  icon={FaUser}
                  label="Profile"
                  path="/profile"
                  isActive={pathMatchRoute("/profile")}
                  onClick={() => navigate("/profile")}
                  iconClassName="text-purple-500"
                />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg hover:from-slate-800 hover:to-slate-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaSignInAlt className="text-sm" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// NavLink Component
function NavLink({ icon: Icon, label, path, isActive, onClick, iconClassName = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isActive
          ? "bg-slate-900 text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className={`text-sm ${iconClassName}`} />
      <span>{label}</span>
    </button>
  );
}

// DropdownItem Component
function DropdownItem({ icon: Icon, label, onClick, iconColor }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
    >
      <Icon className={`text-lg ${iconColor}`} />
      <span className="font-medium">{label}</span>
    </button>
  );
}
