"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getLocalChatHistory,
  saveLocalChatMessage,
  clearChatHistory,
  generateMockCompanionResponse,
  ChatMessage,
} from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  Trash2,
  Search,
  MessageSquarePlus,
  Smile,
  ArrowDownCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentCompanionEmotion, setCurrentCompanionEmotion] = useState("Empathetic Presence");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "I'm feeling swamped and anxious today.",
    "Give me a gentle reflection prompt.",
    "Scan my current wellness score.",
    "What is a good way to release shoulder tension?",
  ];

  useEffect(() => {
    setMessages(getLocalChatHistory());
  }, []);

  useEffect(() => {
    // Scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Save User message
    const userMsg = saveLocalChatMessage("user", text);
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      const response = generateMockCompanionResponse(text);
      const aiMsg = saveLocalChatMessage("assistant", response.content, response.emotion);
      setMessages((prev) => [...prev, aiMsg]);
      setCurrentCompanionEmotion(response.emotion);
      setIsTyping(false);
    }, 1800);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your chat history with Lens? Your profile parameters will not be affected.")) {
      clearChatHistory();
      setMessages(getLocalChatHistory());
      setCurrentCompanionEmotion("Empathetic Presence");
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] w-full gap-4 relative"
    >
      {/* Top chat details bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl glass-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Lens AI Companion</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-energy animate-ping"></span>
              <span className="text-[10px] text-muted-foreground">
                Current Tone: <span className="font-semibold text-primary">{currentCompanionEmotion}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search & controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-muted border border-transparent focus:border-border outline-none text-xs"
              id="chat-search-input"
            />
          </div>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Clear Chat History"
            id="clear-chat-btn"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Pane Container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 p-4 rounded-3xl bg-muted/30 border border-border/50 shadow-inner">
        <div className="text-center py-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Clock className="h-3 w-3" />
          End-to-End Encrypted Session
        </div>

        <AnimatePresence initial={false}>
          {filteredMessages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%] gap-1.5",
                  isUser ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4.5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm transition-all",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "glass-card text-foreground rounded-tl-sm border border-border"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                {/* Message footer parameters */}
                <div className="flex items-center gap-1.5 px-2 text-[8px] text-muted-foreground font-mono">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && msg.detectedEmotion && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-semibold">{msg.detectedEmotion}</span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="self-start flex flex-col gap-1.5 max-w-[80%]">
            <div className="glass-card px-4 py-3.5 rounded-3xl rounded-tl-sm flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-100"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-200"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-300"></span>
            </div>
            <span className="text-[8px] text-muted-foreground font-mono px-2">Lens is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested quick actions if no query is active */}
      {!searchQuery && messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 justify-center px-4">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-2 rounded-full border border-border bg-card hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-all shadow-sm"
              id={`suggested-prompt-${prompt.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input panel */}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          placeholder="Share your thoughts or current stress state..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
          className="flex-1 px-5 py-3.5 rounded-full bg-card border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-sm font-medium"
          id="chat-message-input"
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim()}
          className="p-3.5 rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none transition-all"
          aria-label="Send Message"
          id="chat-send-btn"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </motion.div>
  );
}
