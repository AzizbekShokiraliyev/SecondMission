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



//  import { SidebarProvider } from '@/components/ui/sidebar'
// import SidebarDashboard from './SidebarDashboard'
// import type DashboardProps from '@/interface/Interface'
// import Map from '@/components/map/Map'


// const Dashboard = ({children}: DashboardProps) => {

//   return (
//     <SidebarProvider>
//       <SidebarDashboard/>
//       <main>
//         <Map />
//         {children}
//       </main>
//     </SidebarProvider>
//   )
// }

// export default Dashboard

