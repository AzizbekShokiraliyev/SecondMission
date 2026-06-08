import {Map as MainMap, Source, Layer, Popup, NavigationControl, ScaleControl, Marker, FullscreenControl} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import type { ExpressionSpecification } from 'maplibre-gl';
import type { Feature, LineString, MultiLineString } from 'geojson';
import StartMarker from './StartMarker';
import EndMarker from './EndMarker';
import { setSelectedFeature, toggleStateName } from '@/features/store/mapSlice';
import { getCentroid } from '@/lib/getCentroid';
import type { StoredRoute } from '@/interface/Interface';
import type { MapProps } from '@/interface/Interface';

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

function Map({ onMapLoad }: MapProps) {
  const routes = useSelector((state: RootState) => state.map.routes);
  const locations = useSelector((state: RootState) => state.geoJson.data);
  const selectedLocations = useSelector((state: RootState) => state.map.selectedLocations || []);
  const selectedStateNames: string[] = useSelector((s: RootState) => s.map.selectedStateNames ?? []);

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const dispatch = useDispatch();

  const geoJsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations,
  }), [locations]);

  const fillColor = useMemo((): ExpressionSpecification => {
    if (selectedStateNames.length > 0) {
      return [
        'case',
        ['in', ['get', 'name'], ['literal', selectedStateNames]], '#ef4444',
        ['==', ['get', 'name'], hoveredState ?? ''], '#93c5fd',
        '#d1d5db',
      ] as ExpressionSpecification;
    }
    return [
      'case',
      ['==', ['get', 'name'], hoveredState ?? ''], '#93c5fd',
      '#d1d5db',
    ] as ExpressionSpecification;
  }, [selectedStateNames, hoveredState]);

  const firstRouteStart = useMemo(() => {
    if (!routes.length) return null;
    return getRouteEndpoints(routes[0].geometry as Feature<LineString | MultiLineString>).start;
  }, [routes]);

  const lastRouteEnd = useMemo(() => {
    if (!routes.length) return null;
    return getRouteEndpoints(routes[routes.length - 1].geometry as Feature<LineString | MultiLineString>).end;
  }, [routes]);

  return (
    <div style={{ position: 'relative', width: '85vw', height: '100vh' }}>
      <style>{`
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
        onLoad={(e) => onMapLoad?.(e.target)}

        onMouseMove={(e) => {
          const feature = e.features?.[0];
          if (feature) {
            const name = feature.properties?.name;
            setHoveredState(name);
            if (popupInfo?.name !== name) {
              setPopupInfo({ lng: e.lngLat.lng, lat: e.lngLat.lat, name: name ?? 'Unknown' });
            }
          } else {
            setHoveredState(null);
            setPopupInfo(null);
          }
        }}

        onMouseLeave={() => {
          setHoveredState(null);
          setPopupInfo(null);
        }}

        onClick={(e) => {
          const feature = e.features?.[0];
          if (feature) {
            const name = feature.properties?.name as string;
            dispatch(toggleStateName(name));
            dispatch(setSelectedFeature(feature as Feature));
            const coords = getCentroid((feature as Feature).geometry);
            e.target.flyTo({ center: coords, zoom: 6, essential: true, duration: 1500 });
          }
        }}
      >
        <FullscreenControl position="top-right" />
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
            paint={{ 'line-color': '#6b7280', 'line-width': 0.8 }}
          />
          {selectedStateNames.length > 0 && (
            <Layer
              id="states-selected-border"
              type="line"
              filter={['in', ['get', 'name'], ['literal', selectedStateNames]]}
              paint={{ 'line-color': '#dc2626', 'line-width': 2 }}
            />
          )}
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

        {routes.map((route: StoredRoute) => (
          <Source key={route.id} id={route.id} type="geojson" data={route.geometry}>
            <Layer id={`${route.id}-shadow`} type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#000', 'line-width': 10, 'line-opacity': 0.12, 'line-blur': 4 }}
            />
            <Layer id={`${route.id}-bg`} type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#fff', 'line-width': 7, 'line-opacity': 0.7 }}
            />
            <Layer id={`${route.id}-line`} type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': route.color, 'line-width': 5, 'line-opacity': 1 }}
            />
            <Layer id={`${route.id}-dash`} type="line"
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              paint={{ 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [0, 4] }}
            />
          </Source>
        ))}

        {firstRouteStart && (
          <Marker longitude={firstRouteStart[0]} latitude={firstRouteStart[1]} anchor="bottom">
            <StartMarker />
          </Marker>
        )}
        {lastRouteEnd && (
          <Marker longitude={lastRouteEnd[0]} latitude={lastRouteEnd[1]} anchor="bottom">
            <EndMarker />
          </Marker>
        )}

        {selectedLocations.length > 0 && (
          <Source id="multi-selected-source" type="geojson"
            data={{ type: 'FeatureCollection', features: selectedLocations }}
          >
            <Layer id="multi-selected-layer" type="circle"
              paint={{
                'circle-radius': 10,
                'circle-color': '#f59e0b',
                'circle-opacity': 0.8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              }}
            />
          </Source>
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
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
                {popupInfo.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {popupInfo.lat.toFixed(4)}°N, {Math.abs(popupInfo.lng).toFixed(4)}°W
              </div>
            </div>
          </Popup>
        )}
      </MainMap>
    </div>
  );
}

export default Map;