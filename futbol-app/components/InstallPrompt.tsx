"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// El evento beforeinstallprompt no está tipado de forma estándar en TS/DOM
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 max-w-md mx-auto safe-bottom">
      <div className="card p-4 flex items-center gap-3">
        <Download className="w-5 h-5 text-pitch-500 shrink-0" />
        <p className="flex-1 text-sm">Instala la app en tu móvil para acceder más rápido.</p>
        <button type="button" onClick={handleInstall} className="text-pitch-500 text-sm font-semibold shrink-0">
          Instalar
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-base-500 shrink-0"
          aria-label="Cerrar aviso de instalación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
