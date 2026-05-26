"use client";

import React, { useState, useRef, useEffect } from "react";
import { SVGS } from "./SVGS";
import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TIMEOUT_DURATION = 10000;
const NOTIFICATION_MESSAGES = [
  "Hello, Its Truffy!.",
  "Got questions? Ask me!",
];
const TYPE_SPEED = 100;
const MESSAGE_DISPLAY_TIME = 5000;
const TRANSITION_DELAY = 1000;

interface EmailState {
  step: "email" | "subject" | "body" | "verify";
  data: {
    email?: string;
    subject?: string;
    body?: string;
  };
}

const S7Bot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [emailState, setEmailState] = useState<EmailState | null>(null);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleClose = () => {
    cleanup();
    setIsOpen(false);
    setEmailState(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || isStreaming) return;

    cleanup();

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setMessage("");

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    timeoutRef.current = setTimeout(() => {
      cleanup();
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Request timed out. Please try again." },
      ]);
    }, TIMEOUT_DURATION);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          model: "gemini-pro",
          emailState: emailState,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Stream error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.done) {
                return;
              }

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.emailState !== undefined) {
                setEmailState(data.emailState);
              }

              if (data.text) {
                accumulatedContent += data.text;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: "assistant", content: accumulatedContent },
                ]);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Stream error:", error);
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              "Sorry, there was an error generating the response. Please try again.",
          },
        ]);
      }
    } finally {
      cleanup();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  const _cleanup_notification = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setNotificationText("");
    setShowNotification(false);
  };

  const typeMessage = async (text: string) => {
    setShowNotification(true);
    setNotificationText("");

    const typeNextChar = (currentText: string, fullText: string) => {
      if (currentText.length < fullText.length) {
        const nextChar = fullText[currentText.length];
        const newText = currentText + nextChar;
        setNotificationText(newText);

        typingTimerRef.current = setTimeout(() => {
          typeNextChar(newText, fullText);
        }, TYPE_SPEED);
      } else {
        timeoutRef.current = setTimeout(() => {
          setShowNotification(false);
          setTimeout(() => {
            setCurrentMessageIndex(
              (prev) => (prev + 1) % NOTIFICATION_MESSAGES.length
            );
          }, TRANSITION_DELAY);
        }, MESSAGE_DISPLAY_TIME);
      }
    };

    typeNextChar("", text);
  };

  useEffect(() => {
    if (isOpen) {
      _cleanup_notification();
      return;
    }

    const startNewMessage = () => {
      _cleanup_notification();
      const nextMessage = NOTIFICATION_MESSAGES[currentMessageIndex];
      typeMessage(nextMessage);
    };

    startNewMessage();

    return () => _cleanup_notification();
  }, [currentMessageIndex, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 -md:right-2.5 z-50">
      {/* Notification bubble */}
      <AnimatePresence>
        {!isOpen && showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[60px] right-4 -md:right-2.5 -md:hidden"
          >
            <div className="bg-card rounded-lg border shadow-lg px-3 py-2 max-w-[200px]">
              <p className="text-xs text-card-foreground">
                {notificationText}
                <span className="ml-0.5 animate-blink">|</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 -md:right-2.5 w-11 h-11 rounded-xl overflow-hidden border-2 border-border shadow-lg hover:shadow-xl transition-shadow bg-card"
          >
            <img
              src={"./truffycc.png"}
              className="w-full h-full object-cover object-center hover:scale-110 transition-transform"
              alt="truffy assistant"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card rounded-xl shadow-xl border w-80 max-h-[500px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 overflow-hidden rounded-lg">
                  <img
                    src={"./truffycc.png"}
                    className="w-full h-full object-cover object-center"
                    alt="portfolio assistant"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-tight">
                    Truffy
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div
              ref={chatWindowRef}
              className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[280px] max-h-[340px]"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about Shashwat!
                  </p>
                  
                  {/* Sample prompts */}
                  <div className="w-full space-y-2">
                    {[
                      "What tech stack does Shashwat use?",
                      "Tell me about his work experience",
                      "What projects has he built?",
                    ].map((prompt, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => sendMessage(prompt)}
                        className="w-full text-left px-3 py-2.5 text-xs rounded-lg border border-border hover:bg-secondary/50 hover:border-accent/30 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.role !== "user" && !msg.content && isStreaming && (
                      <span className="text-muted-foreground">Thinking...</span>
                    )}
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t bg-secondary/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    emailState ? "Type your response..." : "Ask a question..."
                  }
                  disabled={isStreaming}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  disabled={isStreaming || !message.trim()}
                  size="sm"
                  className="px-4"
                >
                  {isStreaming ? "..." : "Send"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default S7Bot;
