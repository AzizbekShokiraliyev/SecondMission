import { Sidebar as MainSidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Search from "./Search";
import Filter from "./Filter";
import { useState } from "react";
import { useDebounce } from 'use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from '@/features/store/store';
import { setSortBy } from "@/features/store/filterSlice";
import ColorsGroup from "./ColorsGroup";
import RoadInfoCard from "./RoadInfoCard";
import { setSelectedFeature, setRouteGeometry, setRouteColor, setRouteFrom, setRouteTo, setDirectionsInstructions } from "@/features/store/mapSlice";
import type { Feature, Polygon, MultiPolygon, LineString, Point } from "geojson";
import type { DirectionStep, OSRMStep } from "@/interface/Interface";
import { toast } from "sonner";

const getCentroid = (geometry: Feature['geometry']): [number, number] => {
  if (!geometry) return [0, 0];
  if (geometry.type === 'Polygon') {
    const coords = (geometry as Polygon).coordinates[0];
    let lon = 0, lat = 0;
    for (let i = 0; i < coords.length; i++) {
      lon += coords[i][0];
      lat += coords[i][1];
    }
    return [lon / coords.length, lat / coords.length];
  }
  if (geometry.type === 'MultiPolygon') {
    const coords = (geometry as MultiPolygon).coordinates[0][0];
    let lon = 0, lat = 0;
    for (let i = 0; i < coords.length; i++) {
      lon += coords[i][0];
      lat += coords[i][1];
    }
    return [lon / coords.length, lat / coords.length];
  }
  return [0, 0];
};

const Sidebar = () => {
  const [text, setText] = useState<string>("");
  const [debouncedValue] = useDebounce(text, 300);
  const [fromLocation, setFromLocation] = useState<Feature | null>(null);
  const [toLocation, setToLocation] = useState<Feature | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const dispatch = useDispatch();
  const sortBy = useSelector((state: RootState) => state.location.sortBy) as "asc" | "desc" | null;
  const routeColor = useSelector((state: RootState) => state.map.routeColor);
  
  const locations = useSelector((state: RootState) => state.geoJson.data);

  const filteredLocations = locations
    .filter((loc) => loc.properties?.name?.toLowerCase().includes(debouncedValue.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "asc") return (a.properties?.name || '').localeCompare(b.properties?.name || '');
      if (sortBy === "desc") return (b.properties?.name || '').localeCompare(a.properties?.name || '');
      return 0;
    });

  const fromFiltered = locations.filter((loc) => loc.properties?.name?.toLowerCase().includes(fromQuery.toLowerCase()));
  const toFiltered = locations.filter((loc) => loc.properties?.name?.toLowerCase().includes(toQuery.toLowerCase()));

  const handleSort = (type: "asc" | "desc") => {
    dispatch(setSortBy(type));
  };

  const handleLocationClick = (feature: Feature) => {
    dispatch(setSelectedFeature(feature));
  };

  const handleShowRoute = async () => {
    if (!fromLocation || !toLocation) {
      toast.error("Iltimos, ikkala shtatni tanlang");
      return;
    }

    const fromCoord = getCentroid(fromLocation.geometry);
    const toCoord = getCentroid(toLocation.geometry);

    const fromPoint: Feature<Point> = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: fromCoord },
      properties: {},
    };
    const toPoint: Feature<Point> = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: toCoord },
      properties: {},
    };
    dispatch(setRouteFrom(fromPoint));
    dispatch(setRouteTo(toPoint));

    const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord[0]},${fromCoord[1]};${toCoord[0]},${toCoord[1]}?geometries=geojson&steps=true`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const lineGeometry: LineString = data.routes[0].geometry;
        const routeFeature: Feature<LineString> = {
          type: 'Feature',
          geometry: lineGeometry,
          properties: {},
        };
        dispatch(setRouteGeometry(routeFeature));

        const steps: DirectionStep[] = data.routes[0].legs[0].steps.map((step: OSRMStep) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.maneuver.instruction,
          name: step.name,
          maneuver: {
            location: step.maneuver.location,
            type: step.maneuver.type,
            modifier: step.maneuver.modifier,
          },
        }));
        dispatch(setDirectionsInstructions(steps));
        toast.success("Yo'nalish topildi");
      } else {
        toast.error("Yo'nalish topilmadi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    }
  };

  

  return (
    <div>
      <MainSidebar variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 cursor-pointer p-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">M</div>
            <span className="text-xl font-bold tracking-tight">MapFlow</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase underline">Main Menu</SidebarGroupLabel>

            <Tabs defaultValue="location" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="location">Shtate location</TabsTrigger>
                <TabsTrigger value="road">Show Road</TabsTrigger>
              </TabsList>

              <TabsContent value="location">
              <div className="px-2 flex items-center gap-2 mt-2">
                <Search value={text} onChange={(val) => setText(val)} placeholder="Search locations..." />
                <Filter sortBy={sortBy} onSort={handleSort} />
              </div>
              
              <SidebarGroup>
                <SidebarGroupLabel>Locations</SidebarGroupLabel>
                <SidebarGroupContent className="max-h-[590px] overflow-y-auto">
                  <SidebarMenu>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <SidebarMenuItem key={loc.properties?.name}>
                          <SidebarMenuButton onClick={() => handleLocationClick(loc)}>
                            {loc.properties?.name}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">Ma'lumot topilmadi</div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </TabsContent>

              <TabsContent value="road">
                <div className="mt-2 mb-2">
                  <Combobox onValueChange={(val) => {
                    const selected = locations.find(l => l.properties?.name === val);
                    setFromLocation(selected || null);
                  }}>
                    <ComboboxInput onChange={(e) => setFromQuery(e.target.value)} placeholder="Qayerdan..." />
                    <ComboboxContent>
                      <ComboboxEmpty>Hech narsa topilmadi</ComboboxEmpty>
                      <ComboboxList>
                        {fromFiltered.map((loc) => (
                          <ComboboxItem key={loc.properties?.name} value={loc.properties?.name || ''}>
                            {loc.properties?.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="mt-2 mb-2">
                  <Combobox onValueChange={(val) => {
                    const selected = locations.find(l => l.properties?.name === val);
                    setToLocation(selected || null);
                  }}>
                    <ComboboxInput onChange={(e) => setToQuery(e.target.value)} placeholder="Qayerga..." />
                    <ComboboxContent>
                      <ComboboxEmpty>Hech narsa topilmadi</ComboboxEmpty>
                      <ComboboxList>
                        {toFiltered.map((loc) => (
                          <ComboboxItem key={loc.properties?.name} value={loc.properties?.name || ''}>
                            {loc.properties?.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div>
                  <h1 className="mb-1 font-medium">Select road color</h1>
                  <ColorsGroup value={routeColor} onChange={(color) => dispatch(setRouteColor(color))} />
                </div>

                <RoadInfoCard />

                <Button size={'xl'} variant={'outline'} onClick={handleShowRoute} className="mt-3 w-full">
                  Yo'nalishni ko'rsat
                </Button>
              </TabsContent>
            </Tabs>
          </SidebarGroup>
        </SidebarContent>
      </MainSidebar>
    </div>
  );
};

export default Sidebar;