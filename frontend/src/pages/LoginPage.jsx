import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api, setToken, extractError } from "../lib/api";
import { toast } from "sonner";

const BG_URL =
  "https://static.prod-images.emergentagent.com/jobs/d1780a56-8ecc-422b-831c-41fa514cd86b/images/7f92e8a5ec001dea3c5b30d7552cb83f87047ebc3e9cdf36fb78caff1041f87f.png";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Ingresa la contraseña");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { password });
      setToken(data.token);
      toast.success("Bienvenido al panel");
      navigate("/");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <img
        src={BG_URL}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="bg-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center glow-cyan">
            <Bot className="text-black" size={28} />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">Control panel</span>
          <h1 className="text-4xl font-bold text-white neon-text">Japon Bot</h1>
        </div>

        <form onSubmit={submit} data-testid="login-form" className="glass p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white">Acceso restringido</h2>
            <p className="text-sm text-white/50 mt-1">Ingresa tu contraseña de administrador</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">Contraseña</Label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                data-testid="login-password-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30 h-11"
              />
              <button
                type="button"
                data-testid="toggle-password-visibility"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-testid="login-submit-button"
            className="w-full h-11 bg-cyan-500 text-black font-semibold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.55)] transition-all"
          >
            {loading ? "Entrando..." : "Entrar al panel"}
          </Button>

          <p className="text-xs text-white/30 text-center">
            Acceso restringido solo a administradores autorizados.
          </p>
        </form>
      </div>
    </div>
  );
}
