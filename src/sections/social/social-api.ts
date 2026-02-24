import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';

export const getMetaLoginUrl = async (redirectUri?: string) => {
  const res = await get(ENDPOINTS.META_LOGIN_URL, {
    authRequired: true,
    params: redirectUri ? { redirect_uri: redirectUri } : undefined,
  });
  return res.data.url as string;
};

export const saveMetaToken = async (code: string, redirectUri?: string) =>
  get(ENDPOINTS.META_CALLBACK, {
    authRequired: true,
    params: redirectUri ? { code, redirect_uri: redirectUri } : { code },
  });

export const getMetaPages = async (refresh = false) => {
  const res = await get(ENDPOINTS.META_PAGES, {
    authRequired: true,
    params: refresh ? { refresh: true } : undefined,
  });
  return res.data.data || [];
};

export const getActivePage = async () => {
  const res = await get(ENDPOINTS.META_ACTIVE_PAGE, { authRequired: true });
  return res.data.data || null;
};

export const setActivePage = async (pageId: string) =>
  post(ENDPOINTS.META_ACTIVE_PAGE, { pageId }, { authRequired: true });

export const submitPoster = async (fd: FormData) =>
  post(ENDPOINTS.META_POSTER_SUBMIT, fd, {
    authRequired: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPosterRequests = async (status = 'pending') => {
  const res = await get(ENDPOINTS.META_POSTER_REQUESTS, {
    authRequired: true,
    params: { status },
  });
  return res.data.data || [];
};

export const getMyPosters = async () => {
  const res = await get(ENDPOINTS.META_POSTER_MY, { authRequired: true });
  return res.data.data || [];
};

export const approvePoster = async (id: string) =>
  post(ENDPOINTS.META_POSTER_APPROVE, { id }, { authRequired: true });

export const rejectPoster = async (id: string, reason: string) =>
  post(
    ENDPOINTS.META_POSTER_REJECT,
    { id, reason },
    { authRequired: true }
  );

export const getPosterDashboard = async () => {
  const res = await get(ENDPOINTS.META_POSTER_DASHBOARD, { authRequired: true });
  return res.data;
};
