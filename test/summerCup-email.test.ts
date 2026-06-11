import { describe, expect, it } from "vitest";
import { buildConfirmationEmail } from "../shared/summerCup/email";

describe("buildConfirmationEmail", () => {
  const email = buildConfirmationEmail({
    name: "Jan Janssens",
    playDayLabel: "Toernooi 1 — woensdag 17 juni 2026",
    communication: "6RSC Jan Janssens - wo 17 juni 2026",
    qrImageUrl: "https://www.play-er.be/api/6-reds-summer-cup/registrations/1/qr.png",
  });

  it("puts the play day in the subject", () => {
    expect(email.subject).toContain("Toernooi 1 — woensdag 17 juni 2026");
    expect(email.subject).toContain("6 Reds SummER Cup 2026");
  });

  it("includes name, communication, IBAN and the QR image url in the body", () => {
    expect(email.htmlContent).toContain("Jan Janssens");
    expect(email.htmlContent).toContain("6RSC Jan Janssens - wo 17 juni 2026");
    expect(email.htmlContent).toContain("BE30 0637 6639 4611");
    expect(email.htmlContent).toContain(
      "https://www.play-er.be/api/6-reds-summer-cup/registrations/1/qr.png"
    );
  });
});
