"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { ChatRequestOptions, DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import ChatSplitView from "../../_components/chat-split-view";
import { UploadedDocument } from "../../page";
import { useChatContext } from "@/hooks/use-chat-context";
import { toast } from "sonner";
import { syncHeadMessage } from "../../actions/chat-actions";
import type { BranchMessage } from "../page";
import type { BranchMeta } from "../../_components/chat-split-view";
import { useMessageTree } from "@/hooks/use-message-tree";

interface UserConfig {
  useCase: string;
  preference: string;
  strictness: string;
}

interface ChatInterfaceProps {
  chatId: string;
  headMessageId: string;
  initialMessages: BranchMessage[];
  document: UploadedDocument;
}

// Convert database messages to UIMessage format for useChat
function convertToUIMessages(dbMessages: BranchMessage[]): UIMessage[] {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text" as const, text: msg.content }],
    metadata: { createdAt: new Date(msg.created_at) },
  }));
}

export default function ChatInterface({
  chatId,
  headMessageId,
  initialMessages,
  document,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [input, setInput] = useState("");

  // User Configs
  const user = useChatContext();
  const userConfig: UserConfig = {
    useCase: user?.useCase || "general",
    preference: user?.responsePreference || "detailed",
    strictness: user?.strictnessLevel || "balanced",
  };

  const {
    buildTreeFromDatabase,
    switchBranch,
    branchMeta,
    activeBranch,
    insertMessage,
    reconcileIds,
  } = useMessageTree();

  useEffect(() => {
    if (initialMessages.length > 0) {
      buildTreeFromDatabase(initialMessages, headMessageId);
    }
  }, []);

  const {
    messages,
    sendMessage,
    status,
    setMessages,
    error,
    regenerate,
    stop,
  } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onData: ({ data, type }) => {
      // Handle custom error events from stream
      const lastMsg = messages[messages.length - 1];
      const textParts = lastMsg?.parts?.filter(
        (part) => part.type === "text",
      ) as { text: string }[];
      const content = textParts?.map((part) => part.text).join(" ") || "";

      if (type === "data-error") {
        const errorData = data as { message: string; code: string };
        console.error("[Chat] Stream error:", errorData);
        toast.error("Error", { description: errorData.message });
      }
      if (type === "data-messages_saved") {
        const { tempId, userMsg, assistantMsg } = data as {
          tempId: string;
          userMsg: { id: string; parent_id: string };
          assistantMsg: { id: string; parent_id: string };
        };
        reconcileIds(tempId, userMsg.id);
        insertMessage({
          id: assistantMsg.id,
          chat_id: chatId,
          role: "assistant",
          content: content,
          created_at: new Date().toISOString(),
          parent_id: assistantMsg.parent_id,
        });
      }
      if (type === "data-message_regenerated") {
        console.log("[onData] data-message_regenerated received", data);
        const { assistantMsg } = data as {
          assistantMsg: { id: string; parent_id: string };
        };
        insertMessage({
          id: assistantMsg.id,
          chat_id: chatId,
          role: "assistant",
          content: content,
          created_at: new Date().toISOString(),
          parent_id: assistantMsg.parent_id,
        });
      }
    },
    onError: (err) => {
      console.error("[Chat] Error:", err);
      toast.error("Error", {
        description: err.message || "Failed to send message. Please try again.",
      });
    },
  });

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      console.error("[Chat] Hook error:", error);
      toast.error("Error", {
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }, [error]);

  useEffect(() => {
    if (status === "ready" && activeBranch.length > 0) {
      setMessages(convertToUIMessages(activeBranch));
    }
  }, [activeBranch]);

  // HANDLE BRANCH SWITCHING
  const handleSwitchBranch = async (messageId: string) => {
    switchBranch(messageId);
    syncHeadMessage(chatId, messageId);
  };

  // HANDLE MESSAGE SUBMISSION
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempId = crypto.randomUUID();
    insertMessage({
      id: tempId,
      chat_id: chatId,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
      parent_id: activeBranch[activeBranch.length - 1].id,
    });

    sendMessage(
      { parts: [{ type: "text", text: input }] },
      {
        body: {
          tempId,
          chatId,
          docId: document.id,
          config: userConfig,
        },
      },
    );
    setInput("");
  };

  // HANDLE DOCUMENT DELETION
  const handleDeleteDocument = () => {
    router.push("/c");
  };

  const handleRegeneration = async (opts?: ChatRequestOptions) => {
    await regenerate({
      ...opts,
      body: {
        chatId,
        docId: document.id,
        config: userConfig,
      },
    });
  };

  return (
    <ChatSplitView
      document={document}
      onDeleteDoc={handleDeleteDocument}
      messages={
        status === "ready" ? convertToUIMessages(activeBranch) : messages
      }
      input={input}
      handleInputChange={(e) => setInput(e.target.value)}
      handleSubmit={handleSubmit}
      disableButton={status !== "ready" || input.trim() === ""}
      status={status}
      regenerate={handleRegeneration}
      branchMeta={branchMeta}
      onSwitchBranch={handleSwitchBranch}
      onStop={stop}
    />
  );
}
