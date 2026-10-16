import React, { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  FolderGit2,
  CheckCircle2,
} from "lucide-react";
import { ChatMessage, WorkspaceProject } from "../../types";
import { sendChatMessage } from "../../services/api";
import { MarkdownView } from "../common/MarkdownView";

interface GeneralChatProps {
  currentProject?: WorkspaceProject;
}

export const GeneralChat: React.FC<GeneralChatProps> = ({ currentProject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      role: "assistant",
      content: `Hello! I am **Pramanix**, your engineering mentor and project workspace companion.

I can help you:
- **Analyze GitHub projects** (including \`manthankro/pramanix\`) with architectural walkthroughs and ZIP exports.
- **Architect Student Capstones**: Generate full Software Requirements Specifications (SRS), modern tech stacks, 8-week milestone roadmaps, and viva defense plans.
- **Explain STEM Concepts**: Step-by-step guidance across Computer Science, Electronics, Electrical, Mechanical, and Civil Engineering.
- **Viva Voce Defense**: Conduct mock oral viva examinations with realistic external examiner feedback.
- **Debug & Review Code**: Big-O analysis, race-condition detection, and edge-case test generation.

What engineering challenge are we tackling today?`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const workspaceContext = currentProject
        ? `Active Workspace Project: "${currentProject.name}" (${currentProject.domain})\nConnected Repo: "${currentProject.connectedRepo || "manthankro/pramanix"}"\nTasks Pending: ${currentProject.tasks.filter((t) => t.status !== "done").length}`
        : "Connected Repo: manthankro/pramanix";

      const reply = await sendChatMessage(
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        workspaceContext,
        "general"
      );

      const assistantMsg: ChatMessage = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      setMessages([...nextMessages, assistantMsg]);
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `⚠️ Error generating response: ${err.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "intro-reset",
        role: "assistant",
        content: "Conversation cleared. How can I assist you with your engineering studies or project?",
        timestamp: Date.now(),
      },
    ]);
  };

  const promptSuggestions = [
    "Explain the architecture of manthankro/pramanix and how to run it",
    "Turn my project idea into an 8-week milestone roadmap and SRS",
    "Conduct an oral viva question on process synchronization and mutexes",
    "Explain how to calculate Young's modulus from a stress-strain tensile test",
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Context Bar */}
      <div className="px-6 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 text-zinc-400">
          <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Context:</span>
          <span className="text-zinc-200 font-mono font-medium">
            {currentProject?.connectedRepo || "manthankro/pramanix"}
          </span>
          {currentProject && (
            <span className="text-zinc-500">· Project: {currentProject.name}</span>
          )}
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Clear History
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 border border-zinc-700 text-emerald-400"
                }`}
              >
                {isUser ? "You" : "P"}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 font-sans"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-200 shadow-sm"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <MarkdownView content={m.content} />
                )}
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? "text-emerald-400/80 text-right" : "text-zinc-500"
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
              P
            </div>
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs text-zinc-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Pramanix is thinking and synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area & prompt suggestions */}
      <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-zinc-950 border border-zinc-700/80 rounded-xl p-2 focus-within:border-emerald-500 transition">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Pramanix anything (explain code, conceptual derivations, viva preparation, repo queries)..."
              className="flex-1 bg-transparent px-2 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
