import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        // If profile doesn't exist, create it
        if (!existingProfile) {
          // Try to get role from sessionStorage (set during signup)
          // Default to 'citizen' if not found
          const role = "citizen"; // You can enhance this with query params or other methods

          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email!.split("@")[0],
            role: role,
            phone: user.user_metadata?.phone || null,
          });

          console.log("Created new user profile for OAuth user:", user.id);
        }
      }
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      return NextResponse.redirect(
        new URL("/auth/signin?error=oauth_failed", requestUrl.origin)
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
