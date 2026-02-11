// currently not in use do we need it?
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { matchDevelopersWithProject } from "@/app/(main)/submit/actions";

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const text = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event;

  try {
    // Verify the webhook signature
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(text, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Retrieve the submission data from metadata
      const metadata = session.metadata || {};
      const userId = metadata.userId;

      if (!userId) {
        console.error("No user ID found in session metadata");
        return NextResponse.json(
          { error: "Missing user ID in metadata" },
          { status: 400 }
        );
      }

      try {
        const supabase = await createClient();

        // Get the most recent incomplete submission for this user
        const { data: submission, error: submissionError } = await supabase
          .from("project_submissions")
          .select("id, tech_stack, budget, urgency")
          .eq("user_id", userId)
          .is("completed", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (submissionError) {
          console.error("Error fetching submission:", submissionError);
          return NextResponse.json(
            { error: "Could not find project submission" },
            { status: 400 }
          );
        }

        // Update the submission with the Stripe session ID
        const { error: updateError } = await supabase
          .from("project_submissions")
          .update({
            completed: true,
            status: "submitted",
            stripe_session_id: session.id,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", submission.id);

        if (updateError) {
          console.error("Error updating submission:", updateError);
          return NextResponse.json(
            { error: "Could not update project submission" },
            { status: 500 }
          );
        }

        // Match developers with the project
        await matchDevelopersWithProject(submission.id);

        return NextResponse.json({ received: true });
      } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }

    default:
      return NextResponse.json({ received: true });
  }
}
