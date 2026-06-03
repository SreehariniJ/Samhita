"use client";

import { create } from "zustand";
import type { Citation, Message, MessageStatus, TokenUsage } from "@/lib/api/types";

export type LocalMessage = Message & {
  local?: boolean;
  citations?: Citation[];
  token_usage?: TokenUsage;
};

type ConversationStreamState = {
  status: MessageStatus;
  assistantMessageId?: string;
  retrieval?: {
    queryId?: string;
    candidateCount?: number;
    citationCount?: number;
  };
  abortController?: AbortController;
};

type ChatState = {
  localMessagesByConversation: Record<string, LocalMessage[]>;
  streamByConversation: Record<string, ConversationStreamState>;
  addLocalMessage: (conversationId: string, message: LocalMessage) => void;
  replaceLocalMessageId: (conversationId: string, localId: string, messageId: string) => void;
  appendAssistantDelta: (conversationId: string, messageId: string, delta: string) => void;
  setAssistantStatus: (conversationId: string, messageId: string, status: MessageStatus, tokenUsage?: TokenUsage) => void;
  addCitation: (conversationId: string, messageId: string, citation: Citation) => void;
  setStreamState: (conversationId: string, state: Partial<ConversationStreamState>) => void;
  clearConversationLocal: (conversationId: string) => void;
  abort: (conversationId: string) => void;
};

function markdownPart(text: string) {
  return [{ type: "markdown" as const, text }];
}

export const useChatStore = create<ChatState>((set, get) => ({
  localMessagesByConversation: {},
  streamByConversation: {},
  addLocalMessage: (conversationId, message) =>
    set((state) => ({
      localMessagesByConversation: {
        ...state.localMessagesByConversation,
        [conversationId]: [...(state.localMessagesByConversation[conversationId] ?? []), message]
      }
    })),
  replaceLocalMessageId: (conversationId, localId, messageId) =>
    set((state) => ({
      localMessagesByConversation: {
        ...state.localMessagesByConversation,
        [conversationId]: (state.localMessagesByConversation[conversationId] ?? []).map((message) =>
          message.id === localId ? { ...message, id: messageId, local: false } : message
        )
      }
    })),
  appendAssistantDelta: (conversationId, messageId, delta) =>
    set((state) => {
      const messages = state.localMessagesByConversation[conversationId] ?? [];
      const exists = messages.some((message) => message.id === messageId);
      const nextMessages = exists
        ? messages.map((message) => {
            if (message.id !== messageId) return message;
            const current = message.content.find((part) => part.type === "markdown" || part.type === "text")?.text ?? "";
            return { ...message, status: "streaming" as const, content: markdownPart(current + delta) };
          })
        : [
            ...messages,
            {
              id: messageId,
              conversation_id: conversationId,
              role: "assistant" as const,
              status: "streaming" as const,
              content: markdownPart(delta),
              citation_ids: [],
              file_ids: [],
              created_at: new Date().toISOString(),
              local: true
            }
          ];

      return {
        localMessagesByConversation: {
          ...state.localMessagesByConversation,
          [conversationId]: nextMessages
        }
      };
    }),
  setAssistantStatus: (conversationId, messageId, status, tokenUsage) =>
    set((state) => ({
      localMessagesByConversation: {
        ...state.localMessagesByConversation,
        [conversationId]: (state.localMessagesByConversation[conversationId] ?? []).map((message) =>
          message.id === messageId ? { ...message, status, token_usage: tokenUsage } : message
        )
      },
      streamByConversation: {
        ...state.streamByConversation,
        [conversationId]: {
          ...(state.streamByConversation[conversationId] ?? { status }),
          status
        }
      }
    })),
  addCitation: (conversationId, messageId, citation) =>
    set((state) => ({
      localMessagesByConversation: {
        ...state.localMessagesByConversation,
        [conversationId]: (state.localMessagesByConversation[conversationId] ?? []).map((message) => {
          if (message.id !== messageId) return message;
          const citationIds = new Set([...(message.citation_ids ?? []), citation.id]);
          const citations = [...(message.citations ?? []).filter((item) => item.id !== citation.id), citation];
          return { ...message, citation_ids: Array.from(citationIds), citations };
        })
      }
    })),
  setStreamState: (conversationId, state) =>
    set((current) => ({
      streamByConversation: {
        ...current.streamByConversation,
        [conversationId]: {
          status: "queued",
          ...(current.streamByConversation[conversationId] ?? {}),
          ...state
        }
      }
    })),
  clearConversationLocal: (conversationId) =>
    set((state) => {
      const next = { ...state.localMessagesByConversation };
      delete next[conversationId];
      return { localMessagesByConversation: next };
    }),
  abort: (conversationId) => {
    get().streamByConversation[conversationId]?.abortController?.abort();
    set((state) => ({
      streamByConversation: {
        ...state.streamByConversation,
        [conversationId]: {
          ...(state.streamByConversation[conversationId] ?? { status: "interrupted" }),
          status: "interrupted",
          abortController: undefined
        }
      }
    }));
  }
}));
