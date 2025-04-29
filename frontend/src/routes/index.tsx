import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { authRoutes } from './auth/authRoutes';
import { protectedLoader } from '../utils/authLoader';
import { loader as onboardingLoader } from './Onboarding';

const Onboarding = lazy(() => import('./Onboarding'));
const Dashboard = lazy(() => import('./Dashboard'));

function lazyLoad(element: React.ReactElement) {
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {authRoutes}
      <Route
        path='/'
        element={lazyLoad(<Dashboard />)}
        loader={protectedLoader}
      >
        <Route
          path='onboarding'
          element={lazyLoad(<Onboarding />)}
          loader={onboardingLoader}
        />
      </Route>
    </>
  )
);
