"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { handleRequest } from "@/utils/auth-helpers/client";
import { requestResetPassword } from "@/utils/auth-helpers/server";

interface ForgotPasswordCardProps {
  disableButton?: boolean;
  redirectToURL?: string;
}

export default function ForgotPasswordCard({
  disableButton,
  redirectToURL,
}: ForgotPasswordCardProps) {

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, requestResetPassword, router);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-[400px] sm:min-h-[600px] flex flex-col">
      {/* Headline */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          Reset Password
        </h1>
        <p className="text-muted-foreground text-base">
          Enter your email to reset your password
        </p>
      </div>

      {/* Form */}
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              placeholder="you@example.com"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || disableButton || !email.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </div>
      </form>

      {/* Back to sign in */}
      <p className="text-muted-foreground text-sm text-center mt-6 sm:mt-auto">
        Remember your password?{" "}
        <Link
          href={redirectToURL ? `/signin?next=${redirectToURL}` : "/signin"}
          className="text-foreground hover:underline font-medium"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
