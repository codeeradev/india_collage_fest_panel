export const API_BASE_URL = 'http://localhost:3001';
// export const API_BASE_URL = 'https://india-collage-fest-api.onrender.com';
// export const API_BASE_URL = 'http://172.93.223.239:3001/';
// export const API_BASE_URL = 'https://api.indiacollegefest.com';

export const ENDPOINTS = {
  ADD_CATEGORY: 'admin/add-category',
  EDIT_CATEGORY: (id: string) => `admin/edit-category/${id}`,
  GET_CATEGORY: 'admin/get-category',
  ADD_SUBCATEGORY: 'admin/add-sub-category',
  EDIT_SUBCATEGORY: (id: string) => `admin/edit-sub-category/${id}`,
  ADD_CITY: 'admin/add-city',
  ADD_CITY_CSV: 'admin/add-city-csv',
  GET_CITY: 'admin/get-city',
  GET_SUBCATEGORY_BY_CATEGORY: (categoryId: string) => `admin/get-sub-category/${categoryId}`,
  EDIT_CITY: (id: string) => `admin/edit-city/${id}`,

  ADD_EVENT: '/add-event',
  GET_EVENTS: 'admin/get-event',
  ADD_EVENT_CSV: 'admin/add-event-csv',
  FETCH_GOOGLE_EVENTS_PREVIEW: 'admin/events/google/fetch-preview',
  IMPORT_GOOGLE_EVENTS: 'admin/events/google/import',
  GET_APPROVALS_REQUEST: 'admin/get-approvals-request',
  APPROVAL_ACTION: 'admin/approval-action',

  LOGIN_PANEL: 'admin/login-panel',
  EDIT_PROFILE: 'admin/edit-profile',
  GET_PROFILE: (id: string) => `admin/get-profile/${id}`,
  EDIT_EVENT: (id: string) => `admin/editEvents/${id}`,

  ADMIN_GET_MOUS: 'admin/mou/all-mou',
  ADMIN_GET_BASE_TEMPLATE: 'admin/mou/base-template',
  ORGANISER_GET_BASE_TEMPLATE: 'admin/organizer/filled-base-template',
  ADMIN_UPSERT_BASE_TEMPLATE: 'admin/mou/update-base-template',
  START_MOU: 'admin/organizer/mou/start-mou',
  GET_MY_MOU: 'admin/organizer/mou',
  ORGANISER_SUBMIT_MOU: 'admin/organizer/mou/submit-mou',
  ADMIN_REPLY_MOU: 'admin/mou/reply-mou',
  FINALIZE_MOU: 'admin/mou/finalize-mou',
  SEND_MOU_OTP: 'admin/organizer/mou/send-otp',
  VERIFY_MOU_OTP: 'admin/organizer/mou/verify-otp',
  GET_MOU_VERSIONS: (id: string) => `admin/get-mou-versions/${id}`,
  PREVIEW_MOU: 'admin/organizer/mou/preview',

  GET_USERS: 'admin/get-users',
  UPDATE_USER_PERMISSIONS: 'admin/organizer/permissions',
  ADMIN_EDIT_USER: (id: string) => `admin/edit-user/${id}`,

  ADMIN_DASHBOARD_STATS: 'admin/dashboard-stats',
  USER_DASHBOARD: 'admin/user/dashboard',

  META_LOGIN_URL: 'meta/login-url',
  META_CALLBACK: 'meta/callback',
  META_PAGES: 'meta/pages',
  META_ACTIVE_PAGE: 'meta/active-page',
  META_POSTER_SUBMIT: 'meta/poster/submit',
  META_POSTER_REQUESTS: 'meta/poster/requests',
  META_POSTER_MY: 'meta/poster/my',
  META_POSTER_APPROVE: 'meta/poster/approve',
  META_POSTER_REJECT: 'meta/poster/reject',
  META_POSTER_DASHBOARD: 'meta/poster/dashboard',

  ADMIN_GET_BLOGS: 'admin/get-blogs',
  ADMIN_GET_BLOG: (id: string) => `admin/get-blog/${id}`,
  ADMIN_ADD_BLOG: 'admin/add-blog',
  ADMIN_EDIT_BLOG: (id: string) => `admin/edit-blog/${id}`,
};
