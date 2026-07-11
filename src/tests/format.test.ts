import { describe, expect, it } from "vitest";
import { formatDateTime, formatNumber } from "../utils/format";

describe("format helpers", () => {
  it("formatuje liczby po polsku", () => {
    expect(formatNumber(41.666, 2)).toBe("41,67");
  });

  it("nie pokazuje zbędnych miejsc po przecinku", () => {
    expect(formatNumber(4, 2)).toBe("4");
  });

  it("zwraca pusty tekst dla błędnej daty", () => {
    expect(formatDateTime("nie-data")).toBe("");
  });
});
