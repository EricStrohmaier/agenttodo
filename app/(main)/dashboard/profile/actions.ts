"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateDeveloperProfile(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Extract form data
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const bio = formData.get("bio") as string;
  const heroTagline = formData.get("heroTagline") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;
  const country = formData.get("country") as string;
  const timezone = formData.get("timezone") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const startAvailability = formData.get("startAvailability") as string;
  const hoursPerWeek = parseInt(formData.get("hoursPerWeek") as string) || null;

  // Handle skills (multiple selection)
  const skills = formData.getAll("skills") as string[];

  // Update user table
  const { error: userError } = await supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      bio,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      skills,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (userError) {
    console.error("Error updating user profile:", userError);
    throw new Error("Failed to update user profile");
  }

  // Update developer_profiles table
  const { error: profileError } = await supabase
    .from("developer_profiles")
    .update({
      bio,
      hero_tagline: heroTagline,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      country,
      timezone,
      phone_number: phoneNumber,
      start_availability: startAvailability,
      hours_per_week: hoursPerWeek,
      skills,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (profileError) {
    console.error("Error updating developer profile:", profileError);
    throw new Error("Failed to update developer profile");
  }

  // Handle avatar upload if provided
  const avatarFile = formData.get("avatar") as File;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      // Continue without avatar update
    } else {
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        // Update avatar URL in both tables
        await supabase
          .from("users")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", user.id);

        await supabase
          .from("developer_profiles")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("user_id", user.id);
      }
    }
  }

  // Revalidate the dashboard and profile pages
  revalidatePath("/dashboard");
  revalidatePath("/developers");
  revalidatePath(`/developers/${user.id}`);

  // Redirect to the dashboard after successful update
  redirect("/dashboard");
}
