import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
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
    <div className="min-h-screen relative isolate">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage:
            "url('https://customer-assets.emergentagent.com/job_discord-bot-hub-51/artifacts/h3yf566i_image.png')",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0a0a]/85 via-[#0a0a0a]/80 to-[#0a0a0a]/95 pointer-events-none" />
      <div className="bg-grid fixed inset-0 z-0 pointer-events-none opacity-50" />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#ff3333]/15">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <Link to="/" data-testid="nav-home-link" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#ff3333]/30 glow-red">
              <img
                src="https://customer-assets.emergentagent.com/job_discord-bot-hub-51/artifacts/bccp3ojc_image.png"
                alt="Japon Bot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.25em] text-[#ff3333] font-bold">Panel</span>
              <span className="text-lg font-semibold text-white -mt-1 group-hover:neon-text transition">Japon Bot</span>
            </div>
          </Link>
          <Button
            data-testid="logout-button"
            variant="ghost"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-[#ff3333]/10"
          >
            <LogOut size={16} className="mr-2" /> Salir
          </Button>
        </div>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
};
