import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_COLORS } from '@/lib/routeUtils'; 
import type { ColorsGroupProps } from '@/interface/Interface';

const ColorsGroup = ({ value, onChange }: ColorsGroupProps) => {
  return (
    <div className="flex items-center gap-2 p-3 m-2 rounded-xl border">
      {ROUTE_COLORS.map((color) => (
        <Button
          key={color.hex}
          title={color.name}
          onClick={() => onChange(color.hex)}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform",
            value === color.hex ? "border-black scale-110" : "border-transparent hover:scale-105"
          )}
          style={{ backgroundColor: color.hex }}
        >
          {value === color.hex && (
            <Check className="w-4 h-4 text-white stroke-[3]" />
          )}
        </Button>
      ))}
    </div>
  );
};

export default ColorsGroup;