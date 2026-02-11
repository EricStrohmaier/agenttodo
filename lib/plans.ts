export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      activeTasks: 50,
      apiKeys: 2,
    },
    features: [
      "50 active tasks",
      "2 API keys",
      "Real-time dashboard",
      "Activity log",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: 499, // cents
    priceDisplay: "$4.99",
    interval: "month",
    limits: {
      activeTasks: Infinity,
      apiKeys: Infinity,
    },
    features: [
      "Unlimited tasks",
      "Unlimited API keys",
      "Unlimited agents",
      "Priority API access",
      "Email support",
      "Early access to new features",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
