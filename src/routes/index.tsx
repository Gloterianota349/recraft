import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ELEMENTS, getElement } from "@/lib/recraft-data";
import { selectStats, useRecraftStore } from "@/lib/recraft-store";
import { useShallow } from "zustand/react/shallow";
import { ElementChip } from "@/components/recraft/ElementChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CatalogDialog } from "@/components/recraft/CatalogDialog";
import { AchievementsDialog } from "@/components/recraft/AchievementsDialog";
import { ItemDetailDialog } from "@/components/recraft/ItemDetailDialog";
import { HintDialog } from "@/components/recraft/HintDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RECraft — Descubra, Transforme e Reutilize" },
      { name: "description", content: "Jogo educativo de descoberta e combinação que transforma resíduos do cotidiano em objetos sustentáveis reais." },
      { property: "og:title", content: "RECraft — Descubra, Transforme e Reutilize" },
      { property: "og:description", content: "Transforme resíduos em recursos. Descubra novas possibilidades para o planeta." },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const discovered = useRecraftStore((s) => s.discovered);
  const combine = useRecraftStore((s) => s.combine);
  const stats = useRecraftStore(useShallow(selectStats));
  const [slotA, setSlotA] = useState<string | null>(null);
  const [slotB, setSlotB] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "dup" | "fail"; text: string; emoji?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [hintId, setHintId] = useState<string | null>(null);

  const inventory = useMemo(() => {
    return ELEMENTS.filter((e) => discovered[e.id]).filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));
  }, [discovered, search]);

  const tryCombine = () => {
    if (!slotA || !slotB) return;
    const res = combine(slotA, slotB);
    if (!res.ok) {
      setFeedback({ kind: "fail", text: "Combinação não funcionou. Continue experimentando!", emoji: "❌" });
    } else if (res.alreadyKnown) {
      const def = getElement(res.output!);
      setFeedback({ kind: "dup", text: `Já descoberto: ${def?.name}`, emoji: def?.emoji });
    } else {
      const def = getElement(res.output!);
      setFeedback({ kind: "ok", text: `Descobriu: ${def?.name}!`, emoji: def?.emoji });
    }
    setSlotA(null);
    setSlotB(null);
  };

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleElementClick = (id: string) => {
    if (!slotA) setSlotA(id);
    else if (!slotB) setSlotB(id);
    else { setSlotA(id); setSlotB(null); }
  };

  const renderSlot = (val: string | null, onClear: () => void, label: string) => {
    const el = val ? getElement(val) : null;
    return (
      <div className="flex min-h-32 flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-card/80 p-4 backdrop-blur"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("text/recraft-id");
          if (id && discovered[id]) {
            if (label === "A") setSlotA(id); else setSlotB(id);
          }
        }}
      >
        {el ? (
          <button onClick={onClear} className="flex flex-col items-center gap-1">
            <span className="text-5xl">{el.emoji}</span>
            <span className="font-semibold">{el.name}</span>
            <span className="text-xs text-muted-foreground">clique para remover</span>
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">Slot {label}: clique ou arraste</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <div>
              <h1 className="text-xl font-bold leading-none">RECraft</h1>
              <p className="text-xs text-muted-foreground">Descubra, transforme e reutilize</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary" className="gap-1">🌱 {stats.wasteCount} resíduos</Badge>
            <Badge variant="secondary" className="gap-1">🔍 {stats.totalDiscovered}/{stats.totalDiscoverable}</Badge>
            <Badge variant="secondary" className="gap-1">🏆 {stats.achievementsUnlocked}/{stats.achievementsTotal}</Badge>
            <Button size="sm" variant="outline" onClick={() => setCatalogOpen(true)}>📖 Catálogo</Button>
            <Button size="sm" variant="outline" onClick={() => setAchOpen(true)}>🏆 Conquistas</Button>
          </div>
        </div>
        <Progress value={stats.progressPct} className="h-1 rounded-none" />
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* Workbench */}
        <section className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">🧪 Bancada de Criação</h2>
              <p className="text-xs text-muted-foreground">Combine 2 elementos para descobrir algo novo</p>
            </div>
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
              {renderSlot(slotA, () => setSlotA(null), "A")}
              <span className="text-center text-3xl font-bold text-primary">+</span>
              {renderSlot(slotB, () => setSlotB(null), "B")}
              <span className="text-center text-3xl font-bold text-primary">=</span>
              <Button size="lg" onClick={tryCombine} disabled={!slotA || !slotB} className="h-32 w-full md:w-40">
                ⚗️<br />Combinar
              </Button>
            </div>
            {feedback && (
              <div className={
                "mt-4 flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 " +
                (feedback.kind === "ok" ? "border-emerald-400 bg-emerald-50 text-emerald-900" :
                 feedback.kind === "dup" ? "border-sky-400 bg-sky-50 text-sky-900" :
                 "border-rose-300 bg-rose-50 text-rose-900")
              }>
                {feedback.emoji && <span className="text-2xl">{feedback.emoji}</span>}
                <span>{feedback.text}</span>
                {feedback.kind === "ok" && (
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
                    const last = useRecraftStore.getState().notifications.slice(-1)[0];
                    // open detail for last discovery
                    const lastDisc = Object.values(useRecraftStore.getState().discovered).sort((a, b) => b.at - a.at)[0];
                    if (lastDisc) setDetailId(lastDisc.id);
                    void last;
                  }}>
                    Ver detalhes
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Onboarding */}
          <div className="rounded-2xl border border-dashed bg-secondary/40 p-4 text-sm">
            <p className="font-semibold">💡 Como jogar</p>
            <p className="text-muted-foreground">
              Clique em dois elementos do inventário ao lado e depois em <strong>Combinar</strong>. Algumas combinações geram componentes (como <em>Tiras de PET</em>) que servem de base para objetos finais (<em>Vassoura PET</em>, <em>Horta Vertical</em>...). Não sabe por onde começar? Tente <em>Garrafa PET + Tesoura</em>.
            </p>
          </div>

          {/* Last discoveries */}
          <LastDiscoveries onSelect={setDetailId} />
        </section>

        {/* Inventory */}
        <aside className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">🧺 Inventário</h2>
            <span className="text-xs text-muted-foreground">{inventory.length} itens</span>
          </div>
          <Input placeholder="🔍 Filtrar…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
          <ScrollArea className="h-[60vh] pr-2">
            <InventoryGroup title="Resíduos" items={inventory.filter((e) => e.type === "residuo")} onClick={handleElementClick} selected={[slotA, slotB]} />
            <InventoryGroup title="Ferramentas" items={inventory.filter((e) => e.type === "ferramenta")} onClick={handleElementClick} selected={[slotA, slotB]} />
            <InventoryGroup title="Componentes" items={inventory.filter((e) => e.type === "componente")} onClick={handleElementClick} selected={[slotA, slotB]} onInfo={setDetailId} />
            <InventoryGroup title="Objetos Finais" items={inventory.filter((e) => e.type === "final")} onClick={handleElementClick} selected={[slotA, slotB]} onInfo={setDetailId} />
          </ScrollArea>
        </aside>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-muted-foreground">
        "Transforme resíduos em recursos. Descubra novas possibilidades para o planeta."
      </footer>

      {/* Notifications */}
      <NotificationStack />

      <CatalogDialog open={catalogOpen} onOpenChange={setCatalogOpen} onSelect={(id) => { setDetailId(id); setCatalogOpen(false); }} onRequestHint={(id) => setHintId(id)} />
      <AchievementsDialog open={achOpen} onOpenChange={setAchOpen} />
      <ItemDetailDialog id={detailId} open={!!detailId} onOpenChange={(v) => !v && setDetailId(null)} />
      <HintDialog id={hintId} open={!!hintId} onOpenChange={(v) => !v && setHintId(null)} />
    </div>
  );
}

function InventoryGroup({ title, items, onClick, selected, onInfo }: {
  title: string;
  items: ReturnType<typeof getElement>[] | { id: string; emoji: string; name: string; type: "residuo" | "ferramenta" | "componente" | "final" }[];
  onClick: (id: string) => void;
  selected: (string | null)[];
  onInfo?: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {(items as { id: string; emoji: string; name: string; type: never }[]).map((e) => (
          <div key={e.id} className="group relative">
            <ElementChip
              element={e as never}
              size="sm"
              draggable
              onDragStart={(ev) => ev.dataTransfer.setData("text/recraft-id", e.id)}
              onClick={() => onClick(e.id)}
              selected={selected.includes(e.id)}
            />
            {onInfo && (
              <button
                onClick={(ev) => { ev.stopPropagation(); onInfo(e.id); }}
                className="absolute -top-1 -right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow group-hover:flex"
                title="Ver informações"
              >ℹ</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LastDiscoveries({ onSelect }: { onSelect: (id: string) => void }) {
  const discovered = useRecraftStore((s) => s.discovered);
  const recent = Object.values(discovered).filter((d) => d.at > 0).sort((a, b) => b.at - a.at).slice(0, 6);
  if (recent.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">🕒 Descobertas recentes</h3>
      <div className="flex flex-wrap gap-2">
        {recent.map((d) => {
          const el = getElement(d.id)!;
          return <ElementChip key={d.id} element={el} size="sm" onClick={() => onSelect(d.id)} />;
        })}
      </div>
    </div>
  );
}

function NotificationStack() {
  const notifications = useRecraftStore((s) => s.notifications);
  const dismissNotification = useRecraftStore((s) => s.dismissNotification);
  useEffect(() => {
    const ids = notifications.map((n) => n.id);
    const timers = ids.map((id) => setTimeout(() => dismissNotification(id), 5500));
    return () => timers.forEach(clearTimeout);
  }, [notifications, dismissNotification]);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto flex items-start gap-3 rounded-xl border-2 border-primary/40 bg-card p-3 shadow-lg animate-in slide-in-from-right">
          <span className="text-2xl">{n.emoji ?? (n.type === "achievement" ? "🏆" : "✨")}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{n.title}</p>
            {n.subtitle && <p className="text-xs text-muted-foreground">{n.subtitle}</p>}
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => dismissNotification(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
