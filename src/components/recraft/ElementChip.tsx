import type { ElementDef } from "@/lib/recraft-data";
import { cn } from "@/lib/utils";

interface Props {
  element: ElementDef;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const typeStyles: Record<ElementDef["type"], string> = {
  residuo: "bg-amber-50 border-amber-300 hover:border-amber-500",
  ferramenta: "bg-sky-50 border-sky-300 hover:border-sky-500",
  componente: "bg-violet-50 border-violet-300 hover:border-violet-500",
  final: "bg-emerald-50 border-emerald-400 hover:border-emerald-600",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-3 py-2 text-sm gap-2",
  lg: "px-4 py-3 text-base gap-2",
};

const emojiSize = { sm: "text-base", md: "text-xl", lg: "text-3xl" };

export function ElementChip({ element, onClick, selected, size = "md", locked, draggable, onDragStart }: Props) {
  if (locked) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center rounded-xl border-2 border-dashed border-muted bg-muted/40 text-muted-foreground transition-all hover:bg-muted",
          sizeStyles[size],
        )}
      >
        <span className={emojiSize[size]}>❓</span>
        <span className="font-medium">???</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "flex items-center rounded-xl border-2 font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        typeStyles[element.type],
        sizeStyles[size],
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <span className={emojiSize[size]}>{element.emoji}</span>
      <span className="text-foreground">{element.name}</span>
    </button>
  );
}