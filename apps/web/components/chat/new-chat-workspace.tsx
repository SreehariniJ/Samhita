"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import { ConversationApi } from "@/lib/api/client";
import { useUserSettings } from "@/hooks/use-settings";
import { Composer } from "./composer";
import { ModelSelector } from "./model-selector";

export function NewChatWorkspace() {
  const router = useRouter();
  const settings = useUserSettings();
  const [modelProfile, setModelProfile] = useState("reasoning");
  const create = useMutation({
    mutationFn: (payload: { text: string; fileIds: string[] }) =>
      ConversationApi.create({
        title: payload.text.trim().slice(0, 120) || "New chat",
        model_profile: modelProfile
      }),
    onSuccess: (conversation, payload) => {
      window.sessionStorage.setItem(
        `pending-chat-${conversation.id}`,
        JSON.stringify({
          text: payload.text,
          fileIds: payload.fileIds,
          modelProfile
        })
      );
      router.push(`/chat/${conversation.id}`);
    }
  });

  useEffect(() => {
    if (settings.data?.default_model_profile) {
      setModelProfile(settings.data.default_model_profile);
    }
  }, [settings.data?.default_model_profile]);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BrainCircuit className="size-4 text-primary" />
          New Chat
        </div>
        <ModelSelector value={modelProfile} onChange={setModelProfile} />
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">Samhita AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Private multimodal assistant</p>
        </div>
      </div>
      <Composer
        streamStatus={create.isPending ? "queued" : "complete"}
        disabled={create.isPending}
        onSubmit={(text, fileIds) => {
          create.mutate({ text, fileIds });
        }}
      />
    </section>
  );
}
