import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvatarUploader } from "@/components/AvatarUploader";
import { EditProfileForm } from "@/components/EditProfileForm";

export default async function EditarPerfilPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, nickname, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/perfil" className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Editar perfil</h1>
      </div>

      <AvatarUploader userId={user.id} currentUrl={profile.avatar_url} />

      <EditProfileForm
        userId={user.id}
        initialFullName={profile.full_name}
        initialNickname={profile.nickname}
      />
    </div>
  );
}
