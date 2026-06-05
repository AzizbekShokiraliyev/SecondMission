import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Feature } from "geojson";
import type { MultiSelectComboboxProps } from "@/interface/Interface";



export const ComboboxLocation = ({label, colorClass, selected, onUpdate, locations, placeholder = "Qidirish..."}: MultiSelectComboboxProps) => {

  const handleSelect = (value: string | null) => {
    if (!value) return; 
    const item = locations.find((l) => l.properties?.name === value);
    if (item && !selected.some(s => s.properties?.name === value)) {
      onUpdate([...selected, item]);
    }
  };

  const removeItem = (item: Feature) => {
    onUpdate(selected.filter(s => s !== item));
  };

  const availableLocations = locations.filter(loc => !selected.includes(loc));

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        {label}
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((loc) => (
            <Badge key={loc.properties?.name} variant="secondary">
              {loc.properties?.name}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                onClick={() => removeItem(loc)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Combobox onValueChange={handleSelect}>
        <ComboboxInput placeholder={placeholder} />
        <ComboboxContent>
          <ComboboxList>
            {availableLocations.map((loc) => (
              <ComboboxItem key={loc.properties?.name} value={loc.properties?.name || ''}>
                {loc.properties?.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};
