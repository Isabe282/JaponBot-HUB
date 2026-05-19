import { Link, useNavigate } from "react-router-dom";
import { Bot, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { api, clearToken } from "../lib/api";
import { toast } from "sonner";

export const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) { /* ignore */ }
    clearToken();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative">
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" data-testid="nav-home-link" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center glow-cyan">
                <Bot className="text-black" size={22} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold">Panel</span>
              <span className="text-lg font-semibold text-white -mt-1 group-hover:neon-text transition">Japon Bot</span>
            </div>
          </Link>
          <Button
            data-testid="logout-button"
            variant="ghost"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-white/5"
          >
            <LogOut size={16} className="mr-2" /> Salir
          </Button>
        </div>
      </header>
      <main className="relative max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
};
