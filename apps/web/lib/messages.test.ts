import { describe, expect, it } from "vitest";
import type { Message } from "@/lib/api/types";
import { initials, messageText } from "./messages";

describe("messages", () => {
  it("joins message parts in display order", () => {
    const message: Message = {
      id: "msg_1",
      conversation_id: "conv_1",
      role: "assistant",
      status: "complete",
      content: [
        { type: "markdown", text: "One" },
        { type: "text", text: "Two" }
      ],
      created_at: "2026-06-03T00:00:00.000Z"
    };

    expect(messageText(message)).toBe("One\nTwo");
  });

  it("creates compact initials from display names", () => {
    expect(initials("Samhita Admin")).toBe("SA");
    expect(initials("  workspace   user  ")).toBe("WU");
  });
});
