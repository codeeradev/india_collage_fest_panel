// export const API_BASE_URL = 'http://localhost:3001';
// export const API_BASE_URL = "https://india-collage-fest-api.onrender.com";
export const API_BASE_URL = "http://172.93.223.239:3001/";

// Define all endpoints here
export const ENDPOINTS = {
  ADD_CATEGORY: 'admin/add-category',
  EDIT_CATEGORY: (id: string) => `admin/edit-category/${id}`,
  GET_CATEGORY: 'admin/get-category',
  ADD_SUBCATEGORY: 'admin/add-sub-category',
  EDIT_SUBCATEGORY: (id: string) => `admin/edit-sub-category/${id}`,
  ADD_CITY: 'admin/add-city',
  GET_CITY: 'admin/get-city',
  GET_SUBCATEGORY_BY_CATEGORY: (categoryId: string) => `admin/get-sub-category/${categoryId}`,
  EDIT_CITY: (id: string) => `admin/edit-city/${id}`,

  ADD_EVENT: '/add-event',
  GET_EVENTS: 'admin/get-event',
  GET_APPROVALS_REQUEST: 'admin/get-approvals-request',
  APPROVAL_ACTION: 'admin/approval-action',

  LOGIN_PANEL: 'admin/login-panel',

  EDIT_PROFILE: 'admin/edit-profile',

  GET_PROFILE: (id: string) => `admin/get-profile/${id}`,
  EDIT_EVENT: (id: string) => `admin/editEvents/${id}`,

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
};
