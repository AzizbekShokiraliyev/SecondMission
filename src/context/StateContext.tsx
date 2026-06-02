// import { createContext, useContext, useEffect, useState } from 'react';
// import type { FeatureCollection, Geometry } from 'geojson';
// import { StateFeature } from '@/interface/Interface';
// import type DashboardProps from '@/interface/Interface';

// const StateContext = createContext<StateFeature[] | undefined>(undefined);

// export const StateProvider = ({ children }: { children: DashboardProps }) => {
//   const [states, setStates] = useState<StateFeature[]>([]);

//   useEffect(() => {
//     fetch('/data/us-states.json')
//       .then((res) => res.json())
//       .then((data: FeatureCollection<Geometry, StateProperties>) => {
//         setStates(data.features);
//       })
//       .catch((err) => console.error("GeoJSON yuklashda xatolik:", err));
//   }, []);

//   return <StateContext.Provider value={states}>{children}</StateContext.Provider>;
// };

// export const useStateContext = () => {
//   const context = useContext(StateContext);
//   if (!context) throw new Error('useStateContext faqat StateProvider ichida ishlaydi');
//   return context;
// };