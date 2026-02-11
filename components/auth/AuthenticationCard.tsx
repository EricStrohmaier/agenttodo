"use client";

import { type Provider } from "@supabase/supabase-js";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { signInWithOAuth } from "@/utils/auth-helpers/client";
import GoogleIcon from "./GoogleIcon";

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: any;
};

export default function AuthenticationCard({
  title,
  subtitle,
  allowOauth,
  redirectToURL,
  children,
  userType,
}: {
  title: string;
  subtitle: string;
  allowOauth: boolean;
  redirectToURL?: string;
  children: React.ReactNode;
  userType?: string;
}) {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: "google",
      displayName: "Continue with Google",
      icon: <GoogleIcon className="w-6 h-6" />,
    },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await signInWithOAuth(e, redirectToURL);
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
      <div className="mb-10">
        <CardTitle className="mt-8 mb-2 text-2xl lg:text-3xl">
          {title}
        </CardTitle>

        <CardDescription className="text-sm text-foreground-light">
          {subtitle}
        </CardDescription>
      </div>
      <div className="flex flex-col gap-5">
        {/* Social Sign-in Buttons at the top */}
        {allowOauth && (
          <div className="flex items-center relative">
            <div className="w-full">
              {oAuthProviders.map((provider) => (
                <form
                  key={provider.name}
                  className="pb-2"
                  onSubmit={(e) => handleSubmit(e)}
                >
                  <input type="hidden" name="provider" value={provider.name} />
                  <input
                    type="hidden"
                    name="userType"
                    value={userType || "project_owner"}
                  />
                  <Button
                    variant="slim"
                    type="submit"
                    className="relative cursor-pointer space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-foreground bg-alternative hover:bg-selection border-strong hover:border-stronger w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
                    disabled={isSubmitting}
                  >
                    <span className="mr-2">{provider.icon}</span>
                    <span className="truncate">{provider.displayName}</span>
                  </Button>
                </form>
              ))}
            </div>
          </div>
        )}

        {/* Separator between social and email/password */}
        {allowOauth && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-strong"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-sm text-foreground">or</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
