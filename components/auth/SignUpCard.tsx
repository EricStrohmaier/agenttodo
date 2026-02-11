"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, Eye, EyeClosed } from "lucide-react";

import { handleRequest, signInWithOAuth } from "@/utils/auth-helpers/client";
import { signUp } from "@/utils/auth-helpers/server";
import posthog from "posthog-js";

interface SignUpCardProps {
  allowOauth: boolean;
  redirectMethod: string;
  redirectToURL?: string;
}

export default function SignUpCard({
  allowOauth,
  redirectMethod,
  redirectToURL,
}: SignUpCardProps) {
  
  const router = useRouter();
  const routerMethod = redirectMethod === "client" ? router : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);

    const result = await handleRequest(e, signUp, routerMethod, redirectToURL);

    if (email) {
      posthog.identify(email, {
        email: email,
      });
      posthog.capture("user_signed_up", {
        method: "email",
      });
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGoogleLoading(true);

    posthog.capture("user_signed_up", {
      method: "google",
    });

    try {
      await signInWithOAuth(e, redirectToURL);
    } catch {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] sm:min-h-[600px] flex flex-col">
      {/* Headline */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-content mb-3">
          "Create Account"
        </h1>
        <p className="font-body text-content-body text-base sm:text-lg">
          "Get started with AgentBoard"
        </p>
      </div>

      {/* Google OAuth */}
      {allowOauth && (
        <>
          <form onSubmit={handleGoogleSignIn} className="mb-6">
            <input type="hidden" name="provider" value="google" />
            <input type="hidden" name="userType" value="project_owner" />
            <button
              type="submit"
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-line-dark/20 bg-page-surface hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-content-secondary" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-sans font-medium text-content">
                    "Sign up with Google"
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line-dark/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-page px-4 font-body text-sm text-content-muted">
                "or"
              </span>
            </div>
          </div>
        </>
      )}

      {/* Email/Password Form */}
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first_name" className="block text-sm text-content mb-1.5">
                "First Name"
              </label>
              <input
                id="first_name"
                placeholder="John"
                type="text"
                name="first_name"
                autoCapitalize="words"
                autoComplete="given-name"
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm text-content mb-1.5">
                "Last Name"
              </label>
              <input
                id="last_name"
                placeholder="Doe"
                type="text"
                name="last_name"
                autoCapitalize="words"
                autoComplete="family-name"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-content mb-1.5">
              "Email"
            </label>
            <input
              id="email"
              placeholder="you@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-content mb-1.5">
              "Password"
            </label>
            <div className="relative">
              <input
                id="password"
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-12"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-content-muted hover:text-content-body"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password.trim()}
            className="cta-button w-full flex items-center justify-center gap-2 px-6 py-3.5 font-sans font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>"Create Account"</span>
            )}
          </button>
        </div>
      </form>

      {/* Already have account */}
      <p className="font-body text-content-body text-sm text-center mt-6 sm:mt-auto">
        "Already have an account?"{" "}
        <Link
          href={redirectToURL ? `/signin?next=${redirectToURL}` : "/signin"}
          className="text-brand hover:underline font-medium"
        >
          "Sign In"
        </Link>
      </p>
    </div>
  );
}
