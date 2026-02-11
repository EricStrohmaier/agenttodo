"use client";

import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalToast, Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const triggerToast = (
    message: string | React.ReactNode,
    type: "success" | "info" | "warning" | "error",
    data?: ExternalToast
  ) => {
    switch (type) {
      case "success":
        toast.success(message, data);
        break;
      case "info":
        toast.info(message, data);
        break;
      case "warning":
        toast.warning(message, data);
        break;
      case "error":
        toast.error(message, data);
        break;
      default:
        toast(message, data);
        break;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const status = searchParams.get("status");
    const status_description = searchParams.get("status_description");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    if (error || status) {
      const message = error ? error : status;
      const type = error ? "error" : "success";

      triggerToast(message, type, {
        description: error ? error_description : status_description,
      });

      // Clear search params
      const paramsToRemove = [
        "error",
        "status",
        "status_description",
        "error_description",
      ];
      const newSearchParams = new URLSearchParams(searchParams.toString());
      paramsToRemove.forEach((param) => newSearchParams.delete(param));

      // Update URL without toast params
      const redirectPath = `${pathname}?${newSearchParams.toString()}`;
      router.replace(redirectPath, { scroll: false });
    }
  }, [searchParams, mounted, pathname, router]);

  if (!mounted) return null;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
