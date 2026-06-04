import type { Feature, Geometry, LineString } from "geojson";

export default interface DashboardProps {
  children: React.ReactNode;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  checked: boolean;
}

export default interface Road {
  id: string;
  name: string;
  locationIds: string[]; 
  color: string;         
  checked: boolean;
}

export default interface StateProperties {
  name: string;
  density: number;
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
  geometry: number,
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
  value: string
  onChange: (color: string) => void
}

export interface DirectionStep {
  distance: number;        
  duration: number;        
  instruction: string;     
  name?: string;           
  maneuver: {
    location: [number, number];
    bearing_before?: number;
    bearing_after?: number;
    type: string;          
    modifier?: string;     
  };
}

export interface MapState {
  selectedFeature: Feature | null;
  routeFrom: Feature<Geometry> | null;
  routeTo: Feature<Geometry> | null;
  routeGeometry: Feature<LineString> | null;
  routeColor: string;
  directionsInstructions: DirectionStep[];
  currentInstructionIndex: number;   
}

export interface OSRMStep {
  distance: number;
  duration: number;
  geometry: string;
  name: string;
  mode: string;
  maneuver: {
    location: [number, number];
    bearing_before: number;
    bearing_after: number;
    type: string;
    modifier?: string;
    instruction: string;
  };
}