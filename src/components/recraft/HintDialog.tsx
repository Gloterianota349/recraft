import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getElement } from "@/lib/recraft-data";
import { useRecraftStore } from "@/lib/recraft-store";

export function HintDialog({ id, open, onOpenChange }: { id: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const el = id ? getElement(id) : undefined;
  const { hintsUsed, useHint } = useRecraftStore();
  const initialLevel = id ? (hintsUsed[id] ?? 0) : 0;
  const [level, setLevel] = useState<number>(initialLevel);
  useEffect(() => { setLevel(id ? (hintsUsed[id] ?? 0) : 0); }, [id, open, hintsUsed]);

  if (!el || !el.hints) return null;
  const reveal = (n: 1 | 2 | 3) => {
    setLevel(n);
    useHint(el.id, n);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>💡 Dicas — Item Misterioso</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-lg border bg-card p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Nível {n} {n === 2 && "(-5 pts)"} {n === 3 && "(-10 pts)"}
                </span>
                {level < n && (
                  <Button size="sm" variant="outline" onClick={() => reveal(n as 1 | 2 | 3)}>
                    Revelar
                  </Button>
                )}
              </div>
              {level >= n ? (
                <p className="text-sm">💡 {el.hints![n - 1]}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Bloqueada</p>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Dicas em excesso reduzem seu impacto sustentável.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}