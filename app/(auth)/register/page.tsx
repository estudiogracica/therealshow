import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-2">
        <Logo />
        <p className="text-base-500 text-sm">Crea tu cuenta y únete al grupo</p>
      </div>
      <AuthForm mode="register" />
    </>
  );
}
