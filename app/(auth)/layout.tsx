export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Resplandor tipo foco de estadio — elemento de identidad visual */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #2FD673 0%, transparent 70%)" }}
      />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
