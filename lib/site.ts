export const siteConfig = {
  name: "AgentBoard",
  domain: "agentboard.dev",
  supportEmail: "support@agentboard.dev",
  subtitle: "One execution layer for autonomous agents",
  description:
    "AgentBoard — one execution layer for autonomous agents. A single mission control where you and your agents read and write. Low context, optimized for agents.",
  url: "https://agentboard.dev",
  ogImage: "https://agentboard.dev/og-image.png",
  links: {
    twitter: "",
    github: "",
    linkedin: "",
    signIn: "/signin",
  },
  keywords: [
    "AgentBoard",
    "agent execution layer",
    "AI agents",
    "autonomous agents",
    "mission control",
    "agent API",
    "task queue",
    "agent memory",
  ],
  mainNav: [
    {
      title: "Dashboard",
      titleKey: "dashboard",
      href: "/dashboard",
      showWhen: "auth",
    },
  ],
  resources: [],
  company: [],
  legal: [],
  buttons: {
    mainCta: {
      title: "Get Started",
      href: "/dashboard",
      target: "_self",
    },
    signIn: {
      title: "Sign In",
      href: "/signin",
      target: "_self",
    },
  },
};
