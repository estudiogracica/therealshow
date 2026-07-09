import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-2">
        <Logo />
        <p className="text-base-500 text-sm">Entra para ver los próximos partidos</p>
      </div>
      <AuthForm mode="login" />
    </>
  );
}
