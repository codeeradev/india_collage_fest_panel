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
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ApprovalPage = lazy(() => import('src/pages/approvals'));
export const PermissionPage = lazy(() => import('src/pages/permisson'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/events'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const MouPage = lazy(() => import('src/pages/mou'));
export const AgreementPage = lazy(() => import('src/pages/mouAggrement'));
export const SocialPage = lazy(() => import('src/pages/social'));
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
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
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
        path: 'permisson',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <PermissionPage />
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
      {
        path: 'events',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <ProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'social',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <SocialPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'blog',
        element: (
          <ProtectedRoute allowedRoles={[1]}>
            <BlogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mou',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <MouPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'agreement',
        element: (
          <ProtectedRoute allowedRoles={[1, 3]}>
            <AgreementPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
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
