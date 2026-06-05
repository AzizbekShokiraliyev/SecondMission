import type { Feature, Geometry, LineString } from "geojson";

// Barcha interfeyslar faqat bir marta e'lon qilinadi
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
  geometry: number; // Eslatma: GeoJSON da geometry odatda object bo'ladi
  properties: {
    name: string;
  };
}

export interface FilterState {
  searchQuery: string;
  sortBy: string;
}

export interface FilterProps {
  sortBy: "asc" | "desc" | null;
  onSort: (type: "asc" | "desc") => void;
}

export interface RouteColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export interface MapState {
  selectedFeature: Feature | null;
  routeFrom: Feature<Geometry> | null;
  routeTo: Feature<Geometry> | null;
  routeGeometry: Feature<LineString> | null;
  routeColor: string;
  directionsInstructions: DirectionStep[];
  currentInstructionIndex: number;
  selectedLocations: Feature[]; // Massiv tipi (Bo'sh massiv [] deb yozilmaydi)
}

// LocationComboboxProps faqat BIR MARTA e'lon qilindi
export interface LocationComboboxProps {
  label: string;
  color: string;
  onChange: (values: Feature[]) => void; // Har doim massiv qabul qiladi
  locations: Feature[];
  placeholder?: string;
}

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

export interface MultiSelectComboboxProps {
  label: string;
  colorClass: string; // masalan "bg-green-500"
  selected: Feature[];
  onUpdate: (selected: Feature[]) => void;
  locations: Feature[];
  placeholder?: string;
}