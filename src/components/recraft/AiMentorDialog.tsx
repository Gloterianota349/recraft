import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ELEMENTS, DISCOVERABLE_IDS, getElement } from "@/lib/recraft-data";
import { useRecraftStore } from "@/lib/recraft-store";
import { useShallow } from "zustand/react/shallow";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

const GREETING: Msg = {
  role: "assistant",
  content: "Olá! 🌿 Sou seu **Mentor Ecológico**. Posso te ajudar com dicas para descobrir novos itens, explicar curiosidades sobre sustentabilidade ou sugerir o que tentar a seguir. O que você quer explorar hoje?",
};

export function AiMentorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { discovered, stats } = useRecraftStore(
    useShallow((s) => ({
      discovered: s.discovered,
      stats: { totalDiscovered: Object.keys(s.discovered).length, totalDiscoverable: DISCOVERABLE_IDS.length },
    })),
  );
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    const discoveredNames = Object.keys(discovered).map((id) => getElement(id)?.name).filter(Boolean) as string[];
    const undiscovered = ELEMENTS.filter((e) => !discovered[e.id] && !e.starter).map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
    }));

    let wasteCount = 0;
    for (const id of Object.keys(discovered)) wasteCount += getElement(id)?.wasteCount ?? 0;

    try {
      const resp = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          discovered: discoveredNames,
          undiscovered,
          stats: { ...stats, wasteCount },
        }),
      });

      if (!resp.ok || !resp.body) {
        const t = await resp.text().catch(() => "");
        let msg = "Não consegui responder agora. Tente novamente.";
        try { msg = JSON.parse(t).error ?? msg; } catch { /* ignore */ }
        if (resp.status === 429) msg = "Estou pensando demais 😅 Aguarde alguns segundos e tente de novo.";
        if (resp.status === 402) msg = "Os créditos da IA acabaram neste workspace. Adicione créditos para continuar.";
        setError(msg);
        setLoading(false);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      let acc = "";
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = m.slice();
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setError("Erro de conexão com o mentor.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Me dê uma dica do que tentar agora",
    "Por que reciclar plástico é importante?",
    "Sugira uma combinação criativa",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" /> Mentor Ecológico
          </DialogTitle>
          <DialogDescription>
            Tire dúvidas, peça dicas e aprenda sobre sustentabilidade.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="h-[55vh] overflow-y-auto pr-2">
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm"
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s} size="sm" variant="outline" disabled={loading} onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (!v || loading) return;
            send(v);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao mentor…"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
