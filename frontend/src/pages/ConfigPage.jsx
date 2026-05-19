import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Settings, FolderTree, Shield, FileText, Hash } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Layout } from "../components/Layout";
import { api, extractError } from "../lib/api";
import { toast } from "sonner";

const FIELDS = [
  { key: "nombreServidor", label: "Nombre del servidor", icon: Settings, placeholder: "Ej: Comunidad Japón" },
  { key: "categoriaTickets", label: "Categoría de tickets (ID)", icon: FolderTree, placeholder: "ID de la categoría de Discord" },
  { key: "rolStaff", label: "Rol Staff (ID)", icon: Shield, placeholder: "ID del rol de staff" },
  { key: "canalLogs", label: "Canal de logs (ID)", icon: Hash, placeholder: "ID del canal para logs" },
];

export default function ConfigPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombreServidor: "",
    categoriaTickets: "",
    rolStaff: "",
    canalLogs: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    for (const f of FIELDS) {
      if (!form[f.key].trim()) {
        return toast.error(`El campo "${f.label}" es obligatorio`);
      }
    }
    setSaving(true);
    try {
      await api.post("/configurar-servidor", { servidorId: serverId, ...form });
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Button
        data-testid="back-dashboard-button"
        variant="ghost"
        onClick={() => navigate(`/server/${serverId}`)}
        className="text-white/60 hover:text-white hover:bg-white/5 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver al panel
      </Button>

      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold">Configuración</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Ajustes del servidor</h1>
        <p className="text-white/50 mt-2 max-w-xl">Define los IDs de Discord para que Japon Bot pueda gestionar tickets correctamente.</p>
        <p className="text-white/40 mono text-xs mt-2">Servidor: {serverId}</p>
      </div>

      <form onSubmit={submit} data-testid="config-form" className="glass p-8 max-w-2xl space-y-6">
        {FIELDS.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key} className="text-white/80 text-sm font-medium">
                {f.label}
              </Label>
              <div className="relative">
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  id={f.key}
                  data-testid={`config-input-${f.key}`}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30 h-11"
                />
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            data-testid="config-save-button"
            className="bg-cyan-500 text-black font-semibold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.55)] transition-all"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
          <p className="text-xs text-white/40">Los cambios se aplicarán inmediatamente.</p>
        </div>
      </form>
    </Layout>
  );
}
