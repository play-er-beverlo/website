import { payment, PLAY_TIME, REGISTRATION_FEE } from "../data/summerCup";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared HTML chrome (logo + dark header card) used by every Summer Cup email. */
function renderEmailShell(params: { logoUrl: string; bodyHtml: string }): string {
  const logoUrl = escapeHtml(params.logoUrl);
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <img src="${logoUrl}" alt="Play-ER" width="260" height="81" style="display:block;margin:0 auto 20px;border:0;max-width:100%;height:auto;" />
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td align="center" style="background:#323031;padding:16px 24px;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">6 Reds SummER Cup 2026</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${params.bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildConfirmationEmail(params: {
  name: string;
  playDayLabel: string;
  communication: string;
  qrImageUrl: string;
  logoUrl: string;
  cancelUrl: string;
}): { subject: string; htmlContent: string } {
  const name = escapeHtml(params.name);
  const playDayLabel = escapeHtml(params.playDayLabel);
  const communication = escapeHtml(params.communication);
  const qrImageUrl = escapeHtml(params.qrImageUrl);
  const cancelUrl = escapeHtml(params.cancelUrl);

  const subject = `Bevestiging inschrijving 6 Reds SummER Cup 2026 – ${params.playDayLabel}`;

  const bodyHtml = `<p style="margin:0 0 16px;">Beste ${name},</p>
                <p style="margin:0 0 16px;">Bedankt voor je inschrijving voor de <strong>6 Reds SummER Cup 2026</strong>. Hieronder vind je de gegevens van je inschrijving.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
                  <tr><td style="padding:4px 0;"><strong>Naam:</strong></td><td style="padding:4px 0;">${name}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Speeldag:</strong></td><td style="padding:4px 0;">${playDayLabel}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Aanvang:</strong></td><td style="padding:4px 0;">${PLAY_TIME}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Inschrijvingsgeld:</strong></td><td style="padding:4px 0;">&euro; ${REGISTRATION_FEE}</td></tr>
                </table>
                <h2 style="font-size:16px;margin:24px 0 8px;">Betaling</h2>
                <p style="margin:0 0 16px;">Schrijf het inschrijvingsgeld vóór de speeldag over om je plaats te bevestigen:</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f5;border-radius:8px;padding:16px;margin:0 0 16px;">
                  <tr><td style="padding:4px 16px;"><strong>Begunstigde:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.beneficiary)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>IBAN:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.iban)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>BIC:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.bic)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>Bedrag:</strong></td><td style="padding:4px 16px;">&euro; ${REGISTRATION_FEE}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>Mededeling:</strong></td><td style="padding:4px 16px;">${communication}</td></tr>
                </table>
                <p style="margin:0 0 8px;">Of scan deze QR-code met je bankapp:</p>
                <p style="margin:0 0 16px;"><img src="${qrImageUrl}" alt="Betaal-QR-code" width="200" height="200" style="display:block;border:0;" /></p>
                <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Lukt het scannen niet in je e-mail? De QR-code zit ook als bijlage bij deze mail.</p>
                <p style="margin:24px 0 0;">Tot op de speeldag!<br />Team Play-ER</p>
                <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Kan je toch niet komen? <a href="${cancelUrl}" style="color:#6b7280;text-decoration:underline;">Schrijf je hier uit</a> zodat iemand anders je plaats kan innemen.</p>`;

  return { subject, htmlContent: renderEmailShell({ logoUrl: params.logoUrl, bodyHtml }) };
}

export function buildCancellationEmail(params: {
  name: string;
  playDayLabel: string;
  logoUrl: string;
}): { subject: string; htmlContent: string } {
  const name = escapeHtml(params.name);
  const playDayLabel = escapeHtml(params.playDayLabel);

  const subject = `Uitschrijving 6 Reds SummER Cup 2026 – ${params.playDayLabel}`;

  const bodyHtml = `<p style="margin:0 0 16px;">Beste ${name},</p>
                <p style="margin:0 0 16px;">Je bent uitgeschreven voor de <strong>6 Reds SummER Cup 2026</strong> op <strong>${playDayLabel}</strong>. Je plaats is weer vrijgekomen.</p>
                <p style="margin:0 0 16px;">Van gedacht veranderd? Zolang er plaats is kan je je opnieuw inschrijven via <a href="https://www.play-er.be/6-reds-summer-cup" style="color:#1f2937;">play-er.be/6-reds-summer-cup</a>.</p>
                <p style="margin:0 0 16px;">Vragen? Antwoord gerust op deze e-mail.</p>
                <p style="margin:24px 0 0;">Tot een volgende keer!<br />Team Play-ER</p>`;

  return { subject, htmlContent: renderEmailShell({ logoUrl: params.logoUrl, bodyHtml }) };
}
