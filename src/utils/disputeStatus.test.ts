import { describe, it, expect } from "vitest";
import { DISPUTE_STATUS, getDisputeStatusLabel, isDisputeOpen } from "./disputeStatus";

describe("disputeStatus", () => {
  it("getDisputeStatusLabel", () => {
    expect(getDisputeStatusLabel(DISPUTE_STATUS.OPEN)).toBe("Açık");
    expect(getDisputeStatusLabel(DISPUTE_STATUS.REVIEWING)).toBe("İncelemede");
    expect(getDisputeStatusLabel(DISPUTE_STATUS.RESOLVED)).toBe("Çözüldü");
    expect(getDisputeStatusLabel(DISPUTE_STATUS.REJECTED)).toBe("Reddedildi");
  });

  it("isDisputeOpen", () => {
    expect(isDisputeOpen(DISPUTE_STATUS.OPEN)).toBe(true);
    expect(isDisputeOpen(DISPUTE_STATUS.REVIEWING)).toBe(true);
    expect(isDisputeOpen(DISPUTE_STATUS.RESOLVED)).toBe(false);
  });
});
