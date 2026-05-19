import { Loader2 } from "lucide-react";

export const Spinner = ({ label = "Cargando...", size = 28, full = false }) => (
  <div
    data-testid="loading-spinner"
    className={`flex flex-col items-center justify-center gap-3 ${full ? "min-h-[60vh]" : "py-12"}`}
  >
    <Loader2 className="animate-spin text-[#ff3333]" size={size} />
    {label && <p className="text-sm text-white/60">{label}</p>}
  </div>
);
