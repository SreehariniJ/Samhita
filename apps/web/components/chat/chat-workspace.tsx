"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConversation, useMessages } from "@/hooks/use-conversations";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useUserSettings } from "@/hooks/use-settings";
import { getErrorMessage } from "@/lib/api/errors";
import { messageText } from "@/lib/messages";
import type { LocalMessage } from "@/store/chat-store";
import { useChatStore } from "@/store/chat-store";
import { ErrorPanel } from "@/components/states/error-panel";
import { LoadingCard } from "@/components/states/loading-card";
import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";

type PendingChatPayload = {
  text: string;
  fileIds: string[];
  modelProfile?: string;
};

export function ChatWorkspace({ conversationId }: { conversationId: string }) {
  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const settings = useUserSettings();
  const localMessages = useChatStore((state) => state.localMessagesByConversation[conversationId] ?? []);
  const clearLocal = useChatStore((state) => state.clearConversationLocal);
  const { send, stop, status } = useChatStream(conversationId);
  const [modelProfile, setModelProfile] = useState("reasoning");
  const pendingSent = useRef(false);

  useEffect(() => {
    if (settings.data?.default_model_profile) {
      setModelProfile(settings.data.default_model_profile);
    }
  }, [settings.data?.default_model_profile]);

  useEffect(() => {
    if (conversation.data?.model_profile) {
      setModelProfile(conversation.data.model_profile);
    }
  }, [conversation.data?.model_profile]);

  useEffect(() => {
    if (pendingSent.current) return;
    const raw = window.sessionStorage.getItem(`pending-chat-${conversationId}`);
    if (!raw) return;
    pendingSent.current = true;
    window.sessionStorage.removeItem(`pending-chat-${conversationId}`);
    const payload = JSON.parse(raw) as PendingChatPayload;
    setModelProfile(payload.modelProfile ?? modelProfile);
    send({
      text: payload.text,
      fileIds: payload.fileIds,
      modelProfile: payload.modelProfile ?? modelProfile,
      retrievalEnabled: true
    });
  }, [conversationId, modelProfile, send]);

  useEffect(() => {
    if (!messages.data || status !== "complete" || !localMessages.length) return;
    const hasActiveLocal = localMessages.some((message) => message.status === "queued" || message.status === "streaming");
    if (hasActiveLocal) return;
    const timer = window.setTimeout(() => clearLocal(conversationId), 900);
    return () => window.clearTimeout(timer);
  }, [clearLocal, conversationId, localMessages, messages.data, status]);

  const mergedMessages = useMemo(() => {
    const map = new Map<string, LocalMessage>();
    for (const message of messages.data?.items ?? []) {
      map.set(message.id, message);
    }
    for (const message of localMessages) {
      map.set(message.id, message);
    }
    return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [localMessages, messages.data?.items]);

  const retry = (assistantMessage: LocalMessage) => {
    const index = mergedMessages.findIndex((message) => message.id === assistantMessage.id);
    const previousUser = mergedMessages
      .slice(0, index)
      .reverse()
      .find((message) => message.role === "user");
    if (!previousUser) return;
    send({
      text: messageText(previousUser),
      fileIds: previousUser.file_ids ?? [],
      modelProfile,
      retrievalEnabled: true
    });
  };

  if (conversation.isLoading || messages.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <LoadingCard label="Loading conversation" />
      </div>
    );
  }

  if (conversation.error || messages.error || !conversation.data) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ErrorPanel
          title="Conversation unavailable"
          description={getErrorMessage(conversation.error ?? messages.error)}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <ConversationHeader conversation={conversation.data} modelProfile={modelProfile} onModelProfileChange={setModelProfile} />
      <div className="min-h-0 flex-1">
        <MessageList messages={mergedMessages} onRetry={retry} onStop={stop} streamStatus={status} />
      </div>
      <Composer
        streamStatus={status}
        onStop={stop}
        onSubmit={(text, fileIds) =>
          send({
            text,
            fileIds,
            modelProfile,
            retrievalEnabled: true
          })
        }
      />
    </section>
  );
}
