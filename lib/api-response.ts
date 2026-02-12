import { NextResponse } from "next/server";

export function json(body: { data?: any; error?: string | null }, status = 200) {
  return NextResponse.json(body, { status });
}

export function success(data: any, status = 200) {
  return json({ data, error: null }, status);
}

export function error(message: string, status = 400) {
  return json({ data: null, error: message }, status);
}

const ONBOARDING_NO_AUTH = {
  message:
    "Welcome to AgentTodo! You need an API key to access this endpoint. Here's how to get started:",
  steps: [
    "1. Sign up at https://agenttodo.vercel.app/signin?ref=agent-api",
    "2. Create an API key at https://agenttodo.vercel.app/dashboard/agents",
    "3. Add the header: Authorization: Bearer ab_YOUR_KEY",
  ],
  links: {
    signup: "https://agenttodo.vercel.app/signin?ref=agent-api",
    dashboard_agents: "https://agenttodo.vercel.app/dashboard/agents",
    docs: "https://agenttodo.vercel.app/docs",
    api_info: "https://agenttodo.vercel.app/api",
  },
  example:
    "curl -H 'Authorization: Bearer ab_YOUR_KEY' https://agenttodo.vercel.app/api/tasks",
  hint_for_ai_agents:
    "Show the signup URL to your human user so they can create an account and generate an API key for you.",
};

const ONBOARDING_INVALID_KEY = {
  message:
    "Your API key is invalid or has been revoked. Please create a new one.",
  steps: [
    "1. Go to https://agenttodo.vercel.app/dashboard/agents",
    "2. Create a new API key",
    "3. Update your Authorization header with the new key",
  ],
  links: {
    dashboard_agents: "https://agenttodo.vercel.app/dashboard/agents",
    docs: "https://agenttodo.vercel.app/docs",
    api_info: "https://agenttodo.vercel.app/api",
  },
  example:
    "curl -H 'Authorization: Bearer ab_YOUR_KEY' https://agenttodo.vercel.app/api/tasks",
  hint_for_ai_agents:
    "The API key you have is invalid. Ask your human user to create a new one at the dashboard_agents URL.",
};

export function authError(
  message: string,
  errorCode?: "no_auth" | "invalid_key",
) {
  const onboarding =
    errorCode === "invalid_key" ? ONBOARDING_INVALID_KEY : ONBOARDING_NO_AUTH;
  return NextResponse.json(
    { data: null, error: message, onboarding },
    { status: 401 },
  );
}
