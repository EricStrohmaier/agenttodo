"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, Eye, EyeClosed } from "lucide-react";
import { handleRequest } from "@/utils/auth-helpers/client";
import { updatePassword } from "@/utils/auth-helpers/server";

interface UpdatePasswordCardProps {
  redirectToURL?: string;
  redirectMethod?: string;
  type?: string;
}

export default function UpdatePasswordCard({
  redirectToURL,
  redirectMethod,
  type,
}: UpdatePasswordCardProps) {
  const router = useRouter();
  const routerMethod = redirectMethod === "client" ? router : null;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleRequest(e, updatePassword, routerMethod);
    setIsSubmitting(false);
  };

  const isSetPassword = type === "set-password";

  return (
    <div className="w-full max-w-[400px] sm:min-h-[600px] flex flex-col">
      {/* Headline */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-content mb-3">
          {isSetPassword ? "Set Password" : "Update Password"}
        </h1>
        <p className="font-body text-content-body text-base sm:text-lg">
          {isSetPassword
            ? "Please set your new password to continue"
            : "Please enter your new password"}
        </p>
      </div>

      {/* Form */}
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-content mb-1.5">
              {isSetPassword ? "New Password" : "Password"}
            </label>
            <div className="relative">
              <input
                id="password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
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

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm text-content mb-1.5">
              {isSetPassword ? "Confirm New Password" : "Confirm Password"}
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                placeholder="Confirm password"
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                autoComplete="new-password"
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
            disabled={isSubmitting}
            className="cta-button w-full flex items-center justify-center gap-2 px-6 py-3.5 font-sans font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSetPassword ? "Set Password" : "Update Password"}</span>
            )}
          </button>
        </div>
      </form>

      {/* Back to sign in */}
      <p className="font-body text-content-body text-sm text-center mt-6 sm:mt-auto">
        Changed your mind?{" "}
        <Link
          href={redirectToURL ? `/signin?next=${redirectToURL}` : "/signin"}
          className="text-brand hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
