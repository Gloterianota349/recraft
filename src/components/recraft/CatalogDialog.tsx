import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ELEMENTS, type ElementDef } from "@/lib/recraft-data";
import { selectStats, useRecraftStore } from "@/lib/recraft-store";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "residuo", label: "Resíduos" },
  { id: "ferramenta", label: "Ferramentas" },
  { id: "componente", label: "Componentes" },
  { id: "final", label: "Objetos Finais" },
  { id: "fav", label: "★ Favoritos" },
] as const;

export function CatalogDialog({ open, onOpenChange, onSelect, onRequestHint }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (id: string) => void;
  onRequestHint: (id: string) => void;
}) {
  const discovered = useRecraftStore((s) => s.discovered);
  const favorites = useRecraftStore((s) => s.favorites);
  const stats = useRecraftStore(useShallow(selectStats));
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return ELEMENTS.filter((e) => {
      if (filter === "fav") return favorites.includes(e.id);
      if (filter !== "all" && e.type !== filter) return false;
      if (q) {
        const term = q.toLowerCase();
        return e.name.toLowerCase().includes(term) || e.category?.toLowerCase().includes(term) || e.materials?.some((m) => m.toLowerCase().includes(term));
      }
      return true;
    });
  }, [filter, q, favorites]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">📖 Catálogo RECraft</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <Stat label="Descobertas" value={`${stats.totalDiscovered}/${stats.totalDiscoverable}`} />
          <Stat label="Objetos Finais" value={`${stats.finalsDiscovered}/${stats.totalFinals}`} />
          <Stat label="🌱 Resíduos Reaproveitados" value={String(stats.wasteCount)} />
          <Stat label="🏆 Conquistas" value={`${stats.achievementsUnlocked}/${stats.achievementsTotal}`} />
        </div>
        <Progress value={stats.progressPct} className="h-2" />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} onClick={() => setFilter(f.id)}>
              {f.label}
            </Button>
          ))}
          <Input placeholder="🔍 Pesquisar nome, categoria, material…" value={q} onChange={(e) => setQ(e.target.value)} className="ml-auto max-w-xs" />
        </div>

        <ScrollArea className="max-h-[50vh] pr-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {filtered.map((e) => <CatalogCard key={e.id} el={e} known={!!discovered[e.id]} fav={favorites.includes(e.id)} onSelect={onSelect} onHint={onRequestHint} />)}
            {filtered.length === 0 && <p className="col-span-full py-8 text-center text-muted-foreground">Nada encontrado.</p>}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function CatalogCard({ el, known, fav, onSelect, onHint }: { el: ElementDef; known: boolean; fav: boolean; onSelect: (id: string) => void; onHint: (id: string) => void }) {
  if (!known) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted bg-muted/30 p-4">
        <span className="text-3xl">🔒</span>
        <p className="text-sm font-semibold text-muted-foreground">??? — Não descoberto</p>
        {el.hints && <Button size="sm" variant="outline" onClick={() => onHint(el.id)}>💡 Dica</Button>}
      </div>
    );
  }
  return (
    <button onClick={() => onSelect(el.id)} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow")}>
      <div className="flex w-full items-center justify-between">
        <span className="text-3xl">{el.emoji}</span>
        {fav && <span className="text-amber-500">★</span>}
      </div>
      <p className="self-start font-semibold leading-tight">{el.name}</p>
      {el.impact && <p className="self-start text-xs">{"🌿".repeat(el.impact)}</p>}
      <Badge variant="secondary" className="self-start text-xs">{el.category}</Badge>
    </button>
  );
}