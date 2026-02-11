// Legacy webhook route - redirects to main stripe webhook handler
// Kept for backward compatibility
import { POST as mainHandler } from "@/app/api/stripe/webhook/route";

export const POST = mainHandler;
