import { describe, expect, it } from "vitest";
import { buildCommunication, buildEpcQrPayload } from "../shared/summerCup/epc";

describe("EPC QR builders", () => {
  it("builds the payment communication", () => {
    expect(buildCommunication("Jan Janssens", "wo 17 juni 2026")).toBe(
      "6RSC Jan Janssens - wo 17 juni 2026"
    );
  });

  it("trims the name in the communication", () => {
    expect(buildCommunication("  Jan  ", "wo 17 juni 2026")).toBe("6RSC Jan - wo 17 juni 2026");
  });

  it("builds an EPC069-12 v2 payload", () => {
    const payload = buildEpcQrPayload({
      name: "Jan Janssens",
      shortLabel: "wo 17 juni 2026",
      amount: 15,
    });
    expect(payload).toBe(
      [
        "BCD",
        "002",
        "1",
        "SCT",
        "GKCCBEBB",
        "Beckers Steff",
        "BE30063766394611",
        "EUR15.00",
        "",
        "",
        "6RSC Jan Janssens - wo 17 juni 2026",
      ].join("\n")
    );
  });
});
