import type { Feature } from "geojson";

export const getCentroid = (geometry: Feature['geometry']): [number, number] => {
  // 1. Agar nuqta (Point) bo'lsa, to'g'ridan-to'g'ri koordinatani qaytaring
  if (geometry.type === 'Point') {
    return [geometry.coordinates[0], geometry.coordinates[1]];
  }

  // 2. Polygon uchun barcha nuqtalarni o'rtacha qiymatini hisoblang
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates.flat(1);
    const sum = coords.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [sum[0] / coords.length, sum[1] / coords.length];
  }

  // 3. MultiPolygon uchun
  if (geometry.type === 'MultiPolygon') {
    const coords = geometry.coordinates.flat(2);
    const sum = coords.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [sum[0] / coords.length, sum[1] / coords.length];
  }

  return [0, 0]; // Agar tipi noma'lum bo'lsa
};