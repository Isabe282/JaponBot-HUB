import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export const ErrorState = ({ message, onRetry }) => (
  <div data-testid="error-state" className="glass p-8 flex flex-col items-center text-center gap-4">
    <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
      <AlertCircle className="text-rose-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white">Algo salió mal</h3>
      <p className="text-sm text-white/60 mt-1 max-w-md">{message}</p>
    </div>
    {onRetry && (
      <Button
        data-testid="retry-button"
        onClick={onRetry}
        className="bg-cyan-500 text-black hover:bg-cyan-400"
      >
        <RefreshCw className="mr-2" size={16} /> Reintentar
      </Button>
    )}
  </div>
);
