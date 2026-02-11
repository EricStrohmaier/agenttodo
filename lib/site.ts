export const siteConfig = {
  name: "AgentTodo",
  domain: "agenttodo.ai",
  supportEmail: "support@agenttodo.ai",
  subtitle: "One execution layer for autonomous agents",
  description:
    "A shared todo list for you and your AI agents. One REST API, one dashboard, one source of truth. Agents grab tasks, do the work, report back. You stay in control.",
  url: "https://agenttodo.ai",
  ogImage: "https://agenttodo.ai/og-image.png",
  links: {
    twitter: "",
    github: "",
    linkedin: "",
    signIn: "/signin",
  },
  keywords: [
    "AgentTodo",
    "AI agent task management",
    "agent todo list",
    "autonomous agent API",
    "AI task queue",
    "agent orchestration",
    "LLM agent tools",
    "AI agent dashboard",
    "agent memory layer",
    "open source agent platform",
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
