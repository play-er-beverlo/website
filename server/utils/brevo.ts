interface BrevoContact {
  email: string;
  name?: string;
}

interface BrevoAttachment {
  /** Base64-encoded file content (no data: prefix). */
  content: string;
  name: string;
}

/**
 * Sends a transactional email through the Brevo API.
 * Throws if the API key is missing or the request fails (so callers can roll back).
 */
export async function sendTransactionalEmail(params: {
  sender: BrevoContact;
  to: BrevoContact[];
  bcc?: BrevoContact[];
  replyTo?: BrevoContact;
  subject: string;
  htmlContent: string;
  attachment?: BrevoAttachment[];
}): Promise<void> {
  const apiKey = useRuntimeConfig().brevoApiKey as string;

  if (!apiKey) {
    throw new Error("Missing NUXT_BREVO_API_KEY");
  }

  await $fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: {
      sender: params.sender,
      to: params.to,
      bcc: params.bcc,
      replyTo: params.replyTo,
      subject: params.subject,
      htmlContent: params.htmlContent,
      attachment: params.attachment,
    },
  });
}
