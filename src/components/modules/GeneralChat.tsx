import React, { useEffect, useRef, useState } from "react";
import { Clock3, MessageCircle, Plus, Send, Sparkles } from "lucide-react";
import { ChatMessage, WorkspaceProject } from "../../types";
import { sendChatMessage } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

interface GeneralChatProps {
  currentProject?: WorkspaceProject;
}

interface SavedChat {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const welcomeMessage = (): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  content: `Hi! I’m **Pramanix**, your study companion. Ask me about a class topic, a coding problem, a calculation, or anything you’re curious about.`,
  timestamp: Date.now(),
});

const providerOptions = [
  { id: "groq", label: "Groq", detail: "Fast · your current provider" },
  { id: "gemini", label: "Gemini", detail: "Requires a Gemini API key" },
  { id: "claude", label: "Claude", detail: "Requires an Anthropic API key" },
  { id: "grok", label: "Grok", detail: "Requires an xAI API key" },
  { id: "openai", label: "ChatGPT", detail: "Requires an OpenAI API key" },
] as const;

const initialChats = (): SavedChat[] => {
  try {
    const saved = localStorage.getItem("pramanix_recent_chats");
    const parsed = saved ? JSON.parse(saved) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // Start with a clean chat if saved browser data is unavailable.
  }
  return [{
    id: String(Date.now()),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [welcomeMessage()],
  }];
};

export const GeneralChat: React.FC<GeneralChatProps> = ({ currentProject }) => {
  const [sessions, setSessions] = useState<SavedChat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState("");
  const selectedChatId = sessions.some((chat) => chat.id === activeChatId) ? activeChatId : sessions[0]?.id || "";
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<"groq" | "gemini" | "claude" | "openai" | "grok">("groq");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = sessions.find((chat) => chat.id === selectedChatId) || sessions[0];
  const messages = activeChat?.messages || [welcomeMessage()];

  useEffect(() => {
    try {
      localStorage.setItem("pramanix_recent_chats", JSON.stringify(sessions.slice(0, 30)));
    } catch (error) {
      console.warn("Unable to save recent chats:", error);
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveMessages = (nextMessages: ChatMessage[]) => {
    setSessions((previous) =>
      previous
        .map((chat) => {
          if (chat.id !== selectedChatId) return chat;
          const firstQuestion = nextMessages.find((message) => message.role === "user")?.content;
          return {
            ...chat,
            title: firstQuestion ? firstQuestion.slice(0, 42) + (firstQuestion.length > 42 ? "…" : "") : "New chat",
            messages: nextMessages,
            updatedAt: Date.now(),
          };
        })
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 30)
    );
  };

  const startNewChat = () => {
    const chat: SavedChat = {
      id: String(Date.now()),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [welcomeMessage()],
    };
    setSessions((previous) => [chat, ...previous].slice(0, 30));
    setActiveChatId(chat.id);
    setInput("");
  };

  const handleSend = async (suggestion?: string) => {
    const text = (suggestion ?? input).trim();
    if (!text || loading || !activeChat) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: "user-" + Date.now(), role: "user", content: text, timestamp: Date.now() },
    ];
    setInput("");
    saveMessages(nextMessages);
    setLoading(true);

    try {
      const now = new Date();
      const context = [
        currentProject
          ? `Active student project: ${currentProject.name} (${currentProject.domain}). Repository: ${currentProject.connectedRepo || "none"}.`
          : "No project is currently selected.",
        `The student's local date and time is ${now.toLocaleString()}.`,
      ].join("\n");
      const reply = await sendChatMessage(
        nextMessages.map(({ role, content }) => ({ role, content })),
        context,
        "general",
        provider
      );
      saveMessages([
        ...nextMessages,
        { id: "assistant-" + Date.now(), role: "assistant", content: reply, timestamp: Date.now() },
      ]);
    } catch (error: any) {
      saveMessages([
        ...nextMessages,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: String(error?.message || "").toLowerCase().includes("not configured")
            ? "AI isn’t connected yet. Add GROQ_API_KEY in Netlify → Site configuration → Environment variables, enable it for Functions, and redeploy."
            : `I couldn’t get a response. ${error.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Explain this topic like I’m new to it",
    "Help me solve a math or physics problem",
    "Review my code and explain the bug",
    "Help me plan my study week",
  ];

  return (
    <div className="h-full flex bg-zinc-950 text-zinc-100 overflow-hidden">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="p-4 border-b border-zinc-800">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white transition"
          >
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>
        <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <Clock3 className="w-3.5 h-3.5" /> Recent chats
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {sessions.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${selectedChatId === chat.id ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}
            >
              <MessageCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
              <span className="line-clamp-2">{chat.title}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-zinc-800 p-3 text-[11px] text-zinc-500">
          Your recent chats are saved in this browser.
        </div>
      </aside>

      <section className="min-w-0 flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="md:hidden inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-2 text-xs text-zinc-300"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
            <div>
              <h2 className="text-base font-semibold">Ask Pramanix anything</h2>
              <p className="mt-1 text-xs text-zinc-400">Study help, everyday questions, calculations, and coding support.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedChatId}
              onChange={(event) => setActiveChatId(event.target.value)}
              className="md:hidden max-w-[130px] rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-[11px] text-zinc-200"
              aria-label="Recent chats"
            >
              {sessions.map((chat) => <option key={chat.id} value={chat.id}>{chat.title}</option>)}
            </select>
            <label className="text-xs text-zinc-400" htmlFor="chat-provider">Model</label>
            <select
              id="chat-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value as typeof provider)}
              disabled={loading}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
            >
              {providerOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.length <= 1 && (
              <div className="py-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-center text-xl font-semibold">What are you working on?</h3>
                <p className="mt-2 text-center text-sm text-zinc-400">Ask a quick question or choose a starting point.</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left text-xs text-zinc-300 hover:border-emerald-500/50 hover:bg-zinc-900 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50" : "bg-zinc-900 border border-zinc-800 text-zinc-200"}`}>
                  {message.role === "user" ? <p className="whitespace-pre-wrap">{message.content}</p> : <MarkdownView content={message.content} />}
                  <div className="mt-2 text-[10px] text-zinc-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-emerald-300 animate-pulse">Pramanix is thinking…</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950/95 p-4">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-[11px] text-zinc-500">
              {providerOptions.find((option) => option.id === provider)?.detail}
            </p>
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-2 focus-within:border-emerald-500">
              <textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question, paste a problem, or describe what you need…"
                className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-emerald-600 p-3 text-white transition hover:bg-emerald-500 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">AI can make mistakes. Check important answers with your course material.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
