import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { Layout } from "../components/Layout";
import { api, extractError } from "../lib/api";

const formatDate = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleString("es-ES"); } catch { return String(d); }
};

const colorFromName = (name) => {
  if (!name) return "#22d3ee";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

export default function TranscriptPage() {
  const { ticketId, serverId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/transcript/${ticketId}`);
      const list = Array.isArray(data) ? data : (data?.mensajes || data?.messages || data?.data || []);
      setMessages(list);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ticketId]);

  return (
    <Layout>
      <Button
        data-testid="back-tickets-button"
        variant="ghost"
        onClick={() => navigate(`/server/${serverId}/tickets`)}
        className="text-white/60 hover:text-white hover:bg-[#ff3333]/10 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver a tickets
      </Button>

      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#ff3333] font-bold">Transcript</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Conversación del ticket</h1>
        <p className="text-white/40 mono text-xs mt-2">Ticket ID: {ticketId}</p>
      </div>

      {loading && <Spinner label="Cargando transcript..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && messages.length === 0 && (
        <div data-testid="empty-transcript" className="glass p-12 text-center">
          <MessageSquare className="mx-auto text-white/30 mb-4" size={40} />
          <p className="text-white/60">No hay mensajes en este transcript.</p>
        </div>
      )}
      {!loading && !error && messages.length > 0 && (
        <div data-testid="transcript-list" className="glass p-6 scroll-area-soft max-h-[70vh] overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const name = m.usuario || m.user || m.username || m.author || "Usuario";
            const text = m.mensaje || m.message || m.content || m.text || "";
            const date = formatDate(m.fecha || m.timestamp || m.createdAt || m.date);
            const color = colorFromName(name);
            return (
              <div key={m.id || idx} data-testid={`transcript-msg-${idx}`} className="flex gap-3 hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0"
                  style={{ background: color }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs text-white/40 mono">{date}</span>
                    <span className="text-sm font-semibold" style={{ color }}>{name}:</span>
                  </div>
                  <p className="text-white/85 mt-0.5 break-words leading-relaxed">{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
