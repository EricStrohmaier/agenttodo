import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <main className="w-full flex flex-col justify-between h-screen">
        <div className="flex-grow flex items-center justify-center flex-col text-center px-4 h-full">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-xl font-semibold mt-4">Page not found</p>
          <p className="mt-2 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}
