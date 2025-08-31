import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Check for authorization code in query params (PKCE flow)
  const code = requestUrl.searchParams.get("code");
  const error_description = requestUrl.searchParams.get("error_description");
  const error = requestUrl.searchParams.get("error");
  
  // Check for tokens in URL fragment (implicit flow) - we'll handle this client-side
  const origin = requestUrl.origin;

  console.log("OAuth callback received:", {
    code: code ? "present" : "missing",
    error,
    error_description,
    url: requestUrl.toString(),
    hasFragment: requestUrl.hash ? "yes" : "no"
  });

  // Check for OAuth errors first
  if (error) {
    console.error("OAuth error:", { error, error_description });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`);
  }

  // If no code, redirect to client-side handler to check for URL fragments
  if (!code) {
    console.log("No code in query params, redirecting to client-side handler");
    // We can't access URL fragments server-side, so always redirect to client handler
    return NextResponse.redirect(`${origin}/auth/callback-client`);
  }

  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              console.warn("Cookie set error (can be ignored in server components):", error);
            }
          },
        },
      }
    );

    console.log("Attempting to exchange code for session...");
    
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", {
        message: exchangeError.message,
        status: exchangeError.status,
        code: exchangeError.code,
      });
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`);
    }

    console.log("Code exchange successful, session created:", {
      userId: sessionData.user?.id,
      email: sessionData.user?.email
    });

    // Get the current user to confirm
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user after exchange:", userError);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=user_fetch_failed`);
    }

    if (!user) {
      console.error("No user found after successful exchange");
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user`);
    }

    console.log("User authenticated successfully:", user.id, user.email);

    // Check if user has completed profile setup
    console.log("Checking user profile setup...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("starting_balance_set")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("Profile not found or error:", profileError.message);
      console.log("Redirecting to setup for profile creation");
      return NextResponse.redirect(`${origin}/setup`);
    }

    if (!profile?.starting_balance_set) {
      console.log("Profile exists but setup not complete, redirecting to setup");
      return NextResponse.redirect(`${origin}/setup`);
    }

    console.log("Profile setup complete, redirecting to dashboard");
    // Success - redirect to dashboard
    return NextResponse.redirect(`${origin}/`);

  } catch (err) {
    console.error("Unexpected callback error:", {
      error: err,
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`);
  }
}
