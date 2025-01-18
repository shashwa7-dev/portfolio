"use client";

import React, { useState, useRef, useEffect } from "react";

const TIMEOUT_DURATION = 10000; // 10 seconds
const NOTIFICATION_MESSAGES = [
  "Hello, I'm Truffy!",
  "Your AI assistant.",
  "Got questions? Ask me!",
];
const TYPE_SPEED = 100; // Increased from 50 to 100ms
const MESSAGE_DISPLAY_TIME = 5000; // Time to show full message
const TRANSITION_DELAY = 1000; // Delay before starting new message

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

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Cleanup function for requests and timers
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

  // Handle popup close
  const handleClose = () => {
    cleanup();
    setIsOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    // Cleanup any existing request
    cleanup();

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const userMessage = message;
    setMessage("");

    // Add initial assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Set timeout
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
      // Only update message if not aborted
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

  //notification actions
  // Cleanup function
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
  // Typing effect function
  // Improved typing effect function
  const typeMessage = async (text: string) => {
    setShowNotification(true);
    setNotificationText(""); // Clear previous text

    const typeNextChar = (currentText: string, fullText: string) => {
      if (currentText.length < fullText.length) {
        const nextChar = fullText[currentText.length];
        const newText = currentText + nextChar;
        setNotificationText(newText);

        typingTimerRef.current = setTimeout(() => {
          typeNextChar(newText, fullText);
        }, TYPE_SPEED);
      } else {
        // Full message is typed, wait before starting next message
        timeoutRef.current = setTimeout(() => {
          setShowNotification(false);
          // Wait for fade out, then move to next message
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

  // Handle message cycling
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
      {/* Floating Notification */}
      {!isOpen && (
        <div
          className={`fixed bottom-[85px] -md:bottom-[70px]  right-4 -md:right-2.5 transform transition-all duration-300 ease-in-out
                 ${
                   showNotification
                     ? "opacity-100 translate-y-0"
                     : "opacity-0 translate-y-5"
                 }`}
        >
          <div className="bg-white rounded-md border border-b-4 p-1 px-2 w-fit -md:text-xs text-sm">
            <div className="relative">
              <p className="text-sm text-gray-800">
                {notificationText}
                <span className="ml-1 animate-blink"></span>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? "hidden" : "flex"
        } shadow-md fixed bottom-4 right-4 -md:right-2.5 w-[60px] h-[60px] -md:w-[50px] -md:h-[50px] rounded-lg overflow-hidden border border-s7-gray_graphite border-b-4`}
      >
        <img
          src={"./truffy.jpg"}
          className={
            "w-full h-full object-cover object-center hover:rotate-2 hover:scale-110"
          }
          alt="truffy assistant"
        />
      </button>

      {/* Chat Window */}
      <div
        ref={chatContainerRef}
        className={`${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        } transform transition-all duration-300 ease-in-out
        bg-white rounded-lg shadow-sm border border-b-4 w-96 -md:w-80 max-h-[500px] flex flex-col `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 px-3 border-b">
          <div>
            <div className="flex  items-center gap-1 relative overflow-hidden z-2">
              <div className={`w-[25px] h-[25px] overflow-hidden rounded-lg`}>
                <img
                  src={"./truffy.jpg"}
                  className={"w-full h-full object-cover object-center"}
                  alt="truffy assistant"
                />
              </div>
              <h3 className="font-semibold text-s7-gray300 text-lg translate-y-1 opacity-90 ">
                Truffy AI
              </h3>
            </div>
            <p className="text-xs  text-s7-gray300 text-center">
              Powered by Gemini 3.5 Turbo
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 px-2 text-[0.7rem] border border-b-4 rounded-md hover:bg-gray-100 transition-colors mb-auto"
          >
            Close
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatWindowRef}
          className="flex-1 overflow-y-auto p-3 space-y-4 min-h-[300px] max-h-[360px] scroll-smooth"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-1 text-sm px-2 rounded-md border border-b-4 ${
                msg.role === "user"
                  ? "bg-s7-gray100 border-gray-500 ml-auto"
                  : "bg-white"
              } w-fit max-w-[80%] break-words`}
            >
              {msg.role !== "user" ? (
                <div className={`flex items-center gap-2`}>
                  <img
                    src={"./truffy.jpg"}
                    className={
                      "w-[20px] h-[20px] object-cover object-center rounded-md"
                    }
                    alt="truffy assistant"
                  />
                  {isStreaming ? <span>{"    . . ."}</span> : null}
                </div>
              ) : null}

              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-2 border-t px-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 p-1 border rounded text-sm focus:outline-none"
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
