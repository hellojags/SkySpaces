import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import FileManager from './pages/FileManager';
import Products from './pages/Products';
import Blog from './pages/Blog';
import User from './pages/User';
import NotFound from './pages/Page404';
import AuthGaurd from './AuthGaurd';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/home',
      element: <AuthGaurd component={<DashboardLayout />}></AuthGaurd>,
      children: [
        { element: <Navigate to="/home/filemanager" replace /> },
        // { path: 'app', element: <DashboardApp /> },
        { path: 'filemanager', element: <FileManager /> },
        { path: 'user', element: <User /> },
        { path: 'products', element: <Products /> },
        { path: 'blog', element: <Blog /> }
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/home" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
