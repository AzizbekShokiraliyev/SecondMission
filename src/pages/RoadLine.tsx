import { useState, useCallback, useContext, useRef, useEffect } from 'react';
import { Plus, X, ArrowRight, Route, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useDispatch } from 'react-redux';
import { addRoad, type Road, type RoadPoint } from '@/features/store/RoadSlice';
import { MapContext } from '@/components/context/MapContext';
import { getCentroid } from '@/lib/getCentroid';
import { toast } from 'sonner';
import ComboboxLocation from './ComboboxLocation';
import ColorsGroup from './ColorsGroup';
import { ROUTE_COLORS, fetchAndDispatchRoute } from '@/lib/routeUtils'; // 👈 import shared utils
import type { Feature } from 'geojson';
import { Map } from 'maplibre-gl';

const RoadLine = () => {
  const dispatch = useDispatch();
  const mapContext = useContext(MapContext);
  const map = mapContext instanceof Map ? mapContext : null;

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Feature | null>(null);
  const [to, setTo] = useState<Feature | null>(null);
  const [color, setColor] = useState(ROUTE_COLORS[0].hex);
  const [roadName, setRoadName] = useState('');
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setFrom(null);
    setTo(null);
    setColor(ROUTE_COLORS[0].hex);
    setRoadName('');
  }, []);

  const handleAdd = async () => {
    if (!from || !to) return;

    const fromCentroid = getCentroid(from.geometry) as [number, number];
    const toCentroid = getCentroid(to.geometry) as [number, number];

    const fromPoint: RoadPoint = { name: from.properties?.name ?? 'A', centroid: fromCentroid };
    const toPoint: RoadPoint = { name: to.properties?.name ?? 'B', centroid: toCentroid };

    const newRoad: Road = {
      id: `road-${Date.now()}`,
      name: roadName.trim() || `${fromPoint.name} → ${toPoint.name}`,
      from: fromPoint,
      to: toPoint,
      color,
      createdAt: Date.now(),
    };

    setOpen(false);
    reset();
    dispatch(addRoad(newRoad));

    setLoading(true);
    try {
      await fetchAndDispatchRoute(newRoad, dispatch, map);
      if (mountedRef.current) {
        toast.success(`Marshrut qo'shildi: ${newRoad.name}`);
      }
    } catch {
      if (mountedRef.current) {
        toast.error("Marshrut topilmadi, lekin tarixga saqlandi");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const isValid = !!from && !!to;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 h-9 border-dashed hover:border-solid hover:bg-muted/50 transition-all"
        onClick={() => { reset(); setOpen(true); }}
        disabled={loading}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        Yo'nalish qo'shish
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Route className="w-3.5 h-3.5 text-blue-600" />
              </div>
              Yangi yo'nalish
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nom (ixtiyoriy)
              </label>
              <input
                type="text"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder={
                  from && to
                    ? `${from.properties?.name} → ${to.properties?.name}`
                    : 'Marshrut nomi...'
                }
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-green-500" />
                Boshlang'ich nuqta
              </label>
              <ComboboxLocation selected={from} onUpdate={setFrom} placeholder="Qayerdan?" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border/60" />
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-red-500" />
                Tugatish nuqtasi
              </label>
              <ComboboxLocation selected={to} onUpdate={setTo} placeholder="Qayerga?" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Yo'l rangi
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                <ColorsGroup value={color} onChange={setColor} />
                <div
                  className="ml-auto h-1.5 w-12 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="gap-1.5">
              <X className="w-3.5 h-3.5" />
              Bekor
            </Button>
            <Button
              size="sm"
              disabled={!isValid}
              onClick={handleAdd}
              className="gap-1.5"
              style={isValid ? { backgroundColor: color, color: '#fff' } : undefined}
            >
              <Plus className="w-3.5 h-3.5" />
              Qo'shish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoadLine;