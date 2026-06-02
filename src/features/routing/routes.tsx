import MainLayout from '../../components/layout/MainLayout'
import Login from '../auth/Login';
import Register from '../auth/Register';
import Dashboard from '../../pages/Dashboard';

import { createBrowserRouter, Navigate } from 'react-router-dom';



export const router = createBrowserRouter([
  {
    path: "*", 
    element: <Navigate to="/" replace />, 
  },
  {
    path: "/", 
    element: <MainLayout/>,
  },
  {
    path: "/login", 
    element: <Login />,
  },
  {
    path: "/register", 
    element: <Register />,
  },
  {
    path: "/dashboard", 
    element: <Dashboard/>,
  },
]);