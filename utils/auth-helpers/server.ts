"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getURL, getErrorRedirect, getStatusRedirect } from "@/utils/helpers";
import { getAuthTypes } from "@/utils/auth-helpers/settings";

function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
}

export const signIn = async () => {
  const supabase = await createClient();
  await supabase.auth.signInAnonymously();
};

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { data: null, error: error };
  }

  return { data: null, error: null };
}

export async function signInWithEmail(formData: FormData) {
  // const subdomain = hostname.split(".")[0]; // Extract the subdomain
  const cookieStore = await cookies();

  const callbackURL = getURL("/api/auth/confirm", "");

  const email = String(formData.get("email")).trim();
  let redirectPath: string;

  if (!isValidEmail(email) || email === "") {
    return (redirectPath = getErrorRedirect(
      `/signin`,
      "Invalid email address.",
      "Please try again."
    ));
  }

  const supabase = await createClient();
  const options = {
    email,
    emailRedirectTo: callbackURL,
    shouldCreateUser: true,
  };

  // If allowPassword is false, do not create a new user
  const { allowPassword } = getAuthTypes();

  if (allowPassword) options.shouldCreateUser = false;

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: callbackURL,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirectPath = getErrorRedirect(
      `/signin`,
      "You could not be signed in.",
      error.message
    );
  } else if (data) {
    cookieStore.set("preferredSignInView", "email_signin", { path: "/" });
    console.log(
      "Please check your email for a magic link. You may now close this tab."
    );

    redirectPath = getStatusRedirect(
      `/signin`,
      "Success!",
      "Please check your email for a magic link. You may now close this tab.",
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      `/signin`,
      "Hmm... Something went wrong.",
      "You could not be signed in."
    );
  }

  return redirectPath;
}

export async function signInWithEmailCode(
  formData: FormData,
  hostname: string
) {
  // const subdomain = hostname.split(".")[0]; // Extract the subdomain
  const cookieStore = await cookies();
  const callbackURL = getURL("/api/auth/confirm");

  const email = String(formData.get("email")).trim();
  let redirectPath: string;

  if (!isValidEmail(email) || email === "") {
    return (redirectPath = getErrorRedirect(
      `/signin`,
      "Invalid email address.",
      "Please try again."
    ));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: callbackURL,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirectPath = getErrorRedirect(
      `/signin`,
      "You could not be signed in.",
      error.message
    );
  } else if (data) {
    cookieStore.set("preferredSignInView", "email_signin", { path: "/" });
    console.log(
      "Please check your email for a magic link. You may now close this tab."
    );

    redirectPath = getStatusRedirect(
      `/signin`,
      "Success!",
      "Please check your email for a magic link. You may now close this tab.",
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      `/signin`,
      "Hmm... Something went wrong.",
      "You could not be signed in."
    );
  }

  return redirectPath;
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = await cookies();
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password")).trim();
  // Check if the user is coming from the extension
  const isExtension = formData.get("extension") === "true";
  let redirectPath: string;

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectPath = getErrorRedirect(
      "/signin",
      "Sign in failed.",
      error.message,
      false,
      "",
      isExtension
    );
  } else if (data.user) {
    cookieStore.set("preferredSignInView", "password_signin", { path: "/" });
    // If coming from extension, redirect to extension success page
    redirectPath = isExtension
      ? getStatusRedirect(
          "/extension-auth-success",
          "Success!",
          "You are now signed in.",
          false,
          "",
          true
        )
      : getStatusRedirect("/", "Success!", "You are now signed in.");
  } else {
    redirectPath = getErrorRedirect(
      "/signin",
      "Hmm... Something went wrong.",
      "You could not be signed in.",
      false,
      "",
      isExtension
    );
  }

  return redirectPath;
}

export async function signUp(formData: FormData) {
  const callbackURL = getURL("/api/auth/confirm", "");
  const firstName = String(formData.get("first_name") || "").trim();
  const lastName = String(formData.get("last_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password")).trim();
  let redirectPath: string;

  if (firstName === "") {
    return (redirectPath = getErrorRedirect(
      "/signup",
      "First name is required.",
      "Please provide your first name."
    ));
  } else if (!isValidEmail(email)) {
    return (redirectPath = getErrorRedirect(
      "/signup",
      "Invalid email address.",
      "Please try again."
    ));
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    redirectPath = getErrorRedirect(
      "/signup",
      "Sign up failed.",
      error.message
    );
  } else if (data.session && data.user) {
    // Create user in  Loops

    // User is signed in, redirect to the appropriate onboarding page
    redirectPath = "/dashboard";
  } else if (
    data.user &&
    data.user.identities &&
    data.user.identities.length == 0
  ) {
    redirectPath = getErrorRedirect(
      "/signup",
      "Sign up failed.",
      "There is already an account associated with this email address. Try resetting your password."
    );
  } else if (data.user) {
    redirectPath = getStatusRedirect(
      "/",
      "Success!",
      "Please check your email for a confirmation link. You may now close this tab."
    );
  } else {
    redirectPath = getErrorRedirect(
      "/signup",
      "Hmm... Something went wrong.",
      "You could not be signed up."
    );
  }

  return redirectPath;
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password")).trim();
  const passwordConfirm = String(formData.get("passwordConfirm")).trim();
  let redirectPath: string;

  // Check that the password and confirmation match
  if (password !== passwordConfirm) {
    redirectPath = getErrorRedirect(
      "/update-password",
      "Your password could not be updated.",
      "Passwords do not match."
    );
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirectPath = getErrorRedirect(
      "/update-password",
      "Your password could not be updated.",
      error.message
    );
  } else if (data.user) {
    redirectPath = getStatusRedirect(
      "/",
      "Success!",
      "Your password has been updated."
    );
  } else {
    redirectPath = getErrorRedirect(
      "/update-password",
      "Hmm... Something went wrong.",
      "Your password could not be updated."
    );
  }

  return redirectPath;
}

export async function updateEmail(formData: FormData) {
  // Get form data
  const newEmail = String(formData.get("newEmail")).trim();

  // Check that the email is valid
  if (!isValidEmail(newEmail)) {
    return getErrorRedirect(
      "/update_email",
      "Your email could not be updated.",
      "Invalid email address."
    );
  }

  const supabase = await createClient();
  const callbackUrl = getURL(
    getStatusRedirect("/", "Success!", `Your email has been updated.`)
  );

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: callbackUrl,
    }
  );

  if (error) {
    return getErrorRedirect(
      "/update_email",
      "Your email could not be updated.",
      error.message
    );
  } else {
    return getStatusRedirect(
      "/update_email",
      "Confirmation emails sent.",
      `You will need to confirm the update by clicking the links sent to both the old and new email addresses.`
    );
  }
}

export async function requestResetPassword(formData: FormData) {
  const options = {
    redirectTo: getURL(),
  };
  // Get form data
  const email = String(formData.get("email")).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    redirectPath = getErrorRedirect(
      "/forgot-password",
      "Invalid email address.",
      "Please try again."
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email,
    options
  );

  if (error) {
    redirectPath = getErrorRedirect(
      "/forgot-password",
      error.message,
      "Please try again."
    );
  } else if (data) {
    redirectPath = getStatusRedirect(
      "/forgot-password",
      "Success!",
      "Please check your email for a password reset link. You may now close this tab.",
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      "/forgot-password",
      "Hmm... Something went wrong.",
      "Password reset email could not be sent."
    );
  }

  return redirectPath;
}

/**
 * Sign in with magic link (OTP email)
 * Used for passwordless authentication in the story creation flow
 */
export async function signInWithMagicLink(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  const email = String(formData.get("email")).trim();
  const redirectTo = String(formData.get("redirectTo") || "/dashboard").trim();

  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  // Build the callback URL with the redirect destination
  const callbackURL = getURL(`/api/auth/confirm?next=${encodeURIComponent(redirectTo)}`);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: callbackURL,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (data) {
    return {
      success: true,
    };
  }

  return {
    success: false,
    error: "Something went wrong. Please try again.",
  };
}
