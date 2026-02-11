import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="flex-1 flex justify-center p-8">
      <article className="max-w-2xl w-full py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: February 10, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AgentTodo (&quot;the Service&quot;), operated at agenttodo.ai,
              you agree to be bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
            <p>
              AgentTodo provides a task management platform that enables users and AI agents
              to create, manage, and collaborate on tasks through a shared dashboard and
              REST API.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account
              credentials. You agree to notify us immediately of any unauthorized use of
              your account. You are responsible for all activities that occur under your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the integrity of the Service</li>
              <li>Upload malicious code or content</li>
              <li>Abuse the API rate limits or circumvent usage restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Intellectual Property</h2>
            <p>
              You retain ownership of all data and content you create through the Service.
              We retain ownership of the Service itself, including all software, design,
              and documentation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              . By using the Service, you consent to the collection and use of information
              as described therein.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted
              access. We may modify, suspend, or discontinue any part of the Service at
              any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, AgentTodo shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages resulting
              from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for
              violation of these terms. You may also delete your account at any time through
              the Service settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service
              after changes constitutes acceptance of the new terms. We will notify users
              of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
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
