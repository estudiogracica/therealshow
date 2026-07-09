import Image from "next/image";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-900 pb-24">
      <header className="sticky top-0 z-10 bg-base-900/95 backdrop-blur border-b border-base-700">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 relative shrink-0">
            <Image src="/logo.png" alt="Escudo de The Real Show" fill sizes="36px" className="object-contain" />
          </div>
          <span className="font-display font-bold tracking-wide text-base text-white">
            THE REAL <span className="text-pitch-500">SHOW</span>
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">{children}</main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
