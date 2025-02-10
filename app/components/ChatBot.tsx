"use client";

import React, { useState, useRef, useEffect } from "react";
import { SVGS } from "./SVGS";

const TIMEOUT_DURATION = 10000;
const NOTIFICATION_MESSAGES = [
  "Hello, I'm Truffy!",
  "Your AI assistant.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    cleanup();

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const userMessage = message;
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
          message: userMessage,
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
      {!isOpen && (
        <div
          className={`fixed bottom-[85px] -md:bottom-[70px] right-4 -md:right-2.5 transform transition-all duration-300 ease-in-out
                 ${
                   showNotification
                     ? "opacity-100 translate-y-0"
                     : "opacity-0 translate-y-5"
                 }`}
        >
          <div className="bg-card rounded-md border border-b-4 p-1 px-2 w-fit -md:text-xs text-sm">
            <div className="relative">
              <p className="text-sm text-card-foreground">
                {notificationText}
                <span className="ml-1 animate-blink"></span>
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? "hidden" : "flex"
        } shadow-sm fixed bottom-4 right-4 -md:right-2.5 w-[60px] h-[60px] -md:w-[50px] -md:h-[50px] rounded-lg overflow-hidden border-2`}
      >
        <img
          src={"./truffy.jpg"}
          className="w-full h-full object-cover object-center hover:rotate-2 hover:scale-110"
          alt="truffy assistant"
        />
      </button>

      <div
        ref={chatContainerRef}
        className={`${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        } transform transition-all duration-300 ease-in-out
        bg-card rounded-lg shadow-sm border border-b-4 w-80 max-h-[500px] flex flex-col`}
      >
        <div className="flex items-center justify-between p-2 px-3 border-b">
          <div>
            <div className="flex items-center gap-1 relative overflow-hidden z-2">
              <div className="w-[25px] h-[25px] overflow-hidden rounded-lg">
                <img
                  src={"./truffy.jpg"}
                  className="w-full h-full object-cover object-center"
                  alt="truffy assistant"
                />
              </div>
              <h3 className="text-secondary-foreground text-lg opacity-90 font-sans">
                Truffy AI
              </h3>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Powered by Gemini 3.5 Turbo
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-[0.7rem] border border-b-4 rounded-md hover:bg-muted transition-colors mb-auto flex items-center"
          >
            <p>Close</p>
            <SVGS.Close className="w-3 h-3" />
          </button>
        </div>

        <div
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 min-h-[300px] max-h-[360px] scroll-smooth"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-1 text-sm px-2 rounded-md border ${
                msg.role === "user" ? "bg-secondary ml-auto" : "bg-primary"
              } w-fit max-w-[80%] break-words`}
            >
              {msg.role !== "user" && (
                <div className="flex items-center gap-2">
                  <img
                    src={"./truffy.jpg"}
                    className="w-[20px] h-[20px] object-cover object-center rounded-md"
                    alt="truffy assistant"
                  />
                  {isStreaming && <span>{"    . . ."}</span>}
                </div>
              )}
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-2 border-t px-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                emailState ? "Type your response..." : "Type your message..."
              }
              disabled={isStreaming}
              className="flex-1 p-1 border rounded text-sm bg-input focus:outline-none placeholder-secondary-foreground"
            />
            <button
              type="submit"
              disabled={isStreaming || !message.trim()}
              className="p-1 px-2 border border-b-4 rounded text-sm disabled:opacity-50 transition-all"
            >
              {isStreaming ? ". . ." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default S7Bot;
