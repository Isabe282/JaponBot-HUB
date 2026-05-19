import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, FileText, X, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { Layout } from "../components/Layout";
import { api, extractError } from "../lib/api";
import { toast } from "sonner";
import { successToast } from "../lib/sounds";

const normalizeStatus = (t) => {
  const raw = (t.estado || t.status || "").toString().toLowerCase();
  if (["abierto", "open", "opened", "active"].includes(raw)) return "abierto";
  if (["cerrado", "closed", "close"].includes(raw)) return "cerrado";
  if (["reclamado", "claimed"].includes(raw)) return "reclamado";
  return raw || "desconocido";
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(d); }
};

const StatusBadge = ({ status }) => {
  const map = {
    abierto: "bg-[#ff5555]/15 text-[#ff7777] border-[#ff5555]/30",
    cerrado: "bg-[#660000]/40 text-[#cc6666] border-[#660000]/50",
    reclamado: "bg-[#cc0000]/20 text-[#ff3333] border-[#cc0000]/40",
  };
  return (
    <Badge className={`${map[status] || "bg-white/10 text-white/70 border-white/15"} border capitalize font-medium`}>
      {status}
    </Badge>
  );
};

export default function TicketsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmTicket, setConfirmTicket] = useState(null);
  const [closing, setClosing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/tickets/${serverId}`);
      const list = Array.isArray(data) ? data : (data?.tickets || data?.data || []);
      setTickets(list);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [serverId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const st = normalizeStatus(t);
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (!q) return true;
      const user = (t.usuario || t.user || t.username || "").toString().toLowerCase();
      const reason = (t.razon || t.reason || t.motivo || "").toString().toLowerCase();
      return user.includes(q) || reason.includes(q);
    });
  }, [tickets, statusFilter, search]);

  const handleClose = async () => {
    if (!confirmTicket) return;
    setClosing(true);
    try {
      const canalId = confirmTicket.canalId || confirmTicket.channelId || confirmTicket.canal || confirmTicket.id;
      await api.post("/cerrar-ticket", { servidorId: serverId, canalId });
      successToast("Ticket cerrado correctamente");
      setConfirmTicket(null);
      await load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setClosing(false);
    }
  };

  return (
    <Layout>
      <Button
        data-testid="back-dashboard-button"
        variant="ghost"
        onClick={() => navigate(`/server/${serverId}`)}
        className="text-white/60 hover:text-white hover:bg-[#ff3333]/10 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver al panel
      </Button>

      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#ff3333] font-bold">Tickets</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Gestión de tickets</h1>
      </div>

      <div className="glass p-5 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            data-testid="ticket-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario o razón..."
            className="pl-9 bg-[#1a0a0a]/70 border-[#ff3333]/20 text-white placeholder:text-white/30 focus-visible:border-[#ff3333] focus-visible:ring-[#ff3333]/30"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            data-testid="ticket-status-filter"
            className="md:w-[200px] bg-[#1a0a0a]/70 border-[#ff3333]/20 text-white"
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a0a0a] border-[#ff3333]/20 text-white">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="abierto">Abiertos</SelectItem>
            <SelectItem value="cerrado">Cerrados</SelectItem>
            <SelectItem value="reclamado">Reclamados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <Spinner label="Cargando tickets..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="glass overflow-hidden">
          <Table data-testid="tickets-table">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#ff3333]/15">
                <TableHead className="text-white/50 uppercase tracking-wider text-xs">ID</TableHead>
                <TableHead className="text-white/50 uppercase tracking-wider text-xs">Usuario</TableHead>
                <TableHead className="text-white/50 uppercase tracking-wider text-xs">Razón</TableHead>
                <TableHead className="text-white/50 uppercase tracking-wider text-xs">Estado</TableHead>
                <TableHead className="text-white/50 uppercase tracking-wider text-xs">Fecha</TableHead>
                <TableHead className="text-white/50 uppercase tracking-wider text-xs text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent border-[#ff3333]/10">
                  <TableCell colSpan={6} className="text-center py-12 text-white/40">
                    No hay tickets que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t) => {
                const id = t.id || t._id || t.ticketId;
                const status = normalizeStatus(t);
                const user = t.usuario || t.user || t.username || "—";
                const reason = t.razon || t.reason || t.motivo || "—";
                const date = formatDate(t.fecha || t.createdAt || t.created_at || t.date);
                return (
                  <TableRow
                    key={id}
                    data-testid={`ticket-row-${id}`}
                    className="hover:bg-[#ff3333]/10 border-[#ff3333]/10"
                  >
                    <TableCell className="text-white/80 mono text-xs">{id}</TableCell>
                    <TableCell className="text-white font-medium">{user}</TableCell>
                    <TableCell className="text-white/70 max-w-xs truncate">{reason}</TableCell>
                    <TableCell><StatusBadge status={status} /></TableCell>
                    <TableCell className="text-white/60 text-sm">{date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`view-transcript-${id}`}
                          onClick={() => navigate(`/server/${serverId}/transcript/${id}`)}
                          className="glass border-[#ff3333]/20 text-white hover:bg-[#ff3333]/10 h-8"
                        >
                          <FileText size={14} className="mr-1" /> Transcript
                        </Button>
                        {status !== "cerrado" && (
                          <Button
                            size="sm"
                            data-testid={`close-ticket-${id}`}
                            onClick={() => setConfirmTicket(t)}
                            className="bg-[#cc0000] hover:bg-[#990000] text-white h-8"
                          >
                            <X size={14} className="mr-1" /> Cerrar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!confirmTicket} onOpenChange={(o) => !o && setConfirmTicket(null)}>
        <DialogContent
          data-testid="close-ticket-modal"
          className="glass border-[#ff3333]/15 text-white"
        >
          <DialogHeader>
            <DialogTitle className="text-white">¿Cerrar este ticket?</DialogTitle>
            <DialogDescription className="text-white/60">
              Esta acción cerrará el ticket <span className="mono text-[#ff5555]">#{confirmTicket?.id || confirmTicket?._id}</span>. ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              data-testid="close-ticket-modal-cancel"
              variant="outline"
              onClick={() => setConfirmTicket(null)}
              className="glass border-[#ff3333]/20 text-white hover:bg-[#ff3333]/10"
            >
              Cancelar
            </Button>
            <Button
              data-testid="close-ticket-modal-confirm"
              onClick={handleClose}
              disabled={closing}
              className="bg-[#cc0000] hover:bg-[#990000] text-white"
            >
              {closing ? <Loader2 className="animate-spin mr-2" size={16} /> : <X size={16} className="mr-2" />}
              Cerrar ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
