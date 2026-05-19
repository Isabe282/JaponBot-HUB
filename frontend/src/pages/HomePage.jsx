import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, ServerCog } from "lucide-react";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { Layout } from "../components/Layout";
import { api, extractError } from "../lib/api";

export default function HomePage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/servidores");
      const list = Array.isArray(data) ? data : (data?.servidores || data?.data || []);
      setServers(list);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold">Inicio</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mt-2">Servidores conectados</h1>
        <p className="text-white/50 mt-2 max-w-xl">Selecciona un servidor para ver su panel de tickets, estadísticas y configuración.</p>
      </div>

      {loading && <Spinner label="Cargando servidores..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && servers.length === 0 && (
        <div data-testid="empty-servers" className="glass p-12 text-center">
          <ServerCog className="mx-auto text-white/30 mb-4" size={40} />
          <p className="text-white/60">No se encontraron servidores conectados.</p>
        </div>
      )}

      {!loading && !error && servers.length > 0 && (
        <div data-testid="servers-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((s) => {
            const id = s.id || s.servidorId || s._id;
            const name = s.nombre || s.name || "Servidor";
            const icon = s.icono || s.icon || s.iconUrl;
            const members = s.miembros ?? s.members ?? s.memberCount ?? 0;

            return (
              <div
                key={id}
                data-testid={`server-card-${id}`}
                className="glass glass-hover p-6 group transition-all flex flex-col gap-5"
              >
                <div className="flex items-center gap-4">
                  {icon ? (
                    <img
                      src={icon}
                      alt={name}
                      className="w-14 h-14 rounded-xl border border-white/10 object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center text-cyan-300 font-bold text-xl">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-white/50 mt-1">
                      <Users size={14} />
                      <span>{members.toLocaleString()} miembros</span>
                    </div>
                  </div>
                </div>

                <Button
                  data-testid={`view-server-${id}`}
                  onClick={() => navigate(`/server/${id}`)}
                  className="bg-cyan-500 text-black font-semibold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
                >
                  Ver panel <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
