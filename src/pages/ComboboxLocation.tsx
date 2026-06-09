import { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, MapPin, ChevronsUpDown, Check, Search } from "lucide-react";
import type { RootState } from "@/features/store/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComboboxLocationProps } from "@/interface/Interface";

const ComboboxLocation = memo(({selected, onUpdate, placeholder = "Qidirish...", contentClassName}: ComboboxLocationProps & { contentClassName?: string }) => {

  const locations = useSelector((s: RootState) => s.geoJson.data);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(
      (loc) =>
        loc.id !== selected?.id &&
        loc.properties?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [locations, selected, search]);


  const handleSelect = useCallback(
    (loc: (typeof locations)[0]) => {
      onUpdate(loc);
      setOpen(false);
      setSearch("");
    },
    [onUpdate]
  );

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between font-normal text-sm h-9 transition-all duration-200",
          open && "border-primary/50 ring-2 ring-primary/20"
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected && <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />}
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.properties?.name ?? placeholder}
          </span>
        </div>
        <ChevronsUpDown className={cn(
          "ml-2 h-3.5 w-3.5 shrink-0 transition-transform duration-200",
          open ? "opacity-70 rotate-180" : "opacity-40"
        )} />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+4px)] left-0 right-0 z-[9999]",
            "rounded-xl border border-border/60 bg-popover shadow-xl overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-100",
            contentClassName
          )}
        >
          <div className="flex items-center gap-2 px-3 border-b border-border/40 bg-muted/20">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full h-9 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div style={{ maxHeight: "180px", overflowY: "auto" }} className="p-1">
            {filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <MapPin className="h-5 w-5 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Mavjud joy yo'q</p>
              </div>
            ) : (
              filteredLocations.map((loc, index) => (
                <div
                  key={`${loc.properties?.name}-${index}`}
                  onClick={() => handleSelect(loc)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-100 group"
                >
                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="flex-1 truncate">{loc.properties?.name}</span>
                  {selected?.properties?.name === loc.properties?.name && (
                    <Check className="ml-auto h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1.5 rounded-xl border border-primary/20 bg-primary/5 group hover:bg-primary/10 transition-colors duration-200">
          <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <MapPin className="w-2.5 h-2.5 text-primary" />
          </div>
          <span className="text-xs flex-1 truncate font-medium text-foreground">
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