import { describe, expect, it } from "vitest";
import { createSseDecoder } from "./stream";

describe("createSseDecoder", () => {
  it("decodes event-stream messages split across chunks", () => {
    const messages: Array<{ event: string; data: string }> = [];
    const decoder = createSseDecoder((message) => messages.push(message));

    decoder.push("event: token\ndata: {\"delta\":\"hel");
    decoder.push("lo\"}\n\n");

    expect(messages).toEqual([{ event: "token", data: "{\"delta\":\"hello\"}" }]);
  });

  it("joins multiline data fields and ignores comments", () => {
    const messages: Array<{ event: string; data: string }> = [];
    const decoder = createSseDecoder((message) => messages.push(message));

    decoder.push(": keepalive\nevent: citation\ndata: {\"a\":1}\ndata: {\"b\":2}\n\n");

    expect(messages).toEqual([{ event: "citation", data: "{\"a\":1}\n{\"b\":2}" }]);
  });

  it("flushes a final message without a trailing boundary", () => {
    const messages: Array<{ event: string; data: string }> = [];
    const decoder = createSseDecoder((message) => messages.push(message));

    decoder.push("event: message.completed\ndata: {\"finish_reason\":\"stop\"}");
    decoder.flush();

    expect(messages).toEqual([{ event: "message.completed", data: "{\"finish_reason\":\"stop\"}" }]);
  });
});
