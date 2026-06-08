import { memo, useMemo, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { X, MapPin, ChevronsUpDown, Check } from "lucide-react";
import type { RootState } from "@/features/store/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import type { ComboboxLocationProps } from "@/interface/Interface";

const ComboboxLocation = memo(({selected, onUpdate, placeholder = "Qidirish..."}: ComboboxLocationProps) => {
  
  const locations = useSelector((s: RootState) => s.geoJson.data);
  const [open, setOpen] = useState(false);

  const availableLocations = useMemo(() => {
    return locations.filter(
      (loc) => loc.properties?.name !== selected?.properties?.name
    );
  }, [locations, selected]);

  const handleSelect = useCallback(
    (value: string) => {
      const item = locations.find(
        (l) => l.properties?.name?.toLowerCase() === value.toLowerCase()
      );
      if (item) {
        onUpdate(item);
        setOpen(false);
      }
    },
    [locations, onUpdate]
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal text-sm h-9"
          >
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected?.properties?.name ?? placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} className="h-9" />
            <CommandList>
              <CommandEmpty>
                <div className="py-3 text-center text-xs text-muted-foreground">
                  Mavjud joy yo'q
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableLocations.map((loc, index) => (
                  <CommandItem
                    key={`${loc.properties?.name}-${index}`}
                    value={loc.properties?.name || ""}
                    onSelect={handleSelect}
                  >
                    <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                    {loc.properties?.name}
                    {selected?.properties?.name === loc.properties?.name && (
                      <Check className="ml-auto h-3.5 w-3.5" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected && (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/40 bg-background/40 group hover:bg-muted/40 transition-colors">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0")}>
            <MapPin className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-xs flex-1 truncate font-medium">
            {selected.properties?.name}
          </span>
          <button
            onClick={() => onUpdate(null)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/15 text-muted-foreground hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
});


export default ComboboxLocation;