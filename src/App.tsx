import { RouterProvider } from 'react-router-dom'
import { router } from './features/routing/routes' // router faylingiz yo'lini to'g'irlang

const App = () => {
  return <RouterProvider router={router} />
}

export default App