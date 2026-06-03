import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getElement } from "@/lib/recraft-data";
import { useRecraftStore } from "@/lib/recraft-store";
import { useEffect } from "react";

export function ItemDetailDialog({ id, open, onOpenChange }: { id: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const el = id ? getElement(id) : undefined;
  const { favorites, tutorialsRead, toggleFavorite, markTutorialRead, markCuriosityRead } = useRecraftStore();
  useEffect(() => {
    if (open && id) markCuriosityRead(id);
  }, [open, id, markCuriosityRead]);
  if (!el) return null;
  const isFav = favorites.includes(el.id);
  const isRead = tutorialsRead.includes(el.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl">{el.emoji}</span>
            <span>{el.name}</span>
            {el.impact && <span className="ml-2 text-base">{"🌿".repeat(el.impact)}</span>}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {el.category && <Badge variant="secondary">{el.category}</Badge>}
              {el.difficulty && <Badge>{el.difficulty}</Badge>}
              <Badge variant="outline">{el.type === "final" ? "Objeto Final" : el.type === "componente" ? "Componente" : el.type === "ferramenta" ? "Ferramenta" : "Resíduo"}</Badge>
            </div>

            {el.materials && (
              <section>
                <h4 className="mb-1 font-semibold">Materiais Utilizados</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">{el.materials.map((m) => <li key={m}>{m}</li>)}</ul>
              </section>
            )}

            {el.benefit && (
              <section>
                <h4 className="mb-1 font-semibold">🌍 Benefício Ambiental</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">{el.benefit.map((m) => <li key={m}>{m}</li>)}</ul>
              </section>
            )}

            {el.application && (
              <section>
                <h4 className="mb-1 font-semibold">🛠️ Aplicação Prática</h4>
                <p className="text-sm text-muted-foreground">{el.application}</p>
              </section>
            )}

            {el.curiosity && (
              <section className="rounded-lg bg-accent/30 p-3">
                <h4 className="mb-1 font-semibold">💡 Curiosidade</h4>
                <p className="text-sm">{el.curiosity}</p>
              </section>
            )}

            {el.explanation && (
              <section className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <h4 className="mb-1 font-semibold">🎓 Explique para Mim</h4>
                <p className="text-sm">{el.explanation}</p>
              </section>
            )}

            {el.tutorial && (
              <section>
                <Separator className="my-2" />
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  📋 Tutorial Completo
                  {isRead && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Lido</span>
                  )}
                </h4>
                <ol className="list-decimal space-y-1 pl-5 text-sm">{el.tutorial.map((s, i) => <li key={i}>{s}</li>)}</ol>
                <Button
                  size="sm"
                  variant={isRead ? "default" : "outline"}
                  className={isRead ? "mt-3 bg-emerald-600 hover:bg-emerald-700" : "mt-3"}
                  onClick={() => markTutorialRead(el.id)}
                  disabled={isRead}
                >
                  {isRead ? "✓ Tutorial lido" : "Marcar tutorial como lido"}
                </Button>
              </section>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => toggleFavorite(el.id)}>
            {isFav ? "★ Favoritado" : "☆ Favoritar"}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}