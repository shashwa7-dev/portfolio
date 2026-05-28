"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Check,
  ArrowDown,
  Cpu,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MarkdownMessage from "./chat/MarkdownMessage";
import { cn } from "@/lib/utils";
import {
  popoverUpVariants,
  fabPopVariants,
  chatWindowVariants,
  slideUpVariants,
  pillUpVariants,
  hoverLiftRotate,
  hoverZoom,
  tapPress,
  spring,
} from "@/lib/motionVariants";

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

  // Auto-scroll lock — only nudge to bottom when the user is already there.
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Track whether the user is pinned to the bottom (within 24px slack).
  const onMessagesScroll = () => {
    const el = chatWindowRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // ignore
    }
  };

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
            variants={popoverUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-[60px] right-4 -md:right-2.5 -md:hidden"
          >
            <div className="rounded-xl border border-border-strong bg-card shadow-md px-3 py-2 max-w-[200px]">
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
            variants={fabPopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={hoverLiftRotate}
            whileTap={tapPress}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 -md:right-2.5 h-12 w-12 rounded-2xl overflow-hidden ring-1 ring-border-strong shadow-lg bg-card"
          >
            <motion.img
              src={"./truffycc.png"}
              alt="truffy assistant"
              className="w-full h-full object-cover object-center"
              whileHover={hoverZoom}
              transition={spring.hoverIn}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[360px] max-h-[520px] rounded-2xl border border-border bg-elevated shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-9 overflow-hidden rounded-xl flex-shrink-0">
                  <img
                    src={"./truffycc.png"}
                    className="w-full h-full object-cover object-center"
                    alt="portfolio assistant"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                </div>
                <div>
                  <h3 className="font-serif text-[15px] leading-tight text-foreground">
                    Truffy
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-subtle">
                    Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 hover:bg-elevated text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="relative flex-1">
              <div
                ref={chatWindowRef}
                onScroll={onMessagesScroll}
                className="h-full overflow-y-auto p-3 space-y-3 min-h-[280px] max-h-[340px]"
              >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center mb-2">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about Shashwat!
                  </p>

                  {/* Sample prompts */}
                  <div className="w-full space-y-2">
                    {[
                      {
                        prompt: "What tech stack does Shashwat use?",
                        Icon: Cpu,
                      },
                      {
                        prompt: "Tell me about his work experience",
                        Icon: Briefcase,
                      },
                      {
                        prompt: "What projects has he built?",
                        Icon: Sparkles,
                      },
                    ].map(({ prompt, Icon }, idx) => (
                      <motion.button
                        key={idx}
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => sendMessage(prompt)}
                        className="w-full flex items-center gap-2 text-left rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground transition-all"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                        <span>{prompt}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                const isStreamingThis = isStreaming && isLast && msg.role === "assistant";
                const showThinking =
                  msg.role === "assistant" && !msg.content && isStreaming;
                const showCopy =
                  msg.role === "assistant" && !!msg.content && !isStreamingThis;
                return (
                  <motion.div
                    key={index}
                    variants={slideUpVariants}
                    initial="hidden"
                    animate="visible"
                    className={`group/msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={cn(
                        "relative px-3 py-2 text-sm max-w-[85%]",
                        msg.role === "user"
                          ? "bg-accent text-accent-foreground rounded-2xl rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md"
                      )}
                    >
                      {showThinking ? (
                        <TypingDots />
                      ) : msg.role === "assistant" ? (
                        <>
                          <MarkdownMessage content={msg.content} />
                          {isStreamingThis && (
                            <span className="ml-0.5 inline-block h-3 w-[2px] -mb-0.5 animate-blink bg-accent align-baseline" />
                          )}
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}

                      {showCopy && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, index)}
                          aria-label="Copy message"
                          className={cn(
                            "absolute -bottom-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-opacity hover:text-foreground",
                            copiedIndex === index
                              ? "opacity-100 text-accent"
                              : "opacity-0 group-hover/msg:opacity-100"
                          )}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
              </div>

              {/* New messages pill — appears when user is scrolled up while content arrives */}
              <AnimatePresence>
                {!isAtBottom && messages.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      scrollToBottom();
                      setIsAtBottom(true);
                    }}
                    variants={pillUpVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground shadow-md hover:text-foreground"
                  >
                    <ArrowDown className="h-3 w-3" /> New messages
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    emailState ? "Type your response..." : "Ask a question..."
                  }
                  disabled={isStreaming}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !message.trim()}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Three pulsing dots, shown in the assistant bubble while waiting for the first token. */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-label="Truffy is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70"
          style={{
            animation: "chatDotPulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes chatDotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </span>
  );
}

export default S7Bot;
