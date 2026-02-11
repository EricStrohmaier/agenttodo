"use client";

import { createClient } from "@/utils/supabase/client";
import { type Provider } from "@supabase/supabase-js";
import { redirectToPath } from "./server";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (
    formData: FormData,
    hostname: string,
    signuptype?: string
  ) => Promise<string>,
  router: AppRouterInstance | null = null,
  signuptype?: string
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  // Check if the user is coming from the extension
  const urlParams = new URLSearchParams(window.location.search);
  const isExtension = urlParams.get("extension") === "true";

  // If coming from extension, add it to the form data
  if (isExtension) {
    formData.append("extension", "true");
  }

  const hostname = window.location.hostname; // Get hostname from client-side
  const redirectUrl: string = await requestFunc(formData, hostname, signuptype);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}

export async function handleEmailRequest(
  email: string,
  requestFunc: (formData: FormData, hostname: string) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Create FormData and append the email
  const formData = new FormData();
  formData.append("email", email);

  // Check if the user is coming from the extension
  const urlParams = new URLSearchParams(window.location.search);
  const isExtension = urlParams.get("extension") === "true";

  // If coming from extension, add it to the form data
  if (isExtension) {
    formData.append("extension", "true");
  }

  // Get hostname
  const hostname = window.location.hostname;

  // Send the request
  const redirectUrl: string = await requestFunc(formData, hostname);

  // Handle redirection based on client or server
  if (router) {
    return router.push(redirectUrl);
  } else {
    return await redirectToPath(redirectUrl);
  }
}

export async function signInWithOAuth(
  e: React.FormEvent<HTMLFormElement>,
  redirectTo?: string
) {
  // Prevent default form submission refresh
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const provider = String(formData.get("provider")).trim() as Provider;

  // Get user type from form data or use default
  const userType = String(formData.get("userType") || "project_owner").trim();

  // Check if the user is coming from the extension
  const urlParams = new URLSearchParams(window.location.search);
  const isExtension = urlParams.get("extension") === "true";

  // Create client-side supabase client and call signInWithOAuth
  const supabase = await createClient();

  // Build callback URL with optional redirect destination
  // Use window.location.origin to ensure we redirect back to the current port
  let callbackPath = "/api/auth/callback";
  if (redirectTo) {
    callbackPath += `?next=${encodeURIComponent(redirectTo)}`;
  }
  const redirectURL = `${window.location.origin}${callbackPath}`;

  // Add extension parameter and user type
  const queryParams: Record<string, string> = {
    user_type: userType,
  };
  if (isExtension) queryParams.extension = "true";

  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      queryParams,
      redirectTo: redirectURL,
    },
  });
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
