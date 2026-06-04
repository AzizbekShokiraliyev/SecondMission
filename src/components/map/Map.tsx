import { Map as MainMap, Source, Layer, Popup, NavigationControl, ScaleControl, useMap, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import type { ExpressionSpecification } from 'maplibre-gl';
import type { Feature, LineString, MultiLineString } from 'geojson';
import { FullscreenControl } from '@vis.gl/react-maplibre';
import { Van } from 'lucide-react';

function MapController() {
  const { current: map } = useMap();
  const selectedFeature = useSelector((state: RootState) => state.map.selectedFeature);

  useEffect(() => {
    if (!map || !selectedFeature) return;

    const getCentroid = (geometry: Feature['geometry']): [number, number] => {
      if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0];
        const lon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return [lon, lat];
      }
      if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates[0][0];
        const lon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return [lon, lat];
      }
      return [-100, 40];
    };

    const [lon, lat] = getCentroid(selectedFeature.geometry);
    map.flyTo({ center: [lon, lat], zoom: 5.5, duration: 1200, essential: true });
  }, [selectedFeature, map]);

  return null;
}

function getRouteEndpoints(feature: Feature<LineString | MultiLineString> | null): {
  start: [number, number] | null;
  end: [number, number] | null;
} {
  if (!feature) return { start: null, end: null };

  const geometry = feature.geometry;

  let coords: number[][] = [];

  if (geometry.type === 'LineString') {
    coords = geometry.coordinates;
  } else if (geometry.type === 'MultiLineString') {
    const all = geometry.coordinates;
    coords = [...all[0], ...all[all.length - 1]];
  }

  if (coords.length < 2) return { start: null, end: null };

  return {
    start: [coords[0][0], coords[0][1]],
    end: [coords[coords.length - 1][0], coords[coords.length - 1][1]],
  };
}

function Map() {
  const selectedFeature = useSelector((state: RootState) => state.map.selectedFeature);
  const routeGeometry = useSelector((state: RootState) => state.map.routeGeometry);
  const routeColor = useSelector((state: RootState) => state.map.routeColor);
  const locations = useSelector((state: RootState) => state.geoJson.data);

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<{ lng: number; lat: number; name: string } | null>(null);

  const geoJsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations,
  }), [locations]);

  const fillColor = useMemo((): ExpressionSpecification => [
    'case',
    ['==', ['get', 'name'], selectedFeature?.properties?.name || ''], '#ef4444',
    ['==', ['get', 'name'], hoveredState || ''], '#93c5fd', '#d1d5db',
  ], [selectedFeature, hoveredState]);

  const { start, end } = useMemo(
  () => getRouteEndpoints(routeGeometry as Feature<LineString | MultiLineString> | null),
  [routeGeometry]
);

  return (
    <MainMap
      initialViewState={{ longitude: -95, latitude: 40, zoom: 4 }}
      style={{ width: '85vw', height: '100vh' }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      cursor={hoveredState ? 'pointer' : 'auto'}
      interactiveLayerIds={['states-fill']}
      onMouseMove={(e) => {
        const name = e.features?.[0]?.properties?.name ?? null;
        setHoveredState(name);
      }}
      onMouseLeave={() => setHoveredState(null)}
      onClick={(e) => {
        const feature = e.features?.[0];
        if (feature) {
          setPopupInfo({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
            name: feature.properties?.name ?? 'Unknown',
          });
        } else {
          setPopupInfo(null);
        }
      }}
    >
      <FullscreenControl position="top-right" />
      <MapController />
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-right" />

      <Source id="states" type="geojson" data={geoJsonData}>
        <Layer
          id="states-fill"
          type="fill"
          paint={{ 'fill-color': fillColor, 'fill-opacity': 0.5 }}
        />
        <Layer
          id="states-border"
          type="line"
          paint={{ 'line-color': '#000', 'line-width': 1 }}
        />
        <Layer
          id="states-label"
          type="symbol"
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-font': ['Noto Sans Bold'],
            'text-anchor': 'center',
          }}
          paint={{
            'text-color': '#222222',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          }}
        />
      </Source>

      {routeGeometry && (
        <Source id="route" type="geojson" data={routeGeometry}>
          <Layer
            id="route-line"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': routeColor, 'line-width': 4, 'line-opacity': 0.9 }}
          />
        </Source>
      )}

      {start && (
        <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
          <div style={{ fontSize: 28, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
            <Van className='text-black'/>
          </div>
        </Marker>
      )}
      {end && (
        <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
          <div style={{ fontSize: 28, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
            📍
          </div>
        </Marker>
      )}

      {popupInfo && (
        <Popup
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          anchor="bottom"
          closeButton={true}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
        >
          <div style={{ fontFamily: 'sans-serif', padding: '4px 8px' }}>
            <strong className='text-black' style={{ fontSize: 14 }}>📍 {popupInfo.name}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>
              {popupInfo.lng.toFixed(4)}, {popupInfo.lat.toFixed(4)}
            </p>
          </div>
        </Popup>
      )}
    </MainMap>
  );
}

export default Map;