import type { JSX } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { getToken, isTokenExpired, getTokenPayload } from './auth';

type Props = {
  children: JSX.Element;
  allowedRoles?: number[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: Props) {
  const location = useLocation();

  const token = getToken();

  // ❌ not logged in
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/sign-in" replace />;
  }

  const payload = getTokenPayload(token);

  // ❌ invalid token
  if (!payload) {
    return <Navigate to="/sign-in" replace />;
  }

  // ✅ ROLE CHECK
  if (
    allowedRoles &&
    !allowedRoles.includes(payload.roleId)
  ) {
    return <Navigate to="/404" replace state={{ from: location }} />;
  }

  return children;
}
