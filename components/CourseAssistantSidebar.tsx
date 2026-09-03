"use client";

import React, { useState, useRef, useEffect } from "react";
import { CS50_MODULES } from "@/config/courseModules";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Message {
  role: "user" | "model";
  text: string;
}

interface Props {
  moduleId: number;
}

export default function CourseAssistantSidebar({ moduleId }: Props) {
  const currentModule = CS50_MODULES[moduleId] || CS50_MODULES[0];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Bonjour ! Je suis Socrate, ton tuteur pour le module : **${currentModule.title}**. Comment puis-je t'aider à réfléchir sur ton code ou tes concepts aujourd'hui ?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "model", text: "" }]);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMsg,
          moduleId: currentModule.id,
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        console.error("DÉTAIL DE L'ERREUR BACKEND :", errorText);
        throw new Error(errorText || `Code d'erreur ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "model") {
            updated[updated.length - 1] = {
              ...lastMsg,
              text: lastMsg.text + chunk,
            };
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Erreur capturée dans la Sidebar :", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: "model", 
          text: "⚠️ Une erreur est survenue lors de la communication avec le serveur." 
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-96 flex flex-col h-screen border-l border-slate-800 bg-slate-950 text-slate-100 p-4">
      <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📓</span>
          <h3 className="font-semibold text-sm text-slate-200">Compagnon d'étude</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Accède aux résumés audio (podcasts), cartes conceptuelles et synthèses de cours sur NotebookLM.
        </p>
        <a
          href={currentModule.notebookLmUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow"
        >
          Ouvrir le carnet {currentModule.title.split(":")[0]} ↗
        </a>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 rounded-xl border border-slate-800 p-3">
        <div className="flex-1 overflow-y-auto mb-3 pr-2 space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                }`}
              >
                {/* LA CORRECTION EST ICI : Le className est sur cette div, plus sur ReactMarkdown */}
                <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md my-2 text-xs"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className="bg-slate-900 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-150"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse delay-300"></span>
              <span className="ml-1 text-[11px]">Socrate réfléchit...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
          >
            Envoyer
          </button>
        </form>
      </div>
    </aside>
  );
}