"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { ChatApi } from "@/lib/api/client";
import type { ChatCompletionRequest, MessagePart } from "@/lib/api/types";
import { useChatStore } from "@/store/chat-store";

type SendOptions = {
  text: string;
  fileIds: string[];
  modelProfile?: string;
  retrievalEnabled?: boolean;
  streamingEnabled?: boolean;
};

export function useChatStream(conversationId: string) {
  const queryClient = useQueryClient();
  const addLocalMessage = useChatStore((state) => state.addLocalMessage);
  const replaceLocalMessageId = useChatStore((state) => state.replaceLocalMessageId);
  const replaceAssistantMessage = useChatStore((state) => state.replaceAssistantMessage);
  const appendAssistantDelta = useChatStore((state) => state.appendAssistantDelta);
  const setAssistantStatus = useChatStore((state) => state.setAssistantStatus);
  const addCitation = useChatStore((state) => state.addCitation);
  const setStreamState = useChatStore((state) => state.setStreamState);
  const abort = useChatStore((state) => state.abort);
  const streamState = useChatStore((state) => state.streamByConversation[conversationId]);

  const send = useCallback(
    async ({ text, fileIds, modelProfile, retrievalEnabled = true, streamingEnabled = true }: SendOptions) => {
      const trimmed = text.trim();
      if (!trimmed && fileIds.length === 0) {
        return;
      }

      const now = new Date().toISOString();
      const localUserId = `local_user_${crypto.randomUUID()}`;
      const localAssistantId = `local_assistant_${crypto.randomUUID()}`;
      const abortController = new AbortController();
      const content: MessagePart[] = trimmed ? [{ type: "text", text: trimmed }] : [];

      addLocalMessage(conversationId, {
        id: localUserId,
        conversation_id: conversationId,
        role: "user",
        status: "complete",
        content,
        file_ids: fileIds,
        citation_ids: [],
        created_at: now,
        local: true
      });
      addLocalMessage(conversationId, {
        id: localAssistantId,
        conversation_id: conversationId,
        role: "assistant",
        status: "queued",
        content: [{ type: "markdown", text: "" }],
        file_ids: [],
        citation_ids: [],
        created_at: now,
        local: true
      });
      setStreamState(conversationId, { status: "queued", assistantMessageId: localAssistantId, abortController });

      const request: ChatCompletionRequest = {
        conversation_id: conversationId,
        message: {
          content,
          file_ids: fileIds
        },
        model_profile: modelProfile,
        retrieval: {
          enabled: retrievalEnabled
        }
      };

      try {
        if (!streamingEnabled) {
          const response = await ChatApi.complete(request);
          replaceAssistantMessage(conversationId, localAssistantId, response.message, response.citations);
          setStreamState(conversationId, { status: "complete", assistantMessageId: response.message.id, abortController: undefined });
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          return;
        }

        await ChatApi.stream(
          request,
          {
            onEvent: (event) => {
              if (event.event === "message.created") {
                replaceLocalMessageId(conversationId, localAssistantId, event.data.message_id);
                setStreamState(conversationId, { status: "streaming", assistantMessageId: event.data.message_id });
              }
              if (event.event === "retrieval.started") {
                setStreamState(conversationId, {
                  status: "streaming",
                  retrieval: { queryId: event.data.query_id }
                });
              }
              if (event.event === "retrieval.completed") {
                setStreamState(conversationId, {
                  status: "streaming",
                  retrieval: {
                    queryId: event.data.query_id,
                    candidateCount: event.data.candidate_count,
                    citationCount: event.data.citation_count
                  }
                });
              }
              if (event.event === "token") {
                const state = useChatStore.getState().streamByConversation[conversationId];
                appendAssistantDelta(conversationId, state?.assistantMessageId ?? localAssistantId, event.data.delta);
              }
              if (event.event === "citation") {
                const state = useChatStore.getState().streamByConversation[conversationId];
                addCitation(conversationId, state?.assistantMessageId ?? localAssistantId, event.data);
              }
              if (event.event === "message.completed") {
                setAssistantStatus(conversationId, event.data.message_id, "complete", event.data.token_usage);
                setStreamState(conversationId, { status: "complete", abortController: undefined });
                queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
              }
              if (event.event === "error") {
                const state = useChatStore.getState().streamByConversation[conversationId];
                setAssistantStatus(conversationId, state?.assistantMessageId ?? localAssistantId, "failed");
                setStreamState(conversationId, { status: "failed", abortController: undefined });
                toast.error(event.data.message);
              }
            },
            onError: () => {
              setAssistantStatus(conversationId, localAssistantId, "failed");
            }
          },
          abortController.signal
        );
      } catch (error) {
        if (abortController.signal.aborted) {
          const state = useChatStore.getState().streamByConversation[conversationId];
          setAssistantStatus(conversationId, state?.assistantMessageId ?? localAssistantId, "interrupted");
          setStreamState(conversationId, { status: "interrupted", abortController: undefined });
          return;
        }
        setAssistantStatus(conversationId, localAssistantId, "failed");
        setStreamState(conversationId, { status: "failed", abortController: undefined });
        toast.error(error instanceof Error ? error.message : "Response failed");
      }
    },
    [addCitation, addLocalMessage, appendAssistantDelta, conversationId, queryClient, replaceAssistantMessage, replaceLocalMessageId, setAssistantStatus, setStreamState]
  );

  return {
    send,
    stop: () => abort(conversationId),
    status: streamState?.status ?? "complete",
    retrieval: streamState?.retrieval
  };
}
