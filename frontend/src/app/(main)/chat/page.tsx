"use client";

import React, { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Send, Plus, Trash2, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  detectedEmotion?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "I feel overwhelmed today...",
    "Can you help me reflect on my week?",
    "I need help calming my mind",
    "What patterns have you noticed?",
  ];

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const convos = await fetchApi("/chat/conversations");
        setConversations(convos || []);
        if (convos && convos.length > 0) {
          setActiveConversation(convos[0].id);
        }
      } catch {
        // Silently handle if no conversations exist
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    async function loadMessages() {
      try {
        const msgs = await fetchApi(`/chat/conversations/${activeConversation}/messages`);
        setMessages(msgs || []);
      } catch {
        setMessages([]);
      }
    }
    loadMessages();
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewConversation = async () => {
    try {
      const convo = await fetchApi("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "New Conversation" }),
      });
      setConversations((prev) => [convo, ...prev]);
      setActiveConversation(convo.id);
      setMessages([]);
    } catch {
      // Handle error
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isSending) return;

    // Create conversation if none exists
    let conversationId = activeConversation;
    if (!conversationId) {
      try {
        const convo = await fetchApi("/chat/conversations", {
          method: "POST",
          body: JSON.stringify({ title: messageText.slice(0, 50) }),
        });
        setConversations((prev) => [convo, ...prev]);
        conversationId = convo.id;
        setActiveConversation(convo.id);
      } catch {
        return;
      }
    }

    // Optimistic UI: add user message
    const tempUserMsg: ChatMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setIsSending(true);

    try {
      const assistantMsg = await fetchApi(`/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: messageText }),
      });
      // Replace temp message and add assistant response
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        // Add the user message from server (if different from temp) and assistant message
        return [...withoutTemp, { ...tempUserMsg, id: `user-${Date.now()}` }, assistantMsg];
      });
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const emotionColor = (emotion?: string) => {
    if (!emotion) return "text-muted-foreground";
    const e = emotion.toLowerCase();
    if (e.includes("calm") || e.includes("warm")) return "text-calm";
    if (e.includes("joy") || e.includes("happy")) return "text-energy";
    if (e.includes("concern") || e.includes("empathy")) return "text-focus";
    return "text-primary";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading font-semibold text-xl tracking-tight">AI Companion Chat</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Chat with Lens, your wellness companion</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createNewConversation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> New Chat
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Conversation sidebar (desktop) */}
        <div className="hidden md:flex flex-col w-56 gap-2 overflow-y-auto pr-2">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">Conversations</span>
          {loading ? (
            <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversation(c.id)}
                className={`text-left p-2.5 rounded-xl text-xs transition-all truncate ${
                  activeConversation === c.id
                    ? "bg-primary/10 border border-primary/20 text-primary font-medium"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.title || "Untitled"}
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-card/50 rounded-2xl border border-border overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-calm/20 to-focus/15 flex items-center justify-center border border-calm/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base">Start a conversation</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Share how you&apos;re feeling, ask for guidance, or reflect on your day with Lens.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-2 rounded-full bg-muted border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-muted border border-border rounded-tl-md"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && msg.detectedEmotion && (
                      <span className={`text-[10px] mt-1 block ${emotionColor(msg.detectedEmotion)}`}>
                        Sensing: {msg.detectedEmotion}
                      </span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isSending && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-calm to-focus flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted border border-border rounded-tl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Share what's on your mind..."
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                disabled={isSending}
                id="chat-input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isSending}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                id="chat-send-btn"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
