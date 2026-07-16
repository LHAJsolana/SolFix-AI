import { describe, expect, it } from "vitest";
import { parseExplanationJson } from "./output-validator";

describe("parseExplanationJson", () => {
  it("accepts valid provider output", () => {
    const result = parseExplanationJson(
      JSON.stringify({ userExplanation: "User", developerExplanation: "Developer", limitations: "Evidence only." }),
      "openai"
    );
    expect(result.provider).toBe("openai");
  });

  it("rejects invalid provider output", () => {
    expect(() => parseExplanationJson(JSON.stringify({ userExplanation: "Missing developer field" }), "anthropic")).toThrow(/schema/);
  });
});
