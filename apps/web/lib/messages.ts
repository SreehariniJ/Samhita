import type { Message, MessagePart } from "@/lib/api/types";

export function partText(part: MessagePart) {
  return part.text ?? "";
}

export function messageText(message: Message) {
  return message.content.map(partText).join("\n");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
