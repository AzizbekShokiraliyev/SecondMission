import { SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from './Sidebar'
import Map from '@/components/map/Map'

const Dashboard = () => {
  return (
    <div>
      <SidebarProvider>
        <Sidebar/>
        <main>
          <Map/>
        </main>
      </SidebarProvider>
    </div>
  )
}

export default Dashboard