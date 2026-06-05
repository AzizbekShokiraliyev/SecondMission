import { createContext } from "react";
import type { Map as MapLibreMap } from 'maplibre-gl';

export const MapContext = createContext<MapLibreMap | null>(null);