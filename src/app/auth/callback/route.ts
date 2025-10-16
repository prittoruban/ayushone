import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("OAuth callback received with code:", code ? "Yes" : "No");

  if (code) {
    // Create Supabase server client with proper PKCE cookie handling
    const supabase = await createServerSupabaseClient();

    try {
      console.log("Attempting to exchange code for session...");

      // Exchange the code for a session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError);
        console.error("Error details:", {
          message: sessionError.message,
          status: sessionError.status,
          name: sessionError.name,
        });

        // Return to signin with error details
        return NextResponse.redirect(
          new URL(
            `/auth/signin?error=session_failed&details=${encodeURIComponent(
              sessionError.message
            )}`,
            requestUrl.origin
          )
        );
      }

      console.log(
        "Session established successfully",
        sessionData?.session?.user?.email
      );

      // Verify the session is set
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("Session not found after exchange");
        return NextResponse.redirect(
          new URL("/auth/signin?error=no_session", requestUrl.origin)
        );
      }

      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("OAuth user authenticated:", user.id, user.email);

        // Check if user profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected for new users
          console.error("Error fetching profile:", profileError);
        }

        // If profile doesn't exist, the database trigger should have created it
        // Just redirect to profile page
        if (!existingProfile) {
          console.log(
            "New user detected, database trigger should create profile. Redirecting to profile..."
          );

          // Redirect new OAuth users to profile page
          // The trigger (handle_new_user) creates the profile automatically
          return NextResponse.redirect(
            new URL("/profile?new=true", requestUrl.origin)
          );
        }

        console.log("Existing profile found, redirecting to profile");
      }
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      return NextResponse.redirect(
        new URL("/auth/signin?error=oauth_failed", requestUrl.origin)
      );
    }
  }

  // URL to redirect to after sign in process completes (existing users)
  return NextResponse.redirect(new URL("/profile", requestUrl.origin));
}
