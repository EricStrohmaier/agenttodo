"use client";

export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} AgentBoard. All rights reserved.</p>
    </footer>
  );
}
