import { Map as MainMap, Source, Layer, Popup, NavigationControl, ScaleControl, useMap } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import type { ExpressionSpecification } from 'maplibre-gl';
import type { Feature } from 'geojson';
import {FullscreenControl} from '@vis.gl/react-maplibre';

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

function Map() {
  const selectedFeature = useSelector((state: RootState) => state.map.selectedFeature);
  const routeGeometry = useSelector((state: RootState) => state.map.routeGeometry);
  const routeColor = useSelector((state: RootState) => state.map.routeColor);
  const locations = useSelector((state: RootState) => state.geoJson.data);

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [popupInfo, setPopupInfo]       = useState<{ lng: number; lat: number; name: string } | null>(null);
  

  const geoJsonData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations,
  }), [locations]);

  const fillColor: ExpressionSpecification = [
    'case',
    ['==', ['get', 'name'], selectedFeature?.properties?.name || ''], '#ef4444',
    ['==', ['get', 'name'], hoveredState || ''],                       '#93c5fd',
    '#d1d5db',
  ];

  return (
    <MainMap
      initialViewState={{ longitude: -100, latitude: 40, zoom: 3 }}
      style={{ width: '85vw', height: '100vh' }}
      mapStyle="https://demotiles.maplibre.org/style.json"
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

      {/* Controls */}
      <NavigationControl position="top-right" />
  
      <ScaleControl position="bottom-right" />

      {/* States layer */}
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

      {/* Route layer */}
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

      {/* Popup — shtatga click qilinganda */}
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