// app/privacy/page.tsx
"use client";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="space-y-10 text-sm leading-relaxed text-slate-200">
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              1. Introduction
            </h2>
            <p>
              Welcome to <span className="font-semibold">Niyambadha</span> (the
              &quot;Platform&quot;), which includes our web application and
              browser extension. Niyambadha helps you build better digital
              discipline by limiting time on distracting websites and
              redirecting you to focus-building puzzles and activities.
            </p>
            <p>
              This Privacy Policy explains what information we collect, how we
              use it, and your rights and choices. By using the Niyambadha web
              app or installing and using the Niyambadha browser extension, you
              agree to the practices described in this Policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              2. Information We Collect
            </h2>

            <h3 className="font-semibold text-slate-100">
              2.1 Account & Profile Information
            </h3>
            <p>When you create an account on Niyambadha, we may collect:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name or display name</li>
              <li>Email address</li>
              <li>
                Password (stored in hashed form) or authentication provider
                details (e.g. Google sign-in, if enabled)
              </li>
              <li>Basic profile settings and preferences</li>
            </ul>

            <h3 className="mt-4 font-semibold text-slate-100">
              2.2 Usage Data (Web App)
            </h3>
            <p>When you use the Niyambadha web app, we may collect:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Pages and features you interact with</li>
              <li>Session timestamps and basic usage logs</li>
              <li>
                Device and browser information (such as browser type, version,
                and basic technical metadata)
              </li>
              <li>Approximate location based on IP (country / region level)</li>
            </ul>

            <h3 className="mt-4 font-semibold text-slate-100">
              2.3 Browser Extension Data
            </h3>
            <p>
              The Niyambadha browser extension is designed to work with minimal
              data. It does <span className="font-semibold">not</span> read or
              store the content of the pages you visit. It only uses limited
              information necessary to enforce your focus rules:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold">Active tab domain name</span>{" "}
                (e.g. <code>youtube.com</code>) to check if it matches your
                blocked list.
              </li>
              <li>
                <span className="font-semibold">Redirect and timer events</span>{" "}
                (for example, when your watch time is over and you are
                redirected to Niyambadha).
              </li>
              <li>
                <span className="font-semibold">
                  User identifier (UID or account ID)
                </span>{" "}
                that links the extension to your Niyambadha account and
                settings.
              </li>
            </ul>
            <p>
              The extension does <span className="font-semibold">not</span>{" "}
              collect:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Full URLs beyond what is needed to extract the domain</li>
              <li>Page content, text, or media</li>
              <li>Form inputs, passwords, or payment information</li>
              <li>Keystrokes or detailed browsing history</li>
            </ul>

            <h3 className="mt-4 font-semibold text-slate-100">
              2.4 Settings & Configuration Data
            </h3>
            <p>
              To provide personalized blocking and focus features, we store:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Your blocked domains list (e.g. youtube.com, instagram.com)
              </li>
              <li>Watch time limits (e.g. minutes allowed before redirect)</li>
              <li>Whether to block entire domains or specific subdomains</li>
              <li>Progress or completion of puzzles and focus activities</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Provide and operate the Niyambadha web app and browser extension
              </li>
              <li>
                Enforce your focus rules and watch-time limits on distracting
                sites
              </li>
              <li>
                Redirect you to the Niyambadha portal and puzzles when your time
                is up
              </li>
              <li>Sync settings across devices where applicable</li>
              <li>Maintain security, debug issues, and prevent abuse</li>
              <li>
                Improve the product based on anonymized or aggregated usage
                insights
              </li>
              <li>
                Communicate with you about important updates, changes, or
                support requests
              </li>
            </ul>
          </section>

          {/* 4. Legal Basis */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              4. Legal Basis for Processing
            </h2>
            <p>
              Depending on your location, our legal basis for processing your
              personal data may include:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold">Contract:</span> To provide the
                services you sign up for.
              </li>
              <li>
                <span className="font-semibold">Legitimate interests:</span> To
                keep the platform secure, improve features, and prevent abuse.
              </li>
              <li>
                <span className="font-semibold">Consent:</span> Where required,
                for specific optional features or communications.
              </li>
            </ul>
          </section>

          {/* 5. Sharing of Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              5. Sharing of Information
            </h2>
            <p>
              We do <span className="font-semibold">not</span> sell your
              personal data.
            </p>
            <p>We may share limited information with:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-semibold">Service providers</span> who
                help us host, store, or process data (such as cloud hosting,
                analytics, or error monitoring tools), under appropriate data
                protection agreements.
              </li>
              <li>
                <span className="font-semibold">Legal authorities</span> if
                required by law or to protect our rights, users, or the public.
              </li>
            </ul>
            <p>
              Any sharing is limited to what is necessary for the specific
              purpose and is done with appropriate safeguards.
            </p>
          </section>

          {/* 6. Cookies & Similar Technologies */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              6. Cookies & Similar Technologies
            </h2>
            <p>
              The Niyambadha web app may use cookies or similar technologies to:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Keep you signed in</li>
              <li>Remember your preferences and settings</li>
              <li>Measure basic usage and performance of the platform</li>
            </ul>
            <p>
              You can manage cookies through your browser settings. Disabling
              certain cookies may affect some features of the Platform.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              7. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active or as
              needed to provide the services. We may also retain some
              information for a longer period where required for:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Legal, accounting, or regulatory obligations</li>
              <li>Security, fraud prevention, or dispute resolution</li>
            </ul>
            <p>
              If you request account deletion, we will delete or anonymize your
              personal data within a reasonable period, except where retention
              is required by law.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              8. Your Rights & Choices
            </h2>
            <p>
              Depending on your location, you may have some or all of the
              following rights:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict certain types of processing</li>
              <li>Export your data where technically feasible</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the email
              address provided in the{" "}
              <span className="font-semibold">Contact Us</span> section below.
            </p>
          </section>

          {/* 9. Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">9. Security</h2>
            <p>
              We take reasonable technical and organizational measures to
              protect your data against unauthorized access, loss, misuse, or
              alteration. However, no system can be guaranteed to be 100%
              secure, and you share information with us at your own risk.
            </p>
            <p>
              You are responsible for keeping your account credentials secure
              and for logging out after using shared devices.
            </p>
          </section>

          {/* 10. Children */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              10. Children&apos;s Privacy
            </h2>
            <p>
              Niyambadha is not intended for children under the age of 13 (or
              the minimum age required in your jurisdiction). We do not
              knowingly collect personal information from children. If you
              believe a child has provided us with personal data, please contact
              us so we can take appropriate action.
            </p>
          </section>

          {/* 11. Changes */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. When we do, we
              will update the &quot;Last updated&quot; date at the top of this
              page. In some cases, we may notify you more directly (such as via
              email or an in-app notification).
            </p>
          </section>

          {/* 12. Contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-50">
              12. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests related to this
              Privacy Policy or your personal data, you can contact us at:
            </p>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm">
              <p className="font-semibold text-slate-100">Niyambadha Support</p>
              <p className="text-slate-200">Email: support@niyambadha.com</p>
              {/* TODO: Replace with your real email / contact details */}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
