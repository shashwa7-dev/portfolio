import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateLastMessage = (message: Message) => {
    setMessages((prev) => [...prev.slice(0, -1), message]);
  };

  return {
    messages,
    addMessage,
    updateLastMessage,
  };
}
