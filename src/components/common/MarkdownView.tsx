import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = "" }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple, clean custom markdown formatter for engineering text & code
  const renderFormattedMarkdown = (raw: string) => {
    if (!raw) return null;

    // Split into code blocks and normal text blocks
    const parts = raw.split(/(```[\s\S]*?```)/g);
    let codeBlockCount = 0;

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        codeBlockCount++;
        const currentCodeIdx = codeBlockCount;
        const firstLineBreak = part.indexOf("\n");
        const lang = part.slice(3, firstLineBreak).trim() || "plaintext";
        const code = part.slice(firstLineBreak + 1, -3);

        return (
          <div
            key={index}
            className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-inner"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="uppercase tracking-wider font-semibold text-emerald-400/90">{lang}</span>
              <button
                onClick={() => handleCopy(code, currentCodeIdx)}
                className="flex items-center gap-1 hover:text-zinc-200 transition cursor-pointer text-[11px]"
              >
                {copiedIndex === currentCodeIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-zinc-200 leading-relaxed font-mono selection:bg-emerald-500/30">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Process normal markdown lines
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-2" />;

            // Headings
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={lIdx} className="text-sm font-semibold text-zinc-100 mt-3 mb-1">
                  {trimmed.replace("### ", "")}
                </h4>
              );
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-zinc-100 mt-4 mb-1.5 pb-1 border-b border-zinc-800/80">
                  {trimmed.replace("## ", "")}
                </h3>
              );
            }
            if (trimmed.startsWith("# ")) {
              return (
                <h2 key={lIdx} className="text-lg font-bold text-zinc-50 mt-5 mb-2">
                  {trimmed.replace("# ", "")}
                </h2>
              );
            }

            // Bullet lists
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 text-zinc-300 text-xs pl-2">
                  <span className="text-emerald-400 mt-1">▪</span>
                  <span className="leading-relaxed">{parseInline(trimmed.slice(2))}</span>
                </div>
              );
            }

            // Numbered lists
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 text-zinc-300 text-xs pl-2">
                  <span className="text-zinc-400 font-mono text-[11px] font-medium min-w-[18px]">
                    {numMatch[1]}.
                  </span>
                  <span className="leading-relaxed">{parseInline(numMatch[2])}</span>
                </div>
              );
            }

            // Blockquotes
            if (trimmed.startsWith("> ")) {
              return (
                <blockquote
                  key={lIdx}
                  className="pl-3 border-l-2 border-emerald-500/60 bg-emerald-950/20 py-1 my-1 text-xs text-zinc-300 italic rounded-r"
                >
                  {parseInline(trimmed.slice(2))}
                </blockquote>
              );
            }

            // Default paragraph
            return (
              <p key={lIdx} className="text-xs text-zinc-300 leading-relaxed">
                {parseInline(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const parseInline = (text: string) => {
    // Handle inline bold **bold**, code `code`, link [title](url)
    const elements: React.ReactNode[] = [];
    const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const segments = text.split(inlineRegex);

    segments.forEach((seg, i) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        elements.push(
          <strong key={i} className="text-zinc-100 font-semibold">
            {seg.slice(2, -2)}
          </strong>
        );
      } else if (seg.startsWith("`") && seg.endsWith("`")) {
        elements.push(
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[11px]"
          >
            {seg.slice(1, -1)}
          </code>
        );
      } else {
        elements.push(seg);
      }
    });

    return elements;
  };

  return <div className={`prose-zinc max-w-none ${className}`}>{renderFormattedMarkdown(content)}</div>;
};
