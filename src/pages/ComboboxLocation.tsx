/**
 * ComboboxLocation — multi-select (or single-select) location picker.
 *
 * New prop: `singleSelect?: boolean`
 *   - false (default): select multiple "to" stops — clicking an already-selected
 *     item removes it; clicking a new one appends it.
 *   - true: only one item at a time (used for the "from" field in RouteSegmentCard).
 */
import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Feature } from "geojson";
import type { LocationComboboxProps } from "@/interface/Interface";

interface Props extends LocationComboboxProps {
  singleSelect?: boolean;
}

export const ComboboxLocation = ({
  label,
  colorClass,
  selected,
  onUpdate,
  locations,
  placeholder = "Tanlash...",
  singleSelect = false,
}: Props) => {
  const [open, setOpen] = useState(false);

  const toggle = (feature: Feature) => {
    const name = feature.properties?.name;
    const already = selected.some((s) => s.properties?.name === name);

    if (singleSelect) {
      // always replace
      onUpdate(already ? [] : [feature]);
      setOpen(false);
      return;
    }

    if (already) {
      onUpdate(selected.filter((s) => s.properties?.name !== name));
    } else {
      onUpdate([...selected, feature]);
    }
  };

  const remove = (name: string) =>
    onUpdate(selected.filter((s) => s.properties?.name !== name));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className={cn("w-2 h-2 rounded-full", colorClass)} />
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </label>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm font-normal h-9"
          >
            <span className="truncate text-muted-foreground">
              {selected.length === 0
                ? placeholder
                : singleSelect
                ? selected[0].properties?.name
                : `${selected.length} ta tanlandi`}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandInput placeholder="Qidirish..." className="h-8 text-sm" />
            <CommandEmpty>Topilmadi</CommandEmpty>
            <CommandGroup className="max-h-52 overflow-y-auto">
              {locations.map((loc) => {
                const name = loc.properties?.name;
                const isSelected = selected.some((s) => s.properties?.name === name);
                return (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => toggle(loc)}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selected.length > 0 && !singleSelect && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {selected.map((s) => (
            <Badge
              key={s.properties?.name}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {s.properties?.name}
              <button
                onClick={() => remove(s.properties?.name)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComboboxLocation;