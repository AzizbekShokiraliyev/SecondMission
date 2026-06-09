import { ChevronRight, Trash2 } from 'lucide-react';
import type { RoadHistory } from '@/interface/Interface';

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'Hozirgina';
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

export const RoadHistoryItem = ({road, isActive, onSelect, onRemove}: RoadHistory) => (
  <div
  onClick={() => onSelect(road)}
  className={`
    group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border
    transition-all cursor-pointer select-none
    ${
      isActive
      ? 'border-blue-500/40 bg-blue-500/5'
      : 'border-border/50 bg-background/60 hover:bg-muted/30 hover:border-border'
    }
    `}
    >
    <span
      className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: road.color }}
      />

    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{road.name}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[10px] text-muted-foreground/50">
          {timeAgo(road.createdAt)}
        </span>
      </div>
    </div>

    {isActive ? (
      <div className="flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] text-blue-500 font-medium">Faol</span>
      </div>
    ) : (
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
    )}

    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove(road.id);
      }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all shrink-0"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  </div>
);