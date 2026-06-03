import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2, Sparkles, Lightbulb } from "lucide-react";

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

interface BoardItem {
  iid: string;
  id: string;
  x: number;
  y: number;
}

type DragState =
  | { source: "sidebar"; elementId: string; offX: number; offY: number; cx: number; cy: number }
  | { source: "board"; iid: string; elementId: string; offX: number; offY: number; cx: number; cy: number }
  | null;

const ITEM_W = 130;
const ITEM_H = 48;

function GamePage() {
  const discovered = useRecraftStore((s) => s.discovered);
  const combine = useRecraftStore((s) => s.combine);
  const pickRandomHint = useRecraftStore((s) => s.pickRandomHint);
  const stats = useRecraftStore(useShallow(selectStats));

  const [search, setSearch] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [hintId, setHintId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverIid, setHoverIid] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ iid: string; kind: "ok" | "fail" } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const iidRef = useRef(0);
  const nextIid = () => `b${++iidRef.current}`;

  const inventory = useMemo(
    () =>
      ELEMENTS.filter((e) => discovered[e.id]).filter(
        (e) => !search || e.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [discovered, search],
  );

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0, inside: false };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      inside:
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
    };
  }, []);

  const getDragSize = useCallback(() => {
    const rect = dragPreviewRef.current?.getBoundingClientRect();
    return {
      width: rect?.width ?? ITEM_W,
      height: rect?.height ?? ITEM_H,
    };
  }, []);

  const hitTest = useCallback(
    (clientX: number, clientY: number, activeDrag: DragState, ignoreIid?: string) => {
      const { inside } = toCanvas(clientX, clientY);
      if (!inside) return null;

      const els = document.elementsFromPoint(clientX, clientY);
      for (const el of els) {
        const node = (el as HTMLElement).closest?.("[data-iid]") as HTMLElement | null;
        if (!node) continue;
        const iid = node.dataset.iid;
        if (!iid || iid === ignoreIid) continue;
        const b = board.find((x) => x.iid === iid);
        if (b) return b;
      }

      if (!activeDrag) return null;

      const { width: dragW, height: dragH } = getDragSize();
      const dragLeft = clientX - activeDrag.offX;
      const dragTop = clientY - activeDrag.offY;
      let bestMatch: { item: BoardItem; area: number } | null = null;

      for (const item of board) {
        if (item.iid === ignoreIid) continue;
        const node = document.querySelector(`[data-iid="${item.iid}"]`) as HTMLElement | null;
        if (!node) continue;

        const rect = node.getBoundingClientRect();
        const overlapW = Math.min(dragLeft + dragW, rect.right) - Math.max(dragLeft, rect.left);
        const overlapH = Math.min(dragTop + dragH, rect.bottom) - Math.max(dragTop, rect.top);

        if (overlapW <= 0 || overlapH <= 0) continue;

        const area = overlapW * overlapH;
        if (!bestMatch || area > bestMatch.area) {
          bestMatch = { item, area };
        }
      }

      return bestMatch?.item ?? null;
    },
    [board, getDragSize, toCanvas],
  );

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, cx: e.clientX, cy: e.clientY } : d));
      const t = hitTest(e.clientX, e.clientY, drag, drag.source === "board" ? drag.iid : undefined);
      setHoverIid(t?.iid ?? null);
    };
    const onUp = (e: PointerEvent) => {
      const { x, y, inside } = toCanvas(e.clientX, e.clientY);
      const target = hitTest(e.clientX, e.clientY, drag, drag.source === "board" ? drag.iid : undefined);

      if (target) {
        const res = combine(drag.elementId, target.id);
        if (res.ok && res.output) {
          const outId = res.output;
          setBoard((prev) => {
            const removed = prev.filter(
              (b) => b.iid !== target.iid && (drag.source !== "board" || b.iid !== drag.iid),
            );
            const newItem: BoardItem = { iid: nextIid(), id: outId, x: target.x, y: target.y };
            setTimeout(() => setFlash({ iid: newItem.iid, kind: "ok" }), 0);
            return [...removed, newItem];
          });
          if (!res.alreadyKnown) {
            setBanner(outId);
            setTimeout(() => setBanner(null), 4500);
          }
        } else {
          setFlash({ iid: target.iid, kind: "fail" });
        }
      } else if (inside) {
        const { width: dragW, height: dragH } = getDragSize();
        const px = Math.max(0, Math.min(x - drag.offX, Math.max(0, (canvasRef.current?.clientWidth ?? 1) - dragW)));
        const py = Math.max(0, Math.min(y - drag.offY, Math.max(0, (canvasRef.current?.clientHeight ?? 1) - dragH)));
        if (drag.source === "sidebar") {
          setBoard((prev) => [...prev, { iid: nextIid(), id: drag.elementId, x: px, y: py }]);
        } else {
          setBoard((prev) => prev.map((b) => (b.iid === drag.iid ? { ...b, x: px, y: py } : b)));
        }
      } else if (drag.source === "board") {
        setBoard((prev) => prev.filter((b) => b.iid !== drag.iid));
      }
      setDrag(null);
      setHoverIid(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, hitTest, combine, toCanvas]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const startSidebarDrag = (e: React.PointerEvent, elementId: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDrag({
      source: "sidebar",
      elementId,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      cx: e.clientX,
      cy: e.clientY,
    });
  };

  const startBoardDrag = (e: React.PointerEvent, b: BoardItem) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = toCanvas(e.clientX, e.clientY);
    setDrag({
      source: "board",
      iid: b.iid,
      elementId: b.id,
      offX: x - b.x,
      offY: y - b.y,
      cx: e.clientX,
      cy: e.clientY,
    });
  };

  const dragEl = drag ? getElement(drag.elementId) : null;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="z-30 shrink-0 border-b bg-card/80 backdrop-blur">
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
            <Button size="sm" variant="outline" onClick={() => setBoard([])} disabled={board.length === 0}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Limpar
            </Button>
          </div>
        </div>
        <Progress value={stats.progressPct} className="h-1 rounded-none" />
      </header>

      <main className="relative flex min-h-0 flex-1">
        <div
          ref={canvasRef}
          className="relative flex-1 select-none overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {board.length === 0 && !drag && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-3 h-10 w-10 opacity-50" />
              <p className="text-lg font-semibold">Sua bancada está vazia</p>
              <p className="max-w-sm text-sm">
                Arraste itens do inventário para cá. Solte um item sobre outro para combiná-los.
              </p>
              <p className="mt-2 text-xs">
                Dica inicial: <strong>Garrafa PET</strong> + <strong>Tesoura</strong>
              </p>
            </div>
          )}

          {board.map((b) => {
            const el = getElement(b.id);
            if (!el) return null;
            const isHover = hoverIid === b.iid;
            const isFlash = flash?.iid === b.iid;
            const isDragged = drag?.source === "board" && drag.iid === b.iid;
            return (
              <div
                key={b.iid}
                data-iid={b.iid}
                onPointerDown={(e) => startBoardDrag(e, b)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setDetailId(b.id);
                }}
                className={cn(
                  "absolute touch-none cursor-grab active:cursor-grabbing transition-transform",
                  isDragged && "opacity-30",
                  isHover && "scale-110 rounded-xl ring-4 ring-primary ring-offset-2",
                  isFlash && flash?.kind === "ok" && "scale-110",
                  isFlash && flash?.kind === "fail" && "animate-pulse",
                )}
                style={{ left: b.x, top: b.y }}
              >
                <ElementChip element={el} size="md" />
              </div>
            );
          })}

          {banner && (
            <button
              onClick={() => setDetailId(banner)}
              className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-in slide-in-from-bottom-4 rounded-full border-2 border-emerald-400 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-lg hover:bg-emerald-100"
            >
              ✨ Descoberto: {getElement(banner)?.name} — ver detalhes
            </button>
          )}

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={cn(
              "absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-lg border bg-card p-1.5 shadow-md transition-all hover:bg-accent",
            )}
            title={sidebarOpen ? "Recolher inventário" : "Abrir inventário"}
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <button
            onClick={() => {
              const pick = pickRandomHint();
              if (pick) setHintId(pick);
            }}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border-2 border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-md transition-all hover:scale-105 hover:bg-amber-100"
            title="Receba uma dica aleatória sobre um item ainda não descoberto"
          >
            <Lightbulb className="h-4 w-4" />
            Dica aleatória
          </button>
        </div>

        <aside
          className={cn(
            "shrink-0 overflow-hidden border-l bg-card transition-[width] duration-300 ease-out",
            sidebarOpen ? "w-[340px]" : "w-0",
          )}
        >
          <div className="flex h-full w-[340px] flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">🧺 Inventário</h2>
              <span className="text-xs text-muted-foreground">{inventory.length} itens</span>
            </div>
            <Input
              placeholder="🔍 Filtrar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />
            <ScrollArea className="flex-1 pr-2">
              <InvGroup title="Resíduos" items={inventory.filter((e) => e.type === "residuo")} onPick={startSidebarDrag} onInfo={setDetailId} />
              <InvGroup title="Ferramentas" items={inventory.filter((e) => e.type === "ferramenta")} onPick={startSidebarDrag} onInfo={setDetailId} />
              <InvGroup title="Componentes" items={inventory.filter((e) => e.type === "componente")} onPick={startSidebarDrag} onInfo={setDetailId} />
              <InvGroup title="Objetos Finais" items={inventory.filter((e) => e.type === "final")} onPick={startSidebarDrag} onInfo={setDetailId} />
            </ScrollArea>
            <p className="mt-3 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
              Arraste um item para a bancada. Solte um item <strong>sobre outro</strong> para combinar. Solte <strong>fora da bancada</strong> para descartar. Clique duplo em um item da bancada para detalhes.
            </p>
          </div>
        </aside>

        {drag && dragEl && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-90"
            style={{ left: drag.cx, top: drag.cy }}
          >
            <div ref={dragPreviewRef} className="scale-110 drop-shadow-xl">
              <ElementChip element={dragEl} size="md" />
            </div>
          </div>
        )}
      </main>

      <NotificationStack />

      <CatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onSelect={(id) => {
          setDetailId(id);
          setCatalogOpen(false);
        }}
        onRequestHint={(id) => setHintId(id)}
      />
      <AchievementsDialog open={achOpen} onOpenChange={setAchOpen} />
      <ItemDetailDialog id={detailId} open={!!detailId} onOpenChange={(v) => !v && setDetailId(null)} />
      <HintDialog id={hintId} open={!!hintId} onOpenChange={(v) => !v && setHintId(null)} />
    </div>
  );
}

function InvGroup({
  title,
  items,
  onPick,
  onInfo,
}: {
  title: string;
  items: { id: string; emoji: string; name: string; type: "residuo" | "ferramenta" | "componente" | "final" }[];
  onPick: (e: React.PointerEvent, id: string) => void;
  onInfo: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((e) => (
          <div key={e.id} className="group relative">
            <div
              onPointerDown={(ev) => onPick(ev, e.id)}
              className="cursor-grab touch-none active:cursor-grabbing"
              title="Arraste para a bancada"
            >
              <ElementChip element={e as never} size="sm" />
            </div>
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onInfo(e.id);
              }}
              className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow group-hover:flex"
              title="Ver informações"
            >
              ℹ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationStack() {
  const notifications = useRecraftStore((s) => s.notifications);
  const dismissNotification = useRecraftStore((s) => s.dismissNotification);
  useEffect(() => {
    const ids = notifications.map((n) => n.id);
    const timers = ids.map((id) => setTimeout(() => dismissNotification(id), 1000));
    return () => timers.forEach(clearTimeout);
  }, [notifications, dismissNotification]);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border-2 border-primary/40 bg-card p-3 shadow-lg animate-in slide-in-from-right"
        >
          <span className="text-2xl">{n.emoji ?? (n.type === "achievement" ? "🏆" : "✨")}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{n.title}</p>
            {n.subtitle && <p className="text-xs text-muted-foreground">{n.subtitle}</p>}
          </div>
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => dismissNotification(n.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}