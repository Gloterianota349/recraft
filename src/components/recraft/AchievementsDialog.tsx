import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS, RARITY_COLORS } from "@/lib/recraft-data";
import { selectStats, useRecraftStore } from "@/lib/recraft-store";
import { cn } from "@/lib/utils";

export function AchievementsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const unlockedAchievements = useRecraftStore((s) => s.unlockedAchievements);
  const stats = useRecraftStore(useShallow(selectStats));
  const categories = ["Descoberta", "Sustentabilidade", "Conhecimento", "Progressão", "Especiais"] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">🏆 Conquistas — {stats.achievementsUnlocked}/{stats.achievementsTotal}</DialogTitle>
        </DialogHeader>
        <Progress value={Math.round((stats.achievementsUnlocked / stats.achievementsTotal) * 100)} className="h-2" />

        <div className="grid grid-cols-4 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <Stat label="🌱 Resíduos" value={String(stats.wasteCount)} />
          <Stat label="🔍 Descobertas" value={String(stats.totalDiscovered)} />
          <Stat label="📚 Tutoriais" value={String(stats.tutorialsRead)} />
          <Stat label="❌ Inválidas" value={String(stats.invalidAttempts)} />
        </div>

        <ScrollArea className="max-h-[55vh] pr-3">
          <div className="space-y-5">
            {categories.map((cat) => (
              <section key={cat}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{cat}</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {ACHIEVEMENTS.filter((a) => a.category === cat).map((a) => {
                    const unlocked = !!unlockedAchievements[a.id];
                    const hidden = a.hidden && !unlocked;
                    return (
                      <div key={a.id} className={cn("flex items-start gap-3 rounded-lg border-2 p-3", unlocked ? RARITY_COLORS[a.rarity] : "border-muted opacity-70")}>
                        <span className="text-2xl">{unlocked ? "🏆" : "🔒"}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{hidden ? "??? Conquista Oculta" : a.name}</p>
                          <p className="text-xs text-muted-foreground">{hidden ? "Continue jogando para descobri-la." : a.description}</p>
                          {a.reward && unlocked && <p className="mt-1 text-xs italic">🎁 {a.reward}</p>}
                          <p className="mt-1 text-[10px] uppercase tracking-wide">{a.rarity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
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