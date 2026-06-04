"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/* Verify the current user owns the club that owns this court */
async function assertCourtOwner(courtId: string): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: court } = await supabase
    .from("courts")
    .select("clubs(owner_id)")
    .eq("id", courtId)
    .single();

  const ownerId = (court?.clubs as { owner_id: string } | null)?.owner_id;
  if (!ownerId || ownerId !== user.id) return { error: "Not authorized" };

  return { userId: user.id };
}

export async function addSlot(data: {
  court_id: string; date: string; start_time: string; end_time: string;
}): Promise<{ error?: string }> {
  const check = await assertCourtOwner(data.court_id);
  if ("error" in check) return { error: check.error };

  const admin = createAdminClient();
  const { error } = await admin.from("time_slots").insert({
    court_id: data.court_id,
    date: data.date,
    start_time: data.start_time,
    end_time: data.end_time,
    is_available: true,
  });
  return error ? { error: error.message } : {};
}

export async function deleteSlot(slotId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify slot belongs to one of the user's courts
  const { data: slot } = await supabase
    .from("time_slots")
    .select("courts(clubs(owner_id))")
    .eq("id", slotId)
    .single();

  const ownerId = (slot?.courts as { clubs: { owner_id: string } } | null)?.clubs?.owner_id;
  if (!ownerId || ownerId !== user.id) return { error: "Not authorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("time_slots").delete().eq("id", slotId);
  return error ? { error: error.message } : {};
}

export async function addCourt(
  clubId: string,
  data: { name: string; type: string; price_per_hour: number }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: club } = await supabase.from("clubs").select("owner_id").eq("id", clubId).single();
  if (!club || club.owner_id !== user.id) return { error: "Not authorized" };

  const admin = createAdminClient();
  const { error } = await admin.from("courts").insert({
    club_id: clubId, name: data.name, type: data.type, price_per_hour: data.price_per_hour,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function updateCourt(
  courtId: string,
  data: { name: string; type: string; price_per_hour: number }
): Promise<{ error?: string }> {
  const check = await assertCourtOwner(courtId);
  if ("error" in check) return { error: check.error };

  const admin = createAdminClient();
  const { error } = await admin.from("courts")
    .update({ name: data.name, type: data.type, price_per_hour: data.price_per_hour })
    .eq("id", courtId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function deleteCourt(courtId: string): Promise<{ error?: string }> {
  const check = await assertCourtOwner(courtId);
  if ("error" in check) return { error: check.error };

  const admin = createAdminClient();
  const { error } = await admin.from("courts").delete().eq("id", courtId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function updateClub(
  clubId: string,
  data: { name: string; description: string; address: string; indoor: boolean; outdoor: boolean }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("clubs")
    .update({ name: data.name, description: data.description, address: data.address, indoor: data.indoor, outdoor: data.outdoor })
    .eq("id", clubId)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}
