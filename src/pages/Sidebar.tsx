import { Sidebar as MainSidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Search from "./Search";
import Filter from "./Filter";
import { useContext, useState, useEffect } from "react";
import { useDebounce } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from '@/features/store/store';
import { setSortBy, type SortByType } from "@/features/store/filterSlice";
import ColorsGroup from "./ColorsGroup";
import { setSelectedFeature, setRouteGeometry, setRouteColor, setDirectionsInstructions } from "@/features/store/mapSlice";
import type { Feature, GeoJsonProperties } from "geojson";
import type { DirectionStep, OSRMLeg, OSRMStep } from "@/interface/Interface";
import { toast } from "sonner";
import { Navigation, MapPin, RotateCcw, Clock, Route, ArrowRight, Loader2 } from "lucide-react";
import LocationAdd from "./LocationAdd";
import { MapContext } from "@/components/context/MapContext";
import { getCentroid } from "@/lib/getCentroid";
import { ComboboxLocation } from "./ComboboxLocation";

const getDensityFromProperties = (props: GeoJsonProperties | null | undefined): number => {
  if (!props) return 0;
  const val = props.density;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

function fmtDist(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function fmtTime(s: number) {
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
  return `${Math.round(s / 60)} min`;
}

const Sidebar = () => {
  const [text, setText] = useState("");
  const [debouncedValue] = useDebounce(text, 300);
  const [loading, setLoading] = useState(false);
  const map = useContext(MapContext);

  const dispatch = useDispatch();
  const sortBy = useSelector((s: RootState) => s.location.sortBy) as SortByType;
  const routeColor = useSelector((s: RootState) => s.map.routeColor);
  const directions = useSelector((s: RootState) => s.map.directionsInstructions) as DirectionStep[];
  const locations = useSelector((s: RootState) => s.geoJson.data);

  const [fromPoints, setFromPoints] = useState<Feature[]>([]);
  const [toPoints, setToPoints] = useState<Feature[]>([]);

  const allRoutePoints = [...fromPoints, ...toPoints];

  const totalDist = directions.reduce((s, d) => s + (d.distance || 0), 0);
  const totalTime = directions.reduce((s, d) => s + (d.duration || 0), 0);

  const filteredLocations = locations
    .filter(l => l.properties?.name?.toLowerCase().includes(debouncedValue.toLowerCase()))
    .sort((a, b) => {
      if (!sortBy) return 0;
      const areaA = getDensityFromProperties(a.properties);
      const areaB = getDensityFromProperties(b.properties);
      if (sortBy === 'area-asc') return areaA - areaB;
      if (sortBy === 'area-desc') return areaB - areaA;
      return 0;
    });

  useEffect(() => {
    if (locations.length > 0) {
      console.log('Sample location properties:', locations[0].properties);
      console.log('Detected area value:', getDensityFromProperties(locations[0].properties));
    }
  }, [locations]);

  const handleShowRoute = async () => {
    if (allRoutePoints.length < 2) {
      toast.error("Marshrut uchun kamida 2 ta nuqta tanlang (boshlang‘ich + kamida 1 ta to‘xtash joyi)");
      return;
    }

    setLoading(true);
    const coordsString = allRoutePoints
      .map(l => getCentroid(l.geometry))
      .map(c => `${c[0]},${c[1]}`)
      .join(';');

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?geometries=geojson&overview=full&steps=true`);
      const data = await res.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        dispatch(setRouteGeometry({
          type: 'Feature',
          geometry: route.geometry,
          properties: {}
        }));

        const steps: DirectionStep[] = route.legs.flatMap((leg: OSRMLeg) =>
          leg.steps.map((step: OSRMStep) => ({
            distance: step.distance,
            duration: step.duration,
            instruction: `${step.maneuver.type} ${step.maneuver.modifier ?? ''}`.trim(),
            name: step.name,
            maneuver: step.maneuver
          }))
        );
        dispatch(setDirectionsInstructions(steps));
        toast.success(`Marshrut tayyor! ${allRoutePoints.length} nuqta, ${(route.distance / 1000).toFixed(1)} km`);
      } else {
        toast.error("Ushbu nuqtalar bo‘ylab yo‘l topilmadi");
      }
    } catch (error) {
      console.error("Route error:", error);
      toast.error("Marshrutni hisoblashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoute = () => {
    setFromPoints([]);
    setToPoints([]);
    dispatch(setRouteGeometry(null));
    dispatch(setDirectionsInstructions([]));
    toast.info("Marshrut tozalandi");
  };

  const handleLocationSelect = (coords: [number, number]) => {
    if (map) {
      map.flyTo({ center: coords, zoom: 4, essential: true, duration: 1500 });
    }
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
            <TabsList className="grid w-full grid-cols-2 mx-2 mb-1" style={{ width: 'calc(100% - 16px)' }}>
              <TabsTrigger value="location"><MapPin className="w-3 h-3" /> Shtatlar</TabsTrigger>
              <TabsTrigger value="road"><Route className="w-3 h-3" /> Yo'nalish</TabsTrigger>
            </TabsList>

            <TabsContent value="location">
              <div className="px-2 flex items-center gap-2 mt-2">
                <Search value={text} onChange={setText} placeholder="Qidirish..." />
                <Filter sortBy={sortBy} onSort={(t) => dispatch(setSortBy(t))} />
              </div>
              <SidebarGroup>
                <SidebarGroupLabel>Locations</SidebarGroupLabel>
                <SidebarGroupContent className="max-h-[540px] overflow-y-auto pr-1">
                  <SidebarMenu>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <SidebarMenuItem key={loc.properties?.name}>
                          <SidebarMenuButton
                            className="rounded-lg text-sm gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={() => {
                              dispatch(setSelectedFeature(loc));
                              const coords = getCentroid(loc.geometry);
                              handleLocationSelect(coords);
                            }}
                          >
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            {loc.properties?.name}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        <div className="text-2xl mb-2">🔍</div>
                        Ma'lumot topilmadi
                      </div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <LocationAdd />
            </TabsContent>

            <TabsContent value="road" className="px-2 space-y-3 mt-2">
              <ComboboxLocation
                label="Qayerdan"
                colorClass="bg-green-500"
                selected={fromPoints}
                onUpdate={setFromPoints}
                locations={locations}
                placeholder="Boshlang‘ich shahar..."
              />

              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90" />
                </div>
              </div>

              <ComboboxLocation
                label="Qayerga (to'xtash nuqtalari)"
                colorClass="bg-red-500"
                selected={toPoints}
                onUpdate={setToPoints}
                locations={locations}
                placeholder="To‘xtash joyi qo‘shish..."
              />

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Yo'l rangi</label>
                <ColorsGroup value={routeColor} onChange={(c) => dispatch(setRouteColor(c))} />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2 font-semibold"
                  onClick={handleShowRoute}
                  disabled={loading || allRoutePoints.length < 2}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  {loading ? "Qidirmoqda..." : "Yo'nalishni ko'rsat"}
                </Button>
                {(fromPoints.length > 0 || toPoints.length > 0) && (
                  <Button variant="outline" size="icon" onClick={handleClearRoute} title="Tozalash">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {directions.length > 0 && (
                <div className="space-y-2 mt-1">
                  <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-200/50 dark:border-blue-800/30 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">{fmtDist(totalDist)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">~{fmtTime(totalTime)}</span>
                    </div>
                  </div>
                </div>
              )}

              <LocationAdd />
            </TabsContent>
          </Tabs>
        </SidebarGroup>
      </SidebarContent>
    </MainSidebar>
  );
};

export default Sidebar;