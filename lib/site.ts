export const siteConfig = {
  name: "AgentBoard",
  domain: "agentboard.dev",
  supportEmail: "support@agentboard.dev",
  subtitle: "Agent Task Management",
  description:
    "AgentBoard — a dashboard for managing agent tasks, workflows, and automation.",
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
    "agent tasks",
    "task management",
    "AI agents",
    "automation",
    "workflows",
    "dashboard",
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
