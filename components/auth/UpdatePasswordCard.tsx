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
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          {isSetPassword ? "Set Password" : "Update Password"}
        </h1>
        <p className="text-muted-foreground text-base">
          {isSetPassword
            ? "Please set your new password to continue"
            : "Please enter your new password"}
        </p>
      </div>

      {/* Form */}
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)} className="mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              {isSetPassword ? "New Password" : "Password"}
            </label>
            <div className="relative">
              <input
                id="password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors pr-12"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-foreground mb-1.5">
              {isSetPassword ? "Confirm New Password" : "Confirm Password"}
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                placeholder="Confirm password"
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors pr-12"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
      <p className="text-muted-foreground text-sm text-center mt-6 sm:mt-auto">
        Changed your mind?{" "}
        <Link
          href={redirectToURL ? `/signin?next=${redirectToURL}` : "/signin"}
          className="text-foreground hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
