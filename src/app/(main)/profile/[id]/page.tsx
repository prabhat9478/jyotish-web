import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
      <p className="text-muted-foreground mb-8">Birth Chart & Analysis</p>

      <div className="glass rounded-lg p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Birth Details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Date of Birth</dt>
            <dd className="font-medium">{new Date(profile.birth_date).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Time of Birth</dt>
            <dd className="font-medium">{profile.birth_time}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Place of Birth</dt>
            <dd className="font-medium">{profile.birth_place}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Coordinates</dt>
            <dd className="font-medium">{profile.latitude}°N, {profile.longitude}°E</dd>
          </div>
        </dl>
      </div>

      <div className="glass rounded-lg p-8">
        <p className="text-muted-foreground">
          Chart visualization coming soon...
        </p>
      </div>
    </div>
  );
}
