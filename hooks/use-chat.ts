import { useContext } from "react";
import { ChatContext } from "@/contexts/chat-context";

export function useChat() {
  const user = useContext(ChatContext);
  
  if (user === undefined) {
    console.error("useUser must be used within a ChatContextProvider");
  }

  return user;
}