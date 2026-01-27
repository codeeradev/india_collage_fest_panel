import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import ProtectedRoute from 'src/auth/ProtectedRoute';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const CategoryPage = lazy(() => import('src/pages/category'));
export const CityPage = lazy(() => import('src/pages/city'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ApprovalPage = lazy(() => import('src/pages/approvals'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/events'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      // ✅ Admin + Organizer
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },

      // ✅ Admin only
      {
        path: 'category',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <CategoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <UserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'approvals',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <ApprovalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'city',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <CityPage />
          </ProtectedRoute>
        ),
      },

      // ✅ Admin + Organizer
      {
        path: 'events',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <ProductsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 🔓 public route
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },

  {
    path: '404',
    element: <Page404 />,
  },

  { path: '*', element: <Page404 /> },
];

