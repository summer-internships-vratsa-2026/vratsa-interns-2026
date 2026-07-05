import "../load-env";

import { isEmailConfigured, sendEmail } from "../src/lib/email";

const to = process.argv[2];

if (!to) {
  console.error("Usage: npm run email:test -- you@example.com");
  process.exit(1);
}

if (!isEmailConfigured()) {
  console.error(
    "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local",
  );
  process.exit(1);
}

try {
  const result = await sendEmail({
    to,
    subject: "Core LMS — Resend test",
    html: "<p>If you received this email, Resend is configured correctly.</p>",
  });

  console.log("Email sent:", result);
} catch (error) {
  console.error("Failed to send email:", error instanceof Error ? error.message : error);
  process.exit(1);
}
