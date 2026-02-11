import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod,
} from "@/utils/auth-helpers/settings";
import { createClient } from "@/utils/supabase/server";
import LoginCard from "@/components/auth/LoginCard";
import SignUpCard from "@/components/auth/SignUpCard";
import ForgotPasswordCard from "@/components/auth/ForgotPasswordCard";
import UpdatePasswordCard from "@/components/auth/UpdatePasswordCard";
import EmailCodeCard from "@/components/auth/EmailCodeCard";
import { JSX } from "react";

export default async function SignIn({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; signuptype: string }>;
  searchParams: Promise<{
    disable_button: boolean;
    email: string;
    next: string;
    extension?: string;
  }>;
}) {
  const { allowOauth } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  let viewProp: string;
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;

  if (
    typeof awaitedParams.id === "string" &&
    viewTypes.includes(awaitedParams.id)
  ) {
    viewProp = awaitedParams.id;
  } else {
    const cookieStore = await cookies();
    const preferredSignInView =
      cookieStore.get("preferredSignInView")?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(
      `/${viewProp}${awaitedSearchParams.next ? `?next=${awaitedSearchParams.next}` : ""}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if this is an extension authentication request
  const isExtensionAuth = awaitedSearchParams.extension === "true";

  if (
    user &&
    !user.is_anonymous &&
    viewProp !== "update-password" &&
    viewProp !== "set-password"
  ) {
    if (isExtensionAuth) {
      return redirect("/extension-auth-success");
    } else {
      return redirect("/dashboard");
    }
  } else if (viewProp === "password_signin") {
    return redirect("/signin");
  } else if (
    !user &&
    (viewProp === "update-password" || viewProp === "set-password")
  ) {
    return redirect("/signin");
  }

  // Cards
  const cardConfig: Record<string, JSX.Element> = {
    signin: (
      <>
        <LoginCard
          redirectToURL={awaitedSearchParams.next}
          redirectMethod={redirectMethod}
          disableButton={awaitedSearchParams.disable_button}
          searchParamsEmail={awaitedSearchParams.email}
          allowOauth={allowOauth}
        />
      </>
    ),
    signup: (
      <SignUpCard
        allowOauth={allowOauth}
        redirectToURL={awaitedSearchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    "forgot-password": (
      <ForgotPasswordCard
        disableButton={awaitedSearchParams.disable_button}
        redirectToURL={awaitedSearchParams.next}
      />
    ),
    "update-password": (
      <UpdatePasswordCard
        type="update-password"
        redirectToURL={awaitedSearchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    "set-password": (
      <UpdatePasswordCard
        type="set-password"
        redirectToURL={awaitedSearchParams.next}
        redirectMethod={redirectMethod}
      />
    ),
    "email-code": (
      <EmailCodeCard
        redirectTo={awaitedSearchParams.next}
        redirectMethod={redirectMethod}
        disableButton={awaitedSearchParams.disable_button}
      />
    ),
  };

  const card = cardConfig[viewProp];
  if (!card) return redirect("/signin");

  return (
    <div className="w-full min-h-dvh flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden">
      <main className="relative z-10 flex flex-col items-center w-full max-w-[400px]">
        {card}

        {/* Terms of service at the bottom */}
        <div className="text-center mt-8 pb-8">
          <p className="text-xs sm:text-sm text-muted-foreground">
            By continuing, you agree to AgentTodo&apos;s{" "}
            <a
              className="text-foreground hover:underline transition-colors"
              href="/terms"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="text-foreground hover:underline transition-colors"
              href="/privacy"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
