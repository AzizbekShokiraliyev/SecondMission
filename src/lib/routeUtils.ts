import { setActiveRoad, cacheRoute } from '@/features/store/RoadSlice';
import { addRoute, setDirectionsInstructions } from '@/features/store/mapSlice';
import type {StoredRoute, OSRMLeg, OSRMStep, DirectionStep, FetchRouteParams} from '@/interface/Interface';
import type { Feature, LineString } from 'geojson';

export async function fetchAndDispatchRoute({road, dispatch, map}: FetchRouteParams): Promise<void> {

  let geometry: Feature<LineString>;
  let steps: DirectionStep[];

  if (road.cachedGeometry && road.cachedSteps) {
    geometry = road.cachedGeometry;
    steps = road.cachedSteps;
  } else {
    const coordsStr = `${road.from.centroid[1]},${road.from.centroid[0]};${road.to.centroid[1]},${road.to.centroid[0]}`;
    
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full&steps=true`);
    if (!res.ok) throw new Error(`OSRM xatolik: ${res.status}`);

    const data = await res.json();
    if (!data.routes?.[0]) throw new Error('Route topilmadi');

    const route = data.routes[0];
    geometry = { type: 'Feature', geometry: route.geometry, properties: {} };

    steps = route.legs.flatMap((leg: OSRMLeg) =>
      leg.steps.map((step: OSRMStep) => ({
        distance: step.distance,
        duration: step.duration,
        instruction: `${step.maneuver.type} ${step.maneuver.modifier ?? ''}`.trim(),
        name: step.name,
        maneuver: step.maneuver,
      }))
    );

    dispatch(cacheRoute({ roadId: road.id, geometry, steps }));
  }

  const storedRoute: StoredRoute = {
    id: `route-${road.id}`,
    geometry,
    color: road.color,
  };

  dispatch(addRoute(storedRoute));
  dispatch(setDirectionsInstructions(steps));
  dispatch(setActiveRoad(road.id));

  if (map) {
    const { from, to } = road;
    map.fitBounds(
      [
        [Math.min(from.centroid[1], to.centroid[1]), Math.min(from.centroid[0], to.centroid[0])],
        [Math.max(from.centroid[1], to.centroid[1]), Math.max(from.centroid[0], to.centroid[0])],
      ],
      { padding: 80, duration: 1500 }
    );
  }
}