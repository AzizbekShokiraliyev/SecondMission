import {Sidebar as MainSidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import Search from "./Search";
import Filter from "./Filter";
import { useState } from "react";
import { useDebounce } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList} from "@/components/ui/combobox";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from '@/features/store/store';
import { setSortBy } from "@/features/store/filterSlice";
import ColorsGroup from "./ColorsGroup";
import {setSelectedFeature, setRouteGeometry, setRouteColor, setRouteFrom, setRouteTo, setDirectionsInstructions} from "@/features/store/mapSlice";
import type { Feature, Polygon, MultiPolygon, LineString, Point } from "geojson";
import type { DirectionStep, OSRMStep } from "@/interface/Interface";
import { toast } from "sonner";
import {Navigation, MapPin, RotateCcw, Clock, Route, ArrowRight, Loader2} from "lucide-react";

const getCentroid = (geometry: Feature['geometry']): [number, number] => {
  if (geometry.type === 'Polygon') {
    const c = (geometry as Polygon).coordinates[0];
    return [c.reduce((s,p)=>s+p[0],0)/c.length, c.reduce((s,p)=>s+p[1],0)/c.length];
  }
  if (geometry.type === 'MultiPolygon') {
    const c = (geometry as MultiPolygon).coordinates[0][0];
    return [c.reduce((s,p)=>s+p[0],0)/c.length, c.reduce((s,p)=>s+p[1],0)/c.length];
  }
  return [0, 0];
};


function fmtDist(m: number) {
  if (m >= 1000) return `${(m/1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}
function fmtTime(s: number) {
  if (s >= 3600) return `${Math.floor(s/3600)}h ${Math.round((s%3600)/60)}m`;
  return `${Math.round(s/60)} min`;
}

const Sidebar = () => {
  const [text, setText] = useState("");
  const [debouncedValue] = useDebounce(text, 300);
  const [fromLocation, setFromLoc] = useState<Feature|null>(null);
  const [toLocation,   setToLoc] = useState<Feature|null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery,   setToQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const sortBy = useSelector((s: RootState) => s.location.sortBy) as "asc"|"desc"|null;
  const routeColor = useSelector((s: RootState) => s.map.routeColor);
  const directions = useSelector((s: RootState) => s.map.directionsInstructions) as DirectionStep[];
  const locations = useSelector((s: RootState) => s.geoJson.data);

  const totalDist = directions.reduce((s,d)=>s+(d.distance||0), 0);
  const totalTime = directions.reduce((s,d)=>s+(d.duration||0), 0);

  const filteredLocations = locations
    .filter(l => l.properties?.name?.toLowerCase().includes(debouncedValue.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==='asc')  return (a.properties?.name||'').localeCompare(b.properties?.name||'');
      if (sortBy==='desc') return (b.properties?.name||'').localeCompare(a.properties?.name||'');
      return 0;
    });

  const fromFiltered = locations.filter(l=>l.properties?.name?.toLowerCase().includes(fromQuery.toLowerCase()));
  const toFiltered = locations.filter(l=>l.properties?.name?.toLowerCase().includes(toQuery.toLowerCase()));

  const handleShowRoute = async () => {
    if (!fromLocation || !toLocation) {
      toast.error("Iltimos, ikkala shtatni tanlang");
      return;
    }
    setLoading(true);
    const fromCoord = getCentroid(fromLocation.geometry);
    const toCoord = getCentroid(toLocation.geometry);

    const fromPoint: Feature<Point> = { type:'Feature', geometry:{ type:'Point', coordinates:fromCoord }, properties:{ name: fromLocation.properties?.name } };
    const toPoint: Feature<Point> = { type:'Feature', geometry:{ type:'Point', coordinates:toCoord   }, properties:{ name: toLocation.properties?.name } };
    dispatch(setRouteFrom(fromPoint));
    dispatch(setRouteTo(toPoint));

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoord[0]},${fromCoord[1]};${toCoord[0]},${toCoord[1]}?geometries=geojson&steps=true`);
      const data = await res.json();
      if (data.routes?.[0]) {
        const routeFeature: Feature<LineString> = {
          type:'Feature', geometry: data.routes[0].geometry, properties:{},
        };
        dispatch(setRouteGeometry(routeFeature));
        const steps: DirectionStep[] = data.routes[0].legs[0].steps.map((step: OSRMStep) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver.instruction,
          name: step.name,
          maneuver: { location: step.maneuver.location, type: step.maneuver.type, modifier: step.maneuver.modifier },
        }));
        dispatch(setDirectionsInstructions(steps));
        toast.success(`✅ Yo'nalish topildi — ${fmtDist(data.routes[0].distance)}`);
      } else {
        toast.error("Yo'nalish topilmadi");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFromLoc(null); setToLoc(null);
    setFromQuery(""); setToQuery("");
    dispatch(setRouteGeometry(null));
    dispatch(setRouteFrom(null));
    dispatch(setRouteTo(null));
    dispatch(setDirectionsInstructions([]));
  };

  return (
    <MainSidebar variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-3 p-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Navigation className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">MapFlow</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Navigator</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-2 mb-1" style={{ width:'calc(100% - 16px)' }}>
              <TabsTrigger value="location">
                <MapPin className="w-3 h-3" /> Shtatlar
              </TabsTrigger>
              <TabsTrigger value="road">
                <Route className="w-3 h-3" /> Yo'nalish
              </TabsTrigger>
            </TabsList>

            <TabsContent value="location">
              <div className="px-2 flex items-center gap-2 mt-2">
                <Search value={text} onChange={setText} placeholder="Qidirish..." />
                <Filter sortBy={sortBy} onSort={(t)=>dispatch(setSortBy(t))} />
              </div>
              <SidebarGroup>
                <SidebarGroupLabel>
                  Locations
                </SidebarGroupLabel>
                <SidebarGroupContent className="max-h-[560px] overflow-y-auto pr-1">
                  <SidebarMenu>
                    {filteredLocations.length > 0 ? filteredLocations.map((loc) => (
                      <SidebarMenuItem key={loc.properties?.name}>
                        <SidebarMenuButton
                          className="rounded-lg text-sm gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          onClick={() => dispatch(setSelectedFeature(loc))}
                        >
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          {loc.properties?.name}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )) : (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        <div className="text-2xl mb-2">🔍</div>
                        Ma'lumot topilmadi
                      </div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>

            <TabsContent value="road" className="px-2 space-y-3 mt-2">

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"/>
                  Qayerdan
                </label>
                <Combobox onValueChange={(value) => {
                  const selectedLoc = locations.find(loc => loc.properties?.name === value);
                  setFromLoc(selectedLoc||null);
                }}>
                  <ComboboxInput onChange={(e)=>setFromQuery(e.target.value)} placeholder="Shtatni tanlang..." />
                  <ComboboxContent>
                    <ComboboxEmpty>Topilmadi</ComboboxEmpty>
                    <ComboboxList>
                      {fromFiltered.map(loc=>(
                        <ComboboxItem key={loc.properties?.name} value={loc.properties?.name||''}>
                          {loc.properties?.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"/>
                  Qayerga
                </label>
                <Combobox onValueChange={(value) => {
                  const selectedLoc = locations.find(loc => loc.properties?.name === value);
                  setToLoc(selectedLoc||null);
                }}>
                  <ComboboxInput onChange={(e)=>setToQuery(e.target.value)} placeholder="Shtatni tanlang..." />
                  <ComboboxContent>
                    <ComboboxEmpty>Topilmadi</ComboboxEmpty>
                    <ComboboxList>
                      {toFiltered.map(loc=>(
                        <ComboboxItem key={loc.properties?.name} value={loc.properties?.name||''}>
                          {loc.properties?.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Yo'l rangi</label>
                <ColorsGroup value={routeColor} onChange={(c)=>dispatch(setRouteColor(c))} />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2 font-semibold"
                  onClick={handleShowRoute}
                  disabled={loading || !fromLocation || !toLocation}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Navigation className="w-4 h-4"/>}
                  {loading ? "Qidirmoqda..." : "Yo'nalishni ko'rsat"}
                </Button>
                {(fromLocation || toLocation) && (
                  <Button variant="outline" size="icon" onClick={handleClear} title="Tozalash">
                    <RotateCcw className="w-4 h-4"/>
                  </Button>
                )}
              </div>

              {directions.length > 0 && (
                <div className="space-y-2 mt-1">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-200/50 dark:border-blue-800/30 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-500"/>
                      <span className="text-sm font-semibold">{fmtDist(totalDist)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground"/>
                      <span className="text-xs text-muted-foreground">~{fmtTime(totalTime)}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SidebarGroup>
      </SidebarContent>
    </MainSidebar>
  );
};

export default Sidebar;