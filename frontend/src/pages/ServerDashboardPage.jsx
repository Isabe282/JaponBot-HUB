import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Ticket, CheckCircle2, XCircle, Hand, Settings, ArrowLeft, ListChecks } from "lucide-react";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { Layout } from "../components/Layout";
import { api, extractError } from "../lib/api";

const STAT_CONFIG = [
  { key: "total", label: "Total tickets", icon: Ticket, color: "from-[#ff3333] to-[#cc0000]", accent: "text-[#ff5555]" },
  { key: "abiertos", label: "Abiertos", icon: ListChecks, color: "from-[#ff5555] to-[#cc0000]", accent: "text-[#ff7777]" },
  { key: "cerrados", label: "Cerrados", icon: XCircle, color: "from-[#990000] to-[#660000]", accent: "text-[#cc0000]" },
  { key: "reclamados", label: "Reclamados", icon: Hand, color: "from-[#ff3333] to-[#990000]", accent: "text-[#ff3333]" },
];

const resolveStats = (raw) => {
  const data = raw?.estadisticas || raw?.data || raw || {};
  return {
    total: data?.total ?? data?.totalTickets ?? data?.total_tickets ?? 0,
    abiertos: data?.abiertos ?? data?.open ?? data?.abierto ?? 0,
    cerrados: data?.cerrados ?? data?.closed ?? data?.cerrado ?? 0,
    reclamados: data?.reclamados ?? data?.claimed ?? data?.reclamado ?? 0,
    servidor: raw?.servidor || raw?.server || data?.servidor || null,
  };
};

export default function ServerDashboardPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, serversRes] = await Promise.all([
        api.get(`/estadisticas/${serverId}`),
        api.get(`/servidores`).catch(() => ({ data: [] })),
      ]);
      const s = resolveStats(statsRes.data);
      setStats(s);
      const list = Array.isArray(serversRes.data) ? serversRes.data : (serversRes.data?.servidores || []);
      setServer(list.find((x) => (x.id || x.servidorId || x._id) === serverId) || s.servidor || null);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [serverId]);

  return (
    <Layout>
      <Button
        data-testid="back-home-button"
        variant="ghost"
        onClick={() => navigate("/")}
        className="text-white/60 hover:text-white hover:bg-[#ff3333]/10 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver a servidores
      </Button>

      {loading && <Spinner label="Cargando estadísticas..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && stats && (
        <>
          <div className="flex flex-wrap items-center gap-5 mb-10">
            {server?.icono || server?.icon ? (
              <img
                src={server.icono || server.icon}
                alt={server.nombre || "server"}
                className="w-16 h-16 rounded-2xl border border-[#ff3333]/15 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#cc0000]/30 to-[#ff3333]/10 border border-[#ff3333]/20 flex items-center justify-center text-[#ff5555] font-bold text-2xl">
                {(server?.nombre || server?.name || "S").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#ff3333] font-bold">Panel del servidor</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">{server?.nombre || server?.name || `Servidor ${serverId}`}</h1>
              <p className="text-white/40 mono text-xs mt-1">ID: {serverId}</p>
            </div>
          </div>

          <div data-testid="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {STAT_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              return (
                <div key={cfg.key} data-testid={`stat-${cfg.key}`} className="glass p-6 relative overflow-hidden group">
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${cfg.color} opacity-10 group-hover:opacity-20 blur-2xl transition-all`} />
                  <div className="relative">
                    <Icon className={`${cfg.accent} mb-3`} size={20} />
                    <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">{cfg.label}</p>
                    <p className="text-4xl font-bold text-white mt-2 mono">{stats[cfg.key] ?? 0}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={`/server/${serverId}/tickets`} data-testid="goto-tickets-button">
              <Button className="bg-[#cc0000] text-white font-semibold hover:bg-[#990000] hover:shadow-[0_0_24px_rgba(204,0,0,0.65)]">
                <Ticket size={16} className="mr-2" /> Ver tickets
              </Button>
            </Link>
            <Link to={`/server/${serverId}/config`} data-testid="goto-config-button">
              <Button variant="outline" className="glass border-[#ff3333]/20 text-white hover:bg-[#ff3333]/10">
                <Settings size={16} className="mr-2" /> Configuración
              </Button>
            </Link>
          </div>
        </>
      )}
    </Layout>
  );
}
