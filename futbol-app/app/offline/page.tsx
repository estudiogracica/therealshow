import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-base-900 flex flex-col items-center justify-center px-6 text-center gap-3">
      <WifiOff className="w-10 h-10 text-base-500" />
      <h1 className="text-xl font-bold">Sin conexión</h1>
      <p className="text-base-500 text-sm max-w-xs">
        No se puede conectar en este momento. Revisa tu conexión e inténtalo de nuevo.
      </p>
    </div>
  );
}
