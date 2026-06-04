import {
  Map as MainMap,
  Source,
  Layer,
  Popup,
  NavigationControl,
  ScaleControl,
  useMap,
  Marker,
  FullscreenControl,
} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import type { ExpressionSpecification } from 'maplibre-gl';
import type { Feature, LineString, MultiLineString } from 'geojson';


function MapController() {
  const { current: map } = useMap();
  const selectedFeature = useSelector((state: RootState) => state.map.selectedFeature);

  useEffect(() => {
    if (!map || !selectedFeature) return;
    const getCentroid = (geometry: Feature['geometry']): [number, number] => {
      if (geometry.type === 'Polygon') {
        const c = geometry.coordinates[0];
        return [c.reduce((s, p) => s + p[0], 0) / c.length, c.reduce((s, p) => s + p[1], 0) / c.length];
      }
      if (geometry.type === 'MultiPolygon') {
        const c = geometry.coordinates[0][0];
        return [c.reduce((s, p) => s + p[0], 0) / c.length, c.reduce((s, p) => s + p[1], 0) / c.length];
      }
      return [-100, 40];
    };
    const [lon, lat] = getCentroid(selectedFeature.geometry);
    map.flyTo({ center: [lon, lat], zoom: 5.5, duration: 1200, essential: true });
  }, [selectedFeature, map]);

  return null;
}


function RouteController() {
  const { current: map } = useMap();
  const routeGeometry = useSelector((state: RootState) => state.map.routeGeometry);

  useEffect(() => {
    if (!map || !routeGeometry) return;
    const feature = routeGeometry as Feature<LineString | MultiLineString>;
    let coords: number[][] = [];
    if (feature.geometry.type === 'LineString') coords = feature.geometry.coordinates;
    else if (feature.geometry.type === 'MultiLineString')
      coords = feature.geometry.coordinates.flat();
    if (coords.length < 2) return;

    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);

    map.fitBounds(
      [[minLon, minLat], [maxLon, maxLat]],
      { padding: { top: 80, bottom: 80, left: 120, right: 120 }, duration: 1400, essential: true }
    );
  }, [routeGeometry, map]);

  return null;
}


function getRouteEndpoints(feature: Feature<LineString | MultiLineString> | null) {
  if (!feature) return { start: null as [number, number] | null, end: null as [number, number] | null };
  let coords: number[][] = [];
  if (feature.geometry.type === 'LineString') coords = feature.geometry.coordinates;
  else if (feature.geometry.type === 'MultiLineString') {
    const all = feature.geometry.coordinates;
    coords = [...all[0], ...all[all.length - 1]];
  }
  if (coords.length < 2) return { start: null, end: null };
  return {
    start: [coords[0][0], coords[0][1]] as [number, number],
    end: [coords[coords.length - 1][0], coords[coords.length - 1][1]] as [number, number],
  };
}


function StartMarker() {
  return (
    <div style={{ color: '#16a34a' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(22,163,74,.5)',
        border: '3px solid #fff',
      }}>
        <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>🚗</span>
      </div>
      <div style={{color: '#16a34a', background: '#16a34a' }} />
    </div>
  );
}

function EndMarker() {
  return (
    <div style={{ color: '#dc2626' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: 'linear-gradient(135deg,#f87171,#dc2626)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(220,38,38,.5)',
        border: '3px solid #fff',
      }}>
        <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>📍</span>
      </div>
      <div style={{ background: '#dc2626' }} />
    </div>
  );
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
    ['==', ['get', 'name'], hoveredState || ''], '#93c5fd',
    '#d1d5db',
  ], [selectedFeature, hoveredState]);

  const { start, end } = useMemo(
    () => getRouteEndpoints(routeGeometry as Feature<LineString | MultiLineString> | null),
    [routeGeometry]
  );

  return (
    <div style={{ position: 'relative', width: '85vw', height: '100vh' }}>
      <style>{`
        @keyframes pinDrop {
          from { transform: translateY(-20px) scale(.8); opacity: 0; }
          to   { transform: translateY(0)     scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { transform: translateX(-50%) translateY(12px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -20; }
        }
        .maplibregl-popup-content {
          border-radius: 14px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,.18) !important;
        }
        .maplibregl-popup-tip { display: none !important; }
      `}</style>

      <MainMap
        initialViewState={{ longitude: -100, latitude: 40, zoom: 4 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        cursor={hoveredState ? 'pointer' : 'auto'}
        interactiveLayerIds={['states-fill']}
        onMouseMove={(e) => setHoveredState(e.features?.[0]?.properties?.name ?? null)}
        onMouseLeave={() => setHoveredState(null)}
        onClick={(e) => {
          const feature = e.features?.[0];
          if (feature) {
            setPopupInfo({ lng: e.lngLat.lng, lat: e.lngLat.lat, name: feature.properties?.name ?? 'Unknown' });
          } else {
            setPopupInfo(null);
          }
        }}
      >
        <FullscreenControl position="top-right" />
        <MapController />
        <RouteController />
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        <Source id="states" type="geojson" data={geoJsonData}>
          <Layer
            id="states-fill"
            type="fill"
            paint={{ 'fill-color': fillColor, 'fill-opacity': 0.45 }}
          />
          <Layer
            id="states-border"
            type="line"
            paint={{ 'line-color': '#6b7280', 'line-width': 0.8 }}
          />
          <Layer
            id="states-label"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-font': ['Noto Sans Bold'],
              'text-anchor': 'center',
            }}
            paint={{
              'text-color': '#1e293b',
              'text-halo-color': '#ffffffcc',
              'text-halo-width': 2,
            }}
          />
        </Source>

        {routeGeometry && (
          <Source id="route" type="geojson" data={routeGeometry}>
            <Layer
              id="route-shadow"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#000', 'line-width': 10, 'line-opacity': 0.12, 'line-blur': 4 }}
            />
            <Layer
              id="route-bg"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#fff', 'line-width': 7, 'line-opacity': 0.7 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': routeColor, 'line-width': 5, 'line-opacity': 1 }}
            />
            <Layer
              id="route-dash"
              type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{
                'line-color': '#ffffff',
                'line-width': 2,
                'line-opacity': 0.6,
                'line-dasharray': [0, 4],
              }}
            />
          </Source>
        )}

        {start && (
          <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
            <StartMarker />
          </Marker>
        )}
        {end && (
          <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
            <EndMarker />
          </Marker>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            offset={16}
          >
            <div style={{
              fontFamily: 'system-ui, sans-serif',
              padding: '12px 16px',
              minWidth: 160,
              background: '#fff',
              borderRadius: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
                    {popupInfo.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {popupInfo.lat.toFixed(4)}°N, {Math.abs(popupInfo.lng).toFixed(4)}°W
                  </div>
                </div>
                <button
                  onClick={() => setPopupInfo(null)}
                  style={{
                    border: 'none', background: '#f1f5f9', borderRadius: 6,
                    width: 22, height: 22, cursor: 'pointer', fontSize: 12,
                    color: '#475569', marginLeft: 8,
                  }}
                >✕</button>
              </div>
            </div>
          </Popup>
        )}
      </MainMap>

    </div>
  );
}

export default Map;