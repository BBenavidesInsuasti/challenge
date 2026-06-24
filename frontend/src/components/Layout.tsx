import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Layers,
  GitCompare,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User,
  Rocket,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
  const { token, user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Explorar", icon: Search },
    { to: "/collections", label: "Colecciones", icon: Layers, auth: true },
    { to: "/compare", label: "Comparador", icon: GitCompare, auth: true },
  ];

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <nav className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-md border-b border-space-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <Rocket className="w-7 h-7 text-space-400 group-hover:text-space-300 transition-colors" />
              <span className="text-xl font-bold text-gradient">
                CosmicVault
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                if (link.auth && !isAuthenticated()) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-1.5 text-space-300 hover:text-space-100 transition-colors text-sm font-medium"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-space-700 mx-2" />

              {isAuthenticated() ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-space-300 text-sm">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-space-400 hover:text-red-400 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-space-300 hover:text-space-100 transition-colors text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-1.5 px-4"
                  >
                    <UserPlus className="w-4 h-4 inline mr-1" />
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden text-space-300 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-space-800 bg-space-950/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => {
                if (link.auth && !isAuthenticated()) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-space-300 hover:text-space-100 py-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <hr className="border-space-700 my-2" />
              {isAuthenticated() ? (
                <>
                  <div className="text-space-400 text-sm py-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 py-2 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-space-300 hover:text-space-100 py-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-space-300 hover:text-space-100 py-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
