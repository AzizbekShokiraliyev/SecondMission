import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Plus, X, MapPin, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList} from "@/components/ui/combobox";
import type { RootState } from "@/features/store/store";
import type { Feature } from "geojson";
import { cn } from "@/lib/utils";
import ColorsGroup from "./ColorsGroup";
import type { RouteStopListProps } from "@/interface/Interface";

const DEFAULT_COLOR = "#ef4444";

const RouteStopList = ({ stops, onUpdate }: RouteStopListProps) => {
  const locations = useSelector((s: RootState) => s.geoJson.data);
  const [open, setOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  const usedNames = new Set(stops.map((s) => s.feature.properties?.name));

  const availableLocations = locations.filter(
    (loc) => !usedNames.has(loc.properties?.name)
  );

  const handleSelectFeature = useCallback(
    (value: string | null) => {
      if (!value) return;
      const item = locations.find((loc) => loc.properties?.name === value);
      if (item) setSelectedFeature(item);
    },
    [locations]
  );

  const handleAdd = () => {
    if (!selectedFeature) return;
    onUpdate([...stops, { feature: selectedFeature, color: selectedColor }]);
    setSelectedFeature(null);
    setSelectedColor(DEFAULT_COLOR);
  };

  const handleRemove = (index: number) => {
    onUpdate(stops.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeature(null);
    setSelectedColor(DEFAULT_COLOR);
  };

  return (
    <div className="space-y-2.5">
      {stops.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              To'xtash nuqtalari
            </span>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {stops.length}
            </span>
          </div>

          <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/20">
            {stops.map((stop, i) => (
              <div key={`${stop.feature.properties?.name}-${i}`}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-background/60 hover:bg-muted/40 group transition-colors">

                <span className="text-[10px] font-mono tabular-nums shrink-0 px-1.5 py-0.5 rounded"
                  style={{color: stop.color, backgroundColor: `${stop.color}18`}}>
                  #{i + 1}
                </span>

                <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />

                <span className="text-xs flex-1 truncate font-medium">
                  {stop.feature.properties?.name}
                </span>

                <button
                  onClick={() => handleRemove(i)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-red-500/15 text-muted-foreground hover:text-red-500 shrink-0"
                  title="O'chirish"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        className={cn("w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200",
          open
            ? "border-blue-500/50 bg-blue-500/10 text-blue-400 dark:text-blue-400"
            : "border-dashed border-muted-foreground/30 text-muted-foreground hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5")}>
        {open ? (<><ChevronUp className="w-3.5 h-3.5" />Yopish</>) : (<><Plus className="w-3.5 h-3.5" />Manzil qo'shish</>)}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-3">

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Joy tanlash
              </label>
              <Combobox onValueChange={handleSelectFeature}>
                <ComboboxInput placeholder="Shahar qidirish..." />
                <ComboboxContent>
                  <ComboboxList>
                    {availableLocations.length > 0 ? (
                      availableLocations.map((loc, idx) => (
                        <ComboboxItem
                          key={`${loc.properties?.name}-${idx}`}
                          value={loc.properties?.name || ""}
                        >
                          {loc.properties?.name}
                        </ComboboxItem>
                      ))
                    ) : (
                      <div className="py-3 text-center text-xs text-muted-foreground">
                        Barcha joylar tanlangan
                      </div>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {selectedFeature && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-blue-500/8 border border-blue-500/20 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="text-xs flex-1 truncate font-medium">
                    {selectedFeature.properties?.name}
                  </span>
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Yo'l rangi</label>
              <ColorsGroup value={selectedColor} onChange={setSelectedColor}/>
            </div>

            <div className="border-t border-border/30" />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 font-semibold"
                onClick={handleAdd}
                disabled={!selectedFeature}
              >
                <Plus className="w-3 h-3" />
                Qo'shish
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs text-muted-foreground"
                onClick={handleClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStopList;