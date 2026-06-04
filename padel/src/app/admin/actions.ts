"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type Application = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  indoor: boolean;
  outdoor: boolean;
  owner_email: string;
  owner_id: string | null;
  status: string;
  created_at: string;
};

export async function approveApplication(app: Application): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error: clubError } = await supabase.from("clubs").insert({
    name: app.name,
    description: app.description,
    address: app.address,
    lat: app.lat,
    lng: app.lng,
    indoor: app.indoor,
    outdoor: app.outdoor,
    owner_id: app.owner_id,
  });

  if (clubError) return { error: clubError.message };

  const { error: updateError } = await supabase
    .from("club_applications")
    .update({ status: "approved" })
    .eq("id", app.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin");
  return {};
}

export async function rejectApplication(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("club_applications")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return {};
}
