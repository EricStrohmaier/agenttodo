import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex justify-center p-8">
      <article className="max-w-2xl w-full py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: February 10, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
            <p>
              AgentTodo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website agenttodo.ai
              and the AgentTodo platform. This Privacy Policy explains how we collect, use,
              and protect your personal information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account information:</strong> email address, name, and authentication
                data when you create an account
              </li>
              <li>
                <strong>Usage data:</strong> information about how you interact with the
                Service, including pages visited and features used
              </li>
              <li>
                <strong>Task data:</strong> tasks, notes, and other content you create
                within the Service
              </li>
              <li>
                <strong>API usage:</strong> API keys, request logs, and agent metadata
              </li>
              <li>
                <strong>Device information:</strong> browser type, operating system, and
                IP address
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To communicate with you about the Service</li>
              <li>To improve and optimize the Service</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard practices. We use Supabase
              for data storage and authentication. All data is encrypted in transit using
              TLS and at rest. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase:</strong> authentication and database hosting
              </li>
              <li>
                <strong>PostHog:</strong> privacy-friendly product analytics
              </li>
              <li>
                <strong>Vercel:</strong> hosting and deployment
              </li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies governing how they handle data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We also
              use analytics cookies with your consent to understand how the Service is used.
              You can manage your cookie preferences at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data and account</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for analytics cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. When you delete
              your account, we remove your personal data within 30 days. Some anonymized
              usage data may be retained for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for users under the age of 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              any material changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@agenttodo.ai" className="underline hover:text-foreground">
                support@agenttodo.ai
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
