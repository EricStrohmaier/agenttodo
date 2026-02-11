"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { handleRequest } from "@/utils/auth-helpers/client";
import { signInWithEmailCode } from "@/utils/auth-helpers/server";

interface EmailCodeCardProps {
  redirectMethod: string;
  disableButton?: boolean;
  redirectTo?: string;
}

export default function EmailCodeCard({
  redirectMethod,
  disableButton,
  redirectTo,
}: EmailCodeCardProps) {
  const router = useRouter();
  const routerMethod = redirectMethod === "client" ? router : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithEmailCode, routerMethod, redirectTo);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-[400px] sm:min-h-[600px] flex flex-col">
      {/* Headline */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-content mb-3">
          Email Verification
        </h1>
        <p className="font-body text-content-body text-base sm:text-lg">
          Enter your email to receive a verification code
        </p>
      </div>

      {/* Form */}
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-content mb-1.5">
              Email
            </label>
            <input
              id="email"
              placeholder="Your email address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || disableButton || !email.trim()}
            className="cta-button w-full flex items-center justify-center gap-2 px-6 py-3.5 font-sans font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Send Email Code</span>
            )}
          </button>
        </div>
      </form>

      {/* Back to sign in */}
      <p className="font-body text-content-body text-sm text-center mt-6 sm:mt-auto">
        Want to try another way?{" "}
        <Link
          href={redirectTo ? `/signin?next=${redirectTo}` : "/signin"}
          className="text-brand hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
