import { setActiveRoad } from '@/features/store/RoadSlice';
import { setRoutes, setDirectionsInstructions } from '@/features/store/mapSlice';
import type { StoredRoute, OSRMLeg, OSRMStep, DirectionStep, FetchRouteParams } from '@/interface/Interface';

export const ROUTE_COLORS = [
  { hex: '#378ADD', name: "Ko'k" },
  { hex: '#1D9E75', name: 'Yashil' },
  { hex: '#E24B4A', name: 'Qizil' },
  { hex: '#7F77DD', name: 'Binafsha' },
  { hex: '#F59E0B', name: 'Sariq' },
  { hex: '#EC4899', name: 'Pushti' },
];

export async function fetchAndDispatchRoute({ road, dispatch, map }: FetchRouteParams): Promise<void> {
  const coordsStr = `${road.from.centroid[0]},${road.from.centroid[1]};${road.to.centroid[0]},${road.to.centroid[1]}`;

  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&steps=true`
  );

  const data = await res.json();
  if (!data.routes?.[0]) throw new Error('Route not found');

  const route = data.routes[0];
  const storedRoute: StoredRoute = {
    id: `route-${road.id}`,
    geometry: { type: 'Feature', geometry: route.geometry, properties: {} },
    color: road.color,
  };

  const steps: DirectionStep[] = route.legs.flatMap((leg: OSRMLeg) =>
    leg.steps.map((step: OSRMStep) => ({
      distance: step.distance,
      duration: step.duration,
      instruction: `${step.maneuver.type} ${step.maneuver.modifier ?? ''}`.trim(),
      name: step.name,
      maneuver: step.maneuver,
    }))
  );

  dispatch(setRoutes([storedRoute]));
  dispatch(setDirectionsInstructions(steps));
  dispatch(setActiveRoad(road.id));

  if (map) {
    const { from, to } = road;
    map.fitBounds(
      [
        [Math.min(from.centroid[0], to.centroid[0]), Math.min(from.centroid[1], to.centroid[1])],
        [Math.max(from.centroid[0], to.centroid[0]), Math.max(from.centroid[1], to.centroid[1])],
      ],
      { padding: 80, duration: 1500 }
    );
  }
}