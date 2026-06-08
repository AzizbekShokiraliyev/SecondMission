import { memo, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Combobox, 
  ComboboxContent, 
  ComboboxInput, 
  ComboboxItem, 
  ComboboxList 
} from "@/components/ui/combobox";
import type { Feature } from "geojson";
import type { MultiSelectComboboxProps } from "@/interface/Interface";
import type { RootState } from "@/features/store/store";

const ComboboxLocation = memo(({
  label,
  colorClass,
  selected,
  onUpdate,
  placeholder = "Qidirish..."
}: MultiSelectComboboxProps) => {

  const locations = useSelector((s: RootState) => s.geoJson.data);

  const availableLocations = useMemo(() => {
    const selectedNames = new Set(selected.map(s => s.properties?.name));
    return locations.filter(loc => !selectedNames.has(loc.properties?.name));
  }, [locations, selected]);

  const handleSelect = useCallback((value: string | null) => {
    if (!value) return;
    
    const item = locations.find(l => l.properties?.name === value);
    
    if (item && !selected.some(s => s.properties?.name === value)) {
      onUpdate([...selected, item]);
    }
  }, [locations, selected, onUpdate]);

  const removeItem = useCallback((itemToRemove: Feature) => {
    onUpdate(selected.filter(s => s !== itemToRemove));
  }, [selected, onUpdate]);

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        {label}
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((loc, index) => (
            // key uchun unikal qiymat (name + index)
            <Badge key={`${loc.properties?.name}-${index}`} variant="secondary">
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
            {availableLocations.map((loc, index) => (
              <ComboboxItem 
                key={`${loc.properties?.name}-${index}`} 
                value={loc.properties?.name || ''}
              >
                {loc.properties?.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
});

ComboboxLocation.displayName = "ComboboxLocation";

export default ComboboxLocation;