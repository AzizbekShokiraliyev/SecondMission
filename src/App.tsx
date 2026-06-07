import { RouterProvider } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Dispatch kerak
import { useEffect } from 'react';
import { router } from './features/routing/routes';
import { fetchGeoJson } from './features/store/geoJsonSlice';
import type { AppDispatch } from './features/store/store';

const App = () => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchGeoJson());
  }, [dispatch]);

  // Hooklar chaqirilgandan so'ng return qilinadi
  return <RouterProvider router={router} />;
};

export default App;