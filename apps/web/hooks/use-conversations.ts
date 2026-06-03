"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChatApi, ConversationApi } from "@/lib/api/client";
import type { CreateConversationRequest, UpdateConversationRequest } from "@/lib/api/types";

export function useConversations(archived = false) {
  return useQuery({
    queryKey: ["conversations", { archived }],
    queryFn: () => ConversationApi.list({ archived, limit: 100 })
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => ConversationApi.get(conversationId as string),
    enabled: Boolean(conversationId)
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => ConversationApi.messages(conversationId as string, { limit: 200 }),
    enabled: Boolean(conversationId)
  });
}

export function useCreateConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateConversationRequest) => ConversationApi.create(request),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${conversation.id}`);
    },
    onError: () => toast.error("Conversation could not be created")
  });
}

export function useUpdateConversation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateConversationRequest) => ConversationApi.update(conversationId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Conversation could not be updated")
  });
}

export function useDeleteConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => ConversationApi.remove(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push("/chat");
    },
    onError: () => toast.error("Conversation could not be deleted")
  });
}

export function useConversationSearch(query: string) {
  return useQuery({
    queryKey: ["conversation-search", query],
    queryFn: () => ConversationApi.search({ query, limit: 30 }),
    enabled: query.trim().length > 0
  });
}

export function useGenerateTitle(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ChatApi.title(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
}
