import {Sidebar as MainSidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '@/components/ui/sidebar';
import Search from './Search';
import Filter from './Filter';
import { useContext, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import { setSortBy, type SortByType } from '@/features/store/filterSlice';
import { setDirectionsInstructions, toggleStateName, removeRoute } from '@/features/store/mapSlice';
import { removeRoad, setActiveRoad, toggleSelectedRoad } from '@/features/store/RoadSlice';
import type { GeoJsonProperties } from 'geojson';
import type { DirectionStep, Road } from '@/interface/Interface';
import { toast } from 'sonner';
import { Navigation, MapPin, Clock, Route, Check } from 'lucide-react';
import { MapContext } from '@/components/context/MapContext';
import { getCentroid } from '@/lib/getCentroid';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import type { Feature } from 'geojson';
import { fetchAndDispatchRoute } from '@/lib/routeUtils';
import AddRoadLine from './AddRoadLine';
import LocationAdd from './LocationAdd';
import { RoadHistoryItem } from './RoadHistory';

const getDensity = (props: GeoJsonProperties | null | undefined): number => {
  if (!props) return 0;
  const v = props.density;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmtTime(s: number) {
  return s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`
    : `${Math.round(s / 60)} min`;
}

const Sidebar = () => {
  const [text, setText] = useState('');
  const [debouncedValue] = useDebounce(text, 300);
  const [routeLoading, setRouteLoading] = useState(false);
  const map = useContext(MapContext);
  const dispatch = useDispatch();

  const sortBy = useSelector((s: RootState) => s.location.sortBy) as SortByType;
  const directions = useSelector((s: RootState) => s.map.directionsInstructions) as DirectionStep[];
  const locations = useSelector((s: RootState) => s.geoJson.data);
  const selectedStateNames: string[] = useSelector((s: RootState) => s.map.selectedStateNames ?? []);
  const roads = useSelector((s: RootState) => s.road.roads);
  const activeRoadId = useSelector((s: RootState) => s.road.activeRoadId);
  const selectedRoadIds = useSelector((s: RootState) => s.road.selectedRoadIds);

  const totalDist = directions.reduce((s, d) => s + (d.distance || 0), 0);
  const totalTime = directions.reduce((s, d) => s + (d.duration || 0), 0);

  const filteredLocations = locations
    .filter((loc) => loc.properties?.name?.toLowerCase().includes(debouncedValue.toLowerCase()))
    .sort((a, b) => {if (!sortBy) return 0;
      const dataA = getDensity(a.properties), dataB = getDensity(b.properties);
      return sortBy === 'area-asc' ? dataA - dataB : dataB - dataA;
    });

  const handleLocationClick = (loc: Feature) => {
    const name = loc.properties?.name as string;
    dispatch(toggleStateName(name));
    if (!selectedStateNames.includes(name)) {
      const coords = getCentroid(loc.geometry);
      map?.flyTo({ center: coords, zoom: 6, essential: true, duration: 1500 });
    }
  };

  const handleSelectRoad = useCallback(
    async (road: Road) => {
      const isCurrentlySelected = selectedRoadIds.includes(road.id);

      if (isCurrentlySelected) {
        dispatch(toggleSelectedRoad(road.id));
        dispatch(removeRoute(`route-${road.id}`));

        if (road.id === activeRoadId) {
          dispatch(setActiveRoad(null));
          dispatch(setDirectionsInstructions([]));
        }
        return;
      }

      setRouteLoading(true);
      try {
        await fetchAndDispatchRoute({ road, dispatch, map });
      } catch {
        toast.error(`Marshrut topilmadi: ${road.name}`);
      } finally {
        setRouteLoading(false);
      }
    },
    [activeRoadId, selectedRoadIds, dispatch, map]
  );

  const handleRemoveRoad = useCallback(
    (id: string) => {
      dispatch(removeRoad(id));
      dispatch(removeRoute(`route-${id}`));

      if (id === activeRoadId) {
        dispatch(setActiveRoad(null));
        dispatch(setDirectionsInstructions([]));
      }
    },
    [activeRoadId, dispatch]
  );

  return (
    <MainSidebar variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-3 p-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Navigation className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">MapFlow</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Navigator
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Tabs defaultValue="location" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2 mx-2 mb-1"
              style={{ width: 'calc(100% - 16px)' }}
            >
              <TabsTrigger value="location">
                <MapPin className="w-3 h-3 mr-1" /> Shtatlar
              </TabsTrigger>
              <TabsTrigger value="road">
                <Route className="w-4 h-3 mr-1" /> Yo'nalish
              </TabsTrigger>
            </TabsList>

            <TabsContent value="location">
              <div className="px-2 flex items-center gap-2 mt-2">
                <Search value={text} onChange={setText} placeholder="Qidirish..." />
                <Filter sortBy={sortBy} onSort={(t) => dispatch(setSortBy(t))} />
              </div>
              <SidebarGroup>
                <SidebarGroupLabel>
                  Locations
                  {selectedStateNames.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({selectedStateNames.length})
                    </span>
                  )}
                </SidebarGroupLabel>
                <SidebarGroupContent className="max-h-[540px] overflow-y-auto pr-1">
                  <SidebarMenu>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => {
                        const name = loc.properties?.name as string;
                        const isSelected = selectedStateNames.includes(name);
                        return (
                          <SidebarMenuItem key={name}>
                            <SidebarMenuButton
                              className="rounded-lg text-sm gap-2 transition-all hover:bg-muted/60"
                              onClick={() => handleLocationClick(loc)}
                            >
                              <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="flex-1 truncate">{name}</span>
                              {isSelected && (
                                <Check
                                  className="w-3.5 h-3.5 text-muted-foreground shrink-0"
                                  strokeWidth={2.5}
                                />
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })
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
              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Tarix</CardTitle>
                        <CardDescription className="text-[10px]">
                          {roads.length > 0
                            ? `${roads.length} ta saqlangan yo'nalish`
                            : "Yo'nalishlar bu yerda saqlanadi"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRoadIds.length > 0 && (
                        <span className="text-[10px] text-blue-500 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                          {selectedRoadIds.length} faol
                        </span>
                      )}
                      {routeLoading && (
                        <span className="w-4 h-4 border-2 border-muted-foreground/20 border-t-blue-500 rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                  {roads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-5 gap-2 rounded-xl bg-muted/30 border border-dashed border-border/60">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <Route className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Marshrut tarixi yo'q
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 text-center px-4">
                        Qo'shilgan yo'nalishlar bu yerda ko'rinadi
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-70 overflow-y-auto">
                      {roads.map((road) => (
                        <RoadHistoryItem
                          key={road.id}
                          road={road}
                          isActive={selectedRoadIds.includes(road.id)}
                          onSelect={handleSelectRoad}
                          onRemove={handleRemoveRoad}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <AddRoadLine />

              {directions.length > 0 && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-200/50 dark:border-blue-800/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">{fmtDist(totalDist)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">~{fmtTime(totalTime)}</span>
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