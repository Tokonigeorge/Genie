import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { authRoutes } from './auth/authRoutes';
import { protectedLoader } from '../utils/authLoader';
import { loader as onboardingLoader } from './app/Onboarding';
import AppLayout from './app/Layout';

const Onboarding = lazy(() => import('./app/Onboarding'));
const Dashboard = lazy(() => import('./app/Dashboard'));

function lazyLoad(element: React.ReactElement) {
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {authRoutes}

      <Route
        path='/'
        element={lazyLoad(<AppLayout />)}
        loader={protectedLoader}
      >
        <Route index element={lazyLoad(<Dashboard />)} />
        <Route
          path='onboarding'
          element={lazyLoad(<Onboarding />)}
          loader={onboardingLoader}
        />
      </Route>
    </>
  )
);
