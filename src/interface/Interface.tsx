import type { RouteStop } from "@/pages/Sidebar";
import type { Feature, LineString, Point } from "geojson";
import type { MapLibreMap } from "maplibre-gl";
import {type MapProps as LibMapProps} from '@vis.gl/react-maplibre';

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface UserDataAuth {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface AuthState {
  user: UserDataAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GeoJsonFeature {
  geometry: object;
  properties: {
    name: string;
  };
}

export interface FilterState {
  searchQuery: string;
  sortBy: string;
}

export interface FilterProps {
  sortBy: 'area-asc' | 'area-desc' | null;
  onSort: (value: 'area-asc' | 'area-desc') => void;
}

export interface RouteColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}


export interface StoredRoute {
  id: string;
  geometry: Feature<LineString>;
  color: string;
}

export interface MapState {
  selectedFeature: Feature | null;
  routeGeometry: Feature<LineString> | null;
  routeColor: string;
  directionsInstructions: DirectionStep[];
  selectedLocations: Feature[];
  routeFrom: Feature<Point> | null;
  routeTo: Feature<Point> | null;
  routes: StoredRoute[];
  currentInstructionIndex: number;
}

export interface ComboboxLocationProps {
  selected: Feature | null;
  onUpdate: (f: Feature | null) => void;
  placeholder?: string;
}

export type MultiSelectComboboxProps = ComboboxLocationProps;

export interface OSRMManeuver {
  location: [number, number];
  type: string;
  modifier?: string;
}

export interface OSRMStep {
  distance: number;
  duration: number;
  name?: string;
  maneuver: OSRMManeuver;
}

export interface OSRMLeg {
  steps: OSRMStep[];
  distance: number;
  duration: number;
}

export interface DirectionStep {
  distance: number;
  duration: number;
  instruction: string;
  name?: string;
  maneuver: OSRMManeuver;
}

export interface WaypointWithColor {
  feature: Feature;
  color: string;
}


export interface RouteStopListProps {
  stops: RouteStop[];
  onUpdate: (stops: RouteStop[]) => void;
}

export interface MapProps extends LibMapProps {
  onMapLoad?: (map: MapLibreMap) => void;
}