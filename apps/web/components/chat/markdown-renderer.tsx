"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose-chat max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children, ...props }) => {
            const code = extractText(children);
            return (
              <div className="group relative my-3">
                <Button
                  size="iconSm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10 bg-white/10 text-slate-100 opacity-0 hover:bg-white/15 group-hover:opacity-100"
                  aria-label="Copy code"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast.success("Code copied");
                  }}
                >
                  <Copy className="size-3.5" />
                </Button>
                <pre {...props}>{children}</pre>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}
