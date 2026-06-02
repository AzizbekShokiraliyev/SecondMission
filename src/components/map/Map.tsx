import { Map as MainMap, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { FeatureCollection } from 'geojson';
import type { RootState } from '@/features/store/store';
import type { ExpressionSpecification } from 'maplibre-gl';

function Map() {
  const selectedFeature = useSelector((state: RootState) => state.map.selectedFeature);
  const routeGeometry = useSelector((state: RootState) => state.map.routeGeometry);
  const routeColor = useSelector((state: RootState) => state.map.routeColor);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/us-states.json')
      .then(res => res.json())
      .then(data => setGeoJsonData(data));
  }, []);

  const fillColor: ExpressionSpecification = [
    'case',
    ['==', ['get', 'name'], selectedFeature?.properties?.name || ''],
    '#ff0000',
    '#cccccc'
  ];

  return (
    <MainMap  
      initialViewState={{ longitude: -100, latitude: 40, zoom: 3 }}
      style={{ width: "85vw", height: "100vh" }}
      mapStyle="https://demotiles.maplibre.org/style.json"
    >
      {geoJsonData && (
        <Source id="states" type="geojson" data={geoJsonData}>
          <Layer id="states-fill" type="fill" paint={{ 'fill-color': fillColor, 'fill-opacity': 0.5 }}/>
          <Layer id="states-border" type="line" paint={{ 'line-color': '#000', 'line-width': 1 }}/>
        </Source>
      )}

      {routeGeometry && (
        <Source id="route" type="geojson" data={routeGeometry}>
          <Layer id="route-line" type="line" paint={{ 'line-color': routeColor, 'line-width': 3 }}/>
        </Source>
      )}
    </MainMap>
  );
}

export default Map;