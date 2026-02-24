import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

export const getAdminDashboardStats = async () => {
  const res = await get(ENDPOINTS.ADMIN_DASHBOARD_STATS, { authRequired: true });
  return res.data.data;
};

export const getUserDashboard = async () => {
  const res = await get(ENDPOINTS.USER_DASHBOARD, { authRequired: true });
  return res.data;
};

export const getSocialDashboard = async () => {
  const res = await get(ENDPOINTS.META_POSTER_DASHBOARD, { authRequired: true });
  return res.data;
};
