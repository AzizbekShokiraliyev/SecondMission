import { SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from './Sidebar'
import Map from '@/components/map/Map'
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useState } from 'react';
import { MapContext } from '@/components/context/MapContext';

const Dashboard = () => {
   const [map, setMap] = useState<MapLibreMap | null>(null);

  return (
    <div>
      <MapContext.Provider value={map}>
      <SidebarProvider>
        <Sidebar/>
        <main>
          <Map onMapLoad={setMap}/>
        </main>
      </SidebarProvider>
      </MapContext.Provider>
    </div>
  )
}

export default Dashboard