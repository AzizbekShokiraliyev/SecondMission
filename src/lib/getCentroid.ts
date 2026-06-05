import type { Feature, Polygon, MultiPolygon } from "geojson";

export const getCentroid = (geometry: Feature['geometry']): [number, number] => {
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